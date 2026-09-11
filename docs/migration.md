# Import from Hugo

[Documentation](README.md) · [Writing](writing.md)

The importer targets Hugo Solitude configuration and content. Hugo is not required for normal template use. Your source directory must contain `hugo.yaml`; custom templates and build pipelines need separate migration.

## 1. Preview the changes

Run from the Astro repository root and replace the path:

```sh
pnpm migrate:hugo --source /path/to/hugo --dry-run
```

The preview reads configuration, content, and assets, then reports the expected file count and issues without modifying the source. Resolve reported issues such as unknown shortcodes, missing post dates, or custom templates first.

## 2. Export

```sh
pnpm migrate:hugo --source /path/to/hugo --out /path/to/export
```

Output must be separate from the source and its parent directory must exist. Prefer a fresh output directory. The importer refuses conflicting files, symbolic links, and unresolved issues. Do not use your active Astro project as the export directory.

## 3. Merge into the template

| Source | Exported location |
| --- | --- |
| `hugo.yaml` | `src/site.config.ts` |
| `content/` | `src/content/posts/`, `src/content/pages/` |
| Media alongside content | `public/hugo-content/`, with recognized references rewritten |
| `data/*.yaml`, JSON | `src/data/*.json` |
| `static/` | `public/` |
| `assets/css/custom.css` | `src/styles/custom.css` |

The export is not a complete Astro project. Review `migration-report.json`, then merge the exported files into a template copy and resolve collisions with sample content.

Hugo shortcodes become matching MDX components; regular posts remain Markdown. Explicit source URLs take precedence, and recognized permalink patterns and `.html` URLs are preserved. Complex template expressions, unknown parameters, and custom asset pipelines are reported for manual migration.

## 4. Validate

```sh
pnpm check
pnpm build
pnpm preview
```

Check old URLs, images, categories, series, components, formulas, and redirects. Configure third-party services again. Mapping tests and the component showcase cannot replace a review of your actual content.
