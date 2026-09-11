# 部署指南

[文档首页](README.md) · [快速开始](getting-started.md)

项目使用静态输出。构建命令为 `pnpm build`，发布目录为 `dist`，不需要服务端适配器。仓库自带的 `check.yml` 只执行检查，不会部署网站。

## 通用流程

```sh
pnpm install --frozen-lockfile
pnpm check
pnpm build
pnpm preview
```

确认首页、文章、图片、搜索与 404 后发布 `dist/`。托管环境使用 Node.js 22.12.0+，pnpm 版本跟随 `package.json`；不要把开发服务器作为生产服务。

## 域名与子目录

| 发布地址 | `site` | `base` |
| --- | --- | --- |
| `https://example.com/` | `https://example.com` | `/` |
| `https://YOUR_NAME.github.io/` | `https://YOUR_NAME.github.io` | `/` |
| `https://YOUR_NAME.github.io/my-blog/` | `https://YOUR_NAME.github.io` | `/my-blog/` |

在 `src/site.config.ts` 中修改，不要在 Astro 配置再维护一份不同的地址。更换域名或前缀后重新构建；RSS、Sitemap、canonical 和搜索地址都依赖这些值。

## GitHub Pages

先设置上述 `site`、`base`，再在自己的仓库 Settings → Pages 选择 GitHub Actions 作为发布来源。创建 `.github/workflows/deploy.yml`：

```yaml
name: Deploy blog
on:
  push:
    branches: [main]
  workflow_dispatch:
permissions:
  contents: read
  pages: write
  id-token: write
concurrency:
  group: pages
  cancel-in-progress: false
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - uses: actions/configure-pages@v5
      - run: pnpm install --frozen-lockfile
      - run: pnpm check
      - run: pnpm build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Publish
        id: deployment
        uses: actions/deploy-pages@v4
```

提交后在 Actions 查看部署结果。自定义域名需要在 Pages 设置中配置并完成 DNS 设置；此时通常使用 `base: '/'`。平台流程可对照 [Astro 的 GitHub Pages 部署指南](https://docs.astro.build/en/guides/deploy/github/)。本文件提供可复制示例，不会替模板使用者自动开启部署。

## Netlify 与 Vercel

导入自己创建的 GitHub 仓库，选择 Astro / 静态构建，确认构建命令为 `pnpm build`、输出目录为 `dist`。依赖安装使用 `pnpm install --frozen-lockfile`，运行环境版本与项目一致。配置最终域名后更新 `site` 并重新发布。静态部署不需要添加 SSR 适配器。平台细节见 [Netlify 指南](https://docs.astro.build/en/guides/deploy/netlify/) 与 [Vercel 指南](https://docs.astro.build/en/guides/deploy/vercel/)。

## 自建静态服务器与 404

上传 `dist/` 的内容，确保目录路径映射到对应 `index.html`，保留原样的 `.html` 文章和资源路径。不存在的页面应返回 `404.html` 与 HTTP 404，而不是统一返回首页的 200 响应。

主题生成的别名是静态跳转页面，不等同于服务端 301。需要 HTTP 重定向时，在托管平台按自己的旧地址配置规则。

## 发布检查

- 首页、文章及子目录资源可以直接打开，也能刷新访问。
- 搜索结果指向自己的域名和路径，RSS 与 Sitemap 不含示例域名。
- 未启用的评论与音乐不连接原演示服务；已配置服务在自己的域名上可用。
- 主题截图与演示数据已经替换为自己的内容，版权和依赖声明保留。
