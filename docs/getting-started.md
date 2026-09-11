# 快速开始

[文档首页](README.md) → 开始使用 → [主题配置](configuration.md)

## 1. 创建自己的仓库

打开 [Use this template](https://github.com/everfu/astro-solitude/generate)，选择所有者与仓库名，例如 `my-blog`。创建完成后克隆自己的仓库：

```sh
git clone https://github.com/YOUR_NAME/my-blog.git
cd my-blog
```

将 `YOUR_NAME` 和 `my-blog` 替换为自己的信息。模板生成的仓库拥有独立历史，不会自动同步后续主题更新；区别见 [GitHub 模板说明](https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-repository-from-a-template)。

## 2. 安装并预览

需要 Node.js **22.12.0+**。安装 [package.json](../package.json) 的 `packageManager` 指定的 pnpm；当前为 `pnpm@11.24.0`。

```sh
npm install -g pnpm@11.24.0
pnpm install --frozen-lockfile
pnpm dev
```

打开终端显示的本地地址。停止预览按 `Ctrl+C`。依赖版本由锁文件固定，不需要先升级 Astro。

## 3. 配置身份与地址

编辑 [src/site.config.ts](../src/site.config.ts)。可以保留模板中的导航和首页设置，也可以用下面的最小配置重新开始：

```ts
import { defineSolitudeConfig } from './lib/config';

export default defineSolitudeConfig({
  site: 'https://example.com',
  title: '我的博客',
  description: '记录生活，分享所见。',
  locale: 'zh-CN',
  timeZone: 'Asia/Shanghai',
  hasCJKLanguage: true,
  author: { name: '你的名字' },
  menus: [
    { name: '文章', url: '/archives/' },
    { name: '关于', url: '/about/' },
  ],
});
```

把 `site` 改为最终域名；部署在子目录时另设 `base`。最小配置会使用基础默认外观，与仓库截图略有区别，详见 [默认值与模板配置](configuration.md#默认值与模板配置)。

## 4. 写第一篇文章

创建 `src/content/posts/hello-world.md`：

```md
---
title: 你好，世界
date: 2026-09-11T10:00:00+08:00
description: 我的第一篇文章。
tags: [生活]
---

从这里开始记录。
```

预览 `/p/hello-world/`。普通文章用 `.md`，组件文章用 `.mdx`。发布规则见 [写作指南](writing.md)。

## 5. 替换演示内容

| 内容 | 修改位置 |
| --- | --- |
| 文章与封面 | `src/content/posts/`、`public/img/` |
| 自定义页面 | `src/content/pages/` |
| 关于、友链、装备、短文 | `src/data/`，见 [特色页面](pages.md) |
| 标题、头像、导航、侧栏、页脚 | `src/site.config.ts` |
| 补充样式 | `src/styles/custom.css` |

先保留组件示例方便参考；删除演示文章时，同时检查导航、推荐链接和正文中指向这些文章的链接。评论和在线音乐没有预填服务标识，按需阅读 [第三方集成](integrations.md)。

## 6. 发布

```sh
pnpm check
pnpm build
pnpm preview
```

检查构建预览后，按 [部署指南](deployment.md) 上传 `dist/` 或连接 GitHub 仓库自动构建。创建 GitHub 模板副本本身不会自动上线博客。
