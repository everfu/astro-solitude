import fs from 'node:fs/promises';
import map from '../src/lib/shortcode-map.json';
import params from '../src/lib/shortcode-params.json';
import defaults from '../src/lib/defaults.json';

async function output(file: string, contents: string) {
  if (process.argv.includes('--check')) {
    if ((await fs.readFile(file, 'utf8')) !== contents)
      throw new Error(`${file} is stale; run pnpm docs:generate`);
  } else await fs.writeFile(file, contents);
}

// Only generated reference files belong here; never overwrite authored guides.
await fs.mkdir('docs', { recursive: true });
const lines = [
  '# 组件参数索引',
  '',
  '[文档首页](README.md) · [用法与可复制示例](components.md)',
  '',
  '由 `pnpm docs:generate` 使用仓库内映射生成，无需 Hugo 源目录。下表是迁移参数摘要，不表示每个参数都必填；当前 MDX 扩展属性见组件指南。',
  '',
  '| Hugo 名称 | MDX 组件 | 参数摘要 |',
  '| --- | --- | --- |',
];
for (const [name, component] of Object.entries(map)) {
  const names = params[name as keyof typeof params];
  lines.push(
    `| ${name} | [${component}](components.md#${component.toLowerCase()}) | ${names.length ? names.map((p) => `\`${p}\``).join(', ') : '无映射参数；见用法说明'} |`,
  );
}
await output('docs/component-inventory.md', lines.join('\n') + '\n');

const modules: Record<string, string> = {
  site: 'Header, Base',
  nav: 'Header',
  hometop: 'HomeTop',
  aside: 'Aside',
  page: 'routes, EntryPage',
  post: 'PostCard, PostMeta, Copyright',
  theme_color: 'Base, tokens.css',
  display_mode: 'Base, main',
  font: 'Base, tokens.css',
  index_post_list: 'PostCard, astro.css',
  related_post: 'EntryPage',
  expire: 'main',
  right_menu: 'Overlays, right_menu',
  copy: 'main, utils',
  mermaid: 'Shortcode, tag-runtime',
  chart: 'Shortcode, tag-runtime',
  typeit: 'assets, tag-runtime',
  console: 'Overlays, main',
  translate: 'tw_cn',
  rightside: 'Overlays, main',
  footer: 'Footer, friend_links',
  errorpage: '404',
  capsule: 'Capsule, music',
  music: 'EntryPage, music',
  meting_api: 'assets',
  keyboard: 'keyboard',
  lazyload: 'assets, utils',
  loading: 'Base, preloader',
  highlight: 'astro.config, code-highlight',
  lightbox: 'assets, utils',
  memorial: 'Base',
  katex: 'markdown-plugin, assets',
  pwa: 'Base, manifest endpoints',
  comment: 'Comments, comments',
  twikoo: 'comments',
  waline: 'comments',
  valine: 'comments',
  artalk: 'comments',
  giscus: 'comments',
  search: 'Search, search modules',
  envelope: 'EntryPage, comments',
  brevity: 'Brevity',
  recent_comments: 'EntryPage, comments',
  verify_site: 'Base',
  extends: 'Base',
  cdn: 'assets, resources',
};
const rows = [
  '# 配置字段清单',
  '',
  '[文档首页](README.md) · [配置指南](configuration.md) · [开发与验收](parity.md)。由 `pnpm docs:generate` 根据 `src/lib/defaults.json` 生成；表中是基础默认值，模板覆盖值见 `src/site.config.ts`。顶层站点字段和未在当前布局使用的兼容字段见配置指南；字段存在不等于每项都有可见效果。',
  '',
  '| 字段 | 默认值 | 实现定位 |',
  '| --- | --- | --- |',
];
function walk(value: any, keys: string[] = []) {
  for (const [k, v] of Object.entries(value)) {
    const next = [...keys, k];
    if (
      v &&
      typeof v === 'object' &&
      !Array.isArray(v) &&
      Object.keys(v).length
    )
      walk(v, next);
    else
      rows.push(
        `| \`theme.${next.join('.')}\` | \`${JSON.stringify(v).replace(/\|/g, '\\|')}\` | ${modules[next[0]] ?? 'config'} |`,
      );
  }
}
walk(defaults);
await output('docs/configuration-inventory.md', rows.join('\n') + '\n');
