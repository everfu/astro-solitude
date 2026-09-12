import defaults from './defaults.json';

export interface Link {
  name: string;
  url?: string;
  icon?: string;
  action?: string;
  children?: Link[];
}
export type Locale = 'zh-CN' | 'zh-TW' | 'en' | 'es';
export interface ThemeLink extends Link {
  img?: string;
  id?: string;
  title?: string;
  class?: string;
  click?: string;
}
export interface Recommendation {
  color?: string;
  title: string;
  url: string;
  cover?: string;
  label?: string;
  enable?: boolean;
}
interface EmptyArrays {
  'nav.group': Record<string, ThemeLink[]>;
  'footer.group': Record<string, ThemeLink[]>;
  'nav.right.custom': ThemeLink[];
  'hometop.recommendList': Recommendation[];
  'aside.my_card.witty_words': string[];
  'aside.my_card.information': ThemeLink[];
  'aside.tags.highlight_list': string[];
  'post.award.list': { name: string; qrcode: string }[];
  'post.share.list': string[];
  'right_menu.custom_list': ThemeLink[];
  'footer.information.left': ThemeLink[];
  'footer.information.right': ThemeLink[];
  'footer.links': ThemeLink[];
  'footer.beian': { name: string; url?: string; icon?: string }[];
  'keyboard.list': {
    name?: string;
    modifier: string;
    key: string;
    action?: string;
    url?: string;
  }[];
  'memorial.date': string[];
  'search.tags': string[];
  verify_site: string[];
  'extends.head': string[];
  'extends.body': string[];
}
type Widen<T, P extends string = ''> = P extends keyof EmptyArrays
  ? EmptyArrays[P]
  : T extends null
    ? string | null
    : T extends readonly (infer U)[]
      ? Widen<U>[]
      : T extends object
        ? {
            [K in keyof T]: Widen<
              T[K],
              P extends '' ? K & string : `${P}.${K & string}`
            >;
          }
        : T;
export type ThemeConfig = Widen<typeof defaults>;
export type DeepPartial<T> = T extends readonly unknown[]
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
  const result = structuredClone(base) as Record<string, unknown>;
  for (const [key, value] of Object.entries(override ?? {})) {
    if (key === '__proto__' || key === 'constructor' || key === 'prototype')
      continue;
    result[key] =
      value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      result[key] &&
      typeof result[key] === 'object'
        ? mergeConfig(
            result[key] as Record<string, unknown>,
            value as Record<string, unknown>,
          )
        : value;
  }
  return result as T;
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
      locale: 'en',
      timeZone: 'UTC',
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
