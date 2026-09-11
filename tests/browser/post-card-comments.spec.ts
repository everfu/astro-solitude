import { expect, test, type Page } from '@playwright/test';

test.use({ baseURL: 'http://127.0.0.1:4335' });

const postPath = '/p/getting-started/';
const target = `.post-card-commenters[data-comment-path="${postPath}"]`;
const records = Array.from({ length: 7 }, (_, i) => ({
  objectId: `participant-${i}`,
  nick: `读者 ${i + 1}`,
  mail: `reader-${i}@example.test`,
  url: postPath,
  createdAt: '2026-09-10T08:00:00.000Z',
  updatedAt: '2026-09-10T08:00:00.000Z',
}));

async function mockParticipants(
  page: Page,
  state: 'ready' | 'empty' | 'error' = 'ready',
) {
  await page.addInitScript(() => {
    (window as any).md5 = (mail: string) =>
      mail.match(/\d+/)?.[0].padStart(32, '0');
  });
  await page.route('**/valine@*/**', (route) =>
    route.fulfill({
      contentType: 'application/javascript',
      body: 'window.Valine = class { destroy() {} };',
    }),
  );
  await page.route('https://weavatar.com/avatar/**', (route) => {
    const i = Number(new URL(route.request().url()).pathname.split('/').pop());
    const color = ['#5264dd', '#dd8652', '#509b80', '#c66685', '#72729e'][
      i % 5
    ];
    return route.fulfill({
      contentType: 'image/svg+xml',
      body: `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="64" height="64" rx="32" fill="${color}"/><circle cx="32" cy="25" r="12" fill="white"/><ellipse cx="32" cy="58" rx="22" ry="18" fill="white"/></svg>`,
    });
  });
  await page.route('**/1.1/**', (route) =>
    route.fulfill({
      status: state === 'error' ? 503 : 200,
      json: {
        results:
          state === 'ready'
            ? [
                ...records,
                {
                  ...records[0],
                  objectId: 'repeat',
                  nick: '读者改名',
                  mail: records[0].mail.toUpperCase(),
                },
              ]
            : [],
        count: 8,
      },
    }),
  );
}

test('comment avatars deduplicate, overlap and stay at the bottom left in both themes', async ({
  page,
}) => {
  await mockParticipants(page);
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute(
    'data-solitude-runtime',
    'ready',
  );
  const group = page.locator(target);
  const card = page.locator('.recent-post-item').filter({ has: group });
  await expect(group).toHaveAttribute('data-comment-state', 'ready');
  await expect(group.locator('.post-card-commenter')).toHaveCount(5);
  await expect(group.locator('.post-card-commenter-more')).toHaveText('+2');
  await expect(card.locator('.article-meta.tags')).toBeHidden();
  await expect(group).toHaveAttribute('aria-label', /读者 1/);
  for (const width of [320, 390, 768, 1024, 1280, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const theme of ['light', 'dark']) {
      await page.evaluate((theme) => {
        document.documentElement.dataset.theme = theme;
      }, theme);
      await card.scrollIntoViewIfNeeded();
      const metrics = await card.evaluate((el) => {
        const group = el.querySelector('.post-card-commenters')!;
        const rect = group.getBoundingClientRect();
        const footer = el
          .querySelector('.article-meta-wrap')!
          .getBoundingClientRect();
        const date = el
          .querySelector('.post-meta-date')!
          .getBoundingClientRect();
        const avatars = [...group.querySelectorAll('.post-card-commenter')].map(
          (el) => el.getBoundingClientRect(),
        );
        return {
          right: rect.right,
          footerRight: footer.right,
          footerLeft: footer.left,
          left: rect.left,
          dateLeft: date.left,
          dateRight: date.right,
          avatarSize: avatars[0].width,
          overlap: avatars[0].right - avatars[1].left,
          center: rect.y + rect.height / 2,
          footerCenter: footer.y + footer.height / 2,
        };
      });
      expect(metrics.left).toBeCloseTo(metrics.footerLeft, 0);
      expect(metrics.dateRight).toBeCloseTo(metrics.footerRight, 0);
      expect(metrics.right).toBeLessThanOrEqual(metrics.dateLeft);
      expect(metrics.avatarSize).toBe(width <= 768 ? 26 : 28);
      expect(metrics.overlap).toBe(8);
      expect(metrics.center).toBeCloseTo(metrics.footerCenter, 0);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      if ([390, 1440].includes(width))
        await card.screenshot({
          path: `artifacts/comments/post-card-${width}-${theme}.png`,
          animations: 'disabled',
        });
    }
  }
  await page.evaluate(() => {
    document.documentElement.dataset.theme = 'light';
  });
  const avatar = group.locator('.post-card-commenter').first();
  await avatar.hover();
  await expect(avatar).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, -2)');
  await expect(avatar).toHaveAttribute('title', '读者 1');
  await avatar.click();
  await expect(page).toHaveURL(new RegExp(`${postPath}$`));
  await page.goBack();
  await expect(group.locator('.post-card-commenter')).toHaveCount(5);
  await expect(card.locator('.article-meta.tags')).toBeHidden();
});

for (const state of ['empty', 'error'] as const) {
  test(`${state} comments keep tags and date without an empty avatar group`, async ({
    page,
  }) => {
    await mockParticipants(page, state);
    await page.goto('/');
    const group = page.locator(target);
    const card = page.locator('.recent-post-item').filter({ has: group });
    await expect(group).toHaveAttribute('data-comment-state', state);
    await expect(group).toBeHidden();
    await expect(card.locator('.article-meta.tags')).toBeVisible();
    await expect(card.locator('.post-meta-date')).toBeVisible();
  });
}
