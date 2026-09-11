import test from 'node:test';
import assert from 'node:assert/strict';
import {
  homePosts,
  published,
  paginate,
  contentPath,
  assertUniquePaths,
  taxonomy,
  wordCount,
} from '../src/lib/content';
import { defineSolitudeConfig, mergeConfig } from '../src/lib/config';
const post = (id: string, home = true, draft = false, sticky = false) =>
  ({
    id,
    collection: 'posts',
    data: {
      title: id,
      date: new Date(`2026-01-${id === 'old' ? '01' : '02'}`),
      home,
      draft,
      sticky,
      categories: ['分类'],
      tags: ['Astro'],
      series: [],
    },
  }) as any;
test('home visibility is limited to home collection', () => {
  const posts = [
    post('visible'),
    post('hidden', false),
    post('draft', true, true),
  ];
  assert.deepEqual(
    homePosts(published(posts)).map((p) => p.id),
    ['visible'],
  );
  assert.equal(published(posts).length, 2);
  assert.equal(taxonomy(published(posts), 'tags')[0].posts.length, 2);
  assert.equal(published(posts, true).length, 3);
});
test('sticky posts precede newer posts without changing archive order', () => {
  const posts = [post('new'), post('old', true, false, true)];
  assert.equal(homePosts(posts)[0].id, 'old');
  assert.equal(posts[0].id, 'new');
});
test('pagination handles zero, full and partial pages', () => {
  assert.deepEqual(paginate([], 10), [[]]);
  assert.deepEqual(paginate([1, 2, 3], 2), [[1, 2], [3]]);
  assert.throws(() => paginate([1], 0));
});
test('explicit HTML URLs and Unicode conflicts are validated', () => {
  assert.equal(contentPath(post('example')), '/p/example/');
  assert.equal(
    contentPath({ ...post('old'), data: { url: '/p/old.html' } }),
    '/p/old.html',
  );
  assert.throws(() =>
    contentPath({ ...post('bad'), data: { url: '//example.org' } }),
  );
  assert.throws(() => assertUniquePaths(['/分类/', '/%E5%88%86%E7%B1%BB/']));
  assert.throws(() => assertUniquePaths(['/about', '/about/']));
});
test('configuration merges objects and replaces arrays', () => {
  assert.deepEqual(
    mergeConfig(
      { a: { b: 1, c: 2 }, list: [1, 2] },
      { a: { b: 3 }, list: [9] },
    ),
    { a: { b: 3, c: 2 }, list: [9] },
  );
  const c = defineSolitudeConfig({ theme: { hometop: { enable: false } } });
  assert.equal(c.locale, 'en');
  assert.equal(c.timeZone, 'UTC');
  assert.equal(c.theme.hometop.enable, false);
  assert.equal(c.theme.search.enable, true);
  assert.throws(() => defineSolitudeConfig({ pagination: 0 }));
  assert.throws(() =>
    defineSolitudeConfig({
      theme: {
        keyboard: {
          list: [{ modifier: 'mod', key: 'K', url: '/', action: 'openSearch' }],
        },
      },
    }),
  );
});
test('all UI locales include the complete key set', async () => {
  const { default: fs } = await import('node:fs/promises');
  const langs = await Promise.all(
    ['zh-CN', 'zh-TW', 'en', 'es'].map(async (lang) =>
      JSON.parse(await fs.readFile(`src/i18n/${lang}.json`, 'utf8')),
    ),
  );
  const expected = Object.keys(langs[0]).sort();
  for (const lang of langs)
    assert.deepEqual(Object.keys(lang).sort(), expected);
});
test('directory index aliases cannot collide with a page', () => {
  assert.throws(
    () => assertUniquePaths(['/same/', '/same/index.html']),
    /Duplicate route/,
  );
});

test('word counts preserve Hugo render-hook labels and optional CJK counting', () => {
  assert.equal(wordCount('你好 世界\n\n**Hello** world'), 4);
  assert.equal(wordCount('你好 世界\n\n**Hello** world', true), 6);
  assert.equal(wordCount('```js\nconst a = 1\n```'), 8);
  assert.equal(wordCount(''), 0);
});
