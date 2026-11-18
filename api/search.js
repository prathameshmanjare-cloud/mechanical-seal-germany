// GET /api/search — product search, facets and paging over the SAP Parts catalogue.
//
// Query: scope=<page id> (category subtree; omitted = whole catalogue), facets=<comma-separated filter ids>,
//        q, sort, page, and filter selections as produced by the listing UI (attr=value…, attr_min/attr_max).
// Returns: { total, count, page, pages, pageSize, items: [...], facets: {...} }
import { getCatalog } from '../shared/catalog.mjs'
import { PAGE_SIZE, compute, prepare, readState } from '../shared/search.mjs'

// Fields sent to the browser for product cards (search keys and long copy stay on the server).
const CARD = ['sku', 'title', 'sealType', 'series', 'refManufacturer', 'mpn', 'shaftD', 'rotatingFace', 'stationaryFace', 'secondarySeal', 'image', 'pageId']
const pick = (p) => Object.fromEntries(CARD.map((k) => [k, p[k] ?? null]))

const json = (body, status = 200, cache = true) =>
  Response.json(body, {
    status,
    headers: {
      // Data only changes on deploy; let the CDN cache each query.
      'Cache-Control': cache ? 'public, max-age=60, s-maxage=86400, stale-while-revalidate=604800' : 'no-store',
    },
  })

export function GET(request) {
  const params = new URL(request.url).searchParams
  const cat = getCatalog()
  const scope = params.get('scope')
  if (scope && !cat.pages.has(scope)) return json({ error: `Unknown scope ${scope}` }, 400, false)

  const defs = new Map(cat.defs.map((d) => [d.id, d]))
  const facetIds = (params.get('facets') || '').split(',').filter((id) => defs.get(id)?.field).slice(0, 20)
  // Selections may only use filters that exist; facets list decides which counts are returned.
  const state = readState(params, [...defs.keys()], defs)

  const rows = prepare(cat.scope(scope))
  const { results, facets } = compute(rows, state, facetIds, defs)
  const pages = Math.max(1, Math.ceil(results.length / PAGE_SIZE))
  const page = Math.min(state.page, pages)

  return json({
    total: rows.length,
    count: results.length,
    page,
    pages,
    pageSize: PAGE_SIZE,
    items: results.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map(pick),
    facets,
  })
}
