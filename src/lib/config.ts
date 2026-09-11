import defaults from './defaults.json';

export interface Link {
  name: string;
  url?: string;
  icon?: string;
  action?: string;
  children?: Link[];
}
export type Locale = 'zh-CN' | 'zh-TW' | 'en' | 'es';
type Widen<T> = T extends null
  ? string | null
  : T extends readonly (infer U)[]
    ? unknown extends U
      ? unknown[]
      : [U] extends [never]
        ? any[]
        : Widen<U>[]
    : T extends object
      ? { [K in keyof T]: Widen<T[K]> }
      : T;
export type ThemeConfig = Widen<typeof defaults>;
export type DeepPartial<T> = T extends any[]
  ? T
  : T extends object
    ? { [K in keyof T]?: DeepPartial<T[K]> }
    : T;
export interface SiteConfig {
  site: string;
  base: string;
  title: string;
  description: string;
  locale: Locale;
  timeZone: string;
  hasCJKLanguage: boolean;
  author: { name: string; email?: string };
  pagination: number;
  menus: Link[];
  theme: ThemeConfig;
}
export function mergeConfig<T>(base: T, override: DeepPartial<T>): T {
  const result: any = structuredClone(base);
  for (const [key, value] of Object.entries(override ?? {})) {
    if (key === '__proto__' || key === 'constructor' || key === 'prototype')
      continue;
    result[key] =
      value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      result[key] &&
      typeof result[key] === 'object'
        ? mergeConfig(result[key], value)
        : value;
  }
  return result;
}
export function defineSolitudeConfig(
  input: DeepPartial<SiteConfig>,
): SiteConfig {
  const config = mergeConfig<SiteConfig>(
    {
      site: 'https://example.org',
      base: '/',
      title: 'Solitude',
      description: 'A place to write, collect, and share.',
      locale: 'zh-CN',
      timeZone: 'Asia/Shanghai',
      hasCJKLanguage: false,
      author: { name: 'Solitude' },
      pagination: 10,
      menus: [],
      theme: defaults as ThemeConfig,
    },
    input,
  );
  if (!/^https?:\/\//.test(config.site))
    throw new Error('site must be an absolute HTTP(S) URL');
  if (!Number.isInteger(config.pagination) || config.pagination < 1)
    throw new Error('pagination must be a positive integer');
  if (!['zh-CN', 'zh-TW', 'en', 'es'].includes(config.locale))
    throw new Error('Unsupported locale');
  if (!config.base.startsWith('/') || !config.base.endsWith('/'))
    throw new Error('base must start and end with /');
  if (!['local', 'algolia', 'docsearch'].includes(config.theme.search.type))
    throw new Error('Unknown search provider');
  for (const p of config.theme.comment.use.split(',').filter(Boolean))
    if (!['twikoo', 'waline', 'valine', 'artalk', 'giscus'].includes(p.trim()))
      throw new Error(`Unknown comment provider: ${p}`);
  for (const shortcut of config.theme.keyboard.list)
    if (Boolean(shortcut.action) === Boolean(shortcut.url))
      throw new Error('A shortcut requires exactly one of action or url');
  return config;
}
