# MDX components

[Documentation](README.md) · [Writing](writing.md) · [Parameter index](component-inventory.md)

The theme provides 41 content components. Examples below are also included in the buildable [component showcase](../src/content/posts/components.mdx), available at `/p/components/` after starting the site.

Use components directly in `.mdx` files under `src/content/posts/` or `src/content/pages/`; the theme injects them automatically. Other Astro layouts can import them from `src/components/mdx/index.ts`. Write booleans as `{true}` / `{false}` and objects as JSX expressions. Separate complex Markdown inside components with blank lines.

Examples use bundled media. Replace sample images, videos, and repository names for your own content. Children are the content between opening and closing tags. Hidden-content components only change presentation; they do not protect private information.

## Choose a component

| Purpose | Components |
| --- | --- |
| Callouts and text | Note, Subnote, Bubble, Label, Text, Paragraph, Keyboard, Spoiler |
| Disclosure and grouping | Fold, HideBlock, HideInline, HideToggle, Tabs, Tab |
| Images and media | Image, InlineImage, Gallery, GalleryItem, GalleryGroup, Audio, Video, Videos, BVideo, YouTube |
| Links and collections | Button, Link, Card, Flink, Series, Timeline, Timenode |
| Repository cards | GitHub, GitLab, Gitee, Gitea |
| Charts and displays | ChartJS, Mermaid, Score, Typeit, Checkbox, Radio |

Embedded video, repository cards, and chart libraries can make external requests. Regular posts do not depend on those services. Library URLs are configured through `theme.cdn`.

## Audio

Play audio. Set `src` or `url` to the file, and `name` to its accessible label.

```mdx
<Audio src="/media/shortcodes/t-rex-roar.mp3" name="Sample audio" />
```

## Bubble

Add a tooltip. `notation` is the explanation, `color` selects a style, and children provide the trigger text.

```mdx
<Bubble notation="A little more context">Hover for a note</Bubble>
```

## Button

Link to a destination with `url`, `text`, and an optional Font Awesome `icon`. `option` adds style classes.

```mdx
<Button url="/archives/" text="Read the posts" icon="fas fa-book" />
```

## BVideo

Embed Bilibili using a `bvid` (or `id`). The browser loads a third-party player.

```mdx
<BVideo bvid="BV1GJ411x7h7" />
```

## Card

Introduce a project with `title` (or `name`), `desc`, `cover` (or `bg`), and `url`. Optional fields include `tag`, `star`, `icon`, and CSS `width` and `height`.

```mdx
<Card title="Project card" desc="A space to introduce your project." cover="/img/demo/cover-getting-started-v2.webp" url="/about/" tag="Theme" star={5} />
```

## ChartJS

Render a chart with a Chart.js `config` object or a JSON `code` string. Optional: `id`, `description`, percentage `width`, and `layout`. Requires `theme.chart`.

```mdx
<ChartJS config={{type:"bar",data:{labels:["Posts","Notes","Projects"],datasets:[{label:"Content",data:[12,8,4]}]}}} description="Local sample data" />
```

## Checkbox

Show task status. `checked` is a boolean, defaulting to true; `style` adds classes and `label` sets an accessible name. This is a disabled display control, not form input.

```mdx
<Checkbox checked={true}>Completed task</Checkbox>
```

## Flink

Embed link groups. `groups` contains `class_name`, `class_desc`, and `link_list`; link fields match the friends dataset.

```mdx
<Flink groups={[{class_name:"Official resources",link_list:[{name:"Astro",link:"https://astro.build/",avatar:"/img/logo.png",descr:"Static site framework"}]}]} />
```

## Fold

Create a native disclosure panel with `title`. Set `open={true}` to start expanded; the default is closed.

```mdx
<Fold title="Expand this section">A note inside the fold.</Fold>
```

## Gallery

Arrange images in a grid with `columns`. Place `GalleryItem` components inside.

```mdx
<Gallery columns={2}>
<GalleryItem src="/img/demo/cover-getting-started-v2.webp" alt="Create" />
<GalleryItem src="/img/demo/cover-pagination-v2.webp" alt="Collect" />
</Gallery>
```

## GalleryGroup

Create a gallery entry with `title` (or `name`), cover `img`, and destination `url`. Children provide the description.

```mdx
<GalleryGroup title="Explore the gallery" img="/img/demo/cover-shortcodes-v2.webp" url="/about/">A collection of moments.</GalleryGroup>
```

## GalleryItem

Display a gallery image with `src` and `alt`, usually inside `Gallery`.

```mdx
<GalleryItem src="/img/demo/cover-getting-started-v2.webp" alt="Gallery image" />
```

## Gitea

Show a Gitea repository using `host` (or `server`) and `repo` in owner/repository format. The server must allow browser requests.

```mdx
<Gitea host="https://codeberg.org" repo="forgejo/forgejo" />
```

## Gitee

Show a Gitee repository. Set `repo` to owner/repository. Data is fetched from the public API in the browser.

```mdx
<Gitee repo="mirrors/vue" />
```

## GitHub

Show a GitHub repository. Set `repo` to owner/repository. Data is fetched from the public API in the browser.

```mdx
<GitHub repo="withastro/astro" />
```

## GitLab

Show a GitLab project. Set `repo` to namespace/project. The built-in provider targets gitlab.com.

```mdx
<GitLab repo="gitlab-org/gitlab" />
```

## HideBlock

Reveal a block on click. Set `text` or `title` for the button; children contain the hidden content. Optionally set an `id`.

```mdx
<HideBlock text="Reveal content">Hidden block content.</HideBlock>
```

## HideInline

Reveal inline content on click. Set `text` or `title` for the button and put the content inside.

```mdx
<HideInline text="Reveal">Hidden inline content</HideInline>
```

## HideToggle

Toggle content visibility. Set `title` or `text` for the button; children contain the hidden content.

```mdx
<HideToggle title="Toggle content">Open and close this content.</HideToggle>
```

## Image

Display an image with `src` and `alt`. Optional `caption` adds a figure caption and `style` sets image CSS.

```mdx
<Image src="/img/demo/cover-shortcodes-v2.webp" alt="Solitude component example" caption="Bundled sample image" />
```

## InlineImage

Display a small inline image using `src`, `alt`, and a CSS `height` such as `32px`.

```mdx
<InlineImage src="/img/logo.png" alt="Solitude" height="32px" />
```

## Keyboard

Label a key combination using children or `text`.

```mdx
<Keyboard>⌘ K</Keyboard>
```

## Label

Highlight a label using children or `text`; `color` selects the style.

```mdx
<Label color="green">Complete</Label>
```

## Link

Show a link summary. Use `url` (or `link`), `title`, and `desc` (or `subtitle`).

```mdx
<Link title="Astro" desc="Astro website" url="https://astro.build/" />
```

## Mermaid

Render a diagram from Mermaid text in `code`. Requires `theme.mermaid` and its browser script.

```mdx
<Mermaid code={"graph LR\nA[Content] --> B[Astro] --> C[HTML]"} />
```

## Note

Add a callout. `type` can be `info`, `success`, `warning`, or `danger`; `style` defaults to `flat`.

```mdx
<Note type="info">A callout with **Markdown** support.</Note>
```

## Paragraph

Style a paragraph. `color` selects a style class; children provide its content.

```mdx
<Paragraph color="blue">A paragraph with a splash of color.</Paragraph>
```

## Radio

Show a selection state. `checked` defaults to true; `style` adds classes and `label` sets an accessible name. This is a disabled display control.

```mdx
<Radio checked={false}>An option</Radio>
```

## Score

Render ABC music notation from `score`. `params` accepts an ABCJS rendering options object.

```mdx
<Score score={"X:1\nT:Simple tune\nM:4/4\nL:1/4\nK:C\nC D E F | G A B c |"} />
```

## Series

List posts in a series using `name`. If omitted, the component tries the current post’s first series. Posts are ordered from oldest to newest.

```mdx
<Series name="Theme essentials" />
```

## Text

Style inline text. `color` selects a class; children provide the text.

```mdx
<Text color="red">Something worth highlighting.</Text>
```

## Spoiler

Hide spoiler text until hover or focus. Children provide the content; `style` defaults to `block`.

```mdx
<Spoiler>A little spoiler</Spoiler>
```

## Subnote

Add a supplementary callout. `type` and `style` work like `Note`.

```mdx
<Subnote type="success">An additional note.</Subnote>
```

## Tab

Create a panel inside `Tabs`. Set its `title` and optional `icon`.

```mdx
<Tabs><Tab title="A single panel">Place Tab inside Tabs.</Tab></Tabs>
```

## Tabs

Group `Tab` children. An optional `id` must be unique on the page.

```mdx
<Tabs id="demo-tabs">
<Tab title="Markdown">Text and lists.</Tab>
<Tab title="MDX">Components and interactions.</Tab>
</Tabs>
```

## Timeline

Create a timeline with `title`, `color`, and nested `Timenode` children.

```mdx
<Timeline title="A theme journey" color="blue">
<Timenode time="Step one" title="Create a site">Start from the template.</Timenode>
<Timenode time="Step two" title="Start writing">Publish your first post.</Timenode>
</Timeline>
```

## Timenode

Add a timeline entry with `time`, `title`, and body content. Place it inside `Timeline`.

```mdx
<Timeline><Timenode time="Now" title="Keep creating">Keep the moments worth sharing.</Timenode></Timeline>
```

## Typeit

Animate typed text. `speed` defaults to 80; children provide the text. Animation requires `theme.typeit`.

```mdx
<Typeit speed={80}>Capture everyday life in words.</Typeit>
```

## Video

Play a video with `src` (or `url`) and optional `poster`, using the native browser player.

```mdx
<Video src="/media/shortcodes/flower.mp4" poster="/img/demo/cover-shortcodes-v2.webp" />
```

## Videos

Display a video grid. `sources` is an array of media paths; `col` defaults to 2.

```mdx
<Videos col={2} sources={["/media/shortcodes/flower.mp4"]} />
```

## YouTube

Embed a YouTube video by `id`. The default uses the nocookie domain; set `privacy={false}` for the regular domain.

```mdx
<YouTube id="aqz-KE-bpKQ" />
```
