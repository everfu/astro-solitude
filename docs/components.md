# MDX 组件 / Components

`src/content/posts/components.mdx` 是可运行的 41 组件示例，访问 `/p/components/`。组件由主题自动注入；在其他布局中可显式导入。扩展内容必须使用 `.mdx`，普通 `.md` 不解析组件或 Hugo 短代码。

```mdx
import { Note, Tabs, Tab } from '../../components/mdx';

<Note type="info">

支持 **Markdown** 的提示框。

</Note>

<Tabs id="example">
  <Tab title="One">第一项</Tab>
  <Tab title="Two">第二项</Tab>
</Tabs>
```

嵌套块内部建议用空行包围 Markdown。布尔值使用 `{true}` / `{false}`；图表与配置对象使用 JSX 表达式。组件属性保持源短代码含义。

| Hugo 名称 | MDX 组件 | 源参数 | 验证 |
| --- | --- | --- | --- |
| audio | [Audio](../src/components/mdx/Audio.astro) | url, src, name | 示例构建、转换映射测试 |
| bubble | [Bubble](../src/components/mdx/Bubble.astro) | color, text, notation, position | 示例构建、转换映射测试 |
| button | [Button](../src/components/mdx/Button.astro) | url, text, icon, option | 示例构建、转换映射测试 |
| bvideo | [BVideo](../src/components/mdx/BVideo.astro) | bvid, id | 示例构建、转换映射测试 |
| card | [Card](../src/components/mdx/Card.astro) | title, name, url, cover, bg, desc, tag, width, height, icon, star | 示例构建、转换映射测试 |
| chartjs | [ChartJS](../src/components/mdx/ChartJS.astro) | id, layout, width, description | 示例构建、转换映射测试 |
| checkbox | [Checkbox](../src/components/mdx/Checkbox.astro) | checked, style | 示例构建、转换映射测试 |
| flink | [Flink](../src/components/mdx/Flink.astro) | children | 示例构建、转换映射测试 |
| fold | [Fold](../src/components/mdx/Fold.astro) | open, title | 示例构建、转换映射测试 |
| gallery | [Gallery](../src/components/mdx/Gallery.astro) | columns | 示例构建、转换映射测试 |
| galleryGroup | [GalleryGroup](../src/components/mdx/GalleryGroup.astro) | img, title, name, url | 示例构建、转换映射测试 |
| galleryItem | [GalleryItem](../src/components/mdx/GalleryItem.astro) | src, alt | 示例构建、转换映射测试 |
| gitea | [Gitea](../src/components/mdx/Gitea.astro) | host, server, repo | 示例构建、转换映射测试 |
| gitee | [Gitee](../src/components/mdx/Gitee.astro) | repo | 示例构建、转换映射测试 |
| github | [GitHub](../src/components/mdx/GitHub.astro) | repo | 示例构建、转换映射测试 |
| gitlab | [GitLab](../src/components/mdx/GitLab.astro) | repo | 示例构建、转换映射测试 |
| hideBlock | [HideBlock](../src/components/mdx/HideBlock.astro) | text | 示例构建、转换映射测试 |
| hideInline | [HideInline](../src/components/mdx/HideInline.astro) | text | 示例构建、转换映射测试 |
| hideToggle | [HideToggle](../src/components/mdx/HideToggle.astro) | title, text | 示例构建、转换映射测试 |
| img | [Image](../src/components/mdx/Image.astro) | src, alt, style, caption | 示例构建、转换映射测试 |
| inlineImg | [InlineImage](../src/components/mdx/InlineImage.astro) | src, alt, height | 示例构建、转换映射测试 |
| keyboard | [Keyboard](../src/components/mdx/Keyboard.astro) | children | 示例构建、转换映射测试 |
| label | [Label](../src/components/mdx/Label.astro) | color, text | 示例构建、转换映射测试 |
| link | [Link](../src/components/mdx/Link.astro) | url, link, title, desc, subtitle | 示例构建、转换映射测试 |
| mermaid | [Mermaid](../src/components/mdx/Mermaid.astro) | children | 示例构建、转换映射测试 |
| note | [Note](../src/components/mdx/Note.astro) | type, style | 示例构建、转换映射测试 |
| p | [Paragraph](../src/components/mdx/Paragraph.astro) | color | 示例构建、转换映射测试 |
| radio | [Radio](../src/components/mdx/Radio.astro) | checked, style | 示例构建、转换映射测试 |
| score | [Score](../src/components/mdx/Score.astro) | score | 示例构建、转换映射测试 |
| series | [Series](../src/components/mdx/Series.astro) | name | 示例构建、转换映射测试 |
| span | [Text](../src/components/mdx/Text.astro) | color | 示例构建、转换映射测试 |
| spoiler | [Spoiler](../src/components/mdx/Spoiler.astro) | style | 示例构建、转换映射测试 |
| subnote | [Subnote](../src/components/mdx/Subnote.astro) | type | 示例构建、转换映射测试 |
| tab | [Tab](../src/components/mdx/Tab.astro) | title, icon | 示例构建、转换映射测试 |
| tabs | [Tabs](../src/components/mdx/Tabs.astro) | id | 示例构建、转换映射测试 |
| timeline | [Timeline](../src/components/mdx/Timeline.astro) | color, title | 示例构建、转换映射测试 |
| timenode | [Timenode](../src/components/mdx/Timenode.astro) | time, title | 示例构建、转换映射测试 |
| typeit | [Typeit](../src/components/mdx/Typeit.astro) | speed | 示例构建、转换映射测试 |
| video | [Video](../src/components/mdx/Video.astro) | url, src, poster | 示例构建、转换映射测试 |
| videos | [Videos](../src/components/mdx/Videos.astro) | col | 示例构建、转换映射测试 |
| youtube | [YouTube](../src/components/mdx/YouTube.astro) | id, privacy | 示例构建、转换映射测试 |

## 原始文本与数据属性

| 组件 | 扩展属性 |
| --- | --- |
| ChartJS | `config={{type, data, options}}` 或 `code={JSON文本}` |
| Mermaid | `code={图表文本}` |
| Score | `score={ABC文本}`、`params={{}}` |
| Flink | `groups={[{class_name, class_desc, link_list: []}]}` |
| Videos | `sources={["/video.mp4"]}`、`col={2}` |

图库、时间线和标签页使用子组件嵌套。仓库卡片只在浏览器请求公开仓库 API，失败时显示回退状态。Chart.js、ABCJS、Mermaid、TypeIt、视频嵌入依赖相应脚本或网络服务，使用自己的 CDN 或本地资源时修改 `theme.cdn`。

English: all 41 source shortcodes have named MDX counterparts. The live showcase includes every component. Use JSX props for raw diagram text and structured data; ordinary Markdown stays free of Hugo parsing. Component mappings are tested separately from live third-party APIs.
