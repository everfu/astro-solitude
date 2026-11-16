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
- Follow the surrounding code style and verify affected behavior when fixing defects.
- For visible changes, review desktop and mobile layouts, light and dark modes, and keyboard interaction.
- Keep interface translation keys consistent across `src/i18n/` when adding or changing translatable UI text.
- Update the relevant documentation when changing configuration, components, or user-facing behavior. If generated reference files change, run `pnpm docs:generate` and review the result.
- Never include credentials, private service identifiers, or personal data in changes, logs, or screenshots.

## Validate your change

The core CI checks are:

```sh
pnpm docs:check
pnpm assets:check
pnpm check
pnpm build
```

Use the production preview after building to review layout, interaction, routing, or integration changes.

```sh
pnpm preview
```

Check affected pages at desktop and mobile sizes, in both themes, and with keyboard navigation. Verify configured third-party services with your own account and site.

For documentation-only changes, check the affected links and run `pnpm docs:check`. State which checks you ran and explain anything skipped. The full CI workflow is in [check.yml](.github/workflows/check.yml). See the [development and validation guide](docs/parity.md) for check details.

## Submit a pull request

Target `main` and complete the pull request template. Explain the problem, the resulting behavior, and how you verified it. Link the related issue, include screenshots for visible changes, and mention configuration changes or migration steps when applicable.

Keep commits clear and reviewable, and respond to review feedback. Contributions are made under the project's existing [Apache-2.0 license](LICENSE).

## Shared brand assets

Astro is the source of the shared Astro, Hexo, and Hugo static assets. Follow
[the asset synchronization guide](docs/shared-assets.md) when changing these files.
Run `pnpm assets:check` to validate this checkout without the sibling repositories.
