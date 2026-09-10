import { parse as yamlParse, stringify as yamlStringify } from 'yaml';
import sourceParams from '../src/lib/shortcode-params.json';
import map from '../src/lib/shortcode-map.json';
import defaults from '../src/lib/defaults.json';
export interface Issue {
  file: string;
  line: number;
  message: string;
}
export interface Converted {
  text: string;
  mdx: boolean;
  issues: Issue[];
}
const paired = new Set([
  'note',
  'subnote',
  'p',
  'span',
  'spoiler',
  'bubble',
  'keyboard',
  'label',
  'fold',
  'hideBlock',
  'hideInline',
  'hideToggle',
  'gallery',
  'galleryGroup',
  'tabs',
  'tab',
  'timeline',
  'timenode',
  'chartjs',
  'mermaid',
  'score',
  'typeit',
  'checkbox',
  'radio',
  'card',
  'flink',
  'videos',
]);
const raw = new Set(['chartjs', 'mermaid', 'score', 'flink', 'videos']);
const positional: Record<string, string[]> = {
  note: ['type'],
  subnote: ['type'],
  p: ['color'],
  span: ['color'],
  spoiler: ['style'],
  keyboard: ['text'],
  fold: ['title'],
  img: ['src', 'alt'],
  inlineImg: ['src'],
  audio: ['url'],
  video: ['url'],
  youtube: ['id'],
  bvideo: ['id'],
  button: ['url', 'text', 'icon'],
  link: ['title', 'desc', 'url'],
  github: ['repo'],
  gitlab: ['repo'],
  gitee: ['repo'],
  gitea: ['repo'],
  series: ['name'],
};
export function frontmatter(source: string) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match)
    return { data: {} as Record<string, any>, body: source, lines: 0 };
  return {
    data: yamlParse(match[1]) ?? {},
    body: source.slice(match[0].length),
    lines: match[0].split('\n').length - 1,
  };
}
function attributes(source: string, name: string) {
  const attrs: Record<string, any> = {};
  let position = 0;
  const tokens =
    source.match(
      /(?:[^\s"'`]+=(?:"(?:\\.|[^"\\])*"|'[^']*'|`[^`]*`|[^\s]+)|"(?:\\.|[^"\\])*"|'[^']*'|`[^`]*`|[^\s]+)/g,
    ) ?? [];
  for (const token of tokens) {
    const equal = token.indexOf('=');
    const key =
      equal > 0
        ? token.slice(0, equal)
        : (positional[name]?.[position++] ?? `__unknown${position}`);
    let value: any = equal > 0 ? token.slice(equal + 1) : token;
    if (/^"/.test(value)) {
      try {
        value = JSON.parse(value);
      } catch {
        value = value.slice(1, -1);
      }
    } else if (/^['`]/.test(value)) value = value.slice(1, -1);
    else if (value === 'true') value = true;
    else if (value === 'false') value = false;
    else if (/^-?\d+(\.\d+)?$/.test(value)) value = Number(value);
    attrs[key] = value;
  }
  return attrs;
}
function escapedMdx(source: string) {
  return source
    .replace(/[{}]/g, (c) => (c === '{' ? '&#123;' : '&#125;'))
    .replace(/<(https?:[^>]+)>/g, '[$1]($1)')
    .replace(/<(br|hr|img|input|source)(\s[^<>]*?)?\s*(?<!\/)\>/g, '<$1$2 />');
}
export function convertShortcodes(
  body: string,
  file = 'content.md',
): Converted {
  const issues: Issue[] = [];
  const chunks: string[] = [];
  const stack: string[] = [];
  let cursor = 0;
  let mdx = false;
  // Code fences and inline code are copied verbatim, including illustrative Hugo syntax.
  const token =
    /^ {0,3}(`{3,}|~{3,})[^\n]*\n[\s\S]*?^ {0,3}\1\s*$|(`+)[^`\n]*?\2|\{\{([<%])\s*([\s\S]*?)\s*([>%])\}\}/gm;
  let match: RegExpExecArray | null;
  while ((match = token.exec(body))) {
    chunks.push(escapedMdx(body.slice(cursor, match.index)));
    cursor = token.lastIndex;
    if (match[1] || match[2]) {
      chunks.push(match[0]);
      continue;
    }
    const line = body.slice(0, match.index).split('\n').length;
    const directive = match[4].trim();
    const closing = directive.startsWith('/');
    const name = (closing ? directive.slice(1) : directive).split(/\s/)[0];
    const component = (map as Record<string, string>)[name];
    if (!component) {
      issues.push({ file, line, message: `Unsupported shortcode: ${name}` });
      chunks.push(escapedMdx(match[0]));
      continue;
    }
    mdx = true;
    if (closing) {
      if (stack.pop() !== name)
        issues.push({
          file,
          line,
          message: `Mismatched shortcode closing tag: ${name}`,
        });
      chunks.push(`</${component}>`);
      continue;
    }
    const selfClosing = /\/$/.test(directive);
    const args = attributes(
      directive.slice(name.length).replace(/\/$/, ''),
      name,
    );
    for (const key of Object.keys(args)) {
      if (key.startsWith('__unknown'))
        issues.push({
          file,
          line,
          message: `Unsupported positional argument for ${name}`,
        });
      else if (!(sourceParams as Record<string, string[]>)[name]?.includes(key))
        issues.push({
          file,
          line,
          message: `Unsupported parameter ${key} for ${name}`,
        });
    }
    if (raw.has(name) && !selfClosing) {
      const endPattern = new RegExp(
        '\\{\\{[<%]\\s*/' + name + '\\s*[>%]\\}\\}',
        'g',
      );
      endPattern.lastIndex = cursor;
      const end = endPattern.exec(body);
      if (!end) {
        issues.push({
          file,
          line,
          message: `Missing closing shortcode: ${name}`,
        });
        continue;
      }
      const text = body.slice(cursor, end.index).trim();
      try {
        if (name === 'flink') args.groups = yamlParse(text);
        else if (name === 'videos')
          args.sources = text
            .split(/\r?\n/)
            .map((x) => x.trim())
            .filter(Boolean);
        else args[name === 'score' ? 'score' : 'code'] = text;
      } catch (error) {
        issues.push({ file, line, message: `Invalid ${name} body: ${error}` });
      }
      cursor = endPattern.lastIndex;
      token.lastIndex = cursor;
    }
    const props = Object.entries(args)
      .map(([key, value]) => `${key}={${JSON.stringify(value)}}`)
      .join(' ');
    if (paired.has(name) && !selfClosing && !raw.has(name)) {
      stack.push(name);
      chunks.push(`<${component}${props ? ' ' + props : ''}>`);
    } else chunks.push(`<${component}${props ? ' ' + props : ''} />`);
  }
  chunks.push(escapedMdx(body.slice(cursor)));
  for (const name of stack)
    issues.push({
      file,
      line: body.split('\n').length,
      message: `Missing closing shortcode: ${name}`,
    });
  return { text: mdx ? chunks.join('') : body, mdx, issues };
}
const knownFields = new Set([
  'title',
  'date',
  'lastmod',
  'updated',
  'description',
  'desc',
  'slug',
  'url',
  'aliases',
  'cover',
  'categories',
  'tags',
  'series',
  'home',
  'draft',
  'sticky',
  'comment',
  'aside',
  'toc',
  'random',
  'type',
  'layout',
  'not_cover',
  'author',
  'avatar',
  'avatar_background',
  'copyright',
  'reprint',
  'locate',
  'color',
  'right_menu',
  'weight',
  'data',
  'katex',
  'leftend',
  'rightend',
  'rightbtn',
  'rightbtnlink',
]);
export function convertDocument(source: string, file: string): Converted {
  if (/^\+\+\+\r?\n|^\{/.test(source))
    return {
      text: source,
      mdx: false,
      issues: [
        {
          file,
          line: 1,
          message:
            'TOML/JSON front matter requires conversion to YAML before import',
        },
      ],
    };
  const { data, body, lines } = frontmatter(source);
  const result = convertShortcodes(body, file);
  const issues = result.issues.map((i) => ({ ...i, line: i.line + lines }));
  for (const field of Object.keys(data))
    if (!knownFields.has(field))
      issues.push({
        file,
        line: 1,
        message: `Unmapped front matter field preserved: ${field}`,
      });
  if (data.updated && !data.lastmod) data.lastmod = data.updated;
  delete data.updated;
  if (data.desc && !data.description) data.description = data.desc;
  if (data.layout && !data.type) data.type = data.layout;
  delete data.layout;
  for (const key of ['categories', 'tags', 'series', 'aliases'])
    if (data[key] && !Array.isArray(data[key])) data[key] = [data[key]];
  return {
    text: `---\n${yamlStringify(data)}---\n${result.text}`,
    mdx: result.mdx,
    issues,
  };
}
export function convertConfig(source: Record<string, any>) {
  const issues: Issue[] = [];
  const clean = (value: any): any =>
    Array.isArray(value)
      ? value.map(clean)
      : value && typeof value === 'object'
        ? Object.fromEntries(
            Object.entries(value)
              .filter(([k]) => k !== '_merge')
              .map(([k, v]) => [k, clean(v)]),
          )
        : value;
  const theme = clean(source.params?.solitude ?? {});
  function compare(input: any, reference: any, path = 'theme') {
    for (const [key, value] of Object.entries(input)) {
      if (key === '_merge') continue;
      if (!(key in reference)) {
        issues.push({
          file: 'hugo.yaml',
          line: 1,
          message: `Unmapped configuration preserved for review: ${path}.${key}`,
        });
        continue;
      }
      if (
        value &&
        typeof value === 'object' &&
        !Array.isArray(value) &&
        reference[key] &&
        typeof reference[key] === 'object' &&
        Object.keys(reference[key]).length
      )
        compare(value, reference[key], `${path}.${key}`);
    }
  }
  compare(theme, defaults);
  for (const key of Object.keys(source.params ?? {}))
    if (!['_merge', 'solitude', 'description', 'author'].includes(key))
      issues.push({
        file: 'hugo.yaml',
        line: 1,
        message: `Unmapped site parameter: params.${key}`,
      });
  const original = source.menus?.main ?? [];
  const menus = original
    .filter((item: any) => !item.parent)
    .sort((a: any, b: any) => (a.weight ?? 0) - (b.weight ?? 0))
    .map((item: any) => {
      const convert = (x: any) => ({
        name: x.name,
        ...(x.pageRef || x.url
          ? { url: x.pageRef ? x.pageRef.replace(/\/$/, '') + '/' : x.url }
          : {}),
        ...x.params,
      });
      const children = original
        .filter((x: any) => x.parent === item.identifier)
        .sort((a: any, b: any) => (a.weight ?? 0) - (b.weight ?? 0))
        .map(convert);
      return { ...convert(item), ...(children.length ? { children } : {}) };
    });
  const languages: Record<string, string> = {
    'zh-cn': 'zh-CN',
    'zh-tw': 'zh-TW',
    'zh-hant': 'zh-TW',
    en: 'en',
    es: 'es',
  };
  const parsedSite = new URL(source.baseURL ?? 'https://example.org');
  const config = {
    site: parsedSite.origin,
    base: parsedSite.pathname.replace(/\/?$/, '/'),
    title: source.title ?? 'Solitude',
    description: source.params?.description ?? '',
    locale:
      languages[
        String(
          source.locale ?? source.defaultContentLanguage ?? 'zh-cn',
        ).toLowerCase()
      ] ?? 'zh-CN',
    timeZone: source.timeZone ?? 'Asia/Shanghai',
    author:
      typeof source.params?.author === 'string'
        ? { name: source.params.author }
        : (source.params?.author ?? { name: source.title ?? 'Solitude' }),
    pagination: source.pagination?.pagerSize ?? 10,
    menus,
    theme,
  };
  return { config, issues };
}
