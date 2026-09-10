import fs from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { parse, stringify } from 'yaml';
import config from '../src/site.config';
import { mergeConfig } from '../src/lib/config';
const theme = process.argv[2];
if (!theme) throw new Error('Pass the source Hugo theme directory');
const target = path.resolve('.astro/hugo-reference');
await fs.mkdir(path.join(target, 'content/posts'), { recursive: true });
const defaults = parse(
  await fs.readFile(path.join(theme, 'hugo.yaml'), 'utf8'),
);
const old = {
  ...defaults,
  baseURL: 'http://127.0.0.1:4323/',
  title: config.title,
  defaultContentLanguage: 'zh-cn',
  locale: config.locale,
  timeZone: config.timeZone,
  pagination: { pagerSize: config.pagination },
  params: {
    description: config.description,
    author: config.author,
    solitude: mergeConfig(defaults.params.solitude, config.theme),
  },
  menus: {
    main: config.menus.flatMap((item, i) => [
      { name: item.name, url: item.url, identifier: String(i), weight: i + 1 },
      ...(item.children ?? []).map((c, j) => ({
        ...c,
        parent: String(i),
        weight: j,
      })),
    ]),
  },
  permalinks: { posts: '/p/:slug/' },
};
await fs.writeFile(path.join(target, 'hugo.yaml'), stringify(old));
for (const file of await fs.readdir('src/content/posts'))
  if (file.endsWith('.md'))
    await fs.copyFile(
      `src/content/posts/${file}`,
      path.join(target, 'content/posts', file),
    );
for (const file of await fs.readdir('src/content/posts'))
  if (file.endsWith('.mdx')) {
    const text = await fs.readFile(`src/content/posts/${file}`, 'utf8');
    const fm = text.match(/^---[\s\S]*?\n---/);
    await fs.writeFile(
      path.join(target, 'content/posts', file.replace(/mdx$/, 'md')),
      `${fm?.[0]}\n\nMDX component showcase metadata for visual comparison.\n`,
    );
  }
for (const [name, type] of Object.entries({
  about: 'about',
  links: 'links',
  equipment: 'kit',
  archives: 'archives',
  brevity: 'brevity',
  music: 'music',
  message: 'message',
  recentcomments: 'recentcomment',
})) {
  await fs.mkdir(path.join(target, 'content', name), { recursive: true });
  await fs.writeFile(
    path.join(target, 'content', name, '_index.md'),
    `---\ntitle: ${name}\ntype: ${type}\n---\n`,
  );
}
await fs.cp('src/data', path.join(target, 'data'), { recursive: true });
await fs.cp('public', path.join(target, 'static'), { recursive: true });
const result = spawnSync(
  'hugo',
  [
    '--source',
    target,
    '--themesDir',
    path.dirname(path.resolve(theme)),
    '--theme',
    path.basename(theme),
    '--destination',
    path.join(target, 'public'),
  ],
  { stdio: 'inherit' },
);
process.exitCode = result.status ?? 1;
