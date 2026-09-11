import { test, expect } from '@playwright/test';

test('desktop console opens, switches theme and closes without navigating', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute(
    'data-solitude-runtime',
    'ready',
  );
  await page.locator('#nav-console a').click();
  await expect(page.locator('#console')).toHaveClass(/show/);
  const theme = await page.locator('html').getAttribute('data-theme');
  await page.locator('#console .darkmode_switchbutton').click();
  await expect(page.locator('html')).toHaveAttribute(
    'data-theme',
    theme === 'dark' ? 'light' : 'dark',
  );
  await expect(page.locator('#console')).toHaveClass(/show/);
  await page.locator('#nav-console a').click();
  await expect(page.locator('#console')).not.toHaveClass(/show/);
  await expect(page).toHaveURL('http://127.0.0.1:4321/');
});

test('mobile recommendation switches its cover and opens the selected article', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute(
    'data-solitude-runtime',
    'ready',
  );
  await page.locator('.home-center-indicator').nth(1).click();
  const selected = page.locator('.home-center-banner-item.active');
  await expect(selected).toHaveAttribute('data-index', '1');
  const destination = await selected.getAttribute('data-link');
  await expect(page.locator('.home-center-title-link')).toHaveAttribute(
    'href',
    destination!,
  );
  await selected.click();
  await expect(page).toHaveURL(
    new URL(destination!, 'http://127.0.0.1:4321').href,
  );
  await expect(page.locator('#post')).toBeVisible();
  await page.goBack();
  await expect(page.locator('#home_center')).toBeVisible();
});

test('mobile menu includes site statistics, theme control and navigation', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute(
    'data-solitude-runtime',
    'ready',
  );
  await page.locator('#toggle-menu a').click();
  const menu = page.locator('#sidebar-menus');
  await expect(menu).toHaveClass(/open/);
  await expect(menu.locator('.site-data .data-item')).toHaveCount(3);
  await expect(menu.locator('.site-data')).toContainText('Categories');
  await expect(menu.locator('.card-tag-cloud a').first()).toBeVisible();
  await expect(menu.locator('.webinfo')).toContainText('Total words');
  const mode = await page.locator('html').getAttribute('data-theme');
  const toggle = menu.getByRole('button', {
    name: 'Display mode',
    exact: true,
  });
  await toggle.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('html')).toHaveAttribute(
    'data-theme',
    mode === 'dark' ? 'light' : 'dark',
  );
  await menu.locator('.site-data a[href="/categories/"]').click();
  await expect(page).toHaveURL(/\/categories\/$/);
  await expect(menu).not.toHaveClass(/open/);
});

test('home cards fill the feed until the desktop columns breakpoint', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute(
    'data-solitude-runtime',
    'ready',
  );
  for (const width of [390, 768, 900, 901, 1280, 1299, 1300, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    const cards = page.locator('#recent-posts > .recent-post-item');
    // Wait for the theme's responsive width transition to settle.
    await expect
      .poll(
        async () =>
          cards.first().evaluate((el) => {
            const feed = el.parentElement!;
            const style = getComputedStyle(feed);
            const available =
              feed.clientWidth -
              parseFloat(style.paddingLeft) -
              parseFloat(style.paddingRight);
            const columns = innerWidth >= 1300 ? 2 : 1;
            const gap = columns > 1 ? parseFloat(style.columnGap) : 0;
            return Math.abs(
              el.getBoundingClientRect().width -
                (available - gap * (columns - 1)) / columns,
            );
          }),
        { message: `Card width at ${width}px` },
      )
      .toBeLessThanOrEqual(1);
    const first = (await cards.nth(0).boundingBox())!;
    const second = (await cards.nth(1).boundingBox())!;
    if (width < 1300) {
      expect(
        Math.abs(first.x - second.x),
        `${width}px: one column`,
      ).toBeLessThanOrEqual(1);
      expect(second.y).toBeGreaterThanOrEqual(first.y + first.height);
    } else {
      expect(
        Math.abs(first.y - second.y),
        `${width}px: two columns`,
      ).toBeLessThanOrEqual(1);
      expect(second.x).toBeGreaterThanOrEqual(first.x + first.width);
    }
  }
});

test('configured desktop columns share the available width without overflowing', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute(
    'data-solitude-runtime',
    'ready',
  );
  for (const columns of [1, 2, 3]) {
    await page.locator('html').evaluate((el, value) => {
      el.style.setProperty('--solitude-index-columns', String(value));
    }, columns);
    await expect
      .poll(
        () =>
          page.locator('#recent-posts').evaluate((feed, count) => {
            const cards = [...feed.querySelectorAll('.recent-post-item')];
            const first = cards[0].getBoundingClientRect();
            const lastInRow = cards[count - 1].getBoundingClientRect();
            const nextRow = cards[count].getBoundingClientRect();
            const container = feed.getBoundingClientRect();
            return (
              Math.abs(first.y - lastInRow.y) <= 1 &&
              nextRow.y >= first.bottom &&
              Math.abs(lastInRow.right - container.right) <= 1 &&
              cards.every(
                (card) =>
                  card.getBoundingClientRect().right <= container.right + 1,
              )
            );
          }, columns),
        { message: `${columns} configured columns` },
      )
      .toBe(true);
  }
});
