# Pages

[Documentation](README.md) · [Configuration](configuration.md) · [Integrations](integrations.md)

The theme includes the routes below. Navigation entries and route existence are independent: removing a menu link does not delete its page.

| Route | Page `type` | Data / prerequisite |
| --- | --- | --- |
| `/about/` | `about` | `src/data/about.json` |
| `/links/` | `links` | `src/data/links.json` |
| `/equipment/` | `kit` | `src/data/kit.json` |
| `/brevity/` | `brevity` | `src/data/brevity.json`, `theme.brevity.enable` |
| `/archives/` | `archives` | Generated from posts |
| `/music/` | `music` | `theme.music.enable` and a playlist |
| `/message/` | `message` | Comment service; wall animation also needs `theme.envelope.enable` |
| `/recentcomments/` | `recentcomment` | Comment service and `theme.recent_comments.enable` |

Comments and online music are disabled by default, with their menu links omitted. Their page types and routes remain available for later use.

## Override a built-in page

Create a page with the same path in `src/content/pages/`. For example, `links.md`:

```md
---
title: Friends
type: links
data: links
comment: false
---

A collection of blogs I enjoy.
```

`data: links` resolves to `src/data/links.json`. To use another dataset, copy it to `friends.json` and set `data: friends`. A missing data file fails the build. Each page type has its own layout: friends pages support additional prose, while About, equipment, and short updates primarily use JSON data.

## About

Start with [about.json](../src/data/about.json) and replace the introduction, skills, statistics, images, and personal details. Preserve the field structure. Before removing an optional group, check its conditional rendering in the [About component](../src/components/pages/About.astro). Data does not need to be embedded in an Astro component.

## Friends

```json
{
  "links": [{
    "class_name": "Friends",
    "class_desc": "Blogs I enjoy",
    "type": "item",
    "link_list": [{
      "name": "A friend's blog",
      "link": "https://example.com",
      "avatar": "/img/logo.png",
      "descr": "Words and everyday life"
    }]
  }]
}
```

Use `type: "card"` for a card group; links can also include `topimg` and `tag`. See [links.json](../src/data/links.json) for a complete example.

## Equipment

```json
{
  "groups": [{
    "name": "Creative tools",
    "description": "Tools I use every day",
    "items": [{
      "name": "Laptop",
      "specification": "Portable workstation",
      "description": "Writing and development",
      "image": "/img/demo/cover-getting-started-v2.webp",
      "link": "https://example.com"
    }]
  }]
}
```

## Short updates

```json
{
  "items": [{
    "date": "2026-09-11T10:00:00Z",
    "content": "Another small moment worth keeping.",
    "location": "At my desk",
    "image": ["/img/demo/cover-getting-started-v2.webp"],
    "link": "/archives/"
  }]
}
```

Keep `theme.brevity.enable: true`; the template already enables it. For the homepage update strip, set `theme.brevity.home_mini: true` and `theme.brevity.page: '/brevity/'`.

## Regular pages

Create `src/content/pages/projects.md`, add a `title`, and write Markdown to get `/projects/`. Set `url` for a custom path. Add an entry to `menus` yourself; new pages are not automatically added to navigation.
