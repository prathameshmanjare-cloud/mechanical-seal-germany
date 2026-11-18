#!/usr/bin/env node
// Automated go-live checks for the data, API and build output.
// Numbered items follow the acceptance checklist in content/sap-parts/04_Anleitung/Technische_Importhinweise.txt.
// Run after a build: `npm run qa` (builds first). Exits 1 if any automated check fails.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { DATA_DIR, eachCsvRecord, getCatalog, readCsv } from '../shared/catalog.mjs'
import { compute, prepare, readState } from '../shared/search.mjs'
import { GET as searchApi } from '../api/search.js'
import { GET as productApi } from '../api/product.js'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DIST = path.join(ROOT, 'dist')
const results = []
const check = (id, title, pass, detail) => results.push({ id, title, status: pass === null ? 'MANUAL' : pass ? 'PASS' : 'FAIL', detail })

const cat = getCatalog(ROOT)
const site = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/generated/site.json'), 'utf8'))
const defs = new Map(cat.defs.map((d) => [d.id, d]))
const rows = prepare(cat.rows)
const allIds = [...defs.keys()]
const run = (query) => compute(rows, readState(new URLSearchParams(query), allIds, defs), [], defs).results
const api = async (handler, query) => (await handler(new Request(`http://qa/api?${query}`))).json()

// 1. Every article resolves by SKU to exactly one primary category page.
{
  const primaries = new Map()
  for (const l of readCsv(path.join(ROOT, DATA_DIR), 'product_category_links.csv')) {
    if (l.relationship === 'primary') primaries.set(l.sap_article_number, (primaries.get(l.sap_article_number) || 0) + 1)
  }
  let csvRows = 0
  eachCsvRecord(path.join(ROOT, DATA_DIR), 'products_import.csv.gz', () => csvRows++)
  const multi = [...primaries.values()].filter((n) => n !== 1).length
  const missing = cat.rows.filter((r) => !cat.pages.has(r.pageId)).length
  const sample = await api(productApi, `sku=${encodeURIComponent(cat.rows[1234].sku)}`)
  check(1, 'Every article resolves to exactly one primary page', multi === 0 && missing === 0 && cat.rows.length === csvRows && sample.product?.pageId === cat.rows[1234].pageId,
    `${cat.rows.length}/${csvRows} articles loaded, ${multi} with ≠1 primary link, ${missing} pointing to unknown pages`)
}

// 2. Every mapped page id resolves to a route; /shop/other/ registered.
{
  const missingShell = site.pages.filter((p) => !fs.existsSync(path.join(DIST, p.url === '/' ? '' : p.url, 'index.html'))).map((p) => p.id)
  const other = site.pages.find((p) => p.url === '/shop/other/')
  check(2, 'Every page id has a route; /shop/other/ registered', missingShell.length === 0 && other?.productCount === 16278,
    `${site.pages.length} pages, ${missingShell.length} without a built route${missingShell.length ? ` (${missingShell.slice(0, 5).join(', ')})` : ''}; /shop/other/ holds ${other?.productCount ?? 0} articles`)
}

// 3. No orphan pages or duplicate routes.
{
  const urls = site.pages.map((p) => p.url)
  const dupes = urls.filter((u, i) => urls.indexOf(u) !== i)
  const byId = new Map(site.pages.map((p) => [p.id, p]))
  const seen = new Set()
  const walk = (id) => { seen.add(id); byId.get(id).children.forEach(walk) }
  site.pages.filter((p) => !p.parent).forEach((p) => walk(p.id))
  const tops = site.pages.filter((p) => !p.parent).map((p) => p.title)
  check(3, 'No orphan pages or duplicate routes', dupes.length === 0 && seen.size === site.pages.length,
    `${dupes.length} duplicate URLs; ${seen.size}/${site.pages.length} pages reachable from top level (${tops.join(', ')})`)
}

// 4. Product data exposes diameter, both faces and elastomer independently.
{
  const { product: p } = await api(productApi, 'sku=SAP-MSP-TYP-13-13N-CAR-CER-NBR-D20')
  const src = fs.readFileSync(path.join(ROOT, 'src/pages/ProductPage.jsx'), 'utf8')
  const labels = ['Shaft diameter d1', 'Rotating face', 'Stationary face', 'Secondary seal'].every((l) => src.includes(`'${l}'`))
  check(4, 'Diameter, rotating face, stationary face and elastomer shown separately',
    p.shaftD === 20 && p.rotatingFace === 'Carbon' && p.stationaryFace === 'Ceramic' && p.secondarySeal === 'NBR' && labels,
    `API fields: shaftD=${p.shaftD}, rotatingFace=${p.rotatingFace}, stationaryFace=${p.stationaryFace}, secondarySeal=${p.secondarySeal}; product page renders each as its own row`)
}

// 5. Numeric filter: 20 mm matches 20, never 200.
{
  const range = run('shaft_diameter_mm_min=20&shaft_diameter_mm_max=20')
  const text = run('q=20')
  const exact = cat.rows.filter((r) => r.shaftD === 20).length
  const apiCount = (await api(searchApi, 'shaft_diameter_mm_min=20&shaft_diameter_mm_max=20')).count
  check(5, 'Numeric diameter filter: 20 mm never matches 200 mm',
    range.every((r) => r.shaftD === 20) && range.length === exact && apiCount === exact && !text.some((r) => r.shaftD === 200 && !/(^|\D)20(\D|$)/.test(r.search)),
    `range 20–20: ${range.length} articles (expected ${exact}), API ${apiCount}; text "20": ${text.length} hits, none matched only via 200`)
}

// 6. Material combination filters respect all three component materials.
{
  const q = 'rotating_face_material=Carbon&stationary_face_material=SiC&secondary_seal_material=FKM'
  const res = run(q)
  const expected = cat.rows.filter((r) => r.rotatingFace === 'Carbon' && r.stationaryFace === 'SiC' && r.secondarySeal === 'FKM').length
  check(6, 'Material filters respect all three components',
    res.length === expected && res.every((r) => r.rotatingFace === 'Carbon' && r.stationaryFace === 'SiC' && r.secondarySeal === 'FKM'),
    `Carbon / SiC / FKM: ${res.length} articles (expected ${expected}), all matching on every component`)
}

// 7. Query by part number and SKU finds the records.
{
  const probes = [
    ['SKU (exact)', 'SAP-MSP-TYP-13-13N-CAR-CER-NBR-D20', 'SAP-MSP-TYP-13-13N-CAR-CER-NBR-D20'],
    ['SKU (lower case)', 'sap-msp-typ-13-13n-car-cer-nbr-d20', 'SAP-MSP-TYP-13-13N-CAR-CER-NBR-D20'],
    ['Manufacturer part no.', 'GD 95 / 0158', 'SAP-CSP-GD-95-CAR-CER-NBR-D15P875'],
    ['OEM part no.', '9612903601', 'SAP-OTH-LKH-SIC-SIC-FKM-ALFA-LAVAL'],
    ['Equipment model', 'HS18-20', 'SAP-COMPRE-COMPRESSOR-EQUIPME-SIC-SIC-FKM-APV'],
    ['Series alias', 'typ 13/13n', 'SAP-MSP-TYP-13-13N-CAR-CER-NBR-D20'],
  ]
  const misses = probes.filter(([, q, sku]) => !run(`q=${encodeURIComponent(q)}`).some((r) => r.sku === sku)).map(([l]) => l)
  const exact = (await api(searchApi, 'q=sap-msp-typ-13-13n-car-cer-nbr-d20')).exact?.sku
  check(7, 'Search by SKU, part number, OEM number and model', misses.length === 0 && exact === 'SAP-MSP-TYP-13-13N-CAR-CER-NBR-D20',
    misses.length ? `not found: ${misses.join(', ')}` : `${probes.map(([l]) => l).join(', ')} all found; exact SKU flagged for direct link`)
}

// 8. Missing values are omitted from facets, never defaulted.
{
  const res = await api(searchApi, `facets=${allIds.join(',')}`)
  const bad = []
  for (const [id, f] of Object.entries(res.facets)) {
    if (Array.isArray(f)) for (const v of f) if (!v.value || /^(unknown|n\/a|null|undefined|-)$/i.test(v.value)) bad.push(`${id}:"${v.value}"`)
  }
  const withD = cat.rows.filter((r) => r.shaftD != null).length
  const balance = res.facets.balanced_design?.reduce((n, v) => n + v.count, 0) ?? 0
  const balanceRows = cat.rows.filter((r) => r.balance != null).length
  check(8, 'Missing values omitted from facets (no Unknown / defaults)',
    bad.length === 0 && res.facets.shaft_diameter_mm.count === withD && balance === balanceRows,
    `${bad.length} placeholder facet values; diameter facet covers ${res.facets.shaft_diameter_mm.count} of ${cat.rows.length} articles (rest have no value); balance facet ${balance} = ${balanceRows} articles with a value`)
}

// 9. Category images carry a representative-image disclosure.
{
  const files = ['src/components/PageHero.jsx', 'src/components/cms/ListingTemplate.jsx', 'src/pages/ProductPage.jsx', 'src/components/cms/HomeTemplate.jsx', 'src/components/MegaMenu.jsx']
  const missing = files.filter((f) => !/Representative/i.test(fs.readFileSync(path.join(ROOT, f), 'utf8')))
  const imgs = fs.readdirSync(path.join(ROOT, 'public/img'))
  check(9, 'Category images labelled as representative', missing.length === 0 && imgs.length === 1 && imgs[0] === 'category',
    `${files.length - missing.length}/${files.length} image-rendering components carry the disclosure${missing.length ? ` (missing: ${missing.join(', ')})` : ''}; public/img holds only the package's category artwork`)
}

// 10. Paging and multi-filter queries perform on 38,881 articles.
{
  const time = async (q) => { const t = performance.now(); await api(searchApi, q); return performance.now() - t }
  const heavy = 'scope=P002&facets=seal_type,shaft_diameter_mm,rotating_face_material,stationary_face_material,secondary_seal_material,application&secondary_seal_material=FKM&secondary_seal_material=EPDM&shaft_diameter_mm_min=20&shaft_diameter_mm_max=80&sort=diameter-desc&page=40'
  await time(heavy)
  const runs = []
  for (let i = 0; i < 5; i++) runs.push(await time(heavy))
  const search = await time('scope=P002&q=typ%2013&facets=seal_type,shaft_diameter_mm')
  const median = runs.sort((a, b) => a - b)[2]
  check(10, 'Paging and multi-filter performance', median < 250 && search < 250,
    `catalogue loads in ${cat.loadMs} ms (cold); multi-filter + sort + page 40 over all articles: ${median.toFixed(0)} ms median; text search: ${search.toFixed(0)} ms`)
}

// 11. No brand association, stock, delivery or certification claims in the UI.
{
  const claim = /\b(in stock|available now|ships? (today|within)|delivery (time|within)|lead time|ISO[- ]?9001|ATEX[- ]certified|FDA[- ]approved|genuine|original (part|equipment)|authori[sz]ed (dealer|distributor)|official partner)\b/i
  const hits = []
  const scan = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const f = path.join(dir, e.name)
      if (e.isDirectory()) { if (e.name !== 'generated') scan(f); continue }
      if (!/\.(jsx?|html)$/.test(e.name)) continue
      fs.readFileSync(f, 'utf8').split('\n').forEach((line, i) => claim.test(line) && hits.push(`${path.relative(ROOT, f)}:${i + 1}`))
    }
  }
  scan(path.join(ROOT, 'src'))
  const disclaimer = fs.readFileSync(path.join(ROOT, 'src/pages/ProductPage.jsx'), 'utf8').includes('do not indicate endorsement')
  check(11, 'No inferred brand, stock or certification claims', hits.length === 0 && disclaimer,
    hits.length ? `claim wording in: ${hits.join(', ')}` : 'no stock/delivery/certification/affiliation wording in UI code; product pages carry the catalogue-reference disclaimer')
}

// 12. Approval state and assumed values reviewed by the client.
{
  let published = 0
  let verified = 0
  let materialStatus = 0
  eachCsvRecord(path.join(ROOT, DATA_DIR), 'products_import.csv.gz', (get) => {
    if (get('publication_status') === 'PUBLISHED' && get('public_data_approved') === 'true') published++
    if (get('manufacturer_verified')) verified++
    if (get('material_data_status')) materialStatus++
  })
  check(12, 'Approval state and assumed values reviewed (client release process)', null,
    `${published} articles flagged PUBLISHED + approved, but manufacturer_verified is set for ${verified} and material_data_status for ${materialStatus}; package notes say values are not independently verified`)
}

// Extra: build integrity.
{
  const vercel = JSON.parse(fs.readFileSync(path.join(ROOT, 'vercel.json'), 'utf8'))
  const sitemap = fs.readFileSync(path.join(DIST, 'sitemap-products.xml'), 'utf8').split('<url>').length - 1
  check('B', 'Build output: sitemaps, redirects, function bundling config', sitemap === cat.rows.length && vercel.redirects?.length >= 30 && /products_import\.csv\.gz/.test(vercel.functions?.['api/*.js']?.includeFiles || ''),
    `${sitemap} product URLs in sitemap, ${vercel.redirects.length} redirects, API bundles the source CSVs`)
}

// ---------- Report ----------

const out = results.map((r) => `${r.status.padEnd(6)} ${String(r.id).padStart(2)}. ${r.title}\n         ${r.detail}`).join('\n')
console.log(out)
const failed = results.filter((r) => r.status === 'FAIL').length
console.log(`\n${results.filter((r) => r.status === 'PASS').length} passed, ${failed} failed, ${results.filter((r) => r.status === 'MANUAL').length} manual`)
if (process.argv.includes('--json')) fs.writeFileSync(path.join(ROOT, 'dist/qa.json'), JSON.stringify(results, null, 2))
process.exit(failed ? 1 : 0)
