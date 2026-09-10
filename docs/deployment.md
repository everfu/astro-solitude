# 静态部署 / Static deployment

设置 `src/site.config.ts` 的 `site` 和 `base` 后执行 `pnpm build`，发布 `dist/`。不需要 Node.js 服务器或 Astro adapter。

| 平台 | 构建命令 | 输出目录 |
| --- | --- | --- |
| Cloudflare Pages | `pnpm build` | `dist` |
| Netlify | `pnpm build` | `dist` |
| Vercel（静态） | `pnpm build` | `dist` |
| GitHub Pages | 安装后 `pnpm build`，上传 Pages artifact | `dist` |
| 自建服务器 | `pnpm build`，上传目录 | `dist` |

安装阶段用 `pnpm install --frozen-lockfile`。运行环境需要 Node.js 22.12.0 或更新版本。根域名站点 `base: '/'`；GitHub 项目站点例如 `base: '/my-blog/'`。`site` 不要设置成 localhost。

主题同时输出目录式页面和显式 `.html` 文件。服务器应先寻找实际文件，再查找目录的 `index.html`，不存在时返回 `404.html` 和 HTTP 404；不要把所有请求回退到首页，否则未知文章会被误认为成功。别名页是静态跳转页；如需 HTTP 301，可另行配置托管平台规则。

```nginx
location / {
    try_files $uri $uri/ =404;
}
error_page 404 /404.html;
```

仓库的 GitHub Actions 只检查类型、测试和构建，没有部署任务，也不发布 npm 包。域名、托管平台与生产发布由使用者单独配置。

English: build to `dist`, publish the directory, and preserve actual `.html` files and directory routes. Configure a proper 404 response rather than an SPA fallback. `site` is your public origin; `base` is the deployment subdirectory. The supplied workflow validates the template and does not deploy it.
