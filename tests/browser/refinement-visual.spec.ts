import { test, expect } from '@playwright/test';

const phase = process.env.SOLITUDE_VISUAL_PHASE || 'after';
test('core surfaces fit responsive light and dark layouts', async ({
  page,
}) => {
  test.setTimeout(150000);
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.route('https://**', (route) =>
    route.fulfill({ body: '', contentType: 'application/javascript' }),
  );
  for (const width of [390, 768, 1280, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const theme of ['light', 'dark']) {
      for (const surface of ['home', 'post', 'archives', 'search']) {
        await page.goto(
          surface === 'post'
            ? '/p/getting-started/'
            : surface === 'archives'
              ? '/archives/'
              : '/',
        );
        await expect(page.locator('html')).toHaveAttribute(
          'data-solitude-runtime',
          'ready',
        );
        await page.evaluate(
          (theme) => document.documentElement.setAttribute('data-theme', theme),
          theme,
        );
        if (surface === 'search') {
          await page.locator('#search-button a').click();
          await page.locator('#search-input').fill('主题');
          await expect(
            page.locator('.search-result-title').first(),
          ).toBeVisible();
        }
        await expect
          .poll(() =>
            page.evaluate(
              () => document.documentElement.scrollWidth <= innerWidth,
            ),
          )
          .toBe(true);
        if ([390, 1440].includes(width)) {
          await page.screenshot({
            path: `artifacts/refinement/${phase}/${surface}-${width}-${theme}.png`,
            animations: 'disabled',
          });
        }
      }
    }
  }
  expect(errors).toEqual([]);
});
