import { test, expect, type Page } from '@playwright/test';
import fs from 'node:fs/promises';

const vendor = new URL('./fixtures/music/', import.meta.url);
const playerSelector = '#nav-music :is(meting-js, solitude-meting)';
const ready = (page: Page) =>
  expect(page.locator('html')).toHaveAttribute(
    'data-solitude-runtime',
    'ready',
  );

async function mockMusic(page: Page, gate?: Promise<void>) {
  const scripts = {
    aplayer: await fs.readFile(new URL('APlayer.min.js', vendor), 'utf8'),
    meting: await fs.readFile(new URL('Meting.min.js', vendor), 'utf8'),
  };
  const requests: string[] = [];
  await page.route(/https:\/\//, async (route) => {
    const url = route.request().url();
    if (new URL(url).searchParams.get('id') === 'fixture') {
      requests.push(url);
      await gate;
      await route.fulfill({
        json: [
          {
            name: 'Local track',
            artist: 'Fixture',
            url: 'http://127.0.0.1:4332/media/shortcodes/flower.mp4',
            cover: 'http://127.0.0.1:4332/img/logo.png',
          },
          {
            name: 'Second track',
            artist: 'Fixture',
            url: 'http://127.0.0.1:4332/media/shortcodes/flower.mp4',
            cover: 'http://127.0.0.1:4332/img/logo.png',
          },
        ],
      });
      return;
    }
    await route.fulfill({
      contentType: url.includes('.css') ? 'text/css' : 'application/javascript',
      body: url.includes('APlayer.min.js')
        ? scripts.aplayer
        : url.includes('Meting.min.js')
          ? scripts.meting
          : '',
    });
  });
  return requests;
}

for (const fallback of [false, true]) {
  test(`capsule keeps its real player and playback across navigation (${fallback ? 'legacy DOM moves' : 'state-preserving DOM moves'})`, async ({
    page,
  }) => {
    if (fallback)
      await page.addInitScript(() => {
        Object.defineProperty(Element.prototype, 'moveBefore', {
          value: undefined,
        });
      });
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    const requests = await mockMusic(page);
    await page.goto('http://127.0.0.1:4332/');
    await ready(page);
    await expect(page.locator('#nav-music .aplayer')).toHaveCount(1);
    await page.evaluate(async (selector) => {
      const player = (document.querySelector(selector) as any).aplayer;
      (window as any).__capsulePlayer = player;
      player.audio.muted = true;
      player.audio.loop = true;
      await player.audio.play();
    }, playerSelector);
    await expect
      .poll(() =>
        page.evaluate(() => (window as any).__capsulePlayer.audio.currentTime),
      )
      .toBeGreaterThan(0);
    for (const path of ['/about/', '/music/', '/archives/', '/']) {
      await page.evaluate((path) => window.Solitude.navigate(path), path);
      await expect(page).toHaveURL(`http://127.0.0.1:4332${path}`);
      await ready(page);
      if (path === '/music/')
        await expect(page.locator('#Music-page .aplayer')).toHaveClass(
          /music-layout-ready/,
        );
      await expect(page.locator('#nav-music .aplayer')).toHaveCount(1);
      expect(
        await page.evaluate((selector) => {
          const player = (window as any).__capsulePlayer;
          return (
            player === (document.querySelector(selector) as any).aplayer &&
            !player.audio.paused
          );
        }, playerSelector),
      ).toBe(true);
    }
    await page.goBack();
    await expect(page).toHaveURL('http://127.0.0.1:4332/archives/');
    await ready(page);
    await page.goForward();
    await expect(page).toHaveURL('http://127.0.0.1:4332/');
    await ready(page);
    expect(
      await page.evaluate(
        (selector) =>
          (document.querySelector(selector) as any).aplayer ===
          (window as any).__capsulePlayer,
        playerSelector,
      ),
    ).toBe(true);
    // Only the capsule and the visited music hall should request a playlist.
    expect(requests).toHaveLength(2);
    expect(errors).toEqual([]);
  });
}

test('navigation while playlists are pending never destroys an absent player or mounts a detached hall', async ({
  page,
}) => {
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const requests = await mockMusic(page, gate);
  await page.goto('http://127.0.0.1:4332/music/');
  await ready(page);
  await expect.poll(() => requests.length).toBe(2);
  await page.evaluate(() => {
    const hall = document.querySelector(
      '#Music-page :is(meting-js, solitude-meting)',
    ) as any;
    (window as any).__oldHall = hall;
    const load = hall._loadPlayer;
    hall._loadPlayer = function (audio: unknown[]) {
      load.call(this, audio);
      (window as any).__hallResponseHandled = true;
    };
  });
  await page.evaluate(() => window.Solitude.navigate('/about/'));
  await expect(page).toHaveURL('http://127.0.0.1:4332/about/');
  await ready(page);
  release();
  await expect(page.locator('#nav-music .aplayer')).toHaveCount(1);
  // Wait for the actual late callback, not just the network response.
  await expect
    .poll(() => page.evaluate(() => (window as any).__hallResponseHandled))
    .toBe(true);
  await expect
    .poll(() =>
      page.evaluate(() =>
        (window as any).__oldHall.aplayer?.audio
          ? 'mounted'
          : (window as any).__oldHall.childElementCount,
      ),
    )
    .toBe(0);
  expect(requests).toHaveLength(2);
  expect(errors).toEqual([]);
});

test('leaving a playing music hall disposes its audio and capsule controls still work', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await mockMusic(page);
  await page.goto('http://127.0.0.1:4332/music/');
  await ready(page);
  await expect(page.locator('#Music-page .aplayer')).toHaveClass(
    /music-layout-ready/,
  );
  await expect(page.locator('#nav-music .aplayer')).toHaveCount(1);
  await page.evaluate(async () => {
    const hall = (document.querySelector('#Music-page solitude-meting') as any)
      .aplayer;
    (window as any).__hallAudio = hall.audio;
    hall.audio.muted = true;
    await hall.audio.play();
  });
  await page.locator('#site-name').click();
  await expect(page.locator('#recent-posts')).toBeVisible();
  await ready(page);
  expect(await page.evaluate(() => (window as any).__hallAudio.paused)).toBe(
    true,
  );
  await page.evaluate((selector) => {
    (document.querySelector(selector) as any).aplayer.audio.muted = true;
  }, playerSelector);
  await page.locator('#nav-music').hover();
  await page.locator('#music-play').click();
  await expect
    .poll(() =>
      page.evaluate(
        (selector) =>
          !(document.querySelector(selector) as any).aplayer.audio.paused,
        playerSelector,
      ),
    )
    .toBe(true);
  await expect(page.locator('#nav-music')).toHaveClass(/playing/);
  expect(errors).toEqual([]);
});
