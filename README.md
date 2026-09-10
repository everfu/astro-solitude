# Astro Solitude

基于 Solitude Hugo 主题迁移的 Astro 静态博客模板。保留卡片首页、文章阅读体验、About 光效、主题样式与内容组件，演示站直接运行在仓库根目录。

[English](README.en.md) · [配置](docs/configuration.md) · [41 个 MDX 组件](docs/components.md) · [Hugo 导入](docs/migration.md) · [部署](docs/deployment.md) · [迁移对照与验收](docs/parity.md)

![Solitude](docs/screenshots/home-desktop.png)

## 开始使用

点击 GitHub 的 **Use this template** 创建自己的仓库，然后克隆到本地。需要 Node.js **22.12.0+** 和 pnpm；推荐 Node.js 24 LTS。

```sh
pnpm install
pnpm dev
```

修改 `src/site.config.ts`，把 `site` 改成自己的站点地址。文章放在 `src/content/posts/`，通用页面放在 `src/content/pages/`，图片等静态文件放在 `public/`。保留 `pnpm-lock.yaml`，升级依赖时一起提交。

```sh
pnpm check
pnpm build
pnpm test
pnpm preview
```

## 内容与功能

- Markdown / MDX 内容集合，默认 `/p/:slug/`；自定义 `.html` 地址、别名、分类、标签、系列、首页分页。
- 首页推荐、文章卡片、侧栏、目录、相关文章、版权、赞赏、RSS、搜索索引与 Sitemap。
- About、Links、Equipment、Music、Message、Brevity、Recent Comments、404 和通用页面。
- 简体中文、繁体中文、英语、西班牙语界面；明暗模式、快捷键、右键菜单、灯箱、持久音乐胶囊。
- 本地搜索、Algolia、DocSearch；Twikoo、Waline、Valine、Artalk、Giscus 按需挂载。
- 41 个 MDX 组件，构建时 Shiki 双主题高亮和 KaTeX 数学公式。
- `home: false` 同时从首页列表、推荐和首页最近文章隐藏；归档、搜索、RSS 和直达仍可见。草稿仅在开发预览出现。

评论和在线音乐默认关闭，所有示例均为通用演示。启用第三方服务时填写自己的公开客户端配置；服务端密钥不要放入站点配置。

## 浏览器验收

```sh
pnpm build
pnpm build:fixture
pnpm exec playwright install chromium
pnpm test:e2e
```

独立测试站位于 `.astro/integration-fixture`。五种评论适配器使用模拟响应；音乐测试验证真实音频元素跨页面保留，不代表外部歌单服务已联调。详见 [验收记录](docs/parity.md)。

## 来源与许可

Apache-2.0。迁移基于 `everfu/hugo-solitude`，包括迁移时工作目录的 About 光效修改。来源版本与文件校验值见 [source-manifest.json](docs/source-manifest.json)，版权与第三方资源说明见 [NOTICE](NOTICE)。这个仓库提供独立模板，不会修改或部署原 Hugo 博客。
