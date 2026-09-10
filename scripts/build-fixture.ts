import fs from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import config from '../src/site.config';
import { mergeConfig } from '../src/lib/config';
for (const variant of ['integration', 'algolia', 'docsearch']) {
  const target = path.resolve(`.astro/${variant}-fixture`);
  await fs.rm(target, { recursive: true, force: true });
  await fs.mkdir(target, { recursive: true });
  for (const file of [
    'src',
    'public',
    'scripts',
    'astro.config.mjs',
    'tsconfig.json',
    'package.json',
  ])
    await fs.cp(file, path.join(target, file), { recursive: true });
  await fs.symlink(
    path.resolve('node_modules'),
    path.join(target, 'node_modules'),
    'dir',
  );
  let fixture = mergeConfig(config, {
    theme: {
      capsule: { enable: true, id: 'fixture' },
      music: { enable: true, id: 'fixture' },
      comment: { use: 'twikoo,waline,valine,artalk,giscus', lazyload: false },
      twikoo: { envId: 'fixture' },
      waline: { serverURL: 'https://comments.invalid' },
      valine: {
        appId: 'fixture',
        appKey: 'fixture',
        serverURLs: 'https://comments.invalid',
      },
      artalk: { server: 'https://comments.invalid', site: 'Fixture' },
      giscus: {
        repo: 'fixture/demo',
        repo_id: 'fixture',
        category_id: 'fixture',
      },
      loading: { fullpage: true },
      post: {
        award: {
          enable: true,
          list: [{ name: 'Demo', qrcode: '/img/logo.png' }],
        },
      },
    },
  });
  if (variant !== 'integration')
    fixture = mergeConfig(config, {
      locale: variant === 'algolia' ? 'en' : 'es',
      base: variant === 'algolia' ? '/sub/' : '/',
      theme: {
        search: {
          type: variant,
          algolia: {
            appId: 'fixture',
            apiKey: 'public-search-key',
            indexName: 'posts',
          },
          docsearch: {
            appId: 'fixture',
            apiKey: 'public-search-key',
            indexName: 'posts',
          },
        },
        pwa: { manifest: '/app.webmanifest' },
      },
    });
  await fs.writeFile(
    path.join(target, 'src/site.config.ts'),
    `import {defineSolitudeConfig} from './lib/config';\nexport default defineSolitudeConfig(${JSON.stringify(fixture)});\n`,
  );
  const result = spawnSync(
    'pnpm',
    ['exec', 'astro', 'build', '--root', target],
    { stdio: 'inherit' },
  );
  if (result.status !== 0) {
    process.exitCode = result.status ?? 1;
    break;
  }
}
