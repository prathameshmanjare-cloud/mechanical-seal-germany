// GET /api/product?sku=<sap_article_number> — one article record with its primary page.
import { getCatalog } from '../shared/catalog.mjs'

const HIDDEN = new Set(['search', '_compact', '_title'])

export function GET(request) {
  const sku = new URL(request.url).searchParams.get('sku') || ''
  const p = getCatalog().bySku.get(sku)
  if (!p) return Response.json({ error: 'Not found' }, { status: 404, headers: { 'Cache-Control': 'no-store' } })
  const page = getCatalog().pages.get(p.pageId)
  return Response.json(
    { product: Object.fromEntries(Object.entries(p).filter(([k]) => !HIDDEN.has(k))), page: { id: page.id, url: page.url, title: page.title } },
    { headers: { 'Cache-Control': 'public, max-age=60, s-maxage=86400, stale-while-revalidate=604800' } },
  )
}
