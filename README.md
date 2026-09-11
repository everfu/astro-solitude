English 丨 [简体中文](README.zh-CN.md)

<div align="center">

# Astro Solitude

A clean, elegant, feature-rich blog theme for Astro.

Build your personal blog with static pages, Markdown / MDX, light and dark modes, and a rich collection of content components.

[![Astro](https://img.shields.io/badge/Astro-7-BC52EE?logo=astro&logoColor=white)](https://astro.build/)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D22.12.0-5FA04E?logo=node.js&logoColor=white)](package.json)
[![License](https://img.shields.io/badge/license-Apache--2.0-FF5531)](LICENSE)
[![Checks](https://github.com/everfu/astro-solitude/actions/workflows/check.yml/badge.svg)](https://github.com/everfu/astro-solitude/actions/workflows/check.yml)
[![Stars](https://img.shields.io/github/stars/everfu/astro-solitude)](https://github.com/everfu/astro-solitude/stargazers)

[Use this template](https://github.com/everfu/astro-solitude/generate) · [Documentation](docs/README.md) · [Quick start](#quick-start) · [Configuration](docs/configuration.md) · [Components](docs/components.md) · [Deployment](docs/deployment.md) · [Report an issue](https://github.com/everfu/astro-solitude/issues)

</div>

![Astro Solitude desktop homepage preview](docs/screenshots/home-desktop.png)

## Features

- **Layout and reading**: responsive post cards, recommendations, sidebar, table of contents, related posts, copyright notices, and donation links.
- **Writing**: Markdown / MDX, 41 content components, Shiki syntax highlighting, and KaTeX math rendering.
- **Post management**: categories, tags, series, archives, pagination, pinned posts, drafts, custom URLs, and aliases.
- **Special pages**: About, Links, Equipment, Music, Message Board, short posts, Recent Comments, and 404.
- **Interactions**: light and dark modes, image lightbox, keyboard shortcuts, context menu, and a music capsule that persists across page navigation.
- **Search and feeds**: local search, Algolia, DocSearch, RSS, and sitemap.
- **Comments**: Twikoo, Waline, Valine, Artalk, and Giscus, loaded according to configuration.
- **Interface languages**: English by default, with Simplified Chinese, Traditional Chinese, and Spanish.
- **Static deployment**: generate static files for a hosting platform or your own server.

## Quick start

### 1. Get the project

Install Node.js **22.12.0+** and pnpm. Use the pnpm version specified in the `packageManager` field of [package.json](package.json).

Click [Use this template](https://github.com/everfu/astro-solitude/generate) to create an independent repository, then clone your copy (replace `YOUR_NAME` and `my-blog`):

```sh
git clone https://github.com/YOUR_NAME/my-blog.git
cd my-blog
pnpm install --frozen-lockfile
pnpm dev
```

Open the local URL shown in your terminal to preview the theme and sample content.

### 2. Configure your site

Edit [`src/site.config.ts`](src/site.config.ts) to set your site URL, title, author, navigation, and theme options. Here is a minimal configuration:

```ts
import { defineSolitudeConfig } from './lib/config';

export default defineSolitudeConfig({
  site: 'https://example.com',
  title: 'My blog',
  description: 'Notes, stories, and discoveries.',
  locale: 'en',
  author: { name: 'Your name' },
});
```

For a site hosted under a subdirectory, also set `base`, for example `base: '/blog/'`. See [Configuration](docs/configuration.md) for all options.

The template includes sample posts and pages with local search enabled. Comments, comment aggregation, and online music are disabled with empty service identifiers. Follow the [integration guide](docs/integrations.md) to connect your own services. Replace sample content, images, and site identity before publishing. Changing the interface locale does not translate posts or custom navigation.

### 3. Start writing

Create a Markdown or MDX file in `src/content/posts/`, such as `hello-world.md`:

```md
---
title: Hello, world
date: 2026-09-11
description: My first post.
tags: [Life]
---

Start your story here.
```

The default URL is `/p/hello-world/`. Use `slug`, `url`, and `aliases` to customize addresses. Set `draft: true` for drafts, or `home: false` to hide a post from homepage areas while keeping it in archives, search, RSS, and direct links.

See [Front matter](docs/writing.md#front-matter) and [MDX components](docs/components.md) for more writing options.

### 4. Build and deploy

```sh
pnpm build
pnpm preview
```

Publish the generated `dist/` directory to your hosting platform. Set the build command to `pnpm build` and the output directory to `dist`. Use `pnpm install --frozen-lockfile` during dependency installation.

See [Deployment](docs/deployment.md) for hosting instructions and path configuration.

## Documentation

The template, sample content, and documentation use English by default. Built-in interface translations are available in Simplified Chinese, Traditional Chinese, and Spanish. Start with the [documentation index](docs/README.md).

| Guide                                      | Contents                                                  |
| ------------------------------------------ | --------------------------------------------------------- |
| [Getting started](docs/getting-started.md) | Create a template copy, install, write your first post    |
| [Configuration](docs/configuration.md)     | Site identity, appearance, navigation, defaults           |
| [Writing](docs/writing.md)                 | Front matter, drafts, categories, URLs, feeds             |
| [Pages](docs/pages.md)                     | About, links, equipment, short updates                    |
| [Components](docs/components.md)           | Usage, parameters, and examples for all 41 MDX components |
| [Integrations](docs/integrations.md)       | Comments, music, external search                          |
| [Deployment](docs/deployment.md)           | GitHub Pages, static hosts, subpaths                      |
| [Hugo import](docs/migration.md)           | Preview, export, verify migrated content                  |
| [FAQ](docs/faq.md)                         | Troubleshooting and theme updates                         |

<details>
<summary>More previews: dark mode and mobile reading</summary>

![Dark homepage](docs/screenshots/home-desktop-dark.png)
![Mobile article](docs/screenshots/post-mobile-dark.png)

</details>

## Project structure

```text
astro-solitude/
├── public/                # Images, fonts, and other static assets
├── src/
│   ├── components/        # Theme and MDX components
│   ├── content/
│   │   ├── posts/         # Blog posts
│   │   └── pages/         # Custom pages
│   ├── data/              # About, links, equipment, and short-post data
│   ├── layouts/           # Page layouts
│   ├── pages/             # Astro routes
│   ├── styles/custom.css  # Custom styles
│   └── site.config.ts     # Site configuration
├── docs/                  # Documentation
└── astro.config.mjs       # Astro configuration
```

## Contributing

Use [Issues](https://github.com/everfu/astro-solitude/issues) for bug reports and suggestions. [Pull requests](https://github.com/everfu/astro-solitude/pulls) improving the theme, documentation, and translations are welcome. Include reproduction steps, your environment, and relevant configuration when reporting a problem.

Run these checks before submitting changes:

```sh
pnpm docs:check
pnpm check
pnpm build
pnpm test
```

For changes to page interactions, also run the browser tests:

```sh
pnpm build:fixture
pnpm exec playwright install chromium
pnpm test:e2e
```

Browser tests use an isolated fixture site. Mocked third-party tests do not establish that live services work. See the [development validation report](docs/parity.md) for test coverage and source comparisons.

## License

[Apache-2.0](LICENSE) License © 2026–present [everfu](https://github.com/everfu). Retain the applicable license and copyright notices when modifying or redistributing the project.
