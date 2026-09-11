import { expect, test, type Page } from '@playwright/test';

test.use({ baseURL: 'http://127.0.0.1:4335' });

const comments = Array.from({ length: 24 }, (_, index) => ({
  objectId: `message-${index}`,
  nick: `读者 ${index + 1}`,
  mail: '',
  comment:
    index % 2
      ? '谢谢分享，很有帮助。'
      : '记录生活，分享想法。一起交流主题的使用体验。',
  url: index % 2 ? '/p/comments/' : '/message/',
  createdAt: '2026-09-10T08:00:00.000Z',
}));

async function mockComments(
  page: Page,
  state: 'ready' | 'empty' | 'error' = 'ready',
) {
  await page.route('**/valine@*/**', (route) =>
    route.fulfill({
      contentType: 'application/javascript',
      body: 'window.Valine = class { constructor() { document.querySelector("#vcomment").innerHTML = `<textarea aria-label="留言内容"></textarea>`; } destroy() {} };',
    }),
  );
  await page.route('**/1.1/**', (route) => {
    const params = new URL(route.request().url()).searchParams;
    const data = [
      ...comments,
      {
        ...comments[0],
        objectId: 'outside',
        nick: '其他站点',
        url: '/outside/',
      },
    ];
    return route.fulfill({
      status: state === 'error' ? 503 : 200,
      json: {
        results:
          state === 'ready'
            ? data.slice(
                Number(params.get('skip') || 0),
                Number(params.get('skip') || 0) +
                  Number(params.get('limit') || 1000),
              )
            : [],
        count: state === 'ready' ? 24 : 0,
      },
    });
  });
}

for (const width of [390, 1440]) {
  test(`message has native bullets above the comment form and no sidebar at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await mockComments(page);
    const vendorRequests: string[] = [];
    page.on('request', (request) => {
      if (request.url().includes('/envelope.min.js'))
        vendorRequests.push(request.url());
    });
    await page.goto('/message/');
    const overlay = page.locator('#barrage');
    await expect(overlay).toHaveAttribute('data-comment-count', '24');
    await expect(page.locator('#aside-content')).toHaveCount(0);
    await expect(page.locator('#vcomment textarea')).toBeVisible();
    await expect(overlay).toHaveCSS('position', 'relative');
    const layout = await page.evaluate(() => {
      const stage = document.getElementById('barrage')!;
      const region = document.querySelector('.message-barrage-region')!;
      const form = document.getElementById('post-comment')!;
      return {
        contained: region.contains(stage),
        gap:
          form.getBoundingClientRect().top -
          stage.getBoundingClientRect().bottom,
        height: stage.getBoundingClientRect().height,
        border: getComputedStyle(region).borderBottomStyle,
      };
    });
    expect(layout.contained).toBe(true);
    expect(layout.gap).toBeGreaterThanOrEqual(48);
    expect(layout.height).toBe(width <= 768 ? 240 : 320);
    expect(layout.border).toBe('solid');
    await expect(
      page.locator('.comment-wall, .comment-wall__track'),
    ).toHaveCount(0);
    const bullet = page.locator('.message-danmaku').first();
    await expect
      .poll(() => bullet.evaluate((el) => el.getBoundingClientRect().x))
      .toBeLessThan(width - 80);
    const before = await bullet.evaluate((el) => el.getBoundingClientRect().x);
    await expect
      .poll(() => bullet.evaluate((el) => el.getBoundingClientRect().x))
      .toBeLessThan(before - 30);
    await expect(bullet.locator('span')).toHaveCSS('white-space', 'nowrap');
    for (const theme of ['light', 'dark']) {
      await page.evaluate((value) => {
        document.documentElement.dataset.theme = value;
      }, theme);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
    }
    await expect(overlay).not.toContainText('其他站点');
    expect(vendorRequests).toHaveLength(0);
  });
}

test('bullets pause on hover, hide, resume and clean up on navigation', async ({
  page,
}) => {
  await mockComments(page);
  await page.goto('/message/');
  const bullet = page.locator('.message-danmaku').first();
  await expect
    .poll(() => bullet.evaluate((el) => el.getBoundingClientRect().right))
    .toBeLessThan(1270);
  const box = await bullet.boundingBox();
  await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
  const paused = await bullet.getAttribute('style');
  await page.waitForTimeout(200);
  expect(await bullet.getAttribute('style')).toBe(paused);
  await page.locator('[data-message-barrage="hide"]').click();
  await expect(page.locator('#barrage')).toBeHidden();
  const hidden = await bullet.getAttribute('style');
  await page.waitForTimeout(200);
  expect(await bullet.getAttribute('style')).toBe(hidden);
  await page.locator('[data-message-barrage="show"]').click();
  await expect(page.locator('#barrage')).toBeVisible();
  const resumedBox = await bullet.boundingBox();
  await page.mouse.click(
    resumedBox!.x + resumedBox!.width / 2,
    resumedBox!.y + resumedBox!.height / 2,
  );
  await expect(page).toHaveURL(/\/message\/$/); // first bullet belongs to this page
  await page.locator('#menus a[href="/links/"]').first().click();
  await expect(page).toHaveURL(/\/links\/$/);
  await expect(page.locator('#barrage')).toHaveCount(0);
  await page.goBack();
  await expect(page.locator('#barrage')).toHaveCount(1);
  await expect(page.locator('.message-danmaku').first()).toBeAttached();
});

test('message barrage honors reduced motion and can be explicitly enabled', async ({
  page,
}) => {
  await mockComments(page);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/message/');
  await expect(page.locator('#barrage')).toHaveAttribute(
    'data-initialized',
    'true',
  );
  await expect(page.locator('#barrage')).toBeHidden();
  await page.locator('[data-message-barrage="show"]').click();
  await expect(page.locator('#barrage')).toBeVisible();
  await expect(page.locator('.message-danmaku').first()).toBeAttached();
});

for (const state of ['empty', 'error'] as const) {
  test(`message barrage handles ${state} comments without blocking the form`, async ({
    page,
  }) => {
    await mockComments(page, state);
    await page.goto('/message/');
    await expect(page.locator('#message-barrage-status')).toHaveAttribute(
      'aria-busy',
      'false',
    );
    await expect(page.locator('#message-barrage-status')).not.toBeEmpty();
    await expect(page.locator('.message-danmaku')).toHaveCount(0);
    await expect(page.locator('#vcomment textarea')).toBeVisible();
  });
}

test('message fetches the complete site feed without putting every comment into the DOM', async ({
  page,
}) => {
  await mockComments(page);
  const data = Array.from({ length: 1001 }, (_, i) => ({
    ...comments[i % comments.length],
    objectId: `all-${i}`,
  }));
  const offsets: number[] = [];
  await page.route('**/1.1/**', (route) => {
    const params = new URL(route.request().url()).searchParams;
    const skip = Number(params.get('skip') || 0);
    if (params.has('skip')) offsets.push(skip);
    return route.fulfill({
      json: {
        results: data.slice(skip, skip + Number(params.get('limit') || 0)),
        count: data.length,
      },
    });
  });
  await page.goto('/message/');
  await expect(page.locator('#barrage')).toHaveAttribute(
    'data-comment-count',
    '1001',
  );
  expect(offsets).toContain(1000);
  expect(await page.locator('.message-danmaku').count()).toBeLessThan(50);
});

test('independent bullets loop without collisions in a lane', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await mockComments(page);
  await page.route('http://127.0.0.1:4335/message/', async (route) => {
    const response = await route.fetch();
    await route.fulfill({
      response,
      body: (await response.text()).replace(
        'data-speed="20"',
        'data-speed="240"',
      ),
    });
  });
  await page.goto('/message/');
  await expect(page.locator('#barrage')).toHaveAttribute(
    'data-initialized',
    'true',
  );
  await page.evaluate(() => {
    (window as any).loopCount = document.querySelectorAll(
      '[data-comment-id="message-0"]',
    ).length;
    new MutationObserver((records) => {
      for (const record of records)
        for (const node of record.addedNodes) {
          if (
            node instanceof HTMLElement &&
            node.dataset.commentId === 'message-0'
          )
            (window as any).loopCount += 1;
        }
    }).observe(document.getElementById('barrage')!, { childList: true });
  });
  await expect
    .poll(() => page.evaluate(() => (window as any).loopCount))
    .toBeGreaterThan(1);
  const overlapping = await page.locator('#barrage').evaluate((container) => {
    const lanes = new Map<string, DOMRect[]>();
    container
      .querySelectorAll<HTMLElement>('.message-danmaku')
      .forEach((item) => {
        const key = item.dataset.lane!;
        lanes.set(key, [
          ...(lanes.get(key) || []),
          item.getBoundingClientRect(),
        ]);
      });
    return [...lanes.values()].some((rects) =>
      rects
        .sort((a, b) => a.x - b.x)
        .some((rect, index) => index > 0 && rect.x < rects[index - 1].right),
    );
  });
  expect(overlapping).toBe(false);
});
