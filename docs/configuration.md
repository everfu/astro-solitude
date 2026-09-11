# 主题配置

[文档首页](README.md) · [写作指南](writing.md) · [完整字段清单](configuration-inventory.md)

统一在 [src/site.config.ts](../src/site.config.ts) 调用 `defineSolitudeConfig`。对象递归合并，数组整体替换；未填写的字段使用基础默认值。通常不需要修改 `src/lib/defaults.json`。

## 站点信息

| 字段 | 基础默认值 | 用途 |
| --- | --- | --- |
| `site` | `https://example.org` | 绝对 HTTP(S) 站点地址，用于 canonical、RSS、Sitemap |
| `base` | `/` | 部署前缀，必须以 `/` 开始和结束 |
| `title` / `description` | Solitude / 英文简介 | 标题与简介 |
| `author` | `{ name: 'Solitude' }` | 作者名，可选 `email` |
| `locale` | `zh-CN` | `zh-CN`、`zh-TW`、`en`、`es` |
| `timeZone` | `Asia/Shanghai` | 日期显示时区 |
| `hasCJKLanguage` | `false` | 为中文等内容采用相应字数统计规则 |
| `pagination` | `10` | 首页每页文章数，正整数 |
| `menus` | `[]` | 导航数组 |

`locale` 只切换内置界面文字；文章、导航和页面数据需要自行翻译。

## 默认值与模板配置

| 功能 | 基础默认值 | 当前模板 |
| --- | --- | --- |
| 首页推荐 | 从文章中按日期补齐最多 5 项 | 同基础行为，展示模板文章 |
| 导航、作者链接、页脚 | 空数组或空对象 | 文章、特色页面与项目链接 |
| 侧栏 | 作者卡、站点统计、内页最新文章 | 相同分组，中文作者卡 |
| 封面取色 | 关闭 | 开启，`local` 模式 |
| 即刻短文 | 关闭 | 开启 |
| 快捷键 | 关闭 | 开启主题切换、搜索和帮助快捷键 |
| 本地搜索 | 开启，按需加载 | 开启并预加载 |
| PWA manifest | 关闭 | 开启；不包含离线缓存承诺 |
| 评论及评论聚合 | 关闭，服务标识为空 | 关闭 |
| 音乐馆、音乐胶囊 | 关闭，歌单为空 | 关闭 |

[完整字段清单](configuration-inventory.md)展示基础默认值，不是合并后的模板配置。

## 导航与链接

```ts
menus: [
  { name: '文章', url: '/archives/', icon: 'fas fa-folder-closed' },
  { name: '探索', children: [
    { name: '关于', url: '/about/' },
    { name: '友链', url: '/links/' },
  ] },
],
```

站内链接使用从 `/` 开始的主题路径，由主题添加 `base`；站外使用完整 URL。图标使用项目内置 Font Awesome 类名。替换 `menus` 会替换整个数组。

## 外观与首页

```ts
theme: {
  theme_color: { light: '#425aef', dark: '#ffc848' },
  display_mode: { type: 'auto' },
  font: { font_size: '16px', code_font_size: '14px' },
  hometop: {
    enable: true,
    recommendList: [{
      title: '从这里开始', url: '/p/getting-started/',
      cover: '/img/demo/cover-getting-started-v2.webp', label: '入门',
    }],
  },
  index_post_list: { direction: 'column', column: 2, cover: 'both' },
  post: { covercolor: { enable: true, mode: 'local' } },
},
```

`display_mode.type` 可用 `auto`、`light`、`dark`；访客保存的偏好会影响显示。自定义样式写入 [custom.css](../src/styles/custom.css)。首页列表按置顶权重、日期排序；推荐区域先采用 `recommendList`，再按日期从文章补齐到最多 5 项。`recommendList` 项可设 `enable: false` 隐藏。`hometop.banner` 与 `hometop.group` 是保留的兼容字段，当前推荐轮播不使用它们的内容。`home: false` 会从首页列表和推荐区域隐藏该文章。

## 侧栏与页脚

侧栏位置分别由 `theme.aside.home`、`post`、`page` 配置，`noSticky` 与大小写敏感的 `Sticky` 使用逗号分隔的模块名称：`about`、`newestPost`、`newest_comment`、`allInfo`。最新评论还需要开启评论服务，见 [集成指南](integrations.md)。

```ts
theme: {
  aside: {
    home: { noSticky: 'about', Sticky: 'allInfo' },
    post: { noSticky: 'about', Sticky: 'newestPost,allInfo' },
    my_card: {
      author: { img: '/img/logo.png' },
      description: '记录生活的片段。',
      content: '欢迎来访。',
    },
  },
  footer: {
    information: { right: [{ name: 'RSS', url: '/index.xml' }] },
  },
},
```

## 内容字段 / Front matter

文章与页面的字段、默认值和 URL 优先关系见 [写作指南](writing.md)。关于、友链等结构化数据见 [特色页面](pages.md)。

## 第三方服务与资源

评论、音乐、Algolia 和 DocSearch 的最小配置见 [第三方集成](integrations.md)。`theme.cdn` 可以替换浏览器依赖地址；替换时需要保证对应库的全局接口兼容。静态站点发送到浏览器的配置是公开数据，不要填写服务端管理凭证。
