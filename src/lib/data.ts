interface PageData {
  about: typeof import('../data/about.json');
  links: typeof import('../data/links.json');
  kit: typeof import('../data/kit.json');
  brevity: typeof import('../data/brevity.json');
}
// Front matter `data: profile` resolves src/data/profile.json at build time.
const modules = import.meta.glob('../data/**/*.json', {
  eager: true,
  import: 'default',
});
export function pageData<K extends keyof PageData>(
  name: unknown,
  fallback: K,
): PageData[K] {
  const key = String(name ?? fallback).replace(/\.json$/, '');
  const value = modules[`../data/${key}.json`];
  if (!value) throw new Error(`Missing page data: src/data/${key}.json`);
  return value as PageData[K];
}
