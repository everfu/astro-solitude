import { serveVisual } from './visual-server';
import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
import path from 'node:path';
import { gzipSync } from 'node:zlib';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

const phase = process.argv[2] ?? 'after';
if (!['before', 'after'].includes(phase))
  throw new Error('Use before or after');
const boundaries = process.argv.includes('--boundaries');
const root = path.resolve(
  'artifacts/modernization',
  boundaries ? 'boundaries' : '.',
);
const output = path.join(root, phase);
await fs.mkdir(output, { recursive: true });
const preview = await serveVisual(
  phase === 'before'
    ? 'artifacts/modernization/baseline-dist'
    : (process.env.SOLITUDE_CURRENT_DIST ?? 'dist'),
);
const browser = await chromium.launch();
const routes =
  process.env.SOLITUDE_VISUAL_ROUTES?.split(',') ??
  (boundaries
    ? [
        '/',
        '/p/writing/',
        '/p/components/',
        '/about/',
        '/archives/',
        '/links/',
        '/music/',
        '/brevity/',
      ]
    : [
        '/',
        '/p/writing/',
        '/p/components/',
        '/archives/',
        '/about/',
        '/links/',
        '/equipment/',
        '/tags/',
        '/categories/',
        '/series/',
        '/message/',
        '/brevity/',
        '/music/',
        '/recentcomments/',
        '/404.html',
        '/?search',
      ]);
// Both sides of every width breakpoint in the existing theme.
const widths =
  process.env.SOLITUDE_VISUAL_WIDTHS?.split(',').map(Number) ??
  (boundaries
    ? [
        ...new Set(
          [
            480, 600, 767, 768, 769, 899, 900, 901, 1024, 1199, 1200, 1300,
            1400,
          ].flatMap((width) => [width - 1, width + 1]),
        ),
      ].sort((a, b) => a - b)
    : [390, 768, 1280, 1440]);
const results: {
  route: string;
  width: number;
  theme: string;
  difference: number;
  overflow: boolean;
}[] = [];
const resources: Record<string, { css: number; js: number }> = {};
const errors: string[] = [];
const jobs = widths.flatMap((width) =>
  (['light', 'dark'] as const).map((theme) => ({ width, theme })),
);
async function capture(width: number, theme: 'light' | 'dark') {
  const page = await browser.newPage({
    viewport: { width, height: 900 },
    colorScheme: theme,
  });
  await page.clock.setFixedTime(new Date('2026-09-11T00:00:00Z'));
  await page.addInitScript(() => {
    document.addEventListener(
      'DOMContentLoaded',
      () => {
        document
          .querySelectorAll<HTMLElement>('[data-typeit]')
          .forEach((element) => {
            element.dataset.visualText = element.textContent ?? '';
          });
      },
      { once: true },
    );
    // Keep the visible date fixed while allowing timestamp-based SVG IDs to
    // remain unique when third-party renderers run more than once.
    let timestamp = Date.now();
    Date.now = () => timestamp++;
    let seed = 42;
    Math.random = () => {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      return seed / 4294967296;
    };
  });
  await page.route('**/*', (route) => {
    if (new URL(route.request().url()).hostname === '127.0.0.1')
      return route.continue();
    const type = route.request().resourceType();
    if (type === 'image')
      return route.fulfill({
        body: '<svg xmlns="http://www.w3.org/2000/svg" width="26" height="26"><rect width="26" height="26" rx="5" fill="#667788"/></svg>',
        contentType: 'image/svg+xml',
      });
    return route.fulfill({
      body: '',
      contentType:
        type === 'stylesheet' ? 'text/css' : 'application/javascript',
    });
  });
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (
      message.type() === 'error' &&
      message.text().includes('Solitude initialization failed')
    )
      console.error(message.text());
  });
  for (const route of routes) {
    const assets = new Map<string, Promise<{ type: string; size: number }>>();
    const collect = (response: import('@playwright/test').Response) => {
      const type = response.request().resourceType();
      if (
        width === 1440 &&
        theme === 'light' &&
        ['/', '/p/writing/'].includes(route) &&
        ['stylesheet', 'script'].includes(type) &&
        response.url().startsWith('http://127.0.0.1:')
      ) {
        assets.set(
          response.url(),
          response
            .body()
            .then((body) => ({ type, size: gzipSync(body).length }))
            .catch((error: unknown) => {
              errors.push(`Cannot measure ${response.url()}: ${String(error)}`);
              return { type, size: 0 };
            }),
        );
      }
    };
    page.on('response', collect);
    await page.goto(`${preview.url}${route}`, {
      waitUntil: 'domcontentloaded',
    });
    await page
      .waitForFunction(
        () => document.documentElement.dataset.solitudeRuntime === 'ready',
        undefined,
        { timeout: 15000, polling: 100 },
      )
      .catch(async (error) => {
        throw new Error(
          `${route} ${width} ${theme}: runtime ${await page.locator('html').getAttribute('data-solitude-runtime')}; ${errors.join('; ')}`,
          { cause: error },
        );
      });
    await page.evaluate(async () => {
      await window.__solitudeShortcodeRuntime?.init();
    });
    await page.evaluate(async (theme) => {
      document.documentElement.setAttribute('data-theme', theme);
      await document.fonts.ready;
      // Native buffering indicators vary with disk/cache timing. Keep media
      // geometry and poster pixels, and test live controls in the browser suite.
      document.querySelectorAll('video').forEach((video) => {
        video.pause();
        video.preload = 'auto';
        video.controls = false;
        video.currentTime = 0;
      });
      await Promise.all(
        Array.from(document.images).map((img) => {
          img.loading = 'eager';
          return Promise.race([
            img.decode().catch(() => {}),
            new Promise((resolve) => setTimeout(resolve, 2000)),
          ]);
        }),
      );
      document.getAnimations().forEach((a) => {
        if (a.effect?.getTiming().iterations === Infinity) a.pause();
      });
    }, theme);
    await page.waitForFunction(
      () =>
        Array.from(document.images)
          .filter(
            (img) =>
              img.getAttribute('src') && img.src.startsWith(location.origin),
          )
          .every((img) => img.complete && img.naturalWidth > 0),
      undefined,
      { polling: 100, timeout: 15000 },
    );
    await page.waitForFunction(
      () =>
        Array.from(document.querySelectorAll('video')).every(
          (video) => video.readyState >= 2 && !video.seeking,
        ),
      undefined,
      { polling: 100, timeout: 15000 },
    );
    await page.evaluate(() => {
      document.querySelectorAll('canvas').forEach((canvas) => {
        const chart = window.Chart?.getChart(canvas);
        if (chart && 'stop' in chart && typeof chart.stop === 'function')
          chart.stop();
        if (chart && 'update' in chart && typeof chart.update === 'function')
          chart.update('none');
      });
      // Preserve the fully typed text while detaching the nodes still referenced
      // by TypeIt's timers. Only the screenshot fixture is normalized.
      document
        .querySelectorAll<HTMLElement>('[data-typeit]')
        .forEach((element) => {
          const fixed = element.cloneNode(false) as HTMLElement;
          fixed.textContent = element.dataset.visualText ?? element.textContent;
          element.replaceWith(fixed);
        });
      document.querySelectorAll('.about-word-mask').forEach((element) => {
        const fixed = element.cloneNode(true) as HTMLElement;
        fixed.querySelectorAll('[data-about-word]').forEach((word, index) => {
          word.removeAttribute('data-up');
          word.toggleAttribute('data-show', index === 0);
        });
        element.replaceWith(fixed);
      });
      document.getAnimations().forEach((animation) => {
        if (animation.effect?.getTiming().iterations === Infinity) {
          animation.pause();
          animation.currentTime = 0;
        }
      });
    });
    // Let image-driven ResizeObserver layouts and native media metadata settle.
    await page.waitForTimeout(
      (await page
        .locator('.chartjs-container, .abc-music-sheet, .mermaid')
        .count())
        ? 2000
        : 350,
    );
    await page.evaluate(
      () =>
        new Promise<void>((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
        ),
    );
    if (route === '/?search') {
      await page.locator('#search-button a').click();
      await page.locator('#search-input').fill('theme');
      await page.locator('.search-result-title').first().waitFor();
    }
    const file = `${route.replace(/[^a-z0-9]/gi, '_')}-${width}-${theme}.png`;
    const screenshot = await page.screenshot({
      path: path.join(output, file),
      animations: 'disabled',
      style:
        'audio::-webkit-media-controls,video::-webkit-media-controls { visibility: hidden !important; }',
      fullPage: true,
    });
    let difference = 0;
    if (phase === 'after') {
      const before = PNG.sync.read(
        await fs.readFile(path.join(root, 'before', file)),
      );
      const after = PNG.sync.read(screenshot);
      if (before.width !== after.width || before.height !== after.height)
        difference = -1;
      else {
        const diff = new PNG({
          width: before.width,
          height: before.height,
        });
        difference = pixelmatch(
          before.data,
          after.data,
          diff.data,
          before.width,
          before.height,
          { threshold: 0.1 },
        );
        if (difference)
          await fs.writeFile(
            path.join(output, `diff-${file}`),
            PNG.sync.write(diff),
          );
      }
    }
    if (difference === 0)
      await fs.rm(path.join(output, `diff-${file}`), { force: true });
    results.push({
      route,
      width,
      theme,
      difference,
      overflow: await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth + 1,
      ),
    });
    if (
      width === 1440 &&
      theme === 'light' &&
      ['/', '/p/writing/'].includes(route)
    ) {
      const sizes = await Promise.all(assets.values());
      resources[route] = {
        css: sizes
          .filter((s) => s.type === 'stylesheet')
          .reduce((n, s) => n + s.size, 0),
        js: sizes
          .filter((s) => s.type === 'script')
          .reduce((n, s) => n + s.size, 0),
      };
    }
    page.off('response', collect);
  }
  await page.close();
  console.log(`${phase}: ${width}px ${theme} complete`);
}
try {
  await Promise.all(
    Array.from({ length: 2 }, async () => {
      while (jobs.length) {
        const job = jobs.shift()!;
        await capture(job.width, job.theme);
      }
    }),
  );
} finally {
  await browser.close();
  await preview.close();
}
results.sort(
  (a, b) =>
    a.width - b.width ||
    a.theme.localeCompare(b.theme) ||
    a.route.localeCompare(b.route),
);
const budgetFailures: string[] = [];
const newOverflows: typeof results = [];
if (phase === 'after') {
  const before = JSON.parse(
    await fs.readFile(path.join(root, 'before/results.json'), 'utf8'),
  ) as { results: typeof results };
  newOverflows.push(
    ...results.filter(
      (result) =>
        result.overflow &&
        !before.results.some(
          (baseline) =>
            baseline.route === result.route &&
            baseline.width === result.width &&
            baseline.theme === result.theme &&
            baseline.overflow,
        ),
    ),
  );
}
if (phase === 'after' && !boundaries) {
  const baseline = JSON.parse(
    await fs.readFile(path.join(root, 'before/results.json'), 'utf8'),
  ) as { resources: typeof resources };
  for (const [route, sizes] of Object.entries(resources))
    for (const type of ['css', 'js'] as const)
      if (sizes[type] > baseline.resources[route][type])
        budgetFailures.push(
          `${route} ${type}: ${sizes[type]} > ${baseline.resources[route][type]}`,
        );
}
await fs.writeFile(
  path.join(output, 'results.json'),
  JSON.stringify(
    { results, resources, errors, budgetFailures, newOverflows },
    null,
    2,
  ),
);
console.log(
  JSON.stringify(
    {
      views: results.length,
      differences: results.filter((r) => r.difference),
      resources,
      errors,
    },
    null,
    2,
  ),
);
if (
  budgetFailures.length ||
  errors.length ||
  newOverflows.length ||
  results.some((r) => r.difference)
)
  process.exitCode = 1;
