# 从 Hugo 导入 / Import from Hugo

先创建 Astro 模板副本并安装依赖。导入工具读取源站的 `hugo.yaml`、`content/`、`data/` 和 `static/`，写入单独的导出目录。不会改写源目录，也不会覆盖现有文件。

```sh
pnpm migrate:hugo --source /path/to/hugo --dry-run
pnpm migrate:hugo --source /path/to/hugo --out /path/to/export
```

先处理 dry-run 报告，再生成导出目录。将审核过的导出文件合并进自己的模板副本；主动替换演示文章和默认配置，避免演示内容混入。导出目录不是完整主题仓库，需要模板的组件与工具。

## 转换规则

- `params.solitude` → `theme`；站点地址、语言、时区、作者、菜单与分页转为类型化站点配置；移除 Hugo `_merge`。
- `updated` → `lastmod`，标量分类、标签、系列、别名转数组；未知字段保留在计划中并报告，实际写入前需要处理。
- 普通文章保持 `.md`；使用扩展短代码的内容转为 `.mdx`。41 个组件由页面渲染器统一注入，无需每篇重复导入；独立使用时可从 `src/components/mdx` 导入。
- 代码围栏和行内代码里的短代码示例保持原样；嵌套组件按栈转换，文本大括号转义，原始 Chart.js、Mermaid、ABC、友链 YAML 和视频列表转为组件属性。
- 标准 `posts/` 文章目录、常规 `:slug` / `:filename` 永久链接和 `.html` 地址可转换。特殊页面 `_index.md` 转为页面集合条目；数据 YAML 转 JSON。
- 页面包媒体复制到 `public/hugo-content/` 并更新相对引用；`index.md` 保留页面包目录名作为 slug。静态文件复制到 `public/`，`assets/css/custom.css` 复制到最后加载的自定义样式文件。

## 需要人工审核的情况

未知短代码、未配对标签、未知自定义字段、非标准永久链接、自定义模板、TOML/JSON front matter、非 Markdown 内容与不支持的数据格式会报告文件和行号。工具不会执行自定义模板，不会静默吞掉无法转换的短代码。自定义 Hugo 模板需要改写为 Astro 组件。

目标文件已有内容、目标目录包含符号链接、源与目标相互包含时会停止。冲突检查在写入前完成。生成的 `migration-report.json` 记录文件清单；不要把导出命令直接指向源站或已有模板目录。

转换完成后执行：

```sh
pnpm check
pnpm build
pnpm test
pnpm preview
```

逐篇检查自定义内容，尤其是复杂原生 HTML、MDX 中的 JavaScript 表达式、嵌套组件和图片路径。构建阶段检查重复 URL；老地址应通过 `url` 保留，新地址的跳转可用 `aliases`。切换域名属于单独操作，此模板不会自动部署。

## English

Run the dry check first, review every issue, then export to a new directory. Merge the reviewed files into a template copy manually. The importer is conservative: it stops on unsupported syntax and output conflicts, preserves source files, converts only supported YAML-based Hugo sites, and never evaluates Hugo templates. Ordinary Markdown remains Markdown; extended content becomes MDX with components supplied by the shared renderer. Live comment and music services require separate configuration and verification.
