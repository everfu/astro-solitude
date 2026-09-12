import test from 'node:test';
import assert from 'node:assert/strict';
import { runInNewContext } from 'node:vm';
import { applyInitialTheme } from '../src/scripts/theme-bootstrap';

test('serialized theme bootstrap runs independently before browser modules', () => {
  const cases = [
    { mode: 'light', stored: null, dark: true, expected: 'light' },
    { mode: 'dark', stored: null, dark: false, expected: 'dark' },
    { mode: 'auto', stored: null, dark: true, expected: 'dark' },
    {
      mode: 'light',
      stored: '{"value":"dark"}',
      dark: false,
      expected: 'dark',
    },
    {
      mode: 'light',
      stored: '{"value":"dark","expiry":1}',
      dark: true,
      expected: 'light',
    },
    { mode: 'auto', stored: 'invalid JSON', dark: false, expected: 'light' },
  ];
  for (const item of cases) {
    const document = { documentElement: { dataset: { theme: '' } } };
    runInNewContext(
      `(${applyInitialTheme.toString()})(${JSON.stringify(item.mode)})`,
      {
        document,
        localStorage: { getItem: () => item.stored },
        matchMedia: () => ({ matches: item.dark }),
      },
    );
    assert.equal(document.documentElement.dataset.theme, item.expected);
  }
  const document = { documentElement: { dataset: { theme: '' } } };
  runInNewContext(`(${applyInitialTheme.toString()})("dark")`, {
    document,
    localStorage: {
      getItem: () => {
        throw new Error('Storage blocked');
      },
    },
  });
  assert.equal(document.documentElement.dataset.theme, 'dark');
});
