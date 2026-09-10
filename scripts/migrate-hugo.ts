import fs from 'node:fs/promises';
import path from 'node:path';
import { parse, stringify } from 'yaml';
import { parseArgs } from 'node:util';
import { pathToFileURL } from 'node:url';
import {
  convertConfig,
  convertDocument,
  frontmatter,
  type Issue,
} from './hugo-converter';
export interface MigrationPlan {
  files: Map<string, string | Buffer>;
  issues: Issue[];
}
async function walk(root: string): Promise<string[]> {
  let entries;
  try {
    entries = await fs.readdir(root, { withFileTypes: true });
  } catch (e: any) {
    if (e.code === 'ENOENT') return [];
    throw e;
  }
  const paths: string[] = [];
  for (const e of entries) {
    if (e.isSymbolicLink())
      throw new Error(
        `Symlinks require manual review: ${path.join(root, e.name)}`,
      );
    if (e.isDirectory())
      paths.push(
        ...(await walk(path.join(root, e.name))).map((p) =>
          path.join(e.name, p),
        ),
      );
    else paths.push(e.name);
  }
  return paths;
}
export async function planMigration(source: string): Promise<MigrationPlan> {
  const files = new Map<string, string | Buffer>();
  const issues: Issue[] = [];
  const configFile = path.join(source, 'hugo.yaml');
  const old = parse(await fs.readFile(configFile, 'utf8'));
  const convertedConfig = convertConfig(old);
  issues.push(...convertedConfig.issues);
  files.set(
    'src/site.config.ts',
    `import { defineSolitudeConfig } from './lib/config';\n\nexport default defineSolitudeConfig(${JSON.stringify(convertedConfig.config, null, 2)});\n`,
  );
  const add = (name: string, content: string | Buffer) => {
    if (files.has(name)) throw new Error(`Duplicate output: ${name}`);
    files.set(name, content);
  };
  const contentFiles = await walk(path.join(source, 'content'));
  const mediaFiles = new Set(
    contentFiles.filter((file) =>
      /\.(png|jpe?g|gif|svg|avif|webp|ico|mp3|wav|ogg|m4a|mp4|webm|pdf|woff2?)$/i.test(
        file,
      ),
    ),
  );
  for (const file of contentFiles) {
    if (!/\.md$/i.test(file)) {
      if (mediaFiles.has(file))
        add(
          `public/hugo-content/${file}`,
          await fs.readFile(path.join(source, 'content', file)),
        );
      else
        issues.push({
          file,
          line: 1,
          message: 'Non-Markdown content requires manual migration',
        });
      continue;
    }

    const resolveMedia = (value: string) => {
      const resource = path.posix.normalize(
        path.posix.join(path.posix.dirname(file), value),
      );
      return mediaFiles.has(resource) ? `/hugo-content/${resource}` : value;
    };
    let input = await fs.readFile(path.join(source, 'content', file), 'utf8');
    input = input
      .replace(
        /(\]\()([^\s)]+)(\))/g,
        (_, start, value, end) => start + resolveMedia(value) + end,
      )
      .replace(
        /((?:src|url|img|poster|cover)=")([^"]+)(")/g,
        (_, start, value, end) => start + resolveMedia(value) + end,
      );
    const fm = frontmatter(input);
    const isPost = file.startsWith('posts/');
    const index = path.basename(file) === '_index.md';
    const autoIndex = [
      '_index.md',
      'posts/_index.md',
      'categories/_index.md',
      'tags/_index.md',
      'series/_index.md',
    ];
    if (autoIndex.includes(file)) {
      if (fm.body.trim())
        issues.push({
          file,
          line: 1,
          message: 'Taxonomy/home index body requires manual migration',
        });
      continue;
    }
    const result = convertDocument(input, file);
    issues.push(...result.issues);
    const parsed = frontmatter(result.text);
    const relative = (isPost ? file.slice(6) : file)
      .replace(/(?:\/)?_index\.md$/, '')
      .replace(/\.md$/, '')
      .replace(/\/index$/, '');
    if (typeof parsed.data.cover === 'string')
      parsed.data.cover = resolveMedia(parsed.data.cover);
    const slug = parsed.data.slug ?? relative;
    if (!parsed.data.url) {
      if (isPost) {
        const format = old.permalinks?.posts ?? '/posts/:slug/';
        if (!/^\/[^:]*:(slug|filename)(\/|\.html)?$/.test(format))
          issues.push({
            file,
            line: 1,
            message: `Unsupported permalink pattern: ${format}`,
          });
        else {
          const route = format.replace(/:(slug|filename)/, slug);
          parsed.data.url =
            old.uglyURLs === true || old.uglyURLs?.posts
              ? route.replace(/\/$/, '').replace(/\.html$/, '') + '.html'
              : route;
        }
      } else parsed.data.url = `/${relative}/`;
    }
    if (index && !parsed.data.type)
      parsed.data.type =
        (
          { equipment: 'kit', recentcomments: 'recentcomment' } as Record<
            string,
            string
          >
        )[relative] ?? relative;
    if (isPost && !parsed.data.date)
      issues.push({ file, line: 1, message: 'Post date is required' });
    add(
      `src/content/${isPost ? 'posts' : 'pages'}/${relative}.${result.mdx ? 'mdx' : 'md'}`,
      `---\n${stringify(parsed.data)}---\n${parsed.body}`,
    );
  }
  for (const file of await walk(path.join(source, 'data'))) {
    if (/\.ya?ml$/.test(file))
      add(
        `src/data/${file.replace(/\.ya?ml$/, '.json')}`,
        JSON.stringify(
          parse(await fs.readFile(path.join(source, 'data', file), 'utf8')),
          null,
          2,
        ) + '\n',
      );
    else if (file.endsWith('.json'))
      add(
        `src/data/${file}`,
        await fs.readFile(path.join(source, 'data', file)),
      );
    else
      issues.push({
        file: `data/${file}`,
        line: 1,
        message: 'Unsupported data format',
      });
  }
  for (const file of await walk(path.join(source, 'static')))
    add(`public/${file}`, await fs.readFile(path.join(source, 'static', file)));
  for (const file of await walk(path.join(source, 'layouts')))
    issues.push({
      file: `layouts/${file}`,
      line: 1,
      message: 'Custom Hugo template requires an Astro component',
    });
  const custom = path.join(source, 'assets/css/custom.css');
  try {
    add('src/styles/custom.css', await fs.readFile(custom));
  } catch (e: any) {
    if (e.code !== 'ENOENT') throw e;
  }
  for (const file of await walk(path.join(source, 'assets')))
    if (file !== 'css/custom.css')
      issues.push({
        file: `assets/${file}`,
        line: 1,
        message:
          'Custom asset or build pipeline requires manual migration; use static/ for copied files',
      });
  return { files, issues };
}
export async function writeMigration(
  plan: MigrationPlan,
  source: string,
  out: string,
) {
  const root = await fs.realpath(source);
  const target = path.resolve(out);
  const nearest = await fs.realpath(path.dirname(target));
  const resolvedTarget = path.join(nearest, path.basename(target));
  if (
    resolvedTarget === root ||
    resolvedTarget.startsWith(root + path.sep) ||
    root.startsWith(resolvedTarget + path.sep)
  )
    throw new Error('Output must be separate from source');
  try {
    const stat = await fs.lstat(target);
    if (stat.isSymbolicLink()) throw new Error('Output may not be a symlink');
  } catch (e: any) {
    if (e.code !== 'ENOENT') throw e;
  }
  const outputNames = [...plan.files.keys(), 'migration-report.json'];
  for (const name of outputNames) {
    const dest = path.join(target, name);
    let parent = path.dirname(dest);
    while (parent.startsWith(target)) {
      try {
        if ((await fs.lstat(parent)).isSymbolicLink())
          throw new Error(`Output contains a symlink: ${parent}`);
      } catch (e: any) {
        if (e.code !== 'ENOENT') throw e;
      }
      if (parent === target) break;
      parent = path.dirname(parent);
    }
    try {
      await fs.lstat(dest);
      throw new Error(`Output conflict: ${name}`);
    } catch (e: any) {
      if (e.code !== 'ENOENT') throw e;
    }
  }
  // Nothing is written until every target has passed the conflict check.
  for (const [name, content] of plan.files) {
    const dest = path.join(target, name);
    await fs.mkdir(path.dirname(dest), { recursive: true });
    await fs.writeFile(dest, content, { flag: 'wx' });
  }
  await fs.mkdir(target, { recursive: true });
  await fs.writeFile(
    path.join(target, 'migration-report.json'),
    JSON.stringify(
      { files: [...plan.files.keys()], issues: plan.issues },
      null,
      2,
    ) + '\n',
    { flag: 'wx' },
  );
}
async function main() {
  const { values } = parseArgs({
    options: {
      source: { type: 'string' },
      out: { type: 'string' },
      'dry-run': { type: 'boolean', default: false },
    },
    strict: true,
  });
  if (!values.source)
    throw new Error(
      'Usage: pnpm migrate:hugo --source /path/to/hugo --dry-run | --out /path/to/export',
    );
  const source = path.resolve(values.source);
  const plan = await planMigration(source);
  console.log(
    JSON.stringify({ files: plan.files.size, issues: plan.issues }, null, 2),
  );
  if (values['dry-run']) return;
  if (!values.out) throw new Error('--out is required when writing');
  if (plan.issues.length)
    throw new Error(
      'Resolve the migration report before writing; source has not been changed',
    );
  await writeMigration(plan, source, values.out);
  console.log(
    `Exported ${plan.files.size} files to ${path.resolve(values.out)}`,
  );
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
