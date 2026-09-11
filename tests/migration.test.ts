import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {
  convertDocument,
  convertShortcodes,
  convertConfig,
} from '../scripts/hugo-converter';
import { planMigration, writeMigration } from '../scripts/migrate-hugo';
import map from '../src/lib/shortcode-map.json';
test('nested shortcodes become nested MDX, preserving fenced examples and braces', () => {
  const source =
    'A {literal}\n{{< tabs >}}\n{{< tab title="First" >}}**Bold**{{< /tab >}}\n{{< /tabs >}}\n```md\n{{< note >}}\n```';
  const result = convertShortcodes(source);
  assert.equal(result.issues.length, 0);
  assert.match(result.text, /<Tabs>/);
  assert.match(result.text, /<Tab title=\{"First"\}>\*\*Bold\*\*<\/Tab>/);
  assert.match(result.text, /A &#123;literal&#125;/);
  assert.match(result.text, /```md\n\{\{< note >\}\}\n```/);
});
test('every source shortcode has a component mapping and conversion', () => {
  assert.equal(Object.keys(map).length, 41);
  for (const [name, component] of Object.entries(map)) {
    const result = convertShortcodes(`{{< ${name} / >}}`);
    assert.ok(result.text.includes(`<${component}`), name);
  }
});
test('raw diagram, YAML friend links and video sources are converted to props', () => {
  assert.match(
    convertShortcodes('{{< mermaid >}}graph LR\nA-->B{{< /mermaid >}}').text,
    /code=\{"graph LR\\nA-->B"\}/,
  );
  assert.match(
    convertShortcodes(
      '{{< flink >}}- class_name: Demo\n  link_list: []\n{{< /flink >}}',
    ).text,
    /groups=/,
  );
  assert.match(
    convertShortcodes('{{< videos >}}a.mp4\nb.mp4{{< /videos >}}').text,
    /sources=\{\["a.mp4","b.mp4"\]\}/,
  );
});
test('unknown syntax reports its location without silently dropping content', () => {
  const r = convertDocument(
    '---\ntitle: T\ncustom: yes\n---\n\n{{< unknown >}}',
    'post.md',
  );
  assert.ok(r.issues.some((x) => x.line === 6 && x.file === 'post.md'));
  assert.ok(r.issues.some((x) => x.message.includes('custom')));
  assert.ok(convertShortcodes('{{< tabs >}}{{< /note >}}').issues.length);
});
test('ordinary Markdown remains unchanged and scalar taxonomies normalize', () => {
  const result = convertDocument(
    '---\ntitle: Demo\nupdated: 2026-01-02\ntags: Astro\n---\nBody {literal}',
    'post.md',
  );
  assert.equal(result.mdx, false);
  assert.match(result.text, /lastmod:/);
  assert.match(result.text, /tags:\n  - Astro/);
  assert.ok(result.text.endsWith('Body {literal}'));
});
test('site settings and nested menus convert without carrying Hugo-only fields', () => {
  const { config } = convertConfig({
    baseURL: 'https://example.org/blog/',
    title: 'Demo',
    menus: {
      main: [
        { identifier: 'read', name: 'Read' },
        { name: 'Archive', parent: 'read', pageRef: '/archives' },
        { name: 'Friends', pageRef: '/links' },
        { name: 'Explore' },
        { name: 'About', parent: 'Explore', pageRef: '/about' },
      ],
    },
    pagination: { pagerSize: 8 },
    params: { solitude: { search: { enable: false } } },
  });
  assert.equal(config.base, '/blog/');
  assert.equal(config.menus[0].children[0].url, '/archives/');
  assert.deepEqual(config.menus[1], { name: 'Friends', url: '/links/' });
  assert.deepEqual(config.menus[2].children, [
    { name: 'About', url: '/about/' },
  ]);
  assert.equal(config.pagination, 8);
  assert.equal(config.theme.search.enable, false);
});
test('dry planning preserves source, output conflicts stop all writes, exports are repeat-safe', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'solitude-migration-'));
  try {
    const source = path.join(root, 'hugo'),
      out = path.join(root, 'export');
    await fs.mkdir(path.join(source, 'content/posts'), { recursive: true });
    await fs.writeFile(
      path.join(source, 'hugo.yaml'),
      'title: Demo\npermalinks:\n  posts: /p/:slug/\n',
    );
    const file = path.join(source, 'content/posts/hello.md');
    const body =
      '---\ntitle: Hello\ndate: 2026-01-01\n---\n{{< note >}}Welcome{{< /note >}}';
    await fs.writeFile(file, body);
    const plan = await planMigration(source);
    assert.equal(plan.issues.length, 0);
    assert.ok(plan.files.has('src/content/posts/hello.mdx'));
    assert.equal(await fs.readFile(file, 'utf8'), body);
    await writeMigration(plan, source, out);
    await assert.rejects(() => writeMigration(plan, source, out), /conflict/);
    assert.equal(await fs.readFile(file, 'utf8'), body);
    const unsafe = path.join(root, 'unsafe');
    await fs.mkdir(unsafe);
    await fs.symlink(source, path.join(unsafe, 'src'));
    await assert.rejects(() => writeMigration(plan, source, unsafe), /symlink/);
    await assert.rejects(
      () => writeMigration(plan, source, source),
      /separate/,
    );
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});
test('page bundles preserve media references and bundle slugs', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'solitude-bundle-'));
  try {
    await fs.mkdir(path.join(root, 'content/posts/hello'), { recursive: true });
    await fs.writeFile(
      path.join(root, 'hugo.yaml'),
      'title: Demo\npermalinks:\n  posts: /p/:slug/\n',
    );
    await fs.writeFile(
      path.join(root, 'content/posts/hello/cover.png'),
      'fixture',
    );
    await fs.writeFile(
      path.join(root, 'content/posts/hello/index.md'),
      '---\ntitle: Bundle\ndate: 2026-01-01\ncover: cover.png\n---\n![Cover](cover.png)\n',
    );
    const plan = await planMigration(root);
    assert.deepEqual(plan.issues, []);
    assert.ok(plan.files.has('public/hugo-content/posts/hello/cover.png'));
    const body = String(plan.files.get('src/content/posts/hello.md'));
    assert.match(body, /url: \/p\/hello\//);
    assert.match(body, /cover: \/hugo-content\/posts\/hello\/cover.png/);
    assert.match(body, /!\[Cover\]\(\/hugo-content\/posts\/hello\/cover.png\)/);
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});
test('unknown shortcode parameters are reported', () => {
  assert.match(
    convertShortcodes('{{< note mystery="value" >}}Text{{< /note >}}').issues[0]
      .message,
    /Unsupported parameter mystery/,
  );
});
