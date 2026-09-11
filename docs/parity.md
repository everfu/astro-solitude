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

Existing feature work is retained in this release. Historical screenshots and comparison counts are not evidence for the current version. Current template screenshots are listed below.

## Release validation

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
