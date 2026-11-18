#!/usr/bin/env node
// Builds site data from the SAP Parts developer package in content/sap-parts/.
//
// Outputs (all generated, git-ignored):
//   src/generated/site.json          page tree, SEO fields, filter visibility (bundled)
//   public/data/pages/<id>.json      parsed editorial copy per page (fetched on route)
//
// Products are served by the search API (api/search.js), which reads the same package via shared/catalog.mjs.
//
// Fails (exit 1) on integrity errors from the package's acceptance checklist.

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { ATTR_FIELD, eachCsvRecord, imageOf, readCsv as readCsvIn, toFilterDefs, toProduct } from '../shared/catalog.mjs'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SRC = path.join(ROOT, 'content/sap-parts')
const DATA = path.join(SRC, '01_Artikel_und_Filter')
const OUT_GEN = path.join(ROOT, 'src/generated')
const OUT_PUB = path.join(ROOT, 'public/data')

const errors = []
const warnings = []
const t0 = Date.now()

const readCsv = (name) => readCsvIn(DATA, name)

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
  return { seoTitle: meta['SEO-TITEL'], metaDescription: meta['META-BESCHREIBUNG'], sections: classify(sections) }
}

// Word-export casing artefacts in headings.
const fixCase = (s) => s.replace(/\bSap Parts\b/g, 'SAP Parts').replace(/^Vat\b/, 'VAT')

// Assigns a render "kind" to each section:
//   intro     — opening paragraph, shown as the page lead
//   group     — label with no body that introduces the following sections
//   checklist — "information we need" list, split from a "…: a; b; c." sentence
//   cta       — closing engineering enquiry call to action
function classify(sections) {
  for (const s of sections) if (s.h) s.h = fixCase(s.h)

  // Two bodiless headings in a row: the second is really a value line (e.g. names under "Managing Directors").
  for (let i = 0; i < sections.length - 1; i++) {
    const a = sections[i]
    const b = sections[i + 1]
    if (!a.blocks.length && !b.blocks.length) {
      a.blocks.push({ p: b.h })
      sections.splice(i + 1, 1)
    }
  }

  return sections.map((s, i) => {
    const out = { ...s }
    if (i === 0 && (!s.h || /^technical introduction$/i.test(s.h))) {
      out.kind = 'intro'
      out.h = null
    } else if (!s.blocks.length) out.kind = 'group'
    else if (/^engineering enquiry$/i.test(s.h)) out.kind = 'cta'
    else if (/^technical information we need$/i.test(s.h)) {
      out.kind = 'checklist'
      out.blocks = s.blocks.flatMap((b) => {
        const m = b.p && b.p.match(/^(.*?:)\s*(.+)$/)
        if (!m || !m[2].includes(';')) return [b]
        const items = m[2].replace(/\.$/, '').split(/;\s*/).map((x) => x.charAt(0).toUpperCase() + x.slice(1))
        return [{ p: m[1] }, { ul: items }]
      })
    }
    return out
  })
}

// ---------- Load ----------

const categories = readCsv('categories.csv')
const directory = readCsv('Seitenverzeichnis.csv')
const filterDefs = readCsv('filter_definitions.csv')
const categoryFilters = readCsv('category_filters.csv')
const links = readCsv('product_category_links.csv')

const dirById = new Map(directory.map((d) => [d.page_id, d]))

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

const seenSku = new Set()
const counts = new Map() // page id -> own product count
const presentAttrs = new Map() // page id -> Set(field)

eachCsvRecord(DATA, 'products_import.csv.gz', (get) => {
  const sku = get('sap_article_number')
  if (!sku) { errors.push(`Row ${get('record_id')} has no sap_article_number`); return }
  if (seenSku.has(sku)) { errors.push(`Duplicate SKU ${sku}`); return }
  seenSku.add(sku)

  const pageId = linkBySku.get(sku)
  if (!pageId) { errors.push(`SKU ${sku} has no primary page link`); return }
  const own = get('category_page_id')
  if (own && own !== pageId) errors.push(`SKU ${sku} category mismatch ${own} vs ${pageId}`)

  const row = toProduct(get, (w) => warnings.push(w))
  counts.set(pageId, (counts.get(pageId) || 0) + 1)
  if (!presentAttrs.has(pageId)) presentAttrs.set(pageId, new Set())
  const present = presentAttrs.get(pageId)
  for (const [k, v] of Object.entries(row)) if (v != null) present.add(k)
})

for (const sku of linkBySku.keys()) if (!seenSku.has(sku)) errors.push(`Link for unknown SKU ${sku}`)

// Roll product counts and attribute presence up the tree.
const subtree = (id) => [id, ...pages.get(id).children.flatMap(subtree)]
const withProducts = new Map()
for (const p of pages.values()) {
  p.ownProducts = counts.get(p.id) || 0
  withProducts.set(p.id, subtree(p.id).filter((x) => counts.has(x)))
  p.productCount = withProducts.get(p.id).reduce((n, x) => n + counts.get(x), 0)
}

// ---------- Filters ----------

const defById = new Map(filterDefs.map((f) => [f.attribute_id, f]))
const filters = toFilterDefs(filterDefs)
for (const f of filters) if (!(f.id in ATTR_FIELD)) warnings.push(`Filter ${f.id} has no field mapping`)

for (const cf of categoryFilters) {
  const p = pages.get(cf.page_id)
  if (!p) { errors.push(`category_filters.csv: unknown page ${cf.page_id}`); continue }
  if (!defById.has(cf.attribute_id)) { errors.push(`category_filters.csv: unknown attribute ${cf.attribute_id}`); continue }
  const field = ATTR_FIELD[cf.attribute_id]
  const hasData = field ? withProducts.get(p.id).some((s) => presentAttrs.get(s)?.has(field)) : p.productCount > 0
  if (cf.display_if_data_present === 'true' && !hasData) continue
  p.filters.push({ id: cf.attribute_id, order: Number(cf.display_order) || 0 })
}
for (const p of pages.values()) p.filters = p.filters.sort((a, b) => a.order - b.order).map((f) => f.id)

// ---------- Write ----------

fs.rmSync(OUT_PUB, { recursive: true, force: true })
fs.mkdirSync(path.join(OUT_PUB, 'pages'), { recursive: true })
fs.mkdirSync(OUT_GEN, { recursive: true })

for (const p of pages.values()) {
  const file = p.textFile && path.join(SRC, p.textFile)
  if (!file || !fs.existsSync(file)) { errors.push(`${p.id} text file missing: ${p.textFile}`); continue }
  const parsed = parsePageText(fs.readFileSync(file, 'utf8'), p.title)
  if (!parsed.sections.length) warnings.push(`${p.id} has no body text`)
  fs.writeFileSync(path.join(OUT_PUB, 'pages', `${p.id}.json`), JSON.stringify({ id: p.id, sections: parsed.sections }))
}


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
console.log(`[content] ${pages.size} pages ${JSON.stringify(types)}, ${seenSku.size} products on ${counts.size} pages, ${emptyListings} listing pages without products (${Date.now() - t0} ms)`)
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
