import { test, expect } from '@playwright/test';
test.beforeEach(async ({ page }) => {
  await page.route(/https:\/\//, async (route) => {
    const address = route.request().url();
    await route.fulfill({
      contentType: address.includes('.css')
        ? 'text/css'
        : 'application/javascript',
      body: '',
    });
  });
});
test('home, article, search and history retain responsive interactions', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  await expect(page.locator('#recent-posts .recent-post-item')).toHaveCount(10);
  await expect(page.locator('html')).toHaveAttribute(
    'data-solitude-runtime',
    'ready',
  );
  await page.evaluate(async () => {
    const transition = document.startViewTransition?.(() => {});
    transition?.skipTransition();
    await transition?.finished;
  });
  await page.locator('#search-button a').click();
  await expect(page.locator('#search-input')).toBeVisible();
  await page.locator('#search-input').fill('隐藏');
  await expect(page.locator('#search-results')).toContainText('仅从首页隐藏');
  await page.keyboard.press('Escape');
  await page.locator('#recent-posts .article-title').first().click();
  await expect(page.locator('#post h1')).toHaveCount(1);
  await expect(page.locator('.solitude-code')).toHaveCount(1);
  await expect(page.locator('#card-toc a').first()).toBeVisible();
  await page.goBack();
  await expect(page.locator('#recent-posts')).toBeVisible();
  await page.goForward();
  await expect(page.locator('#post')).toBeVisible();
  await page.evaluate(() => window.Solitude.toggleTheme());
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.goto('/about/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('#about-page .about-intro-card')).toBeVisible();
  expect(errors).toEqual([]);
});
test('MDX controls work after navigation and long code expands', async ({
  page,
}) => {
  await page.goto('/p/components/');
  await expect(page.locator('html')).toHaveAttribute(
    'data-solitude-runtime',
    'ready',
  );
  await expect(page.locator('#demo-tabs .nav-tabs')).toHaveCount(1);
  await page
    .locator('#demo-tabs .nav-tabs')
    .getByText('MDX', { exact: true })
    .click();
  await expect(
    page.locator('#demo-tabs .tab-item-content').nth(1),
  ).toBeVisible();
  const hide = page.locator('.tag-hide-block .tag-hide-button').first();
  await hide.click();
  await expect(hide).toHaveAttribute('aria-expanded', 'true');
  await expect(
    page.locator('.tag-hide-block .tag-hide-content').first(),
  ).toBeVisible();
  await page.locator('.tag-fold summary').first().click();
  await expect(page.locator('.tag-fold').first()).toHaveAttribute('open', '');
});
for (const width of [390, 768, 1440])
  test(`layouts fit ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const route of [
      '/',
      '/p/writing/',
      '/about/',
      '/links/',
      '/equipment/',
      '/archives/',
      '/tags/',
      '/categories/',
      '/series/',
      '/message/',
      '/brevity/',
      '/music/',
      '/recentcomments/',
      '/404.html',
    ]) {
      await page.goto(route);
      await expect(page.locator('main')).toBeVisible();
      const size = await page.evaluate(() => ({
        scroll: document.documentElement.scrollWidth,
        viewport: innerWidth,
      }));
      expect(size.scroll, route).toBeLessThanOrEqual(size.viewport + 1);
    }
    if (width === 390) {
      await page.goto('/');
      await expect(page.locator('html')).toHaveAttribute(
        'data-solitude-runtime',
        'ready',
      );
      expect(
        await page
          .locator('#aside-content')
          .evaluate((el) => el.getBoundingClientRect().height),
      ).toBe(0);
      await page.locator('#toggle-menu a').click();
      await expect(page.locator('#sidebar-menus')).toHaveClass(/open/);
      await page.locator('#menu-mask').click({ position: { x: 10, y: 10 } });
      await expect(page.locator('#sidebar-menus')).not.toHaveClass(/open/);
    }
  });
test('code expansion, keyboard search, TOC and repeated page cleanup', async ({
  page,
  context,
}) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/p/writing/');
  await expect(page.locator('html')).toHaveAttribute(
    'data-solitude-runtime',
    'ready',
  );
  const long = page.locator('.solitude-code').last();
  const expand = long.getByRole('button', { name: '展开全部', exact: true });
  await expect(expand).toBeVisible();
  await expand.click();
  await expect(long.locator('button[aria-expanded]')).toHaveAttribute(
    'aria-expanded',
    'true',
  );
  await long.hover();
  await long.getByRole('button', { name: '复制', exact: true }).click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain(
    'Publish your own site',
  );
  for (const route of ['/about/', '/p/writing/', '/links/', '/p/writing/']) {
    await page.evaluate((path) => window.Solitude.navigate(path), route);
    await page.waitForURL(`**${route}`);
    await expect(page.locator('html')).toHaveAttribute(
      'data-solitude-runtime',
      'ready',
    );
  }
  await page.keyboard.press('Control+k');
  await expect(page.locator('#search-input')).toBeFocused();
  await page.locator('#search-input').fill('隐藏');
  await expect(page.locator('#search-results')).toContainText('仅从首页隐藏');
  await page.keyboard.press('Escape');
  await expect(page.locator('#search-input')).not.toBeVisible();
  await page
    .locator('#card-toc > .toc-content > .toc > .toc-item > a')
    .first()
    .click();
  await expect(page.locator('#card-toc .toc-child').first()).toBeVisible();
  await page.locator('#card-toc a').last().click();
  await expect
    .poll(() =>
      page
        .locator('#post h2')
        .last()
        .evaluate((el) => Math.abs(el.getBoundingClientRect().top)),
    )
    .toBeLessThan(120);
  expect(await page.locator('.solitude-code').count()).toBe(2);
});

test('home metadata, category tags and hover menus retain source behavior', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute(
    'data-solitude-runtime',
    'ready',
  );
  const update = page.locator('.webinfo-item time');
  await expect(update).toHaveAttribute('datetime', /\d{4}-\d{2}-\d{2}T/);
  await expect(update).not.toContainText('1970');
  const group = page.locator('#menus > .menus_items > .menus_item > a').first();
  await group.focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL('http://127.0.0.1:4321/');
  await page.locator('.recent-post-item .article-meta__tags').first().click();
  await expect(page).toHaveURL(/\/tags\/astro\/$/);
  await expect(page.locator('#post')).toHaveCount(0);
});
