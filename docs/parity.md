# Development and validation

[Documentation](README.md) · [Project overview](../README.md)

## Local checks

```sh
pnpm install --frozen-lockfile
pnpm docs:check
pnpm assets:check
pnpm check
pnpm build
```

Run `pnpm docs:generate` after changing configuration defaults or component mappings. It updates the configuration reference and component parameter index. `docs:check` verifies local links, heading anchors, and generated reference freshness. `assets:check` verifies this checkout against the shared asset manifest.

## Review changes

After building, run `pnpm preview` and review the affected pages. Check desktop and mobile layouts, both themes, keyboard navigation, and relevant interactions. Verify configured third-party services with your own account and site.

## Project structure

| Location | Responsibility |
| --- | --- |
| Root site configuration | `site.config.ts` supplies the domain, navigation, and theme options. |
| `src/config/` | Configuration factory, types, defaults, and shortcode metadata. |
| `src/integrations/` | Markdown processing and static-output layout hooks. |
| `src/lib/` | Content access, routing, feeds, and site context. |
| `src/types/` | Shared content, page-data, and serialized runtime contracts. |
| `src/components/` | Layout, navigation, post, integration, page, route-view, and MDX components. |
| `src/layouts/` | Document shell and dispatch to route views with explicit props. |
| `src/scripts/` | Browser entry, application setup, core services, features, and browser types. |
| `scripts/` | Asset synchronization, documentation maintenance, and Hugo migration commands. |

Application imports use `@/` for files under `src/`. Root configuration and command-line tools use relative imports. Content and page data are authored under `src/content/` and `src/data/`.

## Modernization architecture

Astro 7.3.2 retains static output, MDX and ClientRouter. Tailwind CSS 4.3.3 is connected through the [official Vite plugin](https://tailwindcss.com/docs/installation/framework-guides/astro). Utilities use the `tw:` prefix; Preflight is disabled. `src/styles/tailwind.css` maps the existing design tokens, and the `dark` variant follows `data-theme`. Keep semantic classes and DOM IDs because scripts and user CSS depend on them.

The declared CSS layers place utility defaults before layout, component and page overrides. Markdown typography, animation, integrations and complex responsive selectors remain native CSS. About and Brevity styles load only on their page types. A shared layer declaration in the document head preserves cascade order across client navigation. Third-party comment and music overrides stay unlayered; `custom.css` remains the final customization entry. Escape literal underscores in Tailwind arbitrary selectors (`\_`), since unescaped underscores represent spaces.

`pnpm check` runs two independent checks. `check:scripts` uses TypeScript 7.0.2 (`@typescript/native`, the `tsc` executable) against source and development tools. `check:astro` uses the TypeScript 6.0.2 compatibility package aliased as `typescript`. This follows the [TypeScript compatibility-package approach](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/); do not replace the alias with TS7 until Astro supports its compiler API. The compatibility package is pinned to `@typescript/typescript6@6.0.2`; its bundled compiler reports `6.0.3` through `typescript.version`. Direct dependencies are pinned and CI installs the frozen lockfile.

The browser entry coordinates Astro navigation and prepares assets. `src/scripts/app/` separates action registration, optional-feature loading, page refresh, and one-time global events. `core/` provides the public `window.Solitude` facade, lifecycle, storage, resource loading, and utilities. Feature modules live under `features/`, with multi-file comments, search, music, post, and cover-color implementations grouped together.

`EntryPage` reads shared content and metadata, then dispatches to home, post, archive, taxonomy, page, and redirect views. Post navigation and recommendations are computed in the post view. MDX components are exported through `src/components/mdx/index.ts`.

Capture the page lifecycle signal before asynchronous work, check it after each import or request, and register page timers, listeners, and observers for cleanup. Global keyboard, copy, and visibility listeners are installed once. The music capsule has its own lifecycle. The synchronous theme bootstrap is authored in TypeScript and serialized after compilation so stored-theme selection runs before deferred browser modules.

## Continuous integration

GitHub Actions runs the local checks above on Node.js 22 and 24 for pushes to `main`, pull requests, and manual runs. See the [workflow](../.github/workflows/check.yml) for the full configuration.

## Source attribution

The project originated as an Astro migration of Hugo Solitude. [source-manifest.json](source-manifest.json) records the original source snapshot, commit, and file hashes. See [NOTICE](../NOTICE) and [LICENSE](../LICENSE) for attribution and modification details.
