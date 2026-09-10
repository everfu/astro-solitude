# 迁移对照与验收 / Migration parity

来源：`everfu/hugo-solitude`，提交 `30ae31c6cb9627407529370dbd578f5e052b1946`，包含迁移时 `assets/css/solitude/pages/about.css` 与 `assets/ts/main.ts` 的本地 About 光效修改。逐文件 SHA-256 见 [source-manifest.json](source-manifest.json)。原博客和源主题没有被迁移工具改写。

## 架构

- Astro 7.3.2 静态输出，Content Collections + MDX；无服务端运行时。
- `src/layouts` 管理公共文档与页面分发，`src/components` 管理结构，`src/styles` 保留源模块样式，`src/scripts` 负责按需交互。
- `src/lib/config.ts` 与 `src/site.config.ts` 提供 TypeScript 配置；`src/lib/content.ts/routes.ts` 管理筛选、分页、URL 和冲突。
- `scripts` 提供导入、输出兼容、对照站和测试站工具；`tests` 覆盖内容、迁移、产物与真实浏览器操作。
- 从源主题移植的部分无类型注解脚本保留为 JavaScript，通过新的 TypeScript 入口、配置和生命周期 API 调用。`pnpm check` 检查 Astro 与 TypeScript 边界，不能视为这些遗留 JavaScript 内部的完整静态类型证明。

## 功能清单

| 源能力 | Astro 实现 | 验证证据 |
| --- | --- | --- |
| 首页推荐、卡片与分页 | HomeTop、PostCard、Pagination、routes | 内容筛选测试；首页 10 张卡片；桌面/平板/手机截图 |
| 手动推荐、首页隐藏 | HomeTop + homePosts | `home: false` 从列表/推荐/首页最近文章排除；归档、搜索、RSS 保留 |
| 作者卡片、最新文章、标签、站点信息 | Aside | 对照截图、生产构建；侧栏范围配置 |
| 文章头部、元信息、目录 | Header、PostMeta、Aside、main | 正文产物断言、浏览器目录滚动与重复导航 |
| 上下篇、相关文章、版权、RSS、赞赏 | EntryPage、Copyright | 生产构建；独立测试站启用赞赏 |
| 归档、分类、标签、系列 | Archive、routes | 归档与术语页输出；分页单测；响应式检查 |
| About 各内容区、卡片光效 | pages/About、about.css、main | 保留源光效；三种宽度、两种模式对照 |
| Links 卡片、随机友链、JSON | pages/Links、friend_links、links.json | 页面输出、响应式检查；服务脚本复用 |
| Equipment、通用页面 | pages/Equipment、EntryPage | 页面输出、三种宽度检查 |
| Music、持久胶囊 | Capsule、music、ClientRouter | 真实音频元素保持身份与播放状态；歌单服务未做真实联调 |
| Message、Brevity、Recent Comments | EntryPage、pages/Brevity、comments | 页面构建、布局检查；聚合评论增强沿用 Valine 数据适配 |
| 四种界面语言 | i18n JSON + site.t | 完整键集合测试；英语/西班牙语独立站构建与浏览器检查 |
| 明暗模式 | Base、main、tokens.css | 切换及跨导航状态测试；两种模式截图 |
| 三种搜索 | search/local、algolia、docsearch | 本地搜索真实索引；Algolia/DocSearch 模拟响应与切页重建 |
| 五种评论挂载 | Comments、comments.ts | Twikoo/Waline/Valine/Artalk/Giscus 模拟脚本；路径传递、每页一次挂载、销毁与返回 |
| 灯箱、复制、快捷键、右键菜单、翻译 | assets、utils、keyboard、right_menu、tw_cn | 源行为保留；快捷键/复制/搜索/手机菜单浏览器操作 |
| 加载进度、纪念日、过期提示 | Base、preloader、main | 配置与构建；加载页在初始化完成后退出 |
| 构建时双主题代码高亮、公式 | astro.config、markdown-plugin、code-highlight | Shiki/KaTeX HTML 断言；长代码展开和完整复制 |
| 41 个短代码对应组件 | components/mdx、tag-runtime | 41 项转换映射和输出标记；标签页/隐藏/折叠实际交互 |
| SEO、RSS、Sitemap、robots、PWA | Base、pages 端点 | 产物断言；子目录与自定义 webmanifest 测试站构建 |
| `.html`、别名、重复路径 | content、routes、output-layout | 真实 `.html` 文件断言；路径冲突单测 |
| 自定义样式、扩展方法、生命周期 | custom.css、core/api/lifecycle | CSS 最后加载；连续导航/后退/前进/清理测试 |
| Hugo 导入 | migrate-hugo、hugo-converter | 干跑、字段、嵌套、转义、参数、页面包图片、冲突、符号链接、源不变测试 |

完整字段映射另见 [configuration-inventory.md](configuration-inventory.md)，41 个短代码逐项列表见 [components.md](components.md)。

## 源版本中的兼容字段

源版本中的 `hometop.banner/group`、`page.error/tags/categories/archives`、`brevity.home_mini` 等历史字段没有被当前源模板消费。它们作为兼容配置保留，不把“存在配置字段”当成新增功能验收。首页使用当前源版本的推荐轮播；归档使用当前的年份筛选与分页组件。`index_post_list.column` 在 Astro 侧补充为桌面列数设置。

## 本地验证

命令顺序：

```sh
pnpm check
pnpm build
pnpm test
pnpm build:fixture
pnpm exec playwright install chromium
pnpm test:e2e
```

类型检查无错误；生产站生成 37 个页面及 RSS、搜索、Sitemap 等静态端点。18 项单元/产物测试通过，覆盖内容、转换与输出；10 项浏览器测试通过，覆盖核心交互、三种宽度和服务适配器。可复现命令与断言在仓库内，CI 在 Node.js 22、24 上执行同一套验收。

视觉对照使用统一的演示文章元数据和特殊页面 JSON。Hugo 对照站由脚本生成；MDX 示例仅共享元数据用于首页比较，组件本体由 Astro 单独验收。检查首页、文章、About、Links、Equipment、归档 × 390/768/1440 px × light/dark × 两个引擎，共 72 个视图。没有发现横向溢出。保留选定截图于 `docs/screenshots`；完整本地截图在忽略提交的 `artifacts/visual`。

```sh
pnpm exec tsx scripts/compare-hugo.ts /path/to/hugo-theme
# 分别启动 Astro 预览（4321）和 .astro/hugo-reference/public 静态服务（4323）
pnpm exec tsx scripts/visual-check.ts
```

字数统计改为按中文字与西文词计算，代码与公式由 Astro 构建，导航使用 ClientRouter；这些是迁移后的预期实现差异。About 的卡片尺寸和光效遵循源样式。

## 外部验证边界

没有使用个人评论配置、访问令牌或个人歌单完成线上联调。五种评论服务、Algolia、DocSearch 的测试都是模拟响应；音乐验证是本地媒体跨导航持续播放。CDN、真实仓库 API、远端视频、评论权限和外部歌单的服务可用性不由模拟结果担保。PWA 范围为图标和清单，不提供离线缓存。

English: this report maps inherited features to implementations and reproducible evidence. It distinguishes compilation, browser checks, visual review, mocks, and live services. The original source is preserved. Some inherited JavaScript remains behind typed APIs; third-party service tests do not establish production connectivity. No domain migration, production deployment, npm publication, or formal release is performed by this repository setup.
