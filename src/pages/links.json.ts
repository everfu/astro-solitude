import links from '../data/links.json';
export function GET() {
  return Response.json(links);
}
