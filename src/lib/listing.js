// Client side of the listing: URL state and labels from shared/search.mjs, results from /api/search.
import { filters as filterDefs } from './site'
import { PAGE_SIZE, SORTS, formatNumber, readState as readStateWith } from '../../shared/search.mjs'

export { PAGE_SIZE, SORTS, formatNumber }

const defs = new Map(filterDefs.map((f) => [f.id, f]))
export const filterDef = (id) => defs.get(id)
export const readState = (params, filterIds) => readStateWith(params, filterIds, defs)

// Query string for /api/search: listing params plus scope (page id) and the page's filter ids.
export function searchUrl(page, params) {
  const q = new URLSearchParams(params)
  q.set('scope', page.id)
  q.set('facets', page.filters.join(','))
  return `/api/search?${q}`
}
