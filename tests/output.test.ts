import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
test('static output includes articles, feeds, all components and a real legacy HTML file', async () => {
  const home = await fs.readFile('dist/index.html', 'utf8');
  assert.ok(home.includes('recent-posts'));
  assert.ok(!home.includes('/p/hidden-example/" class="article-title'));
  const search = await fs.readFile('dist/search.xml', 'utf8');
  assert.ok(search.includes('/p/hidden-example/'));
  assert.ok(!search.includes('/p/draft/'));
  assert.ok(home.includes('lang="en"'));
  assert.ok((await fs.stat('dist/p/legacy.html')).isFile());
  const html = await fs.readFile('dist/p/components/index.html', 'utf8');
  for (const marker of [
    'tag-audio',
    'tag-bubble',
    'tag-button',
    'tag-video-bilibili',
    'tag-card',
    'tag-chart',
    'tag-choice',
    'tag-flink',
    'tag-fold',
    'tag-gallery',
    'tag-gallery-group',
    'tag-gallery-item',
    'tag-repo',
    'tag-hide-block',
    'tag-hide-inline',
    'tag-hide-toggle',
    'tag-image-wrap',
    'tag-inline-image',
    'tag-keyboard',
    'tag-label',
    'tag-link-card',
    'tag-mermaid',
    'note-content',
    'tag-paragraph',
    'tag-score',
    'tag-series',
    'tag-span',
    'tag-spoiler',
    'subnote',
    'tab-item-content',
    'tag-tabs',
    'tag-timeline',
    'tag-timenode',
    'tag-typeit',
    'tag-video',
    'tag-videos',
    'tag-video-youtube',
  ])
    assert.ok(html.includes(marker), marker);
  assert.ok(html.includes('katex-display'));
  const writing = await fs.readFile('dist/p/writing/index.html', 'utf8');
  assert.ok(writing.includes('katex-mathml'));
  assert.ok(writing.includes('katex-display'));
  assert.ok(writing.includes('--shiki-dark'));
  for (const file of [
    'sitemap.xml',
    'robots.txt',
    'links.json',
    'manifest.json',
    'tags/astro/index.xml',
    '404.html',
  ])
    assert.ok((await fs.stat(path.join('dist', file))).isFile(), file);
});

test('all emitted local asset and page URLs resolve', async () => {
  const root = path.resolve('dist');
  const files = await fs.readdir(root, { recursive: true });
  const urls = new Set<string>();
  for (const file of files.filter((name) => name.endsWith('.html'))) {
    const html = await fs.readFile(path.join(root, file), 'utf8');
    for (const match of html.matchAll(/\b(?:href|src)="(\/[^"\s]*)"/g)) {
      if (!match[1].startsWith('//')) urls.add(match[1]);
    }
  }
  for (const url of urls) {
    const file = path.join(
      root,
      decodeURIComponent(new URL(url, 'https://example.org').pathname),
    );
    await assert.doesNotReject(fs.stat(file), `Missing local URL: ${url}`);
  }
});
