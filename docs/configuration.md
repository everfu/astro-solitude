# 配置 / Configuration

配置入口是 `src/site.config.ts` 的 `defineSolitudeConfig()`。未提供的项深度合并到默认值；数组整体替换。完整默认配置位于 `src/lib/defaults.json`，分组与 Hugo 的 `params.solitude` 保持对应。`theme` 是原 `params.solitude`，站点信息与导航在外层。

```ts
import { defineSolitudeConfig } from './lib/config';
export default defineSolitudeConfig({
  site: 'https://example.org',
  base: '/',
  title: 'My notebook',
  locale: 'en', // zh-CN | zh-TW | en | es
  author: { name: 'Writer' },
  pagination: 10,
  menus: [{ name: 'Archive', url: '/archives/' }],
  theme: {
    display_mode: { type: 'auto' },
    theme_color: { light: '#425aef', dark: '#ffc848' },
    search: { enable: true, type: 'local' },
    comment: { use: '' },
  },
});
```

`site` 是公开站点 origin；子目录站点另设 `base: '/blog/'`，必须以前后斜杠包围。内容与菜单里的根路径不包含 base，输出时统一添加。外部 URL、锚点、mailto 链接保持原值。显式内容 URL 禁止查询字符串、片段和父目录跳转。

## 内容字段 / Front matter

```yaml
---
title: A new post
date: 2026-08-01
lastmod: 2026-08-02
slug: new-post
# url: /p/existing-address.html
aliases: [/old-address/]
description: A short summary
cover: /images/cover.webp
categories: [Notes]
tags: [Astro]
series: [Getting started]
draft: false
home: true
sticky: false
comment: true
aside: true
toc: true
random: true
---
```

`date` 为文章必填项，页面可省略。日期按 `timeZone` 显示。`home` 只影响首页三个区域，`random` 控制随机文章入口，`sticky` 接受布尔值或数值。`not_cover: true` 去掉文章头部封面。`copyright: false` 关闭当前文章的版权声明；作者头像、背景可由 `avatar`、`avatar_background` 覆盖。

所有内容必须通过构建：重复 URL、文件输出冲突、缺失的特殊页面数据和正文渲染失败会报错。

## 布局与页面 / Layout and pages

- 首页：`hometop.enable`、`hometop.recommendList`（title/url/cover/label/color）、`index_post_list`。推荐不足五项时从可见文章补齐，手动推荐的已知隐藏文章也会被排除。
- 侧栏：`aside.position`、`aside.home/post/page.noSticky` 和 `Sticky`，用逗号组合 `about,newestPost,allInfo,newest_comment`。目录由 `aside.toc.post/page` 与页面 `toc` 共同控制。
- 文章：`post.meta`、`post.default`、`post.award`、`post.share`、`related_post`、`expire`。
- 站点外观：`theme_color`、`font`、`display_mode`；最后加载的 `src/styles/custom.css` 用于覆盖。
- 页脚：`footer.information`、`footer.group`、`footer.links`、`footer.beian`。

默认特殊页面可由 `src/content/pages/<name>.md` 覆盖：`about`、`links`、`kit`、`music`、`message`、`brevity`、`recentcomment`、`archives`。例如：

```yaml
---
title: About me
url: /about/
type: about
data: about
comment: false
---
```

`data: about` 指向 `src/data/about.json`；可换成自定义 JSON 名称。About 使用 `sections`；Equipment 使用 `groups`；Links 使用 `links`；Brevity 使用 `items`。结构见仓库内示例。页面内容、演示数据和自定义导航需要自行翻译，界面语言开关不翻译文章。

## 服务 / Services

| 功能 | 配置 |
| --- | --- |
| 本地搜索 | `search.type: 'local'`、`search.local.CDN: '/search.xml'` |
| Algolia | `search.type: 'algolia'`，填写 `search.algolia.appId/apiKey/indexName` |
| DocSearch | `search.type: 'docsearch'`，填写 `search.docsearch.appId/apiKey/indexName` |
| Twikoo | `comment.use: 'twikoo'`，填写 `twikoo.envId`、可选 region/option |
| Waline | `comment.use: 'waline'`，填写 `waline.serverURL` |
| Valine | `comment.use: 'valine'`，填写 `valine.appId/appKey/serverURLs` |
| Artalk | `comment.use: 'artalk'`，填写 `artalk.server/site` |
| Giscus | `comment.use: 'giscus'`，填写 `giscus.repo/repo_id/category_id` |
| 音乐胶囊 | `capsule.enable/id/server/type/volume` |
| 音乐馆 | `music.enable/id/server/type/volume/order/mutex` |
| PWA 图标与清单 | `pwa.enable`、`pwa.manifest`、各图标 URL |

评论可用逗号配置多个提供方。`comment.lazyload` 延迟到评论区域附近加载。各服务的 `option` 对象传入官方客户端；内容路径由主题管理。继承自 Hugo 的最近评论、参与者、聚合计数和弹幕增强以 Valine 聚合接口为基础，不把五种服务的挂载支持等同于五种聚合 API。Giscus 需配置仓库 Discussions。

RSS 默认 `/index.xml`，兼容 section/term 的 `index.xml`；搜索、RSS 不排除 `home: false`。PWA 提供清单和图标，不包含离线缓存服务工作线程。

CDN 地址可在 `cdn` 覆盖。字体图标、KaTeX 样式和代码高亮本地构建；Chart.js、ABCJS、Mermaid、TypeIt、灯箱、评论与音乐库按需加载。第三方网络不可用时保留静态正文。

## 扩展 / Extension API

在 Astro 组件里导入自己的脚本，或通过 `extends.head/body` 添加可信 HTML。配置会进入公开产物，禁止放入服务端秘密。

```ts
const cleanup = window.Solitude.on('afterNavigate', () => {
  const button = document.querySelector('#custom-action');
  window.Solitude.listen(button, 'click', () => console.log('clicked'));
});
// 页面监听默认随切页清理；长期事件可调用 cleanup() 取消。
```

提供 `Solitude.navigate`、`on`、`listen`、`onPageCleanup`、`loadScript`、`loadStyle`、`copy`、`toggleTheme`、`openSearch` 等常用方法。生命周期为 `solitude:ready`、`beforeNavigate`、`afterNavigate`、`themeChange`。`addEventListenerPjax` 保留为自动清理监听器的兼容入口；PJAX 对象本身被 Astro ClientRouter 替代。

The configuration is merged deeply, with arrays replaced as a whole. Keep content paths relative to the configured base. Third-party integrations require your own public client configuration. See the default JSON and the complete field inventory for every inherited setting.
