import type { CollectionEntry } from 'astro:content';
import { termPath } from './site';
export type Post = CollectionEntry<'posts'>;
export type Page = CollectionEntry<'pages'>;
export function contentPath(entry: {
  id: string;
  collection: string;
  data: { url?: string; slug?: string };
}): string {
  const path =
    entry.data.url ??
    (entry.collection === 'posts'
      ? `/p/${entry.data.slug ?? entry.id}/`
      : `/${entry.data.slug ?? entry.id}/`);
  if (
    !path.startsWith('/') ||
    path.startsWith('//') ||
    /[?#\\]/.test(path) ||
    path.split('/').includes('..')
  )
    throw new Error(`Invalid content URL: ${path}`);
  return path;
}
export function published<T extends { data: { draft?: boolean } }>(
  entries: T[],
  preview = false,
): T[] {
  return entries.filter((e) => preview || !e.data.draft);
}
export function homePosts(posts: Post[]): Post[] {
  return posts
    .filter((p) => p.data.home !== false)
    .sort(
      (a, b) =>
        Number(b.data.sticky) - Number(a.data.sticky) ||
        +b.data.date - +a.data.date ||
        a.id.localeCompare(b.id),
    );
}
export async function getPosts() {
  const { getCollection } = await import('astro:content');
  return published(await getCollection('posts'), import.meta.env.DEV).sort(
    (a, b) => +b.data.date - +a.data.date || a.id.localeCompare(b.id),
  );
}
export async function getPages() {
  const { getCollection } = await import('astro:content');
  return published(await getCollection('pages'), import.meta.env.DEV);
}
export function paginate<T>(items: T[], size: number) {
  if (size < 1 || !Number.isInteger(size)) throw new Error('Invalid page size');
  return Array.from(
    { length: Math.max(1, Math.ceil(items.length / size)) },
    (_, i) => items.slice(i * size, (i + 1) * size),
  );
}
export function taxonomy(
  posts: Post[],
  kind: 'tags' | 'categories' | 'series',
) {
  const groups = new Map<string, Post[]>();
  for (const p of posts)
    for (const name of new Set(p.data[kind]))
      groups.set(name, [...(groups.get(name) ?? []), p]);
  return [...groups]
    .map(([name, posts]) => ({ name, posts, path: termPath(kind, name) }))
    .sort(
      (a, b) => b.posts.length - a.posts.length || a.name.localeCompare(b.name),
    );
}
export function assertUniquePaths(paths: string[]) {
  const used = new Set<string>();
  for (const path of paths) {
    const key = decodeURI(path)
      .replace(/\/$/, '')
      .replace(/\/index\.html$/, '')
      .normalize('NFC');
    if (used.has(key)) throw new Error(`Duplicate route: ${path}`);
    used.add(key);
  }
}
export const wordCount = (text: string) =>
  (text.match(/[\p{Script=Han}]|[\p{L}\p{N}]+/gu) ?? []).length;
export const plainText = (text: string) =>
  text
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/!?(\[([^\]]*)\])\([^)]*\)/g, '$2')
    .replace(/[#*_`{}]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
