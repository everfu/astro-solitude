# Troubleshooting

[Documentation](README.md) · [Deployment](deployment.md)

## Does creating a template copy publish my website?

No. It creates your source repository. Connect a hosting platform or deploy `dist/`. The included workflow checks the project without deploying it.

## Why are comments and music missing?

They are disabled by default. Configure your own services, enable the relevant features, and add navigation entries; see [Integrations](integrations.md). Setting `comment: true` on a post alone does not enable a global provider.

## Why are drafts visible locally but absent after deployment?

Development includes `draft: true` content. Production excludes it. By contrast, `home: false` only hides a post from homepage areas; search and direct access remain available.

## Why do images or styles break under a subdirectory?

Check the final `site` URL and a `base` such as `/my-blog/`. Avoid adding the prefix twice. Store static images under `public/` and omit `public` in references. Raw HTML, CSS, and custom scripts also need correct paths.

## Why are components shown as text or failing to build?

Use `.mdx`. JSX booleans use `{true}` and objects use `{{...}}`. Separate complex Markdown inside components with blank lines. Do not paste Hugo shortcodes directly into Astro posts; see [Components](components.md).

## Why does changing locale leave some text unchanged?

`locale` controls built-in interface text. Translate your posts, navigation labels, and page JSON separately.

## What do Duplicate route and Missing page data mean?

A duplicate route means that content, an alias, or a system page shares a path; review `slug`, `url`, and `aliases`. Missing page data means the JSON named by a page's `data` field does not exist in `src/data/`; omit the `.json` extension from the field.

## Why do charts, repository cards, or online resources fail to load?

Check browser requests, feature flags, and `theme.cdn`. Third-party resources need a working network. A successful static build does not guarantee external API availability. Repository cards retain their links and show an error state when loading fails.

## How do I update the theme?

Template copies do not synchronize automatically, and this theme is not installed as an npm theme package. Commit your content and configuration first. Compare upstream changes on a separate branch, then integrate the required theme and dependency changes. Preserve your content, data, and configuration; check and preview before publishing. Template and upstream histories are independent, so avoid blindly forcing a merge of unrelated histories.

## How do I report an issue?

Open an [issue](https://github.com/everfu/astro-solitude/issues) with reproduction steps, Node/pnpm versions, relevant configuration, browser information, and error logs. Do not include server credentials. See [Development and validation](parity.md) for contribution checks.
