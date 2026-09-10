import { defineConfig } from '@playwright/test';
import path from 'node:path';
export default defineConfig({
  testDir: './tests/browser',
  timeout: 45000,
  expect: { timeout: 15000 },
  use: { baseURL: 'http://127.0.0.1:4321', headless: true },
  webServer: [
    {
      command: 'pnpm preview --host 127.0.0.1 --port 4321',
      url: 'http://127.0.0.1:4321',
      env: { ASTRO_PREVIEW_BACKGROUND: '1' },
      reuseExistingServer: !process.env.CI,
    },
    {
      command: `pnpm exec astro preview --root ${path.resolve('.astro/integration-fixture')} --host 127.0.0.1 --port 4332`,
      url: 'http://127.0.0.1:4332',
      env: { ASTRO_PREVIEW_BACKGROUND: '1' },
      reuseExistingServer: !process.env.CI,
    },
    ...['algolia', 'docsearch'].map((variant, i) => ({
      command: `pnpm exec astro preview --root ${path.resolve(`.astro/${variant}-fixture`)} --host 127.0.0.1 --port ${4333 + i}`,
      url: `http://127.0.0.1:${4333 + i}${i === 0 ? '/sub/' : '/'}`,
      env: { ASTRO_PREVIEW_BACKGROUND: '1' },
      reuseExistingServer: !process.env.CI,
    })),
  ],
  reporter: 'list',
  workers: 2,
});
