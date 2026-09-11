import { expect, test } from '@playwright/test';

test.use({ baseURL: 'http://127.0.0.1:4335' });

for (const width of [390, 1440]) {
  test(`Valine keeps its injected styles through navigation at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    let scriptLoads = 0;
    // Model the vendor's one-time CSS injection separately from each mount.
    // No live comments or visitor counters are written by this regression test.
    await page.route(/https?:\/\/(?!127\.0\.0\.1|localhost)/, async (route) => {
      const url = route.request().url();
      if (url.includes('/1.1/')) {
        await route.fulfill({ json: { results: [], count: 0 } });
      } else if (url.includes('/valine@')) {
        scriptLoads++;
        await route.fulfill({
          contentType: 'application/javascript',
          body: `
            const style = document.createElement('style');
            style.textContent = '.v[data-class=v] .vpower { font-size: 12px; text-align: right; }';
            document.head.append(style);
            window.Valine = class {
              constructor({ el }) {
                const mount = document.querySelector(el);
                mount.classList.add('v');
                mount.dataset.class = 'v';
                mount.innerHTML = '<div class="vpower">Powered By Valine</div>';
              }
              destroy() {}
            };
          `,
        });
      } else {
        await route.fulfill({
          contentType: url.includes('.css')
            ? 'text/css'
            : 'application/javascript',
          body: '',
        });
      }
    });
    const ready = () =>
      expect(page.locator('html')).toHaveAttribute(
        'data-solitude-runtime',
        'ready',
      );
    const styled = async () => {
      await ready();
      await expect(page.locator('#vcomment .vpower')).toHaveCSS(
        'font-size',
        '12px',
      );
      await expect(page.locator('#vcomment .vpower')).toHaveCSS(
        'text-align',
        'right',
      );
      await expect(page.locator('#vcomment')).toHaveClass(/valine-theme-style/);
      expect(
        await page
          .locator('head style')
          .evaluateAll(
            (styles) =>
              styles.filter((style) =>
                style.textContent?.includes('.v[data-class=v]'),
              ).length,
          ),
      ).toBe(1);
    };
    await page.goto('/p/comments/');
    await styled();
    await page.evaluate(() => {
      const style = document.createElement('style');
      style.id = 'unrelated-page-style';
      style.textContent = '.unrelated-page { color: red; }';
      document.head.append(style);
    });
    for (const path of ['/recentcomments/', '/message/', '/p/comments/']) {
      await page.evaluate((path) => window.Solitude.navigate(path), path);
      await expect(page).toHaveURL(new RegExp(`${path}$`));
      await ready();
      await expect(page.locator('#unrelated-page-style')).toHaveCount(0);
      if (path !== '/recentcomments/') await styled();
    }
    await page.goBack();
    await expect(page).toHaveURL(/\/message\/$/);
    await styled();
    await page.goForward();
    await expect(page).toHaveURL(/\/p\/comments\/$/);
    await styled();
    expect(scriptLoads).toBe(1);
  });
}
