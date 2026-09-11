# 第三方集成

[文档首页](README.md) · [配置字段清单](configuration-inventory.md)

模板默认只启用本地搜索；评论服务、评论聚合、弹幕、音乐馆和音乐胶囊关闭。下列片段合并到站点配置的 `theme` 中，填写自己的服务信息。配置与构建产物会发送到浏览器，只能包含该服务允许公开的客户端标识。

## 开启评论

选择一个提供商，把 `comment.use` 与其配置一起填写。以下以 Waline 为例：

```ts
theme: {
  comment: { use: 'waline', lazyload: true },
  waline: { serverURL: 'https://comments.example.com' },
},
```

| `comment.use` | 必填的提供商配置 | 补充 |
| --- | --- | --- |
| `twikoo` | `twikoo.envId` | 按服务环境设置 `region` |
| `waline` | `waline.serverURL` | 指向自己的服务端 |
| `valine` | `valine.appId`、`appKey`、`serverURLs` | 客户端 App ID/Key 与服务地址 |
| `artalk` | `artalk.server`、`site` | 服务端与站点名称 |
| `giscus` | `giscus.repo`、`repo_id`、`category_id` | 使用自己仓库的 Discussions 配置 |

可以使用逗号分隔多个提供商；建议先完成一个提供商的验证。文章 `comment: false` 可单独关闭评论；关于、音乐、归档等部分页面按布局不展示评论。服务端域名限制与初始化流程以所选服务的官方文档为准。

## 最新评论、统计和留言弹幕

这些开关需要已配置的评论服务，不是独立服务。下面用 Valine 展示完整组合；请将占位值替换为自己的客户端信息：

```ts
theme: {
  comment: {
    use: 'valine', lazyload: false,
    count: true, sidebar: true, pv: true, commentBarrage: true,
    newest_comment: { enable: true, storage: 0.5, limit: 5 },
  },
  valine: {
    appId: 'YOUR_APP_ID', appKey: 'YOUR_CLIENT_KEY',
    serverURLs: 'https://YOUR_APP_DOMAIN', visitor: true,
  },
  aside: {
    home: { noSticky: 'about', Sticky: 'newest_comment,allInfo' },
    post: { noSticky: 'about', Sticky: 'newestPost,newest_comment,allInfo' },
    page: { noSticky: 'about', Sticky: 'newestPost,newest_comment,allInfo' },
  },
  console: { recentComment: { enable: true, storage: 0.2 } },
  recent_comments: { enable: true, limit: 50, cache: 0.2, page: '/recentcomments/' },
  envelope: { enable: true, page: '/message/' },
  right_menu: { commentBarrage: true },
},
```

再向现有 `menus` 添加 `/message/` 和 `/recentcomments/`。`envelope` 控制留言板弹幕，`comment.commentBarrage` 控制文章评论弹幕；缓存设置的单位为天。当前最新评论、文章参与者头像和留言板聚合使用 Valine 接口；其他提供商的评论挂载不等于支持这些聚合功能。网络错误和空记录会显示对应状态。

## 在线音乐

```ts
theme: {
  music: { enable: true, id: 'YOUR_PLAYLIST_ID', server: 'netease', type: 'playlist' },
  capsule: { enable: true, id: 'YOUR_PLAYLIST_ID', server: 'netease', type: 'playlist' },
},
```

将 `/music/` 加入导航。`music` 控制音乐馆，`capsule` 控制跨页面音乐胶囊，二者分别配置。`server` 必须得到所用 Meting API 的支持；主题还兼容汽水音乐返回数据，但可用性取决于接口。需要更换服务时设 `theme.meting_api`，保留 `:server`、`:type`、`:id` 等模板参数。

默认 API 地址列在字段清单中；未开启音乐时不请求歌单。在线歌单的地区、版权与服务可用性由外部服务决定。文章内播放本地媒体可直接用 `Audio`、`Video`，无需开启在线音乐。

## 搜索

本地搜索无需账户，模板会预加载构建生成的 `/search.xml`。可设 `search.local.preload: false` 改为按需加载。

```ts
theme: {
  search: {
    enable: true, type: 'algolia',
    algolia: { appId: 'YOUR_APP_ID', apiKey: 'YOUR_SEARCH_ONLY_KEY', indexName: 'blog' },
  },
},
```

DocSearch 使用 `search.type: 'docsearch'`，并在 `search.docsearch` 填写 `appId`、`apiKey`、`indexName`。使用公开搜索密钥。主题提供浏览器搜索界面，不会替你创建或同步 Algolia 索引；Algolia 索引至少提供 `title`，并提供完整 `permalink` 或相对站点根路径的 `path`；标题需要返回 `_highlightResult.title` 高亮结果。DocSearch 使用其自身的爬虫索引结构。

## 集成验证

在自己的服务上检查加载、空记录、错误提示、主题切换和页面返回。仓库浏览器测试使用模拟服务，只验证组件行为，不代表你的线上服务已完成联调。不要使用公共模板中的测试标识连接生产数据。
