import { test, expect } from '@playwright/test';
const providerMock = (name: string) =>
  `(()=>{window.__mounts??=[];window.__destroyed??=[];const init=options=>{window.__mounts.push({provider:${JSON.stringify(name)},path:options.path??options.pageKey,options});document.querySelector(options.el).textContent='${name} ready';return{destroy(){window.__destroyed.push(${JSON.stringify(name)})}}};window.${name === 'valine' ? 'Valine' : name === 'waline' ? 'Waline' : name === 'artalk' ? 'Artalk' : 'twikoo'}=${name === 'valine' ? 'function(options){return init(options)}' : '{init}'};})();`;
test('five comment adapters mount once per page and dispose before returning', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.route(/https:\/\/(?!127\.0\.0\.1)/, async (route) => {
    const address = route.request().url();
    const provider = ['twikoo', 'waline', 'valine', 'artalk'].find(
      (p) => address.toLowerCase().includes(p) && address.endsWith('.js'),
    );
    let body = '';
    if (provider) body = providerMock(provider);
    if (address.includes('giscus.app/client.js'))
      body =
        "window.__giscus??=[];window.__giscus.push(document.currentScript.dataset.repo);document.currentScript.parentElement.append('giscus ready');";
    await route.fulfill({
      contentType: address.includes('.css')
        ? 'text/css'
        : address.includes('comments.invalid')
          ? 'application/json'
          : 'application/javascript',
      body: address.includes('comments.invalid')
        ? '{"results":[],"count":0}'
        : body,
    });
  });
  await page.goto('http://127.0.0.1:4332/p/writing/');
  for (const selector of [
    '#twikoo',
    '#waline-wrap',
    '#vcomment',
    '#artalk-wrap',
    '.giscus-comment',
  ])
    await expect(page.locator(selector)).toContainText('ready');
  const mounted = await page.evaluate(() => (window as any).__mounts);
  expect(mounted).toHaveLength(4);
  for (const record of mounted) expect(record.path).toBe('/p/writing/');
  await page.evaluate(() => window.Solitude.navigate('/about/'));
  await expect(page.locator('#about-page')).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => (window as any).__destroyed.length))
    .toBe(4);
  await page.goBack();
  for (const selector of [
    '#twikoo',
    '#waline-wrap',
    '#vcomment',
    '#artalk-wrap',
    '.giscus-comment',
  ])
    await expect(page.locator(selector)).toContainText('ready');
  await expect
    .poll(() => page.evaluate(() => (window as any).__mounts.length))
    .toBe(8);
  expect(await page.evaluate(() => (window as any).__giscus)).toHaveLength(2);
  expect(errors).toEqual([]);
});
test('persistent capsule retains the same playing audio element across navigation', async ({
  page,
}) => {
  await page.route(/https:\/\//, async (route) => {
    await route.fulfill({
      contentType: route.request().url().includes('.css')
        ? 'text/css'
        : 'application/javascript',
      body: '',
    });
  });
  await page.goto('http://127.0.0.1:4332/');
  await expect(page.locator('html')).toHaveAttribute(
    'data-solitude-runtime',
    'ready',
  );
  await page.evaluate(async () => {
    const audio = document.createElement('audio');
    audio.src = '/media/shortcodes/flower.mp4';
    audio.loop = true;
    audio.muted = true;
    audio.id = 'fixture-audio';
    document.querySelector('#nav-music')!.append(audio);
    (window as any).__audio = audio;
    await audio.play();
  });
  await expect
    .poll(() => page.evaluate(() => (window as any).__audio.currentTime))
    .toBeGreaterThan(0);
  await page.evaluate(() => window.Solitude.navigate('/about/'));
  await expect(page.locator('#about-page')).toBeVisible();
  expect(
    await page.evaluate(() => {
      const audio = (window as any).__audio;
      return (
        audio === document.querySelector('#fixture-audio') && !audio.paused
      );
    }),
  ).toBe(true);
  await page.goBack();
  await expect(page.locator('#recent-posts')).toBeVisible();
  expect(
    await page.evaluate(
      () =>
        (window as any).__audio === document.querySelector('#fixture-audio'),
    ),
  ).toBe(true);
});
