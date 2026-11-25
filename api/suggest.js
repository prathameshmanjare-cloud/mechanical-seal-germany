// GET /api/suggest — instant suggestions for the search box (typeahead).
//
// Query: q (what the visitor has typed so far), scope=<page id> (optional; limits product hits).
// Returns: {
//   q, corrected,           // corrected: spelling the results were found with, when q itself found nothing
//   complete,               // a longer term that starts with q, for inline completion
//   total, exact,           // number of matching articles; exact: the article whose number equals q
//   quick: [...],           // shortcuts: shaft size, brands, series, designs, materials, applications
//   products: [...],        // best article matches (max 6)
//   pages: [...],           // matching category and information pages
//   popular: [...]          // only for an empty q: shortcuts to show before typing
// }
import { getCatalog } from '../shared/catalog.mjs'
import { MAX_QUERY, compact, makeMatcher, prepare, rankRows } from '../shared/search.mjs'

const PRODUCTS = 6
const QUICK = 6
const PAGES = 4
const SHOP = '/shop/'

const json = (body) =>
  Response.json(body, { headers: { 'Cache-Control': 'public, max-age=60, s-maxage=86400, stale-while-revalidate=604800' } })

const shopLink = (params) => `${SHOP}?${new URLSearchParams(params)}`

// Shortcut kinds: which product field they come from and how they open the shop.
// Fields with a Shop facet open the facet (it shows as a removable chip); the rest run a text search.
const KINDS = [
  { kind: 'brand', field: 'refManufacturer', label: 'Seal manufacturer', link: (v) => shopLink({ q: v }) },
  { kind: 'equipment', field: 'equipmentManufacturer', label: 'Equipment manufacturer', link: (v) => shopLink({ q: v }) },
  { kind: 'series', field: 'series', label: 'Seal series', link: (v) => shopLink({ q: v }) },
  { kind: 'design', field: 'sealType', label: 'Seal design', link: (v) => shopLink({ seal_type: v }) },
  { kind: 'material', field: 'rotatingFace', label: 'Rotating face', link: (v) => shopLink({ rotating_face_material: v }) },
  { kind: 'elastomer', field: 'secondarySeal', label: 'Secondary seal', link: (v) => shopLink({ secondary_seal_material: v }) },
  { kind: 'combination', field: 'materialCombination', label: 'Material combination', link: (v) => shopLink({ q: v }) },
  { kind: 'application', field: 'application', label: 'Application', link: (v) => shopLink({ application: v }) },
]
const GENERIC = new Set(['other', 'sap parts', 'n/a', '-'])

let index = null

// Built once per warm instance: shortcut entities with counts, searchable pages and a spelling vocabulary.
function getIndex() {
  if (index) return index
  const cat = getCatalog()
  prepare(cat.rows)

  const entities = []
  for (const k of KINDS) {
    const counts = new Map()
    for (const r of cat.rows) {
      const v = r[k.field]
      if (v) counts.set(v, (counts.get(v) || 0) + 1)
    }
    for (const [value, count] of counts) {
      if (GENERIC.has(value.toLowerCase())) continue
      const lower = value.toLowerCase()
      entities.push({
        kind: k.kind, kindLabel: k.label, value, count, url: k.link(value),
        lower, c: compact(value), words: lower.split(/[\s/,()\-–]+/).filter(Boolean),
      })
    }
  }

  const sizes = new Map()
  for (const r of cat.rows) if (r.shaftD != null) sizes.set(r.shaftD, (sizes.get(r.shaftD) || 0) + 1)

  const pages = []
  for (const p of cat.pages.values()) {
    if (p.url === '/' || /legal|imprint|privacy|terms/i.test(p.url)) continue
    const parent = p.parent && cat.pages.get(p.parent)
    pages.push({
      id: p.id, title: p.title, url: p.url, section: parent?.title ?? null,
      count: cat.scope(p.id).length, lower: p.title.toLowerCase(), words: p.title.toLowerCase().split(/[\s/&,\-–]+/).filter(Boolean),
    })
  }

  // Spelling vocabulary: entity words and names, page title words. Words of 3+ letters only.
  const vocab = new Map()
  const add = (w, weight) => {
    if (w.length < 3 || /^\d/.test(w)) return
    vocab.set(w, (vocab.get(w) || 0) + weight)
  }
  for (const e of entities) {
    add(e.lower, e.count)
    for (const w of e.words) add(w, e.count)
  }
  for (const p of pages) for (const w of p.words) add(w, 50)

  const popular = [
    ...entities.filter((e) => e.kind === 'brand').sort((a, b) => b.count - a.count).slice(0, 4),
    ...[...sizes].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([d, count]) => sizeEntity(d, count)),
    ...entities.filter((e) => e.kind === 'combination').sort((a, b) => b.count - a.count).slice(0, 2),
    ...entities.filter((e) => e.kind === 'design').sort((a, b) => b.count - a.count).slice(0, 2),
  ].map(publicEntity)

  index = { cat, entities, sizes, pages, vocab: [...vocab], popular }
  return index
}

function sizeEntity(d, count) {
  return {
    kind: 'size', kindLabel: 'Shaft diameter', value: `Ø ${d} mm`, count,
    url: shopLink({ shaft_diameter_mm_min: d, shaft_diameter_mm_max: d }),
  }
}
const publicEntity = ({ kind, kindLabel, value, count, url }) => ({ kind, kindLabel, value, count, url })

// How well an entity name matches the query: whole name, start of the name, start of a word, anywhere.
function entityScore(e, ql, cq) {
  if (e.lower === ql || e.c === cq) return 100
  if (e.lower.startsWith(ql) || e.c.startsWith(cq)) return 70
  if (e.words.some((w) => w.startsWith(ql))) return 50
  if (cq.length >= 3 && e.c.includes(cq)) return 25
  return 0
}

// Damerau-free Levenshtein with an early exit once the distance exceeds max.
function distance(a, b, max) {
  if (Math.abs(a.length - b.length) > max) return max + 1
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j)
  for (let i = 1; i <= a.length; i++) {
    const cur = [i]
    let best = i
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1))
      if (cur[j] < best) best = cur[j]
    }
    if (best > max) return max + 1
    prev = cur
  }
  return prev[b.length]
}

// Replaces each misspelt word (3+ letters, no digits) with the closest common catalogue word.
function correct(q, vocab) {
  let changed = false
  const out = q.split(/\s+/).map((t) => {
    const w = t.toLowerCase()
    if (w.length < 3 || /\d/.test(w)) return t
    if (vocab.some(([v]) => v === w || v.startsWith(w))) return t
    const max = w.length <= 4 ? 1 : 2
    let best = null
    for (const [v, weight] of vocab) {
      const d = distance(w, v, max)
      if (d <= max && (!best || d < best.d || (d === best.d && weight > best.weight))) best = { v, d, weight }
    }
    if (!best) return t
    changed = true
    return best.v
  })
  return changed ? out.join(' ') : null
}

// "25", "25mm", "Ø25", "d 25", "25,5 mm" -> 25 / 25.5
const SIZE_RE = /^(?:ø|⌀|d|dia\.?|shaft)?\s*(\d{1,3}(?:[.,]\d{1,2})?)\s*(?:mm)?$/i

const CARD = ['sku', 'title', 'image', 'refManufacturer', 'series', 'shaftD', 'mpn', 'oemPn', 'materialCombination', 'sealType']
const pick = (p) => Object.fromEntries(CARD.map((k) => [k, p[k] ?? null]))

function suggest(q, scope, idx) {
  const { cat, entities, sizes, pages } = idx
  const ql = q.toLowerCase()
  const cq = compact(q)

  const quick = []
  const size = q.match(SIZE_RE)
  if (size) {
    const d = parseFloat(size[1].replace(',', '.'))
    if (sizes.has(d)) quick.push(sizeEntity(d, sizes.get(d)))
  }
  const scored = entities
    .map((e) => [entityScore(e, ql, cq) + Math.log10(e.count + 1) * 6, entityScore(e, ql, cq), e])
    .filter(([, s]) => s > 0)
    .sort((a, b) => b[0] - a[0])
  // At most two shortcuts of one kind, so one word shows brands, series and materials side by side.
  const perKind = new Map()
  for (const [, , e] of scored) {
    if (quick.length >= QUICK) break
    const n = perKind.get(e.kind) || 0
    if (n >= 2) continue
    perKind.set(e.kind, n + 1)
    quick.push(publicEntity(e))
  }

  const pageHits = pages
    .map((p) => [p.lower === ql ? 100 : p.lower.startsWith(ql) ? 70 : p.words.some((w) => w.startsWith(ql)) ? 50 : 0, p])
    .filter(([s]) => s > 0)
    .sort((a, b) => b[0] - a[0] || b[1].count - a[1].count)
    .slice(0, PAGES)
    .map(([, p]) => ({ title: p.title, url: p.url, section: p.section, count: p.count }))

  const rows = prepare(cat.scope(scope))
  const match = makeMatcher(q)
  const hits = match ? rows.filter(match) : []
  const products = rankRows(hits, q).slice(0, PRODUCTS).map(pick)

  // Inline completion: the shortest well-known name, or the article number, that continues what was typed.
  const candidates = [
    ...scored.slice(0, 20).map(([, , e]) => e.value),
    ...pageHits.map((p) => p.title),
    ...products.flatMap((p) => [p.sku, p.mpn, p.oemPn]),
  ].filter((v) => v && v.length > q.length && v.toLowerCase().startsWith(ql))
  const complete = /^[\d.,\s]+$/.test(q) ? null : candidates.sort((a, b) => a.length - b.length)[0] ?? null

  const exactRow = cat.bySku.get(q.trim().toUpperCase()) || hits.find((p) => p._crefs.includes(cq))
  return { quick, pages: pageHits, products, total: hits.length, complete, exact: exactRow ? pick(exactRow) : null }
}

export function GET(request) {
  const params = new URL(request.url).searchParams
  const q = (params.get('q') || '').trim().slice(0, MAX_QUERY)
  const idx = getIndex()
  const scope = params.get('scope')
  const scopeId = scope && idx.cat.pages.has(scope) ? scope : null

  if (!q) return json({ q, popular: idx.popular, total: idx.cat.rows.length })

  let out = suggest(q, scopeId, idx)
  let corrected = null
  if (!out.total && !out.quick.length && !out.pages.length) {
    corrected = correct(q, idx.vocab)
    if (corrected) out = suggest(corrected, scopeId, idx)
  }
  return json({ q, corrected, ...out })
}
