# Astro Solitude documentation

Start with a template. Make it your own blog.

[Create your blog](https://github.com/everfu/astro-solitude/generate) · [Project overview](../README.md) · [简体中文介绍](../README.zh-CN.md)

## Start here

| What would you like to do? | Guide |
| --- | --- |
| Create a repository, preview the theme, replace sample content | [Getting started](getting-started.md) |
| Change your site identity, navigation, colors, and homepage | [Configuration](configuration.md) |
| Publish posts, organize categories, customize URLs | [Writing](writing.md) |
| Edit About, friends, equipment, and short updates | [Pages](pages.md) |
| Add callouts, galleries, tabs, diagrams, and media | [MDX components](components.md) |
| Publish your blog on your own domain | [Deployment](deployment.md) |

## Go further

- [Integrations](integrations.md): comments, recent discussions, comment walls, music, and search.
- [Hugo import](migration.md): preview changes before exporting to a separate directory.
- [Troubleshooting](faq.md): paths, drafts, resources, and theme updates.
- [Configuration reference](configuration-inventory.md): generated base defaults.
- [Component parameter index](component-inventory.md): local component mappings and parameter summaries.
- [Development and validation](parity.md): checks, test coverage, and screenshots.

## Conventions

File paths are relative to the repository root. Run commands there. Merge configuration snippets into your existing `defineSolitudeConfig({...})` call; do not add a second default export. Except for complete examples in Getting started, snippets show only the fields being changed.

Base defaults come from `src/lib/defaults.json` and `src/lib/config.ts`. The template overrides selected appearance and interaction settings in `src/site.config.ts`. Comments and online music are disabled by default; local search works without an account.
