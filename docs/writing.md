# Writing

[Documentation](README.md) · [MDX components](components.md) · [Pages](pages.md)

Put posts in `src/content/posts/` and pages in `src/content/pages/`. Subdirectories are supported. Use `.mdx` for components; regular `.md` does not interpret JSX components or Hugo shortcodes.

## Front matter

```yaml
---
title: A new beginning
date: 2026-09-11T10:00:00Z
lastmod: 2026-09-12T09:00:00Z
description: A short summary.
slug: a-new-start
cover: /img/demo/cover-getting-started-v2.webp
categories: [Life]
tags: [Notes, Astro]
series: [Everyday stories]
home: true
draft: false
sticky: 2
comment: true
aside: true
toc: true
---
```

| Field | Default / required | Behavior |
| --- | --- | --- |
| `title` | Required | Page title |
| `date` | Required for posts; optional for pages | Publication date; include a time zone |
| `lastmod` | Optional | Last modification date |
| `description` | Optional | Summary and page description |
| `slug` / `url` | Optional | Custom path; see below |
| `aliases` | `[]` | Additional old URLs that generate redirect pages |
| `cover` | Optional | Cover image; otherwise the theme chooses a default |
| `categories` / `tags` / `series` | `[]` | Arrays of category, tag, and series names |
| `home` | `true` | `false` hides the post only from homepage areas |
| `draft` | `false` | Visible in development; excluded from production |
| `sticky` | `false` | `true` equals weight 1; larger numeric weights appear first on the homepage |
| `comment` | `true` | Allow comments when a global service is configured |
| `aside` / `toc` | `true` | Sidebar and table of contents; some special layouts omit the sidebar |
| `random` | `true` | Include in random post selection |
| `not_cover` | Optional | Omit the large article cover layout |
| `type` | Optional | Page type; see the Pages guide |

Posts with `home: false` remain accessible through direct URLs, archives, search, and RSS. Drafts are excluded from production. A future date does not schedule publication: a post without `draft: true` is published on the next build.

## URLs and redirects

Posts default to `/p/content-id/`; pages default to `/content-id/`. Precedence is `url` → `slug` → content file identifier.

```yaml
slug: hello
url: /notes/hello.html
aliases:
  - /old-hello/
  - /2025/hello.html
```

Here the canonical path is `/notes/hello.html`; both aliases redirect there. URLs and aliases must be absolute internal paths without query strings, fragments, backslashes, or `..` segments. Do not repeat the deployment `base`. Conflicts between posts, pages, aliases, and system routes cause the build to fail.

## Images, code, and math

Store static images in `public/` and omit `public` in references:

```md
![A moment in the mountains](/img/demo/cover-getting-started-v2.webp)
```

Add a language to fenced code blocks for Shiki highlighting. Configure copying, line numbers, and maximum height through `theme.highlight`. Use `$E = mc^2$` or double-dollar blocks for formulas, with `theme.katex.enable: true`.

The theme handles internal links and assets passing through its rendering pipeline. When adding raw HTML, CSS URLs, or custom scripts, verify their prefixes yourself under the actual deployment subdirectory.

## Categories, series, and feeds

Category, tag, and series pages are generated from post fields. Entry points are `/categories/`, `/tags/`, `/series/`, and `/archives/`. The theme also generates `/index.xml`, taxonomy feeds, `/search.xml`, `/sitemap.xml`, and `/robots.txt`. Set `site` and `base` before publishing so feeds do not point to an example domain.
