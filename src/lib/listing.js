// Client-side search, faceting and sorting over product rows.
// Phase 3 replaces the data source with an indexed search service; this module keeps the same rules:
//   AND across attributes, OR within one attribute, counts recomputed from current matches,
//   numeric fields compared as numbers, missing values never offered as a selectable option.
import { filters as filterDefs } from './site'

const defs = new Map(filterDefs.map((f) => [f.id, f]))
export const filterDef = (id) => defs.get(id)

// ---------- URL state ----------

export const PAGE_SIZE = 24

export const SORTS = {
  relevance: { label: 'Relevance' },
  'diameter-asc': { label: 'Shaft Ø: low to high' },
  'diameter-desc': { label: 'Shaft Ø: high to low' },
  sku: { label: 'Article number (A–Z)' },
}

// Reads the listing state for the given filter ids from URLSearchParams.
export function readState(params, filterIds) {
  const sel = {}
  for (const id of filterIds) {
    const def = defs.get(id)
    if (!def?.field) continue
    if (def.type === 'number') {
      const min = parseFloat(params.get(`${id}_min`))
      const max = parseFloat(params.get(`${id}_max`))
      if (Number.isFinite(min) || Number.isFinite(max)) sel[id] = { min: Number.isFinite(min) ? min : null, max: Number.isFinite(max) ? max : null }
    } else {
      const vals = params.getAll(id)
      if (vals.length) sel[id] = vals
    }
  }
  const sort = SORTS[params.get('sort')] ? params.get('sort') : 'relevance'
  const page = Math.max(1, parseInt(params.get('page'), 10) || 1)
  return { q: params.get('q') || '', sel, sort, page }
}

// ---------- Search ----------

const compact = (s) => s.toLowerCase().replace(/[\s\-_./,()]+/g, '')

// Every token must match. Purely numeric tokens match whole numbers only, so "20" never matches "200".
export function makeMatcher(q) {
  const tokens = q.toLowerCase().split(/\s+/).filter(Boolean)
  if (!tokens.length) return null
  const tests = tokens.map((t) => {
    if (/^\d+([.,]\d+)?$/.test(t)) {
      const n = parseFloat(t.replace(',', '.'))
      const re = new RegExp(`(^|[^\\d.])${t.replace('.', '\\.')}(?![\\d]|\\.\\d)`)
      return (p) => p.shaftD === n || re.test(p.search) || re.test(p.title.toLowerCase())
    }
    const c = compact(t)
    return (p) => p.search.includes(t) || p._compact.includes(c)
  })
  return (p) => tests.every((test) => test(p))
}

export function prepare(rows) {
  for (const r of rows) if (r._compact == null) r._compact = compact(`${r.sku} ${r.search} ${r.title}`)
  return rows
}

// ---------- Facets ----------

const valueOf = (p, field) => p[field]

function passes(p, id, s) {
  const field = defs.get(id).field
  const v = valueOf(p, field)
  if (Array.isArray(s)) return v != null && s.includes(String(v))
  if (v == null) return false
  return (s.min == null || v >= s.min) && (s.max == null || v <= s.max)
}

// Returns { results, facets } for the current state.
// facets[id]: enum -> [{ value, count }] ; number -> { min, max, count }
export function compute(rows, state, filterIds) {
  const match = makeMatcher(state.q)
  const base = match ? rows.filter(match) : rows
  const active = Object.entries(state.sel)
  const ids = filterIds.filter((id) => defs.get(id)?.field)

  const results = active.length ? base.filter((p) => active.every(([id, s]) => passes(p, id, s))) : base

  const facets = {}
  for (const id of ids) {
    const def = defs.get(id)
    // Dependent counts: apply every selection except this attribute's own.
    const others = active.filter(([k]) => k !== id)
    const pool = others.length ? base.filter((p) => others.every(([k, s]) => passes(p, k, s))) : base
    if (def.type === 'number') {
      let min = Infinity
      let max = -Infinity
      let count = 0
      for (const p of pool) {
        const v = valueOf(p, def.field)
        if (v == null) continue
        count++
        if (v < min) min = v
        if (v > max) max = v
      }
      if (count) facets[id] = { min, max, count }
    } else {
      const counts = new Map()
      for (const p of pool) {
        const v = valueOf(p, def.field)
        if (v == null) continue
        counts.set(String(v), (counts.get(String(v)) || 0) + 1)
      }
      const selected = state.sel[id] || []
      for (const v of selected) if (!counts.has(v)) counts.set(v, 0)
      if (counts.size) facets[id] = [...counts].map(([value, count]) => ({ value, count })).sort((a, b) => b.count - a.count || a.value.localeCompare(b.value))
    }
  }

  return { results: sortRows(results, state.sort), facets, total: rows.length }
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
