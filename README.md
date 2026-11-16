English 丨 [简体中文](README.zh-CN.md)

# Astro Solitude

A clean, elegant, feature-rich blog theme for Astro.

Static pages, Markdown / MDX, light and dark modes, content components, local search, feeds, comments, and a music capsule that persists across navigation.

[Use this template](https://github.com/everfu/astro-solitude/generate) · [Quick start](#quick-start) · [Report an issue](https://github.com/everfu/astro-solitude/issues)

## Quick start

### 1. Get the project

Install Node.js **22.12.0+** and pnpm. Use the pnpm version specified in the `packageManager` field of [package.json](package.json).

Click [Use this template](https://github.com/everfu/astro-solitude/generate) to create an independent repository, then clone your copy with your account and repository names.

```sh
git clone https://github.com/YOUR_NAME/my-blog.git
cd my-blog
pnpm install --frozen-lockfile
pnpm dev
```

Open the local URL shown in your terminal to preview the theme and sample content.

### 2. Configure your site

Edit [`site.config.ts`](site.config.ts) to set your site URL, title, author, navigation, and theme options.

```ts
import { defineSolitudeConfig } from './src/config';

export default defineSolitudeConfig({
  site: 'https://example.com',
  title: 'My blog',
  description: 'Notes, stories, and discoveries.',
  locale: 'en',
  author: { name: 'Your name' },
});
```

For a site hosted under a subdirectory, also set `base`, for example `base: '/blog/'`.

The template includes sample posts and pages with local search enabled. Comments, comment aggregation, and the music hall are disabled with empty service identifiers. The music capsule is enabled with a sample Qishui playlist. Replace `theme.capsule.id` with your own playlist or set `theme.capsule.enable: false` to disable it. Replace sample content, images, and site identity before publishing. Changing the interface locale does not translate posts or custom navigation.

### 3. Start writing

Create a Markdown or MDX file named `hello-world.md` under `src/content/posts/`.

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

### 4. Build and deploy

```sh
pnpm build
pnpm preview
```

Publish the generated `dist/` directory to your hosting platform. Set the build command to `pnpm build` and the output directory to `dist`. Use `pnpm install --frozen-lockfile` during dependency installation.

## Commands

Run commands from the project root.

| Command        | Purpose                               |
| -------------- | ------------------------------------- |
| `pnpm dev`     | Start local development               |
| `pnpm build`   | Generate the static site in `dist/`   |
| `pnpm preview` | Preview the production build          |
| `pnpm check`   | Check TypeScript and Astro components |

## Contributing

Feedback and focused improvements are welcome. Follow the [contribution guide](CONTRIBUTING.md) and include reproduction steps and verification results in issues or pull requests.

## License

[Apache-2.0](LICENSE) License © 2026–present [everfu](https://github.com/everfu). Retain the applicable license and copyright notices when modifying or redistributing the project.
