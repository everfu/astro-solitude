import { chromium } from '@playwright/test';
import { gzipSync } from 'node:zlib';
import fs from 'node:fs/promises';
import { serveVisual } from './visual-server';

const report: Record<
  string,
  Record<
    string,
    { total: number; css: number; js: number; html: number; requests: number }
  >
> = {};
const browser = await chromium.launch();
try {
  for (const phase of ['before', 'after']) {
    const preview = await serveVisual(
      phase === 'before'
        ? 'artifacts/modernization/baseline-dist'
        : (process.env.SOLITUDE_CURRENT_DIST ?? 'dist'),
    );
    report[phase] = {};
    try {
      for (const route of ['/', '/p/writing/']) {
        const page = await browser.newPage({
          viewport: { width: 1440, height: 900 },
          colorScheme: 'light',
        });
        await page.clock.setFixedTime(new Date('2026-09-11T00:00:00Z'));
        await page.route('https://**', (request) =>
          request.fulfill({ body: '', contentType: 'application/javascript' }),
        );
        const assets = new Map<
          string,
          Promise<{ type: string; bytes: number }>
        >();
        page.on('response', (response) => {
          if (!response.url().startsWith(preview.url)) return;
          const type = response.request().resourceType();
          assets.set(
            response.url(),
            response.body().then((body) => ({
              type,
              bytes: ['image', 'font', 'media'].includes(type)
                ? body.length
                : gzipSync(body).length,
            })),
          );
        });
        await page.goto(preview.url + route);
        await page.waitForFunction(
          () => document.documentElement.dataset.solitudeRuntime === 'ready',
          undefined,
          { polling: 100 },
        );
        await page.evaluate(() => document.fonts.ready);
        await page.waitForLoadState('networkidle');
        const values = await Promise.all(assets.values());
        const sum = (type?: string) =>
          values
            .filter((asset) => !type || asset.type === type)
            .reduce((total, asset) => total + asset.bytes, 0);
        report[phase][route] = {
          total: sum(),
          css: sum('stylesheet'),
          js: sum('script'),
          html: sum('document'),
          requests: values.length,
        };
        await page.close();
      }
    } finally {
      await preview.close();
    }
  }
} finally {
  await browser.close();
}
await fs.mkdir('artifacts/modernization', { recursive: true });
await fs.writeFile(
  'artifacts/modernization/load-budget.json',
  JSON.stringify(report, null, 2),
);
console.log(JSON.stringify(report, null, 2));
for (const route of Object.keys(report.before)) {
  for (const type of ['total', 'css', 'js'] as const) {
    if (report.after[route][type] > report.before[route][type])
      process.exitCode = 1;
  }
}
