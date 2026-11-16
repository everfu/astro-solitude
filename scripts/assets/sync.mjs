import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const sourceDefault = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
);
const projects = ['astro', 'hexo', 'hugo'];
const digest = (bytes) => createHash('sha256').update(bytes).digest('hex');

function options(args) {
  const result = {
    mode: 'preview',
    project: 'all',
    source: sourceDefault,
    roots: {},
  };
  let modeSet = false;
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--help') return { help: true };
    if (['--check', '--write'].includes(arg)) {
      if (modeSet) throw new Error('Choose only one of --check and --write.');
      result.mode = arg.slice(2);
      modeSet = true;
    } else if (
      [
        '--source-root',
        '--project',
        '--astro-root',
        '--hexo-root',
        '--hugo-root',
      ].includes(arg)
    ) {
      const value = args[++i];
      if (!value || value.startsWith('--'))
        throw new Error(`Missing value for ${arg}.`);
      if (arg === '--project') result.project = value;
      else if (arg === '--source-root') result.source = path.resolve(value);
      else result.roots[arg.slice(2, -5)] = path.resolve(value);
    } else throw new Error(`Unknown option: ${arg}`);
  }
  if (![...projects, 'all'].includes(result.project))
    throw new Error('Project must be astro, hexo, hugo, or all.');
  const siblings = path.dirname(result.source);
  result.roots = {
    astro: result.source,
    hexo: path.join(siblings, 'hexo-theme-solitude'),
    hugo: path.join(siblings, 'solitude'),
    ...result.roots,
  };
  return result;
}

// Never follow a manifest path or an existing symlink outside a selected root.
async function within(root, relative) {
  if (
    typeof relative !== 'string' ||
    !relative ||
    path.isAbsolute(relative) ||
    relative.includes('\\') ||
    relative.split('/').some((p) => !p || p === '.' || p === '..')
  ) {
    throw new Error(`Unsafe manifest path: ${relative}`);
  }
  let current = root;
  for (const part of relative.split('/')) {
    current = path.join(current, part);
    try {
      if ((await fs.lstat(current)).isSymbolicLink())
        throw new Error(`Refusing symlink: ${current}`);
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  }
  return current;
}

async function readOptional(file) {
  try {
    return await fs.readFile(file);
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
}

async function writeFile(file, bytes) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, bytes);
}

export async function syncAssets(args = [], log = console.log) {
  const config = options(args);
  if (config.help) {
    log(
      'Usage: node scripts/assets/sync.mjs [--check | --write] [--project all|astro|hexo|hugo]\n  [--source-root PATH] [--astro-root PATH] [--hexo-root PATH] [--hugo-root PATH]\nDefault: preview only. Paths are relative to the current directory.',
    );
    return 0;
  }
  const source = await fs.realpath(config.source);
  const manifestBytes = await fs.readFile(
    await within(source, 'docs/shared-assets.json'),
  );
  const manifest = JSON.parse(manifestBytes);
  if (
    manifest.version !== 1 ||
    !Array.isArray(manifest.assets) ||
    !manifest.removals
  )
    throw new Error('Unsupported asset manifest.');
  const selected = config.project === 'all' ? projects : [config.project];
  const roots = {};
  for (const project of selected) {
    roots[project] = await fs.realpath(config.roots[project]);
    if (!(await fs.stat(roots[project])).isDirectory())
      throw new Error(`Not a directory: ${roots[project]}`);
  }
  if (new Set(Object.values(roots)).size !== selected.length)
    throw new Error('Project roots must be distinct.');
  const operations = [];
  const destinations = new Set();
  const reserve = (file) => {
    if (destinations.has(file))
      throw new Error(`Duplicate manifest target: ${file}`);
    destinations.add(file);
  };

  // Validate every source, destination and deletion before any write occurs.
  for (const asset of manifest.assets) {
    if (
      !/^[a-f0-9]{64}$/.test(asset.sha256) ||
      !asset.targets ||
      !Object.keys(asset.targets).length ||
      Object.keys(asset.targets).some((p) => !projects.includes(p))
    )
      throw new Error(`Invalid asset entry: ${asset.source}`);
    const bytes = await fs.readFile(await within(source, asset.source));
    if (digest(bytes) !== asset.sha256)
      throw new Error(
        `Source hash mismatch: ${asset.source}. Update its manifest SHA-256 before syncing.`,
      );
    for (const project of selected) {
      if (!asset.targets[project]) continue;
      const file = await within(roots[project], asset.targets[project]);
      reserve(file);
      const existing = await readOptional(file);
      if (!existing || !existing.equals(bytes))
        operations.push({
          project,
          file,
          bytes,
          action: existing ? 'update' : 'add',
        });
    }
  }
  for (const project of selected) {
    const file = await within(roots[project], 'docs/shared-assets.json');
    reserve(file);
    const existing = await readOptional(file);
    if (!existing || !existing.equals(manifestBytes))
      operations.push({
        project,
        file,
        bytes: manifestBytes,
        action: existing ? 'update' : 'add',
      });
    if (!Array.isArray(manifest.removals[project]))
      throw new Error(`Missing removal list: ${project}`);
    for (const relative of manifest.removals[project]) {
      const obsolete = await within(roots[project], relative);
      reserve(obsolete);
      try {
        const stat = await fs.lstat(obsolete);
        if (!stat.isFile())
          throw new Error(`Refusing to remove non-file: ${obsolete}`);
        operations.push({ project, file: obsolete, action: 'remove' });
      } catch (error) {
        if (error.code !== 'ENOENT') throw error;
      }
    }
  }
  for (const op of operations)
    log(
      `${config.mode}: ${op.action} ${op.project}/${path.relative(roots[op.project], op.file)}`,
    );
  if (config.mode === 'write') {
    for (const op of operations) {
      if (op.action === 'remove') await fs.unlink(op.file);
      else await writeFile(op.file, op.bytes);
    }
  }
  log(
    `${operations.length} changes${config.mode === 'write' ? ' applied' : ' found'}; checked ${selected.join(', ')}.`,
  );
  return config.mode === 'check' && operations.length ? 1 : 0;
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  try {
    process.exitCode = await syncAssets(process.argv.slice(2));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
