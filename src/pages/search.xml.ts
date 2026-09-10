import { getPosts } from '../lib/content';
import { searchXml } from '../lib/feeds';
export async function GET() {
  return new Response(searchXml(await getPosts()), {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}
