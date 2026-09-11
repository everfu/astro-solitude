# Contributing to Astro Solitude

Bug fixes, documentation, translations, and focused improvements are welcome. You can write issues and pull requests in English or Chinese. Please follow our [Code of Conduct](CODE_OF_CONDUCT.md).

## Before you start

- Read the [documentation](docs/README.md) and [FAQ](docs/faq.md), then search existing issues and pull requests.
- Use the bug report form for defects and the feature request form for proposals. For substantial changes, discuss the approach in an issue before implementing it.
- Report vulnerabilities privately using the [security policy](SECURITY.md), rather than a public issue or pull request.

## Set up development

Fork the repository, clone your fork, and create a branch from the latest `main`.

Use Node.js **22.12.0 or later** and the pnpm version declared in [package.json](package.json). CI currently checks Node.js 22 and 24.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Open the local URL printed in the terminal. See [Getting started](docs/getting-started.md) for site configuration and content setup.

## Make a focused change

- Keep each pull request focused on one problem. Avoid unrelated formatting, sample-content changes, or dependency updates.
- Follow the surrounding code style and add regression coverage when fixing behavior.
- For visible changes, review desktop and mobile layouts, light and dark modes, and keyboard interaction.
- Keep interface translation keys consistent across `src/i18n/` when adding or changing translatable UI text.
- Update the relevant documentation when changing configuration, components, or user-facing behavior. If generated reference files change, run `pnpm docs:generate` and review the result.
- Never include credentials, private service identifiers, or personal data in changes, logs, or screenshots.

## Validate your change

The core CI checks are:

```sh
pnpm docs:check
pnpm check
pnpm build
pnpm test
```

Build before running tests: output tests inspect the generated site. For layout, interaction, routing, or integration changes, also run:

```sh
pnpm build:fixture
pnpm exec playwright install chromium
pnpm test:e2e
```

The browser suite uses the main production build and isolated fixture sites. Keep the ports configured in [playwright.config.ts](playwright.config.ts) available so an unrelated preview server is not reused. Mocked integration tests do not verify live third-party services.

For documentation-only changes, check the affected links and run `pnpm docs:check`. State which checks you ran and explain anything skipped. The full CI workflow is in [check.yml](.github/workflows/check.yml); see the [validation report](docs/parity.md) for coverage details.

## Submit a pull request

Target `main` and complete the pull request template. Explain the problem, the resulting behavior, and how you verified it. Link the related issue, include screenshots for visible changes, and mention configuration changes or migration steps when applicable.

Keep commits clear and reviewable, and respond to review feedback. Contributions are made under the project's existing [Apache-2.0 license](LICENSE).
