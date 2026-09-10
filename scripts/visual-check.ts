import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
const browser = await chromium.launch();
const results = [];
await fs.mkdir('artifacts/visual', { recursive: true });
for (const width of [390, 768, 1440])
  for (const theme of ['light', 'dark'])
    for (const engine of ['hugo', 'astro']) {
      const page = await browser.newPage({
        viewport: { width, height: 900 },
        colorScheme: theme as 'light' | 'dark',
      });
      const errors: string[] = [];
      page.on('pageerror', (e) => errors.push(e.message));
      for (const [name, route] of [
        ['home', '/'],
        ['post', '/p/writing/'],
        ['about', '/about/'],
        ['links', '/links/'],
        ['equipment', '/equipment/'],
        ['archives', '/archives/'],
      ]) {
        await page.goto(
          `http://127.0.0.1:${engine === 'hugo' ? 4323 : 4321}${route}`,
          { waitUntil: 'domcontentloaded' },
        );
        await page.locator('main').waitFor();
        if (engine === 'astro')
          await page.waitForFunction(
            () => document.documentElement.dataset.solitudeRuntime === 'ready',
          );
        await page.evaluate(() => document.fonts.ready);
        await page
          .locator('html')
          .evaluate((el, t) => el.setAttribute('data-theme', t), theme);
        await page.evaluate(async () => {
          await Promise.all(
            document
              .getAnimations()
              .filter((a) => a.effect?.getTiming().iterations !== Infinity)
              .map((a) => a.finished.catch(() => {})),
          );
        });
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth + 1,
        );
        const file = `${engine}-${name}-${width}-${theme}.png`;
        await page.screenshot({ path: `artifacts/visual/${file}` });
        results.push({ engine, route, width, theme, overflow, file });
      }
      await page.close();
    }
await fs.writeFile(
  'artifacts/visual/results.json',
  JSON.stringify(results, null, 2),
);
await browser.close();
console.log(
  JSON.stringify(
    { views: results.length, overflow: results.filter((r) => r.overflow) },
    null,
    2,
  ),
);
