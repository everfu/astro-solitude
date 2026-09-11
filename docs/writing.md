# 写作指南

[文档首页](README.md) · [MDX 组件](components.md) · [特色页面](pages.md)

文章放在 `src/content/posts/`，页面放在 `src/content/pages/`。支持子目录。需要内容组件时使用 `.mdx`；普通 `.md` 不解析 JSX 组件或 Hugo 短代码。

## 文章字段

```yaml
---
title: 一次新的出发
date: 2026-09-11T10:00:00+08:00
lastmod: 2026-09-12T09:00:00+08:00
description: 文章摘要。
slug: a-new-start
cover: /img/demo/cover-getting-started-v2.webp
categories: [生活]
tags: [记录, Astro]
series: [日常随笔]
home: true
draft: false
sticky: 2
comment: true
aside: true
toc: true
---
```

| 字段 | 默认 / 必填 | 行为 |
| --- | --- | --- |
| `title` | 必填 | 页面标题 |
| `date` | 文章必填，页面可选 | 发布时间；建议附带时区 |
| `lastmod` | 可选 | 最后修改时间 |
| `description` | 可选 | 摘要与页面描述 |
| `slug` / `url` | 可选 | 自定义路径，见下节 |
| `aliases` | `[]` | 额外的旧地址，生成跳转页面 |
| `cover` | 可选 | 封面图；未填写时由主题选择默认封面 |
| `categories` / `tags` / `series` | `[]` | 分类、标签与系列，使用字符串数组 |
| `home` | `true` | `false` 只隐藏首页展示 |
| `draft` | `false` | 开发预览可见，生产构建不发布 |
| `sticky` | `false` | `true` 相当于权重 1，也可填写数值；数值越大首页越靠前 |
| `comment` | `true` | 允许评论，仍需全局服务已配置 |
| `aside` / `toc` | `true` | 侧栏与目录；部分特色页面布局不展示侧栏 |
| `random` | `true` | 是否加入随机文章选择 |
| `not_cover` | 可选 | 不使用文章大封面布局 |
| `type` | 可选 | 页面类型，见特色页面指南 |

`home: false` 的文章仍保留直接访问、归档、搜索和 RSS。`draft: true` 的文章不会进入生产站点。未来日期不会自动定时发布，未标记草稿的文章会随构建发布。

## 地址与旧链接

文章默认 `/p/文件标识/`，页面默认 `/文件标识/`。优先顺序是 `url` → `slug` → 内容文件标识。

```yaml
slug: hello
url: /notes/hello.html
aliases:
  - /old-hello/
  - /2025/hello.html
```

此时正式地址为 `/notes/hello.html`，两个别名页面跳转到正式地址。`url` 与别名必须为站内绝对路径，不能包含查询、锚点、反斜杠或 `..` 路径段。不要在内容地址中重复添加部署 `base`。文章、页面、别名与系统路由冲突会导致构建失败。

## 图片、代码和公式

静态图片放在 `public/`，引用时省略 `public`：

```md
![山间记录](/img/demo/cover-getting-started-v2.webp)
```

代码块标注语言会使用 Shiki 高亮；复制、行号、最大高度由 `theme.highlight` 设置。公式使用 `$E = mc^2$` 或双美元符号块，并保持 `theme.katex.enable: true`。

子目录部署时，主题会处理其渲染管线中的站内链接与资源。自行编写原始 HTML、CSS URL 或脚本时，需要自行确保前缀正确，并在实际子目录预览验证。

## 分类、系列与订阅

分类、标签与系列由文章字段生成，无需手工创建列表页。入口为 `/categories/`、`/tags/`、`/series/` 和 `/archives/`。主题同时生成 `/index.xml`、分类及标签订阅源、`/search.xml`、`/sitemap.xml` 和 `/robots.txt`。发布前设置正确的 `site` 与 `base`，避免订阅链接仍指向示例域名。
