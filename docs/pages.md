# 特色页面

[文档首页](README.md) · [主题配置](configuration.md) · [第三方集成](integrations.md)

主题内置以下路由。导航中的入口与路由是否存在相互独立：移除菜单不会删除页面。

| 路由 | 页面 `type` | 数据 / 前置配置 |
| --- | --- | --- |
| `/about/` | `about` | `src/data/about.json` |
| `/links/` | `links` | `src/data/links.json` |
| `/equipment/` | `kit` | `src/data/kit.json` |
| `/brevity/` | `brevity` | `src/data/brevity.json`，`theme.brevity.enable` |
| `/archives/` | `archives` | 从文章生成 |
| `/music/` | `music` | `theme.music.enable` 及歌单 |
| `/message/` | `message` | 评论服务；留言弹幕另设 `theme.envelope.enable` |
| `/recentcomments/` | `recentcomment` | 评论服务及 `theme.recent_comments.enable` |

评论、在线音乐默认关闭，相应导航也默认隐藏；页面类型和路由仍保留供启用使用。

## 覆盖内置页面

在 `src/content/pages/` 创建同路径页面即可覆盖默认页。例如 `links.md`：

```md
---
title: 朋友们
type: links
data: links
comment: false
---

欢迎交换友链。
```

`data: links` 指向 `src/data/links.json`。也可以复制数据为 `friends.json` 并填写 `data: friends`；数据文件不存在时构建会报错。内置页面各有布局，正文不是所有页面的主体：友链支持附加正文，关于、装备和短文主要使用 JSON 数据。

## 关于页面

以 [about.json](../src/data/about.json) 为起点，逐项替换简介、技能、统计、图片与个人信息。保持现有字段形状，删除不需要的数据前对照 [About 组件](../src/components/pages/About.astro) 的条件显示逻辑。无需将数据复制进 Astro 组件。

## 友链

```json
{
  "links": [{
    "class_name": "朋友们",
    "class_desc": "常读的博客",
    "type": "item",
    "link_list": [{
      "name": "朋友的博客",
      "link": "https://example.com",
      "avatar": "/img/logo.png",
      "descr": "文字与生活"
    }]
  }]
}
```

卡片组使用 `type: "card"`，可给链接增加 `topimg` 和 `tag`。完整示例见 [links.json](../src/data/links.json)。

## 装备

```json
{
  "groups": [{
    "name": "创作工具",
    "description": "每天陪伴我的工具",
    "items": [{
      "name": "笔记本",
      "specification": "便携工作站",
      "description": "写作与开发",
      "image": "/img/demo/cover-getting-started-v2.webp",
      "link": "https://example.com"
    }]
  }]
}
```

## 即刻短文

```json
{
  "items": [{
    "date": "2026-09-11T10:00:00+08:00",
    "content": "今天也有值得记录的事情。",
    "location": "书桌前",
    "image": ["/img/demo/cover-getting-started-v2.webp"],
    "link": "/archives/"
  }]
}
```

保持 `theme.brevity.enable: true`；当前模板已开启。需要首页短文条时配置 `theme.brevity.home_mini: true` 与 `theme.brevity.page: '/brevity/'`。

## 普通页面

创建 `src/content/pages/projects.md`，填写 `title` 后直接写 Markdown，即可得到 `/projects/`。需要自定义地址时设 `url`。最后将入口加入 `menus`，不会自动出现在导航中。
