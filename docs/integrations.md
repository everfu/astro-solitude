# Integrations

[Documentation](README.md) · [Configuration reference](configuration-inventory.md)

The template enables local search without an account. Comments, comment aggregation, comment walls, music hall, and the music capsule are disabled. Merge the snippets below into the `theme` object in your site configuration and use your own service information. Browser configuration is public: only use identifiers intended for client-side use.

## Enable comments

Choose a provider and set both `comment.use` and its configuration. For example, Waline:

```ts
theme: {
  comment: { use: 'waline', lazyload: true },
  waline: { serverURL: 'https://comments.example.com' },
},
```

| `comment.use` | Required provider settings | Notes |
| --- | --- | --- |
| `twikoo` | `twikoo.envId` | Set `region` for your environment when needed |
| `waline` | `waline.serverURL` | Your own server |
| `valine` | `valine.appId`, `appKey`, `serverURLs` | Client App ID/key and service URL |
| `artalk` | `artalk.server`, `site` | Server URL and site name |
| `giscus` | `giscus.repo`, `repo_id`, `category_id` | Your repository's Discussions configuration |

Multiple providers can be comma-separated, but configure and verify one first. Set `comment: false` on individual posts to disable comments there. Some special layouts, including About, music, and archives, omit comments. Follow the provider's own documentation for server setup and allowed domains.

## Recent comments, counts, and comment walls

These features depend on a configured provider. The following complete Valine example uses placeholders you must replace:

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

Add `/message/` and `/recentcomments/` to your existing menus. `envelope` controls the message wall; `comment.commentBarrage` controls floating comments on posts. Cache durations are measured in days.

Recent comments, post participant avatars, and message aggregation currently use Valine's API. Mounting another provider's comment widget does not enable those aggregation features. Empty and failed responses display their own states.

## Online music

```ts
theme: {
  music: { enable: true, id: 'YOUR_PLAYLIST_ID', server: 'netease', type: 'playlist' },
  capsule: { enable: true, id: 'YOUR_PLAYLIST_ID', server: 'netease', type: 'playlist' },
},
```

Add `/music/` to navigation. `music` controls the music hall; `capsule` controls the player retained across navigation. Configure them separately. Your Meting API must support the selected `server`. The theme also handles Qishui music responses, subject to the chosen API's availability.

To use another API, set `theme.meting_api` and preserve placeholders such as `:server`, `:type`, and `:id`. The default API is listed in the reference; no playlist request is made while music is disabled. Availability, region restrictions, and playback rights depend on the service. Local `Audio` and `Video` components do not require online music to be enabled.

## Search

Local search needs no account and reads the generated `/search.xml`. The template preloads it; set `search.local.preload: false` for on-demand loading.

```ts
theme: {
  search: {
    enable: true, type: 'algolia',
    algolia: { appId: 'YOUR_APP_ID', apiKey: 'YOUR_SEARCH_ONLY_KEY', indexName: 'blog' },
  },
},
```

For DocSearch, set `search.type: 'docsearch'` and fill in `appId`, `apiKey`, and `indexName` under `search.docsearch`. Use public search keys.

The theme provides a search interface but does not create or synchronize your external index. Algolia records need `title` and either an absolute `permalink` or a `path` relative to the site root, plus `_highlightResult.title` in search responses. DocSearch uses its own crawler index structure.

## Verify your integration

Check loading, empty results, error messages, theme switching, and navigation with your own service. Repository tests use mocked responses and do not establish that your production account is configured correctly. Test identifiers are not production credentials.
