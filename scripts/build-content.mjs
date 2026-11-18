#!/usr/bin/env node
// Builds site data from the SAP Parts developer package in content/sap-parts/.
//
// Outputs (all generated, git-ignored):
//   src/generated/site.json          page tree, SEO fields, filter visibility (bundled)
//   public/data/pages/<id>.json      parsed editorial copy per page (fetched on route)
//   public/data/products/<id>.json   compact product rows per primary category page
//   public/data/sku-index.json       sap_article_number -> primary page id
//
// Fails (exit 1) on integrity errors from the package's acceptance checklist.

import fs from 'node:fs'
import path from 'node:path'
import zlib from 'node:zlib'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SRC = path.join(ROOT, 'content/sap-parts')
const DATA = path.join(SRC, '01_Artikel_und_Filter')
const OUT_GEN = path.join(ROOT, 'src/generated')
const OUT_PUB = path.join(ROOT, 'public/data')

const errors = []
const warnings = []
const t0 = Date.now()

// ---------- CSV ----------

function parseCsv(text) {
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1)
  const rows = []
  let row = []
  let field = ''
  let quoted = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++ } else quoted = false
      } else field += c
    } else if (c === '"') quoted = true
    else if (c === ',') { row.push(field); field = '' }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++
      row.push(field); field = ''
      if (row.length > 1 || row[0] !== '') rows.push(row)
      row = []
    } else field += c
  }
  if (field || row.length) { row.push(field); rows.push(row) }
  const [head, ...body] = rows
  return body.map((r) => Object.fromEntries(head.map((h, i) => [h.trim(), (r[i] ?? '').trim()])))
}

const readCsv = (name) => {
  const file = path.join(DATA, name)
  const buf = fs.readFileSync(file)
  return parseCsv((name.endsWith('.gz') ? zlib.gunzipSync(buf) : buf).toString('utf8'))
}

// ---------- Editorial text files ----------

const HEADER_KEYS = new Set(['SEO-TITEL', 'META-BESCHREIBUNG'])

// Plain-text page files carry no markup. Blocks are separated by blank lines:
// "• " starts a list item; a short line without terminal punctuation or colon is a heading.
function parsePageText(raw, title) {
  const lines = raw.replace(/\r/g, '').split('\n')
  const meta = {}
  let i = 0
  for (; i < lines.length; i++) {
    const l = lines[i].trim()
    if (l === 'SEITENTEXT') { i++; break }
    if (HEADER_KEYS.has(l)) meta[l] = (lines[++i] || '').trim()
  }
  const blocks = lines.slice(i).map((l) => l.trim()).filter(Boolean)
  if (blocks[0] === title) blocks.shift()

  const isHeading = (b) =>
    !/[.!?:;]$/.test(b) && !b.includes(': ') && b.split(/\s+/).length <= 12 && /^[A-Z0-9]/.test(b)

  const sections = []
  let cur = { h: null, blocks: [] }
  for (const b of blocks) {
    if (b.startsWith('•')) {
      const item = b.replace(/^•\s*/, '')
      const last = cur.blocks[cur.blocks.length - 1]
      if (last?.ul) last.ul.push(item)
      else cur.blocks.push({ ul: [item] })
    } else if (isHeading(b)) {
      if (cur.h || cur.blocks.length) sections.push(cur)
      cur = { h: b, blocks: [] }
    } else cur.blocks.push({ p: b })
  }
  if (cur.h || cur.blocks.length) sections.push(cur)
  return { seoTitle: meta['SEO-TITEL'], metaDescription: meta['META-BESCHREIBUNG'], sections }
}

// ---------- Material normalisation (per 04_Anleitung) ----------

const MATERIAL = {
  CAR: 'Carbon', Carbon: 'Carbon',
  CER: 'Ceramic', Ceramic: 'Ceramic',
  TC: 'Tungsten Carbide', 'Tungsten Carbide': 'Tungsten Carbide',
  SIC: 'SiC', SiC: 'SiC',
  SICAR: 'SiCAR', SiCAR: 'SiCAR',
}
const material = (v, field, sku) => {
  if (!v) return null
  if (MATERIAL[v]) return MATERIAL[v]
  warnings.push(`Unmapped ${field} "${v}" (${sku})`)
  return v
}
const num = (v) => {
  if (v === '' || v == null) return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}
const str = (v) => v || null

// ---------- Load ----------

const categories = readCsv('categories.csv')
const directory = readCsv('Seitenverzeichnis.csv')
const filterDefs = readCsv('filter_definitions.csv')
const categoryFilters = readCsv('category_filters.csv')
const links = readCsv('product_category_links.csv')
const products = readCsv('products_import.csv.gz')

const dirById = new Map(directory.map((d) => [d.page_id, d]))
const imageOf = (p) => (p ? `/img/category/${path.basename(p, path.extname(p))}.webp` : null)

// ---------- Pages ----------

const pages = new Map()
const byCrumb = new Map()
const byUrl = new Map()

for (const c of categories) {
  const d = dirById.get(c.page_id)
  if (!d) errors.push(`${c.page_id} missing from Seitenverzeichnis.csv`)
  if (byUrl.has(c.page_url)) errors.push(`Duplicate route ${c.page_url} (${byUrl.get(c.page_url)}, ${c.page_id})`)
  byUrl.set(c.page_url, c.page_id)
  if (byCrumb.has(c.breadcrumb)) errors.push(`Duplicate breadcrumb "${c.breadcrumb}"`)
  byCrumb.set(c.breadcrumb, c.page_id)

  const image = imageOf(c.category_image)
  if (image && !fs.existsSync(path.join(ROOT, 'public', image))) errors.push(`${c.page_id} image not found: ${image}`)

  pages.set(c.page_id, {
    id: c.page_id,
    url: c.page_url,
    title: c.page_title,
    type: c.page_type,
    area: c.main_area,
    breadcrumb: c.breadcrumb,
    // parent_breadcrumb holds only the parent's title; derive its full path from our own breadcrumb.
    parentCrumb: c.breadcrumb.includes(' > ') ? c.breadcrumb.split(' > ').slice(0, -1).join(' > ') : null,
    parentTitle: c.parent_breadcrumb || null,
    parent: null,
    children: [],
    image,
    seo: {
      title: d?.meta_title || `${c.page_title} | SAP Parts`,
      description: d?.meta_description || '',
      canonical: d?.seo_canonical_path || c.page_url,
    },
    textFile: d?.textdatei,
    ownProducts: 0,
    productCount: 0,
    shards: [],
    filters: [],
  })
}

for (const p of pages.values()) {
  if (!p.parentCrumb) continue
  const parentId = byCrumb.get(p.parentCrumb)
  if (!parentId) { errors.push(`${p.id} parent "${p.parentCrumb}" not found`); continue }
  if (p.parentTitle && pages.get(parentId).title !== p.parentTitle) errors.push(`${p.id} parent title mismatch "${p.parentTitle}"`)
  p.parent = parentId
  pages.get(parentId).children.push(p.id)
}

// ---------- Products ----------

const linkBySku = new Map()
for (const l of links) {
  if (l.relationship !== 'primary') continue
  if (linkBySku.has(l.sap_article_number)) errors.push(`SKU ${l.sap_article_number} has more than one primary page`)
  if (!pages.has(l.page_id)) errors.push(`Link to unknown page ${l.page_id}`)
  else if (pages.get(l.page_id).url !== l.page_url) errors.push(`Link URL mismatch for ${l.sap_article_number}`)
  linkBySku.set(l.sap_article_number, l.page_id)
}

// Compact row layout; field order documented in each shard's "fields" array.
const FIELDS = [
  'sku', 'title', 'sealType', 'series', 'refManufacturer', 'mpn', 'oemPn', 'equipmentManufacturer', 'equipmentModel',
  'shaftD', 'seatOd', 'installLength', 'otherDims', 'rotatingFace', 'stationaryFace', 'secondarySeal',
  'materialCombination', 'configuration', 'balance', 'springDesign', 'seatType', 'application', 'image', 'search',
]
// Facet attribute id (filter_definitions.csv) -> row field
const ATTR_FIELD = {
  shaft_diameter_mm: 'shaftD', stationary_seat_od_mm: 'seatOd', installation_length_mm: 'installLength',
  seal_type: 'sealType', seal_series: 'series', seal_configuration: 'configuration', spring_design: 'springDesign',
  rotating_face_material: 'rotatingFace', stationary_face_material: 'stationaryFace', secondary_seal_material: 'secondarySeal',
  material_combination: 'materialCombination', balanced_design: 'balance', stationary_seat_type: 'seatType', application: 'application',
  manufacturer_display: 'refManufacturer', equipment_manufacturer: 'equipmentManufacturer',
}

const seenSku = new Set()
const shards = new Map()
const skuIndex = {}
const presentAttrs = new Map() // page id -> Set(field)

for (const r of products) {
  const sku = r.sap_article_number
  if (!sku) { errors.push(`Row ${r.record_id} has no sap_article_number`); continue }
  if (seenSku.has(sku)) { errors.push(`Duplicate SKU ${sku}`); continue }
  seenSku.add(sku)

  const pageId = linkBySku.get(sku)
  if (!pageId) { errors.push(`SKU ${sku} has no primary page link`); continue }
  if (r.category_page_id && r.category_page_id !== pageId) errors.push(`SKU ${sku} category mismatch ${r.category_page_id} vs ${pageId}`)
  if (r.shaft_diameter_mm && num(r.facet_shaft_diameter_mm) == null) warnings.push(`SKU ${sku} invalid shaft diameter "${r.shaft_diameter_mm}"`)

  const row = {
    sku,
    title: r.product_title,
    sealType: str(r.seal_type),
    series: str(r.seal_series),
    refManufacturer: str(r.manufacturer_display),
    mpn: str(r.manufacturer_part_number),
    oemPn: str(r.oem_part_number),
    equipmentManufacturer: str(r.equipment_manufacturer),
    equipmentModel: str(r.equipment_model),
    shaftD: num(r.facet_shaft_diameter_mm),
    seatOd: num(r.facet_stationary_seat_od_mm),
    installLength: num(r.facet_installation_length_mm),
    otherDims: str(r.other_dimensions_mm),
    rotatingFace: material(r.facet_rotating_face_material || r.rotating_face_material, 'rotating face', sku),
    stationaryFace: material(r.facet_stationary_face_material || r.stationary_face_material, 'stationary face', sku),
    secondarySeal: str(r.facet_secondary_seal_material || r.secondary_seal_material),
    materialCombination: str(r.facet_material_combination || r.material_combination),
    configuration: str(r.seal_configuration),
    balance: str(r.balanced_design),
    springDesign: str(r.spring_design),
    seatType: str(r.stationary_seat_type),
    application: str(r.application),
    image: imageOf(r.product_image),
    search: (r.facet_search_text || '').toLowerCase(),
  }
  // technical_drawing intentionally dropped: values reference third-party catalogue PDFs.

  if (!shards.has(pageId)) shards.set(pageId, [])
  shards.get(pageId).push(FIELDS.map((f) => row[f]))
  skuIndex[sku] = pageId

  if (!presentAttrs.has(pageId)) presentAttrs.set(pageId, new Set())
  const present = presentAttrs.get(pageId)
  for (const f of FIELDS) if (row[f] != null) present.add(f)
}

for (const sku of linkBySku.keys()) if (!seenSku.has(sku)) errors.push(`Link for unknown SKU ${sku}`)

// Roll product counts, shards and attribute presence up the tree.
const subtree = (id) => [id, ...pages.get(id).children.flatMap(subtree)]
for (const p of pages.values()) {
  p.ownProducts = shards.get(p.id)?.length || 0
  const ids = subtree(p.id).filter((x) => shards.has(x))
  p.shards = ids
  p.productCount = ids.reduce((n, x) => n + shards.get(x).length, 0)
}

// ---------- Filters ----------

const defById = new Map(filterDefs.map((f) => [f.attribute_id, f]))
const filters = filterDefs.map((f) => ({
  id: f.attribute_id,
  field: ATTR_FIELD[f.attribute_id] ?? null,
  label: f.label_en,
  type: f.data_type,
  unit: f.unit || null,
  typeahead: /typeahead/i.test(f.usage_notes),
  note: f.usage_notes,
}))
for (const f of filters) if (!(f.id in ATTR_FIELD)) warnings.push(`Filter ${f.id} has no field mapping`)

for (const cf of categoryFilters) {
  const p = pages.get(cf.page_id)
  if (!p) { errors.push(`category_filters.csv: unknown page ${cf.page_id}`); continue }
  if (!defById.has(cf.attribute_id)) { errors.push(`category_filters.csv: unknown attribute ${cf.attribute_id}`); continue }
  const field = ATTR_FIELD[cf.attribute_id]
  const hasData = field ? p.shards.some((s) => presentAttrs.get(s)?.has(field)) : p.productCount > 0
  if (cf.display_if_data_present === 'true' && !hasData) continue
  p.filters.push({ id: cf.attribute_id, order: Number(cf.display_order) || 0 })
}
for (const p of pages.values()) p.filters = p.filters.sort((a, b) => a.order - b.order).map((f) => f.id)

// ---------- Write ----------

fs.rmSync(OUT_PUB, { recursive: true, force: true })
fs.mkdirSync(path.join(OUT_PUB, 'pages'), { recursive: true })
fs.mkdirSync(path.join(OUT_PUB, 'products'), { recursive: true })
fs.mkdirSync(OUT_GEN, { recursive: true })

for (const p of pages.values()) {
  const file = p.textFile && path.join(SRC, p.textFile)
  if (!file || !fs.existsSync(file)) { errors.push(`${p.id} text file missing: ${p.textFile}`); continue }
  const parsed = parsePageText(fs.readFileSync(file, 'utf8'), p.title)
  if (!parsed.sections.length) warnings.push(`${p.id} has no body text`)
  fs.writeFileSync(path.join(OUT_PUB, 'pages', `${p.id}.json`), JSON.stringify({ id: p.id, sections: parsed.sections }))
}

for (const [id, rows] of shards) {
  fs.writeFileSync(path.join(OUT_PUB, 'products', `${id}.json`), JSON.stringify({ page: id, fields: FIELDS, rows }))
}
fs.writeFileSync(path.join(OUT_PUB, 'sku-index.json'), JSON.stringify(skuIndex))

const site = {
  generated: new Date().toISOString(),
  totals: { pages: pages.size, products: seenSku.size },
  filters,
  pages: [...pages.values()].map(({ parentCrumb: _pc, parentTitle: _pt, textFile: _tf, breadcrumb: _bc, ...p }) => p),
}
fs.writeFileSync(path.join(OUT_GEN, 'site.json'), JSON.stringify(site))

// ---------- Report ----------

const types = {}
for (const p of pages.values()) types[p.type] = (types[p.type] || 0) + 1
const emptyListings = [...pages.values()].filter((p) => p.type === 'listing' && p.productCount === 0).length
console.log(`[content] ${pages.size} pages ${JSON.stringify(types)}, ${seenSku.size} products in ${shards.size} shards, ${emptyListings} listing pages without products (${Date.now() - t0} ms)`)
if (warnings.length) {
  console.warn(`[content] ${warnings.length} warning(s):`)
  for (const w of warnings.slice(0, 20)) console.warn('  - ' + w)
  if (warnings.length > 20) console.warn(`  … ${warnings.length - 20} more`)
}
if (errors.length) {
  console.error(`[content] ${errors.length} error(s):`)
  for (const e of errors.slice(0, 50)) console.error('  - ' + e)
  process.exit(1)
}
