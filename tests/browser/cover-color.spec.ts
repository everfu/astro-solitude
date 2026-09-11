import { test, expect, type Page } from '@playwright/test';
import fs from 'node:fs/promises';

// Music color regressions need an explicitly enabled player.
test.use({ baseURL: 'http://127.0.0.1:4336' });

const ready = (page: Page) =>
  expect(page.locator('html')).toHaveAttribute(
    'data-solitude-runtime',
    'ready',
  );
const mainColor = (page: Page) =>
  page.evaluate(() =>
    document.documentElement.style.getPropertyValue('--efu-main'),
  );
const musicColor = (page: Page) =>
  page
    .locator('#nav-music')
    .evaluate((node) =>
      (node as HTMLElement).style.getPropertyValue('--efu-music'),
    );

async function mockAssets(page: Page, playlistGate?: Promise<void>) {
  const player = await fs.readFile(
    new URL('./fixtures/music/APlayer.min.js', import.meta.url),
    'utf8',
  );
  const meting = await fs.readFile(
    new URL('./fixtures/music/Meting.min.js', import.meta.url),
    'utf8',
  );
  await page.route('**/color-fixture-*.svg', (route) =>
    route.fulfill({
      contentType: 'image/svg+xml',
      body: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><path fill="${route.request().url().includes('red') ? '#dc503c' : '#2878c8'}" d="M0 0h40v40H0z"/></svg>`,
    }),
  );
  await page.route(/https:\/\//, async (route) => {
    const address = route.request().url();
    if (new URL(address).searchParams.has('id')) {
      await playlistGate;
      return route.fulfill({
        json: ['red', 'blue'].map((color) => ({
          name: color,
          artist: 'Color fixture',
          url: '/media/shortcodes/flower.mp4',
          cover: `http://127.0.0.1:4336/color-fixture-${color}.svg`,
        })),
      });
    }
    // Exercise the native image fallback with the optional color CDN absent.
    return route.fulfill({
      contentType: address.includes('.css')
        ? 'text/css'
        : 'application/javascript',
      body: address.includes('APlayer.min.js')
        ? player
        : address.includes('Meting.min.js')
          ? meting
          : '',
    });
  });
}

for (const width of [1440, 390]) {
  test(`article cover colors update across navigation at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await mockAssets(page);
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto('/p/getting-started/');
    await ready(page);
    await expect(page.locator('#post-cover')).toBeVisible();
    await expect.poll(() => mainColor(page)).toMatch(/^#[\da-f]{6}$/i);
    const first = await mainColor(page);
    await page.evaluate(() => window.Solitude.navigate('/p/configuration/'));
    await expect(page).toHaveURL(/\/p\/configuration\/$/);
    await ready(page);
    await expect.poll(() => mainColor(page)).toMatch(/^#[\da-f]{6}$/i);
    expect(await mainColor(page)).not.toBe(first);
    await page.evaluate(() => window.Solitude.toggleTheme());
    await expect.poll(() => mainColor(page)).toMatch(/^#[\da-f]{6}$/i);
    await page.evaluate(() => window.Solitude.navigate('/about/'));
    await expect(page).toHaveURL(/\/about\/$/);
    await ready(page);
    await expect.poll(() => mainColor(page)).toBe('var(--efu-theme)');
    expect(errors).toEqual([]);
  });
}

test('capsule samples its initial artwork and paused track switches without loading audio', async ({
  page,
}) => {
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await mockAssets(page, gate);
  await page.goto('/');
  await ready(page);
  release();
  await expect.poll(() => musicColor(page)).toMatch(/^#(?:b04030|2060a0)$/);
  await page.evaluate(() => {
    const player = (document.querySelector('#nav-music solitude-meting') as any)
      .aplayer;
    const redIndex = player.list.audios.findIndex(
      (track: any) => track.name === 'red',
    );
    player.list.switch(redIndex);
  });
  await expect.poll(() => musicColor(page)).toBe('#b04030');
  await page.evaluate(() => {
    const player = (document.querySelector('#nav-music solitude-meting') as any)
      .aplayer;
    player.list.switch(
      player.list.audios.findIndex((track: any) => track.name === 'blue'),
    );
  });
  await expect.poll(() => musicColor(page)).toBe('#2060a0');
  await page.evaluate(() => window.Solitude.navigate('/about/'));
  await expect(page).toHaveURL(/\/about\/$/);
  await ready(page);
  await expect.poll(() => musicColor(page)).toBe('#2060a0');
  expect(
    await page.evaluate(
      () =>
        (document.querySelector('#nav-music solitude-meting') as any).aplayer
          .audio.paused,
    ),
  ).toBe(true);
});

test('missing artwork resets only its own color and late failures cannot reset a newer cover', async ({
  page,
}) => {
  await mockAssets(page);
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route('**/missing-cover.png', async (route) => {
    await gate;
    await route.fulfill({ status: 404, body: '' });
  });
  await page.goto('/p/getting-started/');
  await ready(page);
  await expect.poll(() => mainColor(page)).toMatch(/^#[\da-f]{6}$/i);
  await page.evaluate(() => {
    (document.querySelector('#post-cover') as HTMLImageElement).src =
      '/missing-cover.png';
    (window as any).__pendingColor = window.Solitude.coverColor();
  });
  await page.evaluate(() => {
    (document.querySelector('#post-cover') as HTMLImageElement).src =
      '/color-fixture-blue.svg';
    return window.Solitude.coverColor();
  });
  const current = await mainColor(page);
  release();
  await page.evaluate(() => (window as any).__pendingColor);
  expect(await mainColor(page)).toBe(current);
  await expect.poll(() => musicColor(page)).toMatch(/^#(?:b04030|2060a0)$/);
  await page.evaluate(() => {
    (
      document.querySelector('#nav-music .aplayer-pic') as HTMLElement
    ).style.backgroundImage = '';
    return window.Solitude.coverColor(true);
  });
  await expect.poll(() => musicColor(page)).toBe('');
  expect(await mainColor(page)).toBe(current);
});

test('cross-origin artwork uses a blurred cover and clears the fallback after switching back', async ({
  page,
}) => {
  await mockAssets(page);
  await page.route('https://artwork.invalid/cover.svg', (route) => {
    if (route.request().headers().origin) return route.abort('failed');
    return route.fulfill({
      contentType: 'image/svg+xml',
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><path fill="#dc503c" d="M0 0h40v40H0z"/></svg>',
    });
  });
  await page.goto('/');
  await ready(page);
  await expect.poll(() => musicColor(page)).toMatch(/^#[\da-f]{6}$/i);
  await page.evaluate(() => {
    (
      document.querySelector('#nav-music .aplayer-pic') as HTMLElement
    ).style.backgroundImage = 'url("https://artwork.invalid/cover.svg")';
    return window.Solitude.coverColor(true);
  });
  await expect(page.locator('#nav-music')).toHaveAttribute(
    'data-cover-color-fallback',
    '',
  );
  await page.locator('#nav-music').hover();
  expect(
    await page
      .locator('#nav-music .aplayer')
      .evaluate((node) => getComputedStyle(node, '::before').backgroundImage),
  ).toContain('artwork.invalid/cover.svg');
  expect(
    await page
      .locator('#nav-music .aplayer')
      .evaluate((node) => getComputedStyle(node, '::before').filter),
  ).toContain('blur(30px)');
  await page.evaluate(() => {
    (
      document.querySelector('#nav-music .aplayer-pic') as HTMLElement
    ).style.backgroundImage = 'url("/color-fixture-blue.svg")';
    return window.Solitude.coverColor(true);
  });
  await expect.poll(() => musicColor(page)).toBe('#2060a0');
  await expect(page.locator('#nav-music')).not.toHaveAttribute(
    'data-cover-color-fallback',
  );
});
