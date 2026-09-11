import fs from 'node:fs/promises';
import path from 'node:path';
import { marked } from 'marked';

const files = [
  'README.md',
  'README.en.md',
  ...(await fs.readdir('docs'))
    .filter((f) => f.endsWith('.md'))
    .map((f) => `docs/${f}`),
];
const parsed = new Map<string, { anchors: Set<string>; links: string[] }>();
async function document(file: string) {
  const key = path.resolve(file);
  if (parsed.has(key)) return parsed.get(key)!;
  const source = await fs.readFile(key, 'utf8');
  const anchors = new Set<string>();
  const links: string[] = [];
  const counts = new Map<string, number>();
  marked.walkTokens(marked.lexer(source), (token) => {
    if (token.type === 'heading') {
      const slug = token.text
        .toLowerCase()
        .replace(/<[^>]+>/g, '')
        .replace(/[^\p{L}\p{M}\p{N}_\- ]/gu, '')
        .replace(/ /g, '-');
      const count = counts.get(slug) ?? 0;
      anchors.add(count ? `${slug}-${count}` : slug);
      counts.set(slug, count + 1);
    }
    if (token.type === 'link' || token.type === 'image') links.push(token.href);
    if (token.type === 'html') {
      for (const match of token.text.matchAll(/(?:href|src)=["']([^"']+)["']/g))
        links.push(match[1]);
      for (const match of token.text.matchAll(/(?:id|name)=["']([^"']+)["']/g))
        anchors.add(match[1]);
    }
  });
  const result = { anchors, links };
  parsed.set(key, result);
  return result;
}
const errors: string[] = [];
let checked = 0;
for (const file of files) {
  for (const href of (await document(file)).links) {
    if (/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(href)) continue;
    const [relative, fragment] = href.split('#');
    const target = relative
      ? path.resolve(path.dirname(file), decodeURIComponent(relative))
      : path.resolve(file);
    try {
      await fs.access(target);
      if (
        fragment &&
        target.endsWith('.md') &&
        !(await document(target)).anchors.has(decodeURIComponent(fragment))
      ) {
        errors.push(`${file}: missing anchor ${href}`);
      }
      checked++;
    } catch {
      errors.push(`${file}: missing file ${href}`);
    }
  }
}
if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else
  console.log(
    `Checked ${checked} local links and anchors across ${files.length} documents.`,
  );
