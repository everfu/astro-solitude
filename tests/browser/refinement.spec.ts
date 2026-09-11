import { test, expect, type Page } from '@playwright/test';

async function ready(page: Page) {
  await expect(page.locator('html')).toHaveAttribute(
    'data-solitude-runtime',
    'ready',
  );
}
const xml =
  '<search>' +
  Array.from(
    { length: 120 },
    (_, i) =>
      `<entry><title>Needle ${i} &lt;img src=x onerror=alert(1)&gt;</title><url>/p/writing/</url><content>${'Context '.repeat(30)}needle match in the body. &lt;b&gt;literal&lt;/b&gt;</content></entry>`,
  ).join('') +
  '</search>';

test.beforeEach(async ({ page }) => {
  await page.route('**/*', (route) => {
    const host = new URL(route.request().url()).hostname;
    if (host === '127.0.0.1' || host === 'localhost') return route.continue();
    return route.fulfill({ body: '', contentType: 'application/javascript' });
  });
});

test('local search retries failed indexes, safely highlights excerpts and supports keyboard navigation', async ({
  page,
}) => {
  let requests = 0;
  await page.route('**/search.xml', async (route) => {
    requests++;
    await route.fulfill({
      status: requests === 1 ? 503 : 200,
      contentType: 'application/xml',
      body: requests === 1 ? '' : xml,
    });
  });
  await page.goto('/');
  await ready(page);
  await expect.poll(() => requests).toBe(1);
  const trigger = page.locator('#search-button a');
  await trigger.click();
  await expect(page.locator('.search-retry')).toBeVisible();
  await page.locator('.search-retry').click();
  await page.locator('#search-input').fill('needle');
  await expect(page.locator('.search-result-title')).toHaveCount(10);
  await expect(page.locator('.search-result-summary').first()).toContainText(
    'needle match',
  );
  await expect(
    page.locator('#search-results img, #search-results b'),
  ).toHaveCount(0);
  await expect(page.locator('.search-result-heading').first()).toContainText(
    '<img src=x onerror=alert(1)>',
  );
  await expect(page.locator('.search-result-heading mark').first()).toHaveText(
    'Needle',
  );
  await expect(page.locator('#search-pagination [data-page]')).toHaveCount(8);
  await page.locator('#search-pagination [data-page="12"]').click();
  await expect(
    page.locator('#search-pagination [aria-current="page"]'),
  ).toHaveText('12');
  await expect(page.locator('#search-results')).toContainText('Needle 110');
  await page.setViewportSize({ width: 390, height: 844 });
  for (const button of await page.locator('#search-pagination button').all()) {
    const bounds = await button.boundingBox();
    expect(bounds!.width).toBeGreaterThanOrEqual(44);
    expect(bounds!.height).toBeGreaterThanOrEqual(44);
  }
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: 'artifacts/refinement/after/search-pagination-390-light.png',
    animations: 'disabled',
  });

  await page.locator('#search-input').focus();
  await page.keyboard.press('ArrowDown');
  await expect(page.locator('.search-result-title').first()).toBeFocused();
  await page.keyboard.press('ArrowUp');
  await expect(page.locator('.search-result-title').last()).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
  await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
  await trigger.click();
  await page.locator('.search-close-button').focus();
  await page.keyboard.press('Shift+Tab');
  await expect(
    page.locator('#search-pagination [data-page="12"]'),
  ).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.locator('.search-close-button')).toBeFocused();
  await page.locator('#search-input').focus();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/p\/writing\/$/);
  await ready(page);
  await page.keyboard.press('Control+k');
  await page.locator('#search-input').fill('needle');
  await expect(page.locator('.search-result-title')).toHaveCount(10);
  expect(requests).toBe(2);
  await page.keyboard.press('Escape');
  await expect(page.locator('[inert]:not(#card-toc)')).toHaveCount(0);
});

test('deferred search merges requests, handles composition, empty results and invalid XML', async ({
  page,
}) => {
  await page.route('**/', async (route) => {
    if (route.request().resourceType() !== 'document') return route.continue();
    const response = await route.fetch();
    await route.fulfill({
      response,
      body: (await response.text()).replaceAll(
        '"preload":true',
        '"preload":false',
      ),
    });
  });
  let requests = 0;
  let release!: () => void;
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route('**/search.xml', async (route) => {
    requests++;
    if (requests === 1) await pending;
    await route.fulfill({
      contentType: 'application/xml',
      body: requests === 1 ? '<broken>' : xml,
    });
  });
  await page.goto('/');
  await ready(page);
  expect(requests).toBe(0);
  await page.locator('#search-button a').click();
  await expect(page.locator('.search-result-loading')).toBeVisible();
  await page.keyboard.press('Escape');
  await page.locator('#search-button a').click();
  await expect.poll(() => requests).toBe(1);
  release();
  await page.locator('.search-retry').click();
  const input = page.locator('#search-input');
  await input.fill('needle');
  await expect(page.locator('.search-result-title')).toHaveCount(10);
  await input.dispatchEvent('compositionstart');
  await input.fill('不存在的词');
  await page.waitForTimeout(300); // Ensure the debounce cannot run during IME composition.
  await expect(page.locator('.search-result-title')).toHaveCount(10);
  await input.dispatchEvent('compositionend');
  await expect(page.locator('.search-result-empty')).toContainText(
    '不存在的词',
  );
  await expect(page.locator('#search-pagination')).toBeEmpty();
  await input.fill('');
  await expect(page.locator('#search-suggestions')).toBeVisible();
  expect(requests).toBe(2);
});

async function archiveFixture(page: Page) {
  const data = Array.from({ length: 120 }, (_, i) => ({
    title: `Archive ${i}`,
    url: '/p/writing/',
    cover: '/img/logo.png',
    primaryCategory: 'Tests',
    dateLabel: '1/1',
    year: i < 90 ? '2026' : '2025',
  }));
  await page.route(/\/archives\/(?:\?.*)?$/, async (route) => {
    const response = await route.fetch();
    const body = (await response.text()).replace(
      /(<template id="archive-page-data"[^>]*>)[\s\S]*?(<\/template>)/,
      `$1${JSON.stringify(data)}$2`,
    );
    await route.fulfill({ response, body });
  });
}

test('archive URLs retain filters, normalize bad values and restore browser history', async ({
  page,
}) => {
  await archiveFixture(page);
  await page.goto('/archives/?campaign=keep&year=invalid&page=999');
  await ready(page);
  await expect(page).toHaveURL(/campaign=keep&page=12$/);
  await expect(page.locator('.archive-page-number[aria-current]')).toHaveText(
    '12',
  );
  await page.locator('[data-year="2026"]').click();
  await ready(page);
  await expect(page).toHaveURL(/campaign=keep&year=2026$/);
  await page.locator('[data-archive-page="9"]').click();
  await ready(page);
  await expect(page).toHaveURL(/campaign=keep&year=2026&page=9$/);
  const destination = page.url();
  await page.reload();
  await ready(page);
  await expect(page.locator('#archives-page-list')).toContainText('Archive 80');
  await page.locator('.archive-page-item').first().click();
  await expect(page).toHaveURL(/\/p\/writing\/$/);
  await ready(page);
  await page.goBack();
  await expect(page).toHaveURL(destination);
  await ready(page);
  await expect(page.locator('.archive-page-number[aria-current]')).toHaveText(
    '9',
  );
  await page.goBack();
  await ready(page);
  await expect(page.locator('.archive-page-number[aria-current]')).toHaveText(
    '1',
  );
  await page.goForward();
  await ready(page);
  await expect(page.locator('.archive-page-number[aria-current]')).toHaveText(
    '9',
  );
  await page.goto('/archives/?year=2025&page=-3');
  await ready(page);
  await expect(page).toHaveURL(/\?year=2025$/);
});

test('mobile TOC isolates focus, closes cleanly, locates headings and survives navigation', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('http://127.0.0.1:4336/p/writing/');
  await ready(page);
  const header = page.locator('#page-header');
  const height = (await header.boundingBox())!.height;
  expect(height).toBeGreaterThanOrEqual(300);
  expect(height).toBeLessThanOrEqual(400);
  await page.locator('.article-container').scrollIntoViewIfNeeded();
  const toggle = page.locator('[data-solitude-toc-toggle]');
  await toggle.click();
  const panel = page.locator('#card-toc');
  await expect(panel).toHaveAttribute('role', 'dialog');
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('#toc-mask')).toBeVisible();
  await expect(page.locator('#nav-music')).toHaveCSS('opacity', '0');
  await page.screenshot({
    path: 'artifacts/refinement/after/toc-390-light.png',
    animations: 'disabled',
  });
  expect((await panel.boundingBox())!.height).toBeLessThanOrEqual(
    844 * 0.6 + 1,
  );
  await page.keyboard.press('Escape');
  await expect(toggle).toBeFocused();
  await expect(page.locator('#toc-mask')).toBeHidden();
  await toggle.click();
  await panel.locator('a').last().click();
  await expect(page).toHaveURL(/#/);
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  const target = await page.evaluate(
    () =>
      document
        .getElementById(decodeURIComponent(location.hash.slice(1)))!
        .getBoundingClientRect().top,
  );
  expect(target).toBeGreaterThanOrEqual(60);
  expect(target).toBeLessThan(120);
  await toggle.click();
  await panel.locator('.toc-close').click();
  await expect(toggle).toBeFocused();
  for (const route of ['/about/', '/p/writing/', '/p/components/']) {
    await page.evaluate((url) => window.Solitude.navigate(url), route);
    await page.waitForURL(`**${route}`);
    await ready(page);
    await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
  }
  await page.locator('.article-container').scrollIntoViewIfNeeded();
  await page.locator('[data-solitude-toc-toggle]').click();
  await expect(page.locator('#toc-mask')).toHaveCount(1);
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(page.locator('#toc-mask')).toBeHidden();
  await expect(page.locator('#aside-content #card-toc')).toHaveCount(1);
  await expect(page.locator('[inert]')).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('long titles, many tags and long TOCs remain readable in both themes', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await ready(page);
  await page.evaluate(() => {
    const title = document.querySelector<HTMLElement>('.article-title')!;
    title.textContent = '用于验证标题换行与信息层级的长标题'.repeat(12);
    title.title = title.textContent;
    const tags = document.querySelector('.article-meta.tags')!;
    const sample = tags.firstElementChild!;
    for (let i = 0; i < 12; i++) {
      const tag = sample.cloneNode(true) as HTMLElement;
      tag.textContent = '标签名称'.repeat((i % 3) + 1);
      tags.append(tag);
    }
  });
  for (const width of [390, 768, 1280, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await expect
      .poll(() =>
        page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      )
      .toBe(true);
    const card = page.locator('.recent-post-item').first();
    const metrics = await card.evaluate((el) => {
      const title = el.querySelector<HTMLElement>('.article-title')!;
      const date = el.querySelector('.post-meta-date')!.getBoundingClientRect();
      const bounds = el.getBoundingClientRect();
      return {
        titleHeight: title.offsetHeight,
        lineHeight: parseFloat(getComputedStyle(title).lineHeight),
        dateRight: date.right,
        dateBottom: date.bottom,
        right: bounds.right,
        bottom: bounds.bottom,
      };
    });
    expect(metrics.titleHeight).toBeLessThanOrEqual(metrics.lineHeight * 3 + 1);
    expect(metrics.dateRight).toBeLessThanOrEqual(metrics.right + 1);
    expect(metrics.dateBottom).toBeLessThanOrEqual(metrics.bottom + 1);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/p/writing/');
  await ready(page);
  await page.evaluate(() => {
    document.querySelector('#post-info .post-title')!.textContent =
      '超长文章标题应完整显示并撑高封面'.repeat(12);
    const article = document.querySelector('.article-container')!;
    const list = document.querySelector('#card-toc .toc')!;
    for (let i = 0; i < 40; i++) {
      const heading = document.createElement('h2');
      heading.id = `stress-${i}`;
      heading.textContent = `章节 ${i}：长目录的可见性和滚动`;
      article.append(heading);
      const item = document.createElement('li');
      item.className = 'toc-item';
      const link = document.createElement('a');
      link.className = 'toc-link';
      link.href = `#stress-${i}`;
      link.textContent = heading.textContent;
      item.append(link);
      list.append(item);
    }
    return window.Solitude.refresh();
  });
  for (const theme of ['light', 'dark']) {
    await page.evaluate(
      (theme) => (document.documentElement.dataset.theme = theme),
      theme,
    );
    const bounds = await page.locator('#post-info .post-title').boundingBox();
    const header = await page.locator('#page-header').boundingBox();
    expect(bounds!.y + bounds!.height).toBeLessThan(header!.y + header!.height);
    expect(bounds!.height).toBeGreaterThan(400);
    await page
      .locator('.article-container h1')
      .evaluate((el) =>
        el.scrollIntoView({ block: 'start', behavior: 'instant' }),
      );
    await page.locator('[data-solitude-toc-toggle]').click();
    await expect(page.locator('#card-toc')).toBeVisible();
    const dimensions = await page
      .locator('#toc-content')
      .evaluate((el) => ({ scroll: el.scrollHeight, height: el.clientHeight }));
    expect(dimensions.scroll).toBeGreaterThan(dimensions.height);
    await page.locator('#card-toc a').last().click();
    await expect(page).toHaveURL(/#stress-39$/);
    await expect(page.locator('#toc-mask')).toBeHidden();
    await expect
      .poll(() =>
        page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      )
      .toBe(true);
  }
  await page.keyboard.press('Control+k');
  await page.locator('#search-input').fill('主题');
  await expect(page.locator('.search-result-title').first()).toBeVisible();
});
