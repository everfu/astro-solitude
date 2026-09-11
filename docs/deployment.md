# Deployment

[Documentation](README.md) · [Getting started](getting-started.md)

The project produces a static website. Build with `pnpm build` and publish `dist/`; no server adapter is required. The included `check.yml` workflow validates the project without deploying it.

## Build and preview

```sh
pnpm install --frozen-lockfile
pnpm check
pnpm build
pnpm preview
```

Check the homepage, posts, images, search, and 404 page before publishing. Use Node.js 22.12.0+ and the pnpm version in `package.json`. Do not use the development server as a production service.

## Domains and subdirectories

| Published URL | `site` | `base` |
| --- | --- | --- |
| `https://example.com/` | `https://example.com` | `/` |
| `https://YOUR_NAME.github.io/` | `https://YOUR_NAME.github.io` | `/` |
| `https://YOUR_NAME.github.io/my-blog/` | `https://YOUR_NAME.github.io` | `/my-blog/` |

Set these values in `src/site.config.ts`; avoid maintaining a different address in Astro's configuration. Rebuild after changing the domain or prefix. RSS, Sitemap, canonical links, and search paths depend on these settings.

## GitHub Pages

Set `site` and `base`, then select GitHub Actions under your repository's Settings → Pages. Create `.github/workflows/deploy.yml`:

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

Commit the workflow and check Actions for the result. For a custom domain, configure Pages and DNS, usually with `base: '/'`. Refer to the [Astro GitHub Pages guide](https://docs.astro.build/en/guides/deploy/github/) for platform details. This is a copyable example; the template does not enable deployment for you.

## Netlify and Vercel

Import your own GitHub repository and select an Astro/static build. Set the build command to `pnpm build`, output directory to `dist`, and install command to `pnpm install --frozen-lockfile`. Match the project's runtime versions. Once your domain is ready, update `site` and publish again. Static hosting does not require an SSR adapter. See the [Netlify guide](https://docs.astro.build/en/guides/deploy/netlify/) and [Vercel guide](https://docs.astro.build/en/guides/deploy/vercel/).

## Static servers and 404s

Upload the contents of `dist/`. Directory paths must resolve to their `index.html` files; preserve `.html` post URLs and asset paths. Unknown pages should serve `404.html` with HTTP 404, rather than returning the homepage with HTTP 200.

Aliases are static redirect pages, not server-side 301 responses. Configure HTTP redirects on your host when required by your existing URLs.

## Before publishing

- Open and refresh the homepage, posts, and subdirectory assets directly.
- Check that search, RSS, and Sitemap use your domain and paths.
- Keep unconfigured comment and music services disabled; test configured services on your own domain.
- Replace sample identity and content while preserving copyright and dependency notices.
