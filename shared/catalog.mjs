// Node-only loader for the SAP Parts developer package (content/sap-parts/).
// Used by the content build script and by the search API so both apply the same normalisation.
import fs from 'node:fs'
import path from 'node:path'
import zlib from 'node:zlib'

export const DATA_DIR = 'content/sap-parts/01_Artikel_und_Filter'

// ---------- CSV ----------

// Streams CSV rows as arrays of cells. Fields are sliced from the source text (no per-character
// concatenation), which keeps parsing of the 52 MB product file fast and memory-light.
export function eachCsvRow(text, onRow) {
  let i = text.charCodeAt(0) === 0xfeff ? 1 : 0
  const n = text.length
  while (i < n) {
    const row = []
    for (;;) {
      let value
      if (text.charCodeAt(i) === 34) {
        // Quoted field: find the closing quote, skipping doubled quotes.
        let j = i + 1
        let doubled = false
        for (;;) {
          j = text.indexOf('"', j)
          if (j === -1) { j = n; break }
          if (text.charCodeAt(j + 1) === 34) { doubled = true; j += 2; continue }
          break
        }
        value = text.slice(i + 1, j)
        if (doubled) value = value.replaceAll('""', '"')
        i = j + 1
      } else {
        let j = i
        while (j < n) {
          const c = text.charCodeAt(j)
          if (c === 44 || c === 10 || c === 13) break
          j++
        }
        value = text.slice(i, j)
        i = j
      }
      row.push(value.trim())
      const c = text.charCodeAt(i)
      if (c === 44) { i++; continue }
      if (c === 13) i++
      if (text.charCodeAt(i) === 10) i++
      break
    }
    if (row.length > 1 || row[0] !== '') onRow(row)
  }
}

export function parseCsv(text) {
  let head = null
  const out = []
  eachCsvRow(text, (r) => {
    if (!head) head = r
    else out.push(Object.fromEntries(head.map((h, k) => [h, r[k] ?? ''])))
  })
  return out
}

const readText = (dir, name) => {
  const buf = fs.readFileSync(path.join(dir, name))
  return (name.endsWith('.gz') ? zlib.gunzipSync(buf) : buf).toString('utf8')
}

// Calls onRow(get) per data row; get(column) reads a cell by header name. Avoids building row objects.
export function eachCsvRecord(dir, name, onRecord) {
  let idx = null
  eachCsvRow(readText(dir, name), (r) => {
    if (!idx) { idx = new Map(r.map((h, k) => [h, k])); return }
    onRecord((col) => r[idx.get(col)] ?? '')
  })
}

export const readCsv = (dir, name) => parseCsv(readText(dir, name))

// ---------- Normalisation (per 04_Anleitung) ----------

const MATERIAL = {
  CAR: 'Carbon', Carbon: 'Carbon',
  CER: 'Ceramic', Ceramic: 'Ceramic',
  TC: 'Tungsten Carbide', 'Tungsten Carbide': 'Tungsten Carbide',
  SIC: 'SiC', SiC: 'SiC',
  SICAR: 'SiCAR', SiCAR: 'SiCAR',
}
const num = (v) => {
  if (v === '' || v == null) return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}
const str = (v) => v || null

export const imageOf = (p) => (p ? `/img/category/${path.basename(p, path.extname(p))}.webp` : null)

// Facet attribute id (filter_definitions.csv) -> product row field
export const ATTR_FIELD = {
  shaft_diameter_mm: 'shaftD', stationary_seat_od_mm: 'seatOd', installation_length_mm: 'installLength',
  seal_type: 'sealType', seal_series: 'series', seal_configuration: 'configuration', spring_design: 'springDesign',
  rotating_face_material: 'rotatingFace', stationary_face_material: 'stationaryFace', secondary_seal_material: 'secondarySeal',
  material_combination: 'materialCombination', balanced_design: 'balance', stationary_seat_type: 'seatType', application: 'application',
  manufacturer_display: 'refManufacturer', equipment_manufacturer: 'equipmentManufacturer',
}

export function toFilterDefs(rows) {
  return rows.map((f) => ({
    id: f.attribute_id,
    field: ATTR_FIELD[f.attribute_id] ?? null,
    label: f.label_en,
    type: f.data_type,
    unit: f.unit || null,
    typeahead: /typeahead/i.test(f.usage_notes),
    note: f.usage_notes,
  }))
}

// One product record from products_import.csv; get(column) reads a cell. technical_drawing is intentionally dropped:
// its values reference third-party catalogue PDFs.
export function toProduct(get, warn = () => {}) {
  const sku = get('sap_article_number')
  const material = (v, field) => {
    if (!v) return null
    if (MATERIAL[v]) return MATERIAL[v]
    warn(`Unmapped ${field} "${v}" (${sku})`)
    return v
  }
  if (get('shaft_diameter_mm') && num(get('facet_shaft_diameter_mm')) == null) warn(`SKU ${sku} invalid shaft diameter "${get('shaft_diameter_mm')}"`)
  return {
    sku,
    title: get('product_title'),
    description: str(get('product_description')),
    sealType: str(get('seal_type')),
    series: str(get('seal_series')),
    refManufacturer: str(get('manufacturer_display')),
    mpn: str(get('manufacturer_part_number')),
    oemPn: str(get('oem_part_number')),
    equipmentManufacturer: str(get('equipment_manufacturer')),
    equipmentModel: str(get('equipment_model')),
    shaftD: num(get('facet_shaft_diameter_mm')),
    seatOd: num(get('facet_stationary_seat_od_mm')),
    installLength: num(get('facet_installation_length_mm')),
    otherDims: str(get('other_dimensions_mm')),
    rotatingFace: material(get('facet_rotating_face_material') || get('rotating_face_material'), 'rotating face'),
    stationaryFace: material(get('facet_stationary_face_material') || get('stationary_face_material'), 'stationary face'),
    secondarySeal: str(get('facet_secondary_seal_material') || get('secondary_seal_material')),
    materialCombination: str(get('facet_material_combination') || get('material_combination')),
    configuration: str(get('seal_configuration')),
    balance: str(get('balanced_design')),
    springDesign: str(get('spring_design')),
    seatType: str(get('stationary_seat_type')),
    application: str(get('application')),
    image: imageOf(get('product_image')),
    search: (get('facet_search_text') || '').toLowerCase(),
  }
}

// ---------- Page tree ----------

// Builds id -> page with parent/children. parent_breadcrumb holds only the parent's title,
// so the parent's full path is derived from the page's own breadcrumb.
export function buildTree(categories, onError = () => {}) {
  const pages = new Map()
  const byCrumb = new Map()
  for (const c of categories) {
    if (byCrumb.has(c.breadcrumb)) onError(`Duplicate breadcrumb "${c.breadcrumb}"`)
    byCrumb.set(c.breadcrumb, c.page_id)
    pages.set(c.page_id, { row: c, id: c.page_id, url: c.page_url, title: c.page_title, parent: null, children: [] })
  }
  for (const p of pages.values()) {
    const crumb = p.row.breadcrumb
    if (!crumb.includes(' > ')) continue
    const parentId = byCrumb.get(crumb.split(' > ').slice(0, -1).join(' > '))
    if (!parentId) { onError(`${p.id} parent of "${crumb}" not found`); continue }
    if (p.row.parent_breadcrumb && pages.get(parentId).title !== p.row.parent_breadcrumb) onError(`${p.id} parent title mismatch "${p.row.parent_breadcrumb}"`)
    p.parent = parentId
    pages.get(parentId).children.push(p.id)
  }
  return pages
}

export const subtreeOf = (pages, id) => [id, ...pages.get(id).children.flatMap((c) => subtreeOf(pages, c))]

// ---------- Server catalogue ----------

let catalog = null

// Loads and indexes every product once per process (Fluid Compute reuses warm instances).
export function getCatalog(root = process.cwd()) {
  if (catalog) return catalog
  const t0 = Date.now()
  const dir = path.join(root, DATA_DIR)
  const pages = buildTree(readCsv(dir, 'categories.csv'))
  const defs = toFilterDefs(readCsv(dir, 'filter_definitions.csv'))
  const pageBySku = new Map()
  for (const l of readCsv(dir, 'product_category_links.csv')) if (l.relationship === 'primary') pageBySku.set(l.sap_article_number, l.page_id)

  const rows = []
  const bySku = new Map()
  const byPage = new Map()
  eachCsvRecord(dir, 'products_import.csv.gz', (get) => {
    const sku = get('sap_article_number')
    const pageId = pageBySku.get(sku)
    if (!pageId || bySku.has(sku)) return
    const p = toProduct(get)
    p.pageId = pageId
    rows.push(p)
    bySku.set(p.sku, p)
    if (!byPage.has(pageId)) byPage.set(pageId, [])
    byPage.get(pageId).push(p)
  })

  const scopes = new Map()
  const scope = (id) => {
    if (!id || !pages.has(id)) return rows
    if (!scopes.has(id)) scopes.set(id, subtreeOf(pages, id).flatMap((x) => byPage.get(x) || []))
    return scopes.get(id)
  }

  // Variant family: same primary page and seal series.
  const families = new Map()
  const familyOf = (p) => {
    const key = `${p.pageId}|${p.series ?? ''}`
    if (!families.has(key)) families.set(key, rows.filter((r) => r.pageId === p.pageId && r.series === p.series))
    return families.get(key)
  }

  catalog = { rows, bySku, pages, defs, scope, familyOf, loadMs: Date.now() - t0 }
  return catalog
}
