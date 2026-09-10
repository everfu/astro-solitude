import fs from 'node:fs/promises';
import path from 'node:path';
import map from '../src/lib/shortcode-map.json';
import defaults from '../src/lib/defaults.json';
const source = process.argv[2];
const lines = [
  '# MDX 组件 / Components',
  '',
  '`src/content/posts/components.mdx` 是可运行的 41 组件示例，访问 `/p/components/`。组件由主题自动注入；在其他布局中可显式导入。扩展内容必须使用 `.mdx`，普通 `.md` 不解析组件或 Hugo 短代码。',
  '',
  '```mdx',
  "import { Note, Tabs, Tab } from '../../components/mdx';",
  '',
  '<Note type="info">',
  '',
  '支持 **Markdown** 的提示框。',
  '',
  '</Note>',
  '',
  '<Tabs id="example">',
  '  <Tab title="One">第一项</Tab>',
  '  <Tab title="Two">第二项</Tab>',
  '</Tabs>',
  '```',
  '',
  '嵌套块内部建议用空行包围 Markdown。布尔值使用 `{true}` / `{false}`；图表与配置对象使用 JSX 表达式。组件属性保持源短代码含义。',
  '',
  '| Hugo 名称 | MDX 组件 | 源参数 | 验证 |',
  '| --- | --- | --- | --- |',
];
for (const [name, component] of Object.entries(map)) {
  let params = '';
  if (source) {
    const body = await fs.readFile(
      path.join(source, 'layouts/_shortcodes', `${name}.html`),
      'utf8',
    );
    params = [
      ...new Set([...body.matchAll(/\.Get "([^"]+)"/g)].map((m) => m[1])),
    ].join(', ');
  }
  lines.push(
    `| ${name} | [${component}](../src/components/mdx/${component}.astro) | ${params || 'children'} | 示例构建、转换映射测试 |`,
  );
}
lines.push(
  '',
  '## 原始文本与数据属性',
  '',
  '| 组件 | 扩展属性 |',
  '| --- | --- |',
  '| ChartJS | `config={{type, data, options}}` 或 `code={JSON文本}` |',
  '| Mermaid | `code={图表文本}` |',
  '| Score | `score={ABC文本}`、`params={{}}` |',
  '| Flink | `groups={[{class_name, class_desc, link_list: []}]}` |',
  '| Videos | `sources={["/video.mp4"]}`、`col={2}` |',
  '',
  '图库、时间线和标签页使用子组件嵌套。仓库卡片只在浏览器请求公开仓库 API，失败时显示回退状态。Chart.js、ABCJS、Mermaid、TypeIt、视频嵌入依赖相应脚本或网络服务，使用自己的 CDN 或本地资源时修改 `theme.cdn`。',
  '',
  'English: all 41 source shortcodes have named MDX counterparts. The live showcase includes every component. Use JSX props for raw diagram text and structured data; ordinary Markdown stays free of Hugo parsing. Component mappings are tested separately from live third-party APIs.',
);
await fs.writeFile('docs/components.md', lines.join('\n') + '\n');
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
  '# 配置字段清单 / Configuration inventory',
  '',
  '原 Hugo `params.solitude.*` 对应 Astro `theme.*`。本表逐项列出完整默认配置，定位实现分组；自动检查只验证配置形状与构建，不代表每个外部服务已完成真实联调。功能验收证据与局限见 [parity.md](parity.md)。',
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
await fs.writeFile('docs/configuration-inventory.md', rows.join('\n') + '\n');
