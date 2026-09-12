# Development and validation

[Documentation](README.md) · [Project overview](../README.md)

## Local checks

```sh
pnpm install --frozen-lockfile
pnpm docs:generate
pnpm docs:check
pnpm check
pnpm build
pnpm test
pnpm build:fixture
pnpm exec playwright install chromium
pnpm test:e2e
```

`docs:generate` updates only the configuration reference and component parameter index. It does not overwrite authored guides or require a Hugo source directory. `docs:check` verifies local links, heading anchors, and generated reference freshness; it does not crawl external links.

Output tests in `pnpm test` read `dist/`, so build first. Browser tests require the fixture builds; Playwright starts the preview servers.

## Modernization architecture

Astro 7.3.2 retains static output, MDX and ClientRouter. Tailwind CSS 4.3.3 is connected through the [official Vite plugin](https://tailwindcss.com/docs/installation/framework-guides/astro). Utilities use the `tw:` prefix; Preflight is disabled. `src/styles/tailwind.css` maps the existing design tokens, and the `dark` variant follows `data-theme`. Keep semantic classes and DOM IDs because scripts and user CSS depend on them.

The declared CSS layers place utility defaults before layout, component and page overrides. Markdown typography, animation, integrations and complex responsive selectors remain native CSS. About and Brevity styles load only on their page types. A shared layer declaration in the document head preserves cascade order across client navigation. Third-party comment and music overrides stay unlayered; `custom.css` remains the final customization entry. Escape literal underscores in Tailwind arbitrary selectors (`\_`), since unescaped underscores represent spaces.

`pnpm check` runs two independent checks: `check:scripts` uses TypeScript 7.0.2 (`@typescript/native`, the `tsc` executable) against source, tools and tests; `check:astro` uses the TypeScript 6.0.2 compatibility package aliased as `typescript`. This follows the [TypeScript compatibility-package approach](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/); do not replace the alias with TS7 until Astro supports its compiler API. The compatibility package is pinned to `@typescript/typescript6@6.0.2`; its bundled compiler reports `6.0.3` through `typescript.version`. Direct dependencies are pinned and CI installs the frozen lockfile.

Browser modules live in `src/scripts/features/`; `main.ts` assembles the public `window.Solitude` facade. Comments separate orchestration, provider mounting and Valine data/views. Capture the page lifecycle signal before asynchronous work, check it after each import/request, and register timers, listeners and observers for cleanup. The persistent music capsule has a separate lifetime from the music page. The synchronous theme bootstrap is authored in TypeScript and serialized after compilation, so selecting a stored theme still runs before deferred browser modules. Public configuration, event names and URLs remain compatible.

## Screenshot and resource comparison

Before editing, build and copy `dist/` to `artifacts/modernization/baseline-dist/`. The comparison starts isolated local servers for this baseline and the new `dist/` (or `SOLITUDE_CURRENT_DIST` when comparing a preserved build snapshot); run:

```sh
pnpm check:visual before
pnpm check:visual after
pnpm check:visual before --boundaries
pnpm check:visual after --boundaries
pnpm check:size
```

The comparison records 16 routes in both themes at 390, 768, 1280 and 1440 pixels. It fixes the visible date and random seed while keeping timestamp-generated diagram identifiers unique, waits for images and diagram rendering, normalizes typewriter text, and hides native audio/video buffering controls during captures. External services are stubbed and external images receive a fixed SVG fixture; local theme assets remain unchanged. The optional boundary run compares eight representative pages on both sides of every existing CSS width breakpoint. `artifacts/modernization/` contains full-page before/after images, pixel differences and compressed CSS/JavaScript response totals for the home and writing pages. `check:size` additionally measures all initial local resources at 1440px without forcing lazy images to load: text responses use gzip size and already-compressed images/fonts/media use their byte lengths. Run both phases with the same browser and machine; screenshots are environment-dependent. Never update the baseline to hide a layout regression. Pull-request CI builds the base revision and current revision with the same browser, checks pixel differences and rejects increases in compressed CSS or JavaScript on the homepage and writing page.

## Fixtures and coverage

| Fixture | Address | Coverage |
| --- | --- | --- |
| Default template | `http://127.0.0.1:4321` | Homepage, posts, routes, search, themes, responsive layout |
| Integrations | `http://127.0.0.1:4332` | Comment adapters, music, resource lifecycle |
| Algolia | `http://127.0.0.1:4333/sub/` | Subdirectory deployment and search adapter |
| DocSearch | `http://127.0.0.1:4334` | DocSearch and Spanish interface |
| Valine aggregation | `http://127.0.0.1:4335` | Recent comments, message wall, participant avatars, style restoration |
| Online music | `http://127.0.0.1:4336` | Qishui player, cover colors, mobile table-of-contents overlay |

Third-party services use mocked responses or local resources in tests. Fixture identifiers are not live accounts. Production defaults keep comments and online music disabled.

## Source attribution

The project originated as an Astro migration of Hugo Solitude. [source-manifest.json](source-manifest.json) preserves the original source snapshot, commit, and file hashes. See [NOTICE](../NOTICE) and [LICENSE](../LICENSE) for attribution and modification details. These hashes describe the migration source, not the current Astro files.

Existing feature work is retained in this release. Historical screenshots and comparison counts are not evidence for the current version. Previous release screenshots remain listed below for reference.

## Modernization validation

Validated on September 12, 2026 against baseline commit `69bbce2acf7b88d8774c5fbb00772860a850517a`. The machine-readable record is [modernization-results.json](modernization-results.json).

| Check | Observed result |
| --- | --- |
| Dual type checks | 178 files; 0 errors, 0 warnings, 3 hints |
| Unit tests | 22 passed |
| Browser tests | 52 passed, including cancellation of delayed translation after page cleanup |
| Production build | 37 pages; RSS, sitemap, aliases and subdirectory fixture checks passed |
| Visual comparison | 128 standard views + 384 breakpoint views; zero detected differences or new horizontal overflows |
| Documentation | Local links, anchors and generated references checked |

The component demonstration page already overflows horizontally at 1200px in both themes in the baseline; this migration preserves that layout. The mobile carousel test now selects a stable card identity while smooth scrolling changes the active class. Five comment adapters, search, persistent music, keyboard shortcuts, TOC, lightbox and repeated navigation use the local browser fixtures; external production services were not live-tested.

Initial resource bytes at a 1440px viewport, using gzip for text and original byte lengths for compressed images, fonts and media:

| Page / resource | Before | After | Reduction |
| --- | ---: | ---: | ---: |
| Home CSS | 82,766 | 81,811 | 1.2% |
| Home JavaScript | 45,108 | 40,706 | 9.8% |
| Home total | 1,083,460 | 1,079,203 | 0.4% |
| Writing CSS | 82,766 | 81,811 | 1.2% |
| Writing JavaScript | 46,223 | 39,715 | 14.1% |
| Writing total | 1,133,956 | 1,127,634 | 0.6% |

One sequential warm-cache wall-clock run measured `check` at 7.250s before and 8.487s after, and `build` at 1.910s before and 1.870s after. The baseline source was reconstructed with locally cached dependencies. The added independent TypeScript check broadens coverage; these single measurements do not establish a performance speedup. Live Core Web Vitals were not measured.

Comparison snapshots retain the original branding images to isolate the technical migration. Concurrent Logo/favicon and README edits were preserved, and the final build includes those external asset edits. To reproduce the migration-only measurements after rebuilding, set `SOLITUDE_CURRENT_DIST=artifacts/modernization/after-dist`. The original untracked `output/` was preserved. No commit, publication or deployment was performed; the updated CI workflow has not been run remotely.

## Previous release validation

Validated on September 11, 2026 with Node.js 24.16.0, pnpm 11.24.0, and Playwright Chromium on macOS:

| Check | Observed result |
| --- | --- |
| Fresh copy | Frozen-lockfile installation, development startup, and production build succeeded |
| Documentation | 174 local links and anchors checked across 15 documents; generated references current |
| Configuration examples | 10 TypeScript documentation snippets type-checked |
| Astro check | 155 files checked: 0 errors, 0 warnings, 4 hints |
| Production build | 37 pages generated |
| Unit tests | 21 passed |
| Browser tests | 51 passed |
| English defaults | Tested default pages use `lang="en"` and English visible text; local search finds English content |
| Optional services | No configured comment or online playlist requests in the default-template browser test |
| Screenshots | Five captures; no horizontal overflow or page errors recorded |

The browser suite uses production builds and isolated integration fixtures. It covers responsive layouts, light and dark modes, navigation, search, comments, music, and resource cleanup. The English comment-card date was allowed to shrink after a 320px overflow was found; the complete suite passed after that correction.

Screenshots and their dimensions are recorded in [visual-results.json](visual-results.json):

- [Desktop homepage](screenshots/home-desktop.png)
- [Dark homepage](screenshots/home-desktop-dark.png)
- [Mobile dark article](screenshots/post-mobile-dark.png)
- [Desktop About page](screenshots/about-desktop.png)
- [Tablet dark About page](screenshots/about-tablet-dark.png)

Production accounts, online music availability, Safari/Firefox, and user hosting platforms are not covered by mocked browser tests. GitHub Actions checks Node.js 22 and 24; the workflow does not deploy the website.
