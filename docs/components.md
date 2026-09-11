# MDX 内容组件

[文档首页](README.md) · [写作指南](writing.md) · [参数索引](component-inventory.md)

主题提供 41 个内容组件。以下示例来自仓库内可构建的 [完整演示文章](../src/content/posts/components.mdx)，启动后访问 `/p/components/`。

在 `src/content/posts/` 或 `src/content/pages/` 的 `.mdx` 正文中可以直接使用组件，主题会自动注入。其他 Astro 布局可从 `src/components/mdx/index.ts` 显式导入。布尔值写 `{true}` / `{false}`，对象写 JSX 表达式；组件内部复杂 Markdown 用空行包围。

示例使用模板内置媒体，可直接复制；发布自己的文章时替换图片、音视频与外部仓库。`children` 表示组件开闭标签之间的正文。隐藏组件只改变展示，不用于保护私密内容。

## 选择组件

| 用途 | 组件 |
| --- | --- |
| 提示与文字 | Note、Subnote、Bubble、Label、Text、Paragraph、Keyboard、Spoiler |
| 折叠与分组 | Fold、HideBlock、HideInline、HideToggle、Tabs、Tab |
| 图片与媒体 | Image、InlineImage、Gallery、GalleryItem、GalleryGroup、Audio、Video、Videos、BVideo、YouTube |
| 链接与内容集合 | Button、Link、Card、Flink、Series、Timeline、Timenode |
| 仓库信息 | GitHub、GitLab、Gitee、Gitea |
| 图表与展示 | ChartJS、Mermaid、Score、Typeit、Checkbox、Radio |

第三方视频、仓库卡片和图表脚本可能发起外部请求；网络失败不影响普通文章写作。库地址在 `theme.cdn` 中配置。

## Audio

播放音频。`src` 或 `url`：音频路径；`name`：可访问名称。

```mdx
<Audio src="/media/shortcodes/t-rex-roar.mp3" name="演示音频" />
```

## Bubble

补充悬停解释。`notation`：解释文本；`color`：样式色；正文为触发文字。

```mdx
<Bubble notation="补充解释">悬停提示</Bubble>
```

## Button

跳转按钮。`url`：目标；`text`：文字；`icon`：图标类；`option`：附加样式类。

```mdx
<Button url="/archives/" text="查看文章" icon="fas fa-book" />
```

## BVideo

嵌入 Bilibili 视频。`bvid`（或 `id`）：BV 编号；浏览器加载第三方播放器。

```mdx
<BVideo bvid="BV1GJ411x7h7" />
```

## Card

展示项目卡片。`title`（或 `name`）、`desc`、`cover`（或 `bg`）、`url`；可选 `tag`、`star`、`icon`、CSS 尺寸 `width`、`height`。

```mdx
<Card title="内容卡片" desc="用于展示一个项目。" cover="/img/demo/cover-getting-started-v2.webp" url="/about/" tag="主题" star={5} />
```

## ChartJS

绘制数据图表。`config`：Chart.js 配置对象，或 `code`：JSON 字符串；可选 `id`、`description`、`width`（百分比数值）、`layout`；依赖 `theme.chart`。

```mdx
<ChartJS config={{type:"bar",data:{labels:["文章","笔记","项目"],datasets:[{label:"内容",data:[12,8,4]}]}}} description="本地演示数据" />
```

## Checkbox

展示任务状态。`checked`：布尔值，默认选中；`style`：样式类；`label`：可访问名称。为禁用的展示控件，不收集表单输入。

```mdx
<Checkbox checked={true}>已完成任务</Checkbox>
```

## Flink

嵌入友链分组。`groups`：包含 `class_name`、`class_desc`、`link_list` 的数组，链接字段同友链数据。

```mdx
<Flink groups={[{class_name:"官方资源",link_list:[{name:"Astro",link:"https://astro.build/",avatar:"/img/logo.png",descr:"静态网站框架"}]}]} />
```

## Fold

原生折叠面板。`title`：标题；`open={true}`：初始展开，默认关闭。

```mdx
<Fold title="展开内容">折叠面板中的内容。</Fold>
```

## Gallery

组织图片网格。`columns`：列数；内部使用 `GalleryItem`。

```mdx
<Gallery columns={2}>
<GalleryItem src="/img/demo/cover-getting-started-v2.webp" alt="创作" />
<GalleryItem src="/img/demo/cover-pagination-v2.webp" alt="记录" />
</Gallery>
```

## GalleryGroup

创建相册入口。`title`（或 `name`）：名称；`img`：封面；`url`：目标，正文为描述。

```mdx
<GalleryGroup title="相册入口" img="/img/demo/cover-shortcodes-v2.webp" url="/about/">走进内容世界。</GalleryGroup>
```

## GalleryItem

单张图库图片。`src`：图片；`alt`：替代文本；通常放入 `Gallery`。

```mdx
<GalleryItem src="/img/demo/cover-getting-started-v2.webp" alt="画廊图片" />
```

## Gitea

展示 Gitea 仓库。`host`（或 `server`）：服务 URL；`repo`：所有者/仓库；需服务支持浏览器跨域读取。

```mdx
<Gitea host="https://codeberg.org" repo="forgejo/forgejo" />
```

## Gitee

展示 Gitee 仓库。`repo`：所有者/仓库；在浏览器请求公开仓库 API。

```mdx
<Gitee repo="mirrors/vue" />
```

## GitHub

展示 GitHub 仓库。`repo`：所有者/仓库；在浏览器请求公开仓库 API。

```mdx
<GitHub repo="withastro/astro" />
```

## GitLab

展示 GitLab 仓库。`repo`：命名空间/项目；当前内置请求 gitlab.com。

```mdx
<GitLab repo="gitlab-org/gitlab" />
```

## HideBlock

点击显示块内容。`text` 或 `title`：按钮文字；正文为隐藏内容，可用 `id` 标识。

```mdx
<HideBlock text="显示内容">块级隐藏内容。</HideBlock>
```

## HideInline

点击显示行内内容。`text` 或 `title`：按钮文字；正文为隐藏内容。

```mdx
<HideInline text="显示">行内内容</HideInline>
```

## HideToggle

切换内容可见性。`title` 或 `text`：按钮文字；正文为隐藏内容。

```mdx
<HideToggle title="切换显示">可反复切换的内容。</HideToggle>
```

## Image

带说明的图片。`src`、`alt`；可选 `caption`：图注、`style`：图片 CSS。

```mdx
<Image src="/img/demo/cover-shortcodes-v2.webp" alt="Solitude 组件示例" caption="主题内置示例图" />
```

## InlineImage

行内小图片。`src`、`alt`；`height`：带单位高度，如 `32px`。

```mdx
<InlineImage src="/img/logo.png" alt="Solitude" height="32px" />
```

## Keyboard

标注按键组合。正文或 `text`：按键文字。

```mdx
<Keyboard>⌘ K</Keyboard>
```

## Label

高亮标签。正文或 `text`：文字；`color`：样式色。

```mdx
<Label color="green">已完成</Label>
```

## Link

展示链接摘要。`url`（或 `link`）：目标；`title`：标题；`desc`（或 `subtitle`）：简介。

```mdx
<Link title="Astro" desc="Astro 官方网站" url="https://astro.build/" />
```

## Mermaid

绘制流程图。`code`：Mermaid 文本；依赖 `theme.mermaid` 和浏览器脚本。

```mdx
<Mermaid code={"graph LR\nA[Content] --> B[Astro] --> C[HTML]"} />
```

## Note

正文提示框。`type`：如 `info`、`success`、`warning`、`danger`；`style` 默认 `flat`。

```mdx
<Note type="info">支持 **Markdown** 的提示内容。</Note>
```

## Paragraph

彩色段落。`color`：样式类；正文为段落内容。

```mdx
<Paragraph color="blue">一段彩色文字。</Paragraph>
```

## Radio

展示单选状态。`checked`：布尔值，默认选中；`style`：样式类；`label`：可访问名称。为禁用的展示控件。

```mdx
<Radio checked={false}>可选项目</Radio>
```

## Score

展示乐谱。`score`：ABC 文本；`params`：ABCJS 渲染选项对象。

```mdx
<Score score={"X:1\nT:Simple tune\nM:4/4\nL:1/4\nK:C\nC D E F | G A B c |"} />
```

## Series

列出系列文章。`name`：文章 `series` 中的名称；省略时尝试使用当前文章的第一个系列，按日期正序列出。

```mdx
<Series name="主题入门" />
```

## Text

彩色行内文字。`color`：样式类；正文为文字。

```mdx
<Text color="red">重点文字。</Text>
```

## Spoiler

隐藏剧透文字。正文为内容；`style` 默认 `block`，通过悬停或聚焦显示。

```mdx
<Spoiler>隐藏的内容</Spoiler>
```

## Subnote

补充提示。`type` 与 `style` 同 `Note`。

```mdx
<Subnote type="success">补充说明。</Subnote>
```

## Tab

标签页内容面板。`title`：页签名；可选 `icon`；必须放入 `Tabs`。

```mdx
<Tabs><Tab title="独立面板">Tab 作为 Tabs 的子组件。</Tab></Tabs>
```

## Tabs

组合多个标签页。`id`：可选且应唯一；内部使用 `Tab`。

```mdx
<Tabs id="demo-tabs">
<Tab title="Markdown">文字与列表。</Tab>
<Tab title="MDX">组件与交互。</Tab>
</Tabs>
```

## Timeline

创建时间线。`title`：标题；`color`：样式类；内部使用 `Timenode`。

```mdx
<Timeline title="主题旅程" color="blue">
<Timenode time="第一步" title="创建站点">从模板开始。</Timenode>
<Timenode time="第二步" title="开始写作">发布第一篇文章。</Timenode>
</Timeline>
```

## Timenode

时间线节点。`time`：时间文字；`title`：节点标题；正文为详情，放入 `Timeline`。

```mdx
<Timeline><Timenode time="现在" title="保持创作">记录值得分享的事情。</Timenode></Timeline>
```

## Typeit

打字动画。`speed`：速度，默认 80；正文为文字；动画依赖 `theme.typeit`。

```mdx
<Typeit speed={80}>用文字记录生活。</Typeit>
```

## Video

播放本地视频。`src` 或 `url`：视频；`poster`：封面；使用原生播放器。

```mdx
<Video src="/media/shortcodes/flower.mp4" poster="/img/demo/cover-shortcodes-v2.webp" />
```

## Videos

多个视频网格。`sources`：视频路径数组；`col`：列数，默认 2。

```mdx
<Videos col={2} sources={["/media/shortcodes/flower.mp4"]} />
```

## YouTube

嵌入 YouTube 视频。`id`：视频编号；默认使用 nocookie 域名，`privacy={false}` 改用普通域名。

```mdx
<YouTube id="aqz-KE-bpKQ" />
```
