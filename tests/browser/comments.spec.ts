import { expect, test, type Page } from '@playwright/test';

test.use({ baseURL: 'http://127.0.0.1:4335' });

const comments = Array.from({ length: 8 }, (_, index) => ({
  objectId: `comment-${index}`,
  nick: `读者 ${index + 1}`,
  mail: '',
  comment: '记录生活，分享想法。一起交流主题的使用体验。',
  url: '/message/',
  createdAt: '2026-09-10T08:00:00.000Z',
  updatedAt: '2026-09-10T08:00:00.000Z',
}));

async function mockComments(
  page: Page,
  state: 'ready' | 'empty' | 'error' = 'ready',
) {
  // Aggregate UI tests never submit comments or update live visitor counters.
  await page.route('**/valine@*/**', (route) =>
    route.fulfill({
      contentType: 'application/javascript',
      body: 'window.Valine = class { destroy() {} };',
    }),
  );
  await page.route('**/1.1/**', (route) =>
    route.fulfill({
      status: state === 'error' ? 503 : 200,
      json: {
        results:
          state === 'ready'
            ? [
                ...comments,
                {
                  ...comments[0],
                  objectId: 'outside',
                  nick: '其他站点',
                  url: '/outside/',
                },
              ]
            : [],
        count: state === 'ready' ? comments.length : 0,
      },
    }),
  );
}

async function ready(page: Page) {
  await expect(page.locator('html')).toHaveAttribute(
    'data-solitude-runtime',
    'ready',
  );
}

test('sidebar, console and recent page keep independent limits after client navigation', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await mockComments(page);
  await page.goto('/');
  await ready(page);
  const sidebar = page.locator('.card-recent-comment');
  await expect(sidebar.locator('.aside-list-item')).toHaveCount(5);
  await expect(sidebar.locator('.aside-list')).toHaveAttribute(
    'aria-busy',
    'false',
  );
  await expect(sidebar).not.toContainText('其他站点');
  await sidebar.locator('.recent-comment-more').click();
  await expect(page).toHaveURL(/\/recentcomments\/$/);
  await ready(page);
  await expect(page.locator('#page .sharePage')).toBeVisible();
  await expect(page.locator('#page .author-content-item-title')).toHaveText(
    'Recent comments',
  );
  await expect(page.locator('#aside-content')).toHaveCount(0);
  await expect(page.locator('#post-comment')).toHaveCount(0);
  await expect(page.locator('#page .comment-card')).toHaveCount(8);
  await page.locator('#nav-console a').click();
  const consolePanel = page.locator('#console');
  await expect(consolePanel).toHaveClass(/show/);
  await expect(consolePanel.locator('.console-mask')).toHaveCSS(
    'backdrop-filter',
    'saturate(1.8) blur(20px)',
  );
  await expect(consolePanel.locator('.comment-card')).toHaveCount(6);
  await expect(consolePanel.locator('.console_recentcomments')).toHaveAttribute(
    'aria-busy',
    'false',
  );
  await consolePanel.locator('.comment-card').first().click();
  await expect(page).toHaveURL(/\/message\/$/);
  await ready(page);
  await expect(consolePanel).not.toHaveClass(/show/);
  await expect(page.locator('#aside-content')).toHaveCount(0);
  await page.goBack();
  await ready(page);
  await expect(page.locator('#page .comment-card')).toHaveCount(8);
  await expect(page.locator('#console .comment-card')).toHaveCount(6);
});

for (const width of [390, 768, 1440]) {
  test(`recent comments retain the Hugo card layout at ${width}px in both themes`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    await mockComments(page);
    await page.goto('/recentcomments/');
    await ready(page);
    await expect(page.locator('#page .comment-card')).toHaveCount(8);
    for (const theme of ['light', 'dark']) {
      await page.evaluate((value) => {
        document.documentElement.dataset.theme = value;
      }, theme);
      const metrics = await page
        .locator('#page .comment-card')
        .first()
        .evaluate((el) => ({
          width: el.getBoundingClientRect().width,
          parent: el.parentElement!.getBoundingClientRect().width,
        }));
      expect(metrics.width / metrics.parent).toBeCloseTo(
        width > 1300 ? 1 / 3 : 1,
        1,
      );
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await expect(page.locator('#console .comment-card')).toHaveCount(6);
      if (width > 768) {
        await page.locator('#nav-console a').click();
        await expect(page.locator('#console')).toHaveClass(/show/);
        await page.locator('#nav-console a').click();
        await expect(page.locator('#console')).not.toHaveClass(/show/);
      } else {
        await expect(page.locator('#nav-console')).toBeHidden();
      }
    }
  });
}

for (const state of ['empty', 'error'] as const) {
  test(`recent comments finish loading in the ${state} state`, async ({
    page,
  }) => {
    await mockComments(page, state);
    await page.goto('/p/comments/');
    await ready(page);
    const aside = page.locator('.card-recent-comment .aside-list');
    await expect(aside).toHaveAttribute('aria-busy', 'false');
    await expect(aside.locator(`.comment-status.is-${state}`)).toBeVisible();
    await page.goto('/recentcomments/');
    await ready(page);
    await expect(page.locator('#page .recent-comments-list')).toHaveAttribute(
      'aria-busy',
      'false',
    );
    await expect(
      page.locator('#console .console_recentcomments'),
    ).toHaveAttribute('aria-busy', 'false');
    await expect(page.locator('.comment-card')).toHaveCount(0);
  });
}
