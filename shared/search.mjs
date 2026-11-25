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

export const compact = (s) => String(s ?? '').toLowerCase().replace(/[\s\-_./,()]+/g, '')
const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// Words of a query. Size notation is reduced to the number ("Ø25", "25mm" -> "25"); bare units are dropped.
export const tokenize = (q) =>
  q.toLowerCase().split(/\s+/)
    .map((t) => t.replace(/^(?:ø|⌀)(?=\d)/, '').replace(/^(\d+(?:[.,]\d+)?)mm$/, '$1'))
    .filter((t) => t && !/^(?:mm|ø|⌀)$/.test(t))

// Every token must match. Purely numeric tokens match whole numbers only, so "20" never matches "200".
// Text tokens match anywhere in the article's searchable text: article number, OEM / manufacturer
// part numbers, series, title, brands, equipment, design, materials and application.
export function makeMatcher(q) {
  const tokens = tokenize(q)
  if (!tokens.length) return null
  const tests = tokens.map((t) => {
    if (/^\d+([.,]\d+)?$/.test(t)) {
      const norm = t.replace(',', '.')
      const n = parseFloat(norm)
      const re = new RegExp(`(^|[^\\d.])${escape(norm)}(?![\\d]|\\.\\d)`)
      return (p) => p.shaftD === n || re.test(p.search) || re.test(p._title)
    }
    const c = compact(t)
    return (p) => p._all.includes(t) || (c && p._compact.includes(c))
  })
  return (p) => tests.every((test) => test(p))
}

// Adds derived search keys to rows once.
export function prepare(rows) {
  for (const r of rows) {
    if (r._all != null) continue
    r._title = r.title.toLowerCase()
    r._all = [r.search, r._title, r.refManufacturer, r.equipmentManufacturer, r.equipmentModel, r.oemPn, r.mpn, r.sealType, r.series, r.materialCombination, r.application, r.configuration]
      .filter(Boolean).join(' | ').toLowerCase()
    r._compact = compact(`${r.sku} ${r.search} ${r.title} ${r.oemPn ?? ''} ${r.mpn ?? ''}`)
    r._csku = compact(r.sku)
    r._crefs = [r.mpn, r.oemPn].filter(Boolean).map(compact)
  }
  return rows
}

// Relevance of one prepared row for a query: identifiers first (article, OEM and manufacturer
// numbers), then series and brand, then words in the title. Higher is better.
export function scoreRow(p, q, tokens = tokenize(q), cq = compact(q)) {
  let s = 0
  const ql = q.trim().toLowerCase()
  if (cq) {
    if (p._csku === cq) s += 1000
    else if (p._csku.startsWith(cq)) s += 420
    else if (p._csku.includes(cq)) s += 160
    for (const r of p._crefs) {
      if (r === cq) s += 900
      else if (r.startsWith(cq)) s += 450
      else if (r.includes(cq)) s += 140
    }
  }
  const series = p.series?.toLowerCase()
  if (series) {
    if (series === ql) s += 320
    else if (series.startsWith(ql)) s += 160
  }
  for (const b of [p.refManufacturer, p.equipmentManufacturer]) {
    const bl = b?.toLowerCase()
    if (bl && (bl === ql || bl.startsWith(ql))) s += 110
  }
  for (const t of tokens) {
    if (/^\d+([.,]\d+)?$/.test(t) && p.shaftD === parseFloat(t.replace(',', '.'))) s += 60
    const i = p._title.indexOf(t)
    if (i === 0 || (i > 0 && !/[a-z0-9]/.test(p._title[i - 1]))) s += 24
    else if (i > 0) s += 6
  }
  return s
}

// Sorts matches by relevance (stable for ties: shaft diameter, then article number).
export function rankRows(rows, q) {
  const tokens = tokenize(q)
  const cq = compact(q)
  return rows
    .map((p) => [scoreRow(p, q, tokens, cq), p])
    .sort((a, b) => b[0] - a[0] || (a[1].shaftD ?? 1e9) - (b[1].shaftD ?? 1e9) || a[1].sku.localeCompare(b[1].sku))
    .map(([, p]) => p)
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

  return { results: sortRows(results, state.sort, state.q), facets }
}

function sortRows(rows, sort, q) {
  if (sort === 'relevance') return q?.trim() ? rankRows(rows, q) : rows
  const out = [...rows]
  if (sort === 'sku') return out.sort((a, b) => a.sku.localeCompare(b.sku))
  const dir = sort === 'diameter-desc' ? -1 : 1
  // Rows without a diameter always go last.
  return out.sort((a, b) => (a.shaftD == null) - (b.shaftD == null) || dir * ((a.shaftD ?? 0) - (b.shaftD ?? 0)) || a.sku.localeCompare(b.sku))
}

export const formatNumber = (n) => (Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/0+$/, '').replace(/\.$/, ''))
