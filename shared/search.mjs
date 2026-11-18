// Search, faceting and sorting rules shared by the API (server) and the listing UI (URL state, labels).
//   AND across attributes, OR within one attribute, counts recomputed from current matches,
//   numeric fields compared as numbers, missing values never offered as a selectable option.
// `defs` is a Map of filter id -> definition ({ id, field, type, label, unit, typeahead }).

export const PAGE_SIZE = 24
export const MAX_QUERY = 120

export const SORTS = {
  relevance: { label: 'Relevance' },
  'diameter-asc': { label: 'Shaft Ø: low to high' },
  'diameter-desc': { label: 'Shaft Ø: high to low' },
  sku: { label: 'Article number (A–Z)' },
}

// Listing state from URLSearchParams. Unknown filters and malformed values are ignored.
export function readState(params, filterIds, defs) {
  const sel = {}
  for (const id of filterIds) {
    const def = defs.get(id)
    if (!def?.field) continue
    if (def.type === 'number') {
      const min = parseFloat(params.get(`${id}_min`))
      const max = parseFloat(params.get(`${id}_max`))
      if (Number.isFinite(min) || Number.isFinite(max)) sel[id] = { min: Number.isFinite(min) ? min : null, max: Number.isFinite(max) ? max : null }
    } else {
      const vals = params.getAll(id).filter(Boolean)
      if (vals.length) sel[id] = vals
    }
  }
  const sort = SORTS[params.get('sort')] ? params.get('sort') : 'relevance'
  const page = Math.max(1, parseInt(params.get('page'), 10) || 1)
  return { q: (params.get('q') || '').slice(0, MAX_QUERY), sel, sort, page }
}

// ---------- Search ----------

const compact = (s) => s.toLowerCase().replace(/[\s\-_./,()]+/g, '')
const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// Every token must match. Purely numeric tokens match whole numbers only, so "20" never matches "200".
export function makeMatcher(q) {
  const tokens = q.toLowerCase().split(/\s+/).filter(Boolean)
  if (!tokens.length) return null
  const tests = tokens.map((t) => {
    if (/^\d+([.,]\d+)?$/.test(t)) {
      const norm = t.replace(',', '.')
      const n = parseFloat(norm)
      const re = new RegExp(`(^|[^\\d.])${escape(norm)}(?![\\d]|\\.\\d)`)
      return (p) => p.shaftD === n || re.test(p.search) || re.test(p._title)
    }
    const c = compact(t)
    return (p) => p.search.includes(t) || (c && p._compact.includes(c))
  })
  return (p) => tests.every((test) => test(p))
}

// Adds derived search keys to rows once.
export function prepare(rows) {
  for (const r of rows) {
    if (r._compact != null) continue
    r._title = r.title.toLowerCase()
    r._compact = compact(`${r.sku} ${r.search} ${r.title}`)
  }
  return rows
}

// ---------- Facets ----------

function passes(p, def, s) {
  const v = p[def.field]
  if (Array.isArray(s)) return v != null && s.includes(String(v))
  if (v == null) return false
  return (s.min == null || v >= s.min) && (s.max == null || v <= s.max)
}

// Returns { results, facets } for the current state.
// facets[id]: enum -> [{ value, count }] ; number -> { min, max, count }
export function compute(rows, state, filterIds, defs) {
  const match = makeMatcher(state.q)
  const base = match ? rows.filter(match) : rows
  const active = Object.entries(state.sel).map(([id, s]) => [id, defs.get(id), s])
  const ids = filterIds.filter((id) => defs.get(id)?.field)

  const results = active.length ? base.filter((p) => active.every(([, d, s]) => passes(p, d, s))) : base

  const facets = {}
  for (const id of ids) {
    const def = defs.get(id)
    // Dependent counts: apply every selection except this attribute's own.
    const others = active.filter(([k]) => k !== id)
    const pool = others.length === active.length ? results : others.length ? base.filter((p) => others.every(([, d, s]) => passes(p, d, s))) : base
    if (def.type === 'number') {
      let min = Infinity
      let max = -Infinity
      let count = 0
      for (const p of pool) {
        const v = p[def.field]
        if (v == null) continue
        count++
        if (v < min) min = v
        if (v > max) max = v
      }
      if (count) facets[id] = { min, max, count }
    } else {
      const counts = new Map()
      for (const p of pool) {
        const v = p[def.field]
        if (v == null) continue
        const k = String(v)
        counts.set(k, (counts.get(k) || 0) + 1)
      }
      for (const v of state.sel[id] || []) if (!counts.has(v)) counts.set(v, 0)
      if (counts.size) facets[id] = [...counts].map(([value, count]) => ({ value, count })).sort((a, b) => b.count - a.count || a.value.localeCompare(b.value))
    }
  }

  return { results: sortRows(results, state.sort), facets }
}

function sortRows(rows, sort) {
  if (sort === 'relevance') return rows
  const out = [...rows]
  if (sort === 'sku') return out.sort((a, b) => a.sku.localeCompare(b.sku))
  const dir = sort === 'diameter-desc' ? -1 : 1
  // Rows without a diameter always go last.
  return out.sort((a, b) => (a.shaftD == null) - (b.shaftD == null) || dir * ((a.shaftD ?? 0) - (b.shaftD ?? 0)) || a.sku.localeCompare(b.sku))
}

export const formatNumber = (n) => (Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/0+$/, '').replace(/\.$/, ''))
