# Getting started

[Documentation](README.md) → Getting started → [Configuration](configuration.md)

## 1. Create your repository

Open [Use this template](https://github.com/everfu/astro-solitude/generate), choose an owner and a repository name such as `my-blog`, then clone your new repository:

```sh
git clone https://github.com/YOUR_NAME/my-blog.git
cd my-blog
```

Replace `YOUR_NAME` and `my-blog`. A repository created from a template has its own history and does not automatically receive future theme updates. See [GitHub's template documentation](https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-repository-from-a-template).

## 2. Install and preview

Use Node.js **22.12.0+** and the pnpm version specified by `packageManager` in [package.json](../package.json), currently `pnpm@11.24.0`.

```sh
npm install -g pnpm@11.24.0
pnpm install --frozen-lockfile
pnpm dev
```

Open the local address shown in your terminal. Press `Ctrl+C` for a foreground server; if Astro reports a background server, use `pnpm exec astro dev stop`. The lockfile pins the dependencies; an Astro upgrade is not required to get started.

## 3. Set your identity and URL

Edit [src/site.config.ts](../src/site.config.ts). Keep the template navigation and appearance, or replace the file with this minimal configuration:

```ts
import { defineSolitudeConfig } from './lib/config';

export default defineSolitudeConfig({
  site: 'https://example.com',
  title: 'My blog',
  description: 'Notes, stories, and discoveries.',
  locale: 'en',
  timeZone: 'UTC',
  author: { name: 'Your name' },
  menus: [
    { name: 'Articles', url: '/archives/' },
    { name: 'About', url: '/about/' },
  ],
});
```

Set `site` to your final domain. Set `base` separately when deploying under a subdirectory. A minimal configuration uses base appearance defaults and may look different from the repository screenshots; see [Base defaults and template settings](configuration.md#base-defaults-and-template-settings).

## 4. Write your first post

Create `src/content/posts/hello-world.md`:

```md
---
title: Hello, world
date: 2026-09-11T10:00:00Z
description: My first post.
tags: [Life]
---

Start your story here.
```

Preview `/p/hello-world/`. Use `.md` for regular posts and `.mdx` for posts containing components. See [Writing](writing.md) for publishing behavior.

## 5. Replace sample content

| Content | Location |
| --- | --- |
| Posts and cover images | `src/content/posts/`, `public/img/` |
| Custom pages | `src/content/pages/` |
| About, friends, equipment, short updates | `src/data/`; see [Pages](pages.md) |
| Title, avatar, navigation, sidebar, footer | `src/site.config.ts` |
| Additional styles | `src/styles/custom.css` |

Keep the component showcase as a reference until you no longer need it. When removing a sample post, also update navigation, recommendations, and links from other posts. Comments and online music have no preset service identifiers; enable your own through [Integrations](integrations.md).

## 6. Publish

```sh
pnpm check
pnpm build
pnpm preview
```

Review the production preview, then follow [Deployment](deployment.md) to upload `dist/` or connect your repository to a hosting service. Creating a template repository does not automatically publish a website.
