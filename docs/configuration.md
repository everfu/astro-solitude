# Configuration

[Documentation](README.md) · [Writing](writing.md) · [Full reference](configuration-inventory.md)

Configure the theme through `defineSolitudeConfig` in [src/site.config.ts](../src/site.config.ts). Objects merge recursively; arrays replace the entire default array. Omitted fields use base defaults. You normally do not need to edit `src/lib/defaults.json`.

## Site identity

| Field | Base default | Purpose |
| --- | --- | --- |
| `site` | `https://example.org` | Absolute HTTP(S) site URL for canonical links, RSS, and Sitemap |
| `base` | `/` | Deployment prefix; must start and end with `/` |
| `title` / `description` | Solitude / a short English description | Site title and description |
| `author` | `{ name: 'Solitude' }` | Author name and optional `email` |
| `locale` | `en` | `zh-CN`, `zh-TW`, `en`, or `es` |
| `timeZone` | `UTC` | Time zone for displayed dates |
| `hasCJKLanguage` | `false` | Use CJK-aware word counting for Chinese and related writing systems |
| `pagination` | `10` | Homepage posts per page; positive integer |
| `menus` | `[]` | Navigation array |

`locale` changes built-in interface text. Translate posts, custom navigation labels, and page data separately.

## Base defaults and template settings

| Feature | Base default | Template setting |
| --- | --- | --- |
| Homepage recommendations | Fill up to five slots from posts by date | Shows the sample posts |
| Navigation, author links, footer | Empty arrays or objects | Article, page, and project links |
| Sidebar | Author card, site statistics, recent posts on inner pages | Same grouping with a sample author card |
| Cover color sampling | Disabled | Enabled in `local` mode |
| Short updates | Disabled | Enabled |
| Keyboard shortcuts | Disabled | Theme, search, and shortcut help enabled |
| Local search | Enabled, loaded on demand | Enabled and preloaded |
| PWA manifest | Disabled | Enabled; this does not provide offline caching |
| Comments and aggregation | Disabled, empty service identifiers | Disabled |
| Music hall and capsule | Disabled, empty playlist | Disabled |

The [full reference](configuration-inventory.md) lists base defaults, not the merged template configuration. Inspect `src/site.config.ts` for the template's locale and all overrides.

## Navigation and links

```ts
menus: [
  { name: 'Articles', url: '/archives/', icon: 'fas fa-folder-closed' },
  { name: 'Explore', children: [
    { name: 'About', url: '/about/' },
    { name: 'Friends', url: '/links/' },
  ] },
],
```

Use theme paths starting with `/` for internal links; the theme applies `base`. Use absolute URLs for external links. Icons use bundled Font Awesome classes. Replacing `menus` replaces the whole array.

## Appearance and homepage

```ts
theme: {
  theme_color: { light: '#425aef', dark: '#ffc848' },
  display_mode: { type: 'auto' },
  font: { font_size: '16px', code_font_size: '14px' },
  hometop: {
    enable: true,
    recommendList: [{
      title: 'Start here', url: '/p/getting-started/',
      cover: '/img/demo/cover-getting-started-v2.webp', label: 'Guide',
    }],
  },
  index_post_list: { direction: 'column', column: 2, cover: 'both' },
  post: { covercolor: { enable: true, mode: 'local' } },
},
```

`display_mode.type` accepts `auto`, `light`, or `dark`; a saved visitor preference can override it. Put additional styles in [custom.css](../src/styles/custom.css).

The homepage feed sorts by sticky weight and date. Recommendations use `recommendList` first, then fill up to five slots from posts by date. Set an item's `enable: false` to hide it. `hometop.banner` and `hometop.group` are retained compatibility fields; the current recommendation carousel does not render their content. Posts with `home: false` are excluded from homepage areas.

## Sidebar and footer

Configure the sidebar separately for `theme.aside.home`, `post`, and `page`. The `noSticky` and case-sensitive `Sticky` strings contain comma-separated module names: `about`, `newestPost`, `newest_comment`, and `allInfo`. Recent comments also require a comment service; see [Integrations](integrations.md).

```ts
theme: {
  aside: {
    home: { noSticky: 'about', Sticky: 'allInfo' },
    post: { noSticky: 'about', Sticky: 'newestPost,allInfo' },
    my_card: {
      author: { img: '/img/logo.png' },
      description: 'Notes from everyday life.',
      content: 'Welcome to my blog.',
    },
  },
  footer: {
    information: { right: [{ name: 'RSS', url: '/index.xml' }] },
  },
},
```

## Front matter

See [Writing](writing.md) for post and page fields, defaults, and URL precedence. See [Pages](pages.md) for structured About, friends, and equipment data.

## Services and resources

Minimal configurations for comments, music, Algolia, and DocSearch are in [Integrations](integrations.md). Use `theme.cdn` to replace browser dependency URLs while preserving the expected library interfaces. Configuration sent to the browser is public; never put server administration credentials in it.
