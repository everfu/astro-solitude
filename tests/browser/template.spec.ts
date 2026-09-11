import { expect, test } from '@playwright/test';

test('template starts with local search and no configured comment or online music service', async ({
  page,
}) => {
  const requests: string[] = [];
  const errors: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  page.on('pageerror', (error) => errors.push(error.message));
  // Observe attempted requests while isolating optional CDN availability.
  await page.route('https://**', (route) =>
    route.fulfill({ body: '', contentType: 'application/javascript' }),
  );
  for (const route of [
    '/',
    '/p/writing/',
    '/music/',
    '/message/',
    '/recentcomments/',
  ]) {
    await page.goto(route);
    await expect(page.locator('html')).toHaveAttribute(
      'data-solitude-runtime',
      'ready',
    );
    await expect(
      page.locator(
        '#nav-music, #post-comment, .card-recent-comment, #message-barrage',
      ),
    ).toHaveCount(0);
    await expect(
      page.locator(
        '#menus a[href="/music/"], #menus a[href="/message/"], #menus a[href="/recentcomments/"]',
      ),
    ).toHaveCount(0);
  }
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute(
    'data-solitude-runtime',
    'ready',
  );
  await page.locator('#search-button a').click();
  await page.locator('#search-input').fill('隐藏');
  await expect(page.locator('#search-results')).toContainText('仅从首页隐藏');
  expect(requests.some((url) => url.endsWith('/search.xml'))).toBe(true);
  expect(
    requests.filter((url) =>
      /meting\.efu\.me|lc-cn-|comments\.invalid|\/(?:valine|waline|twikoo|artalk|aplayer|meting)@|giscus\.app/i.test(
        url,
      ),
    ),
  ).toEqual([]);
  expect(errors).toEqual([]);
});
