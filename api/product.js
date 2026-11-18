// GET /api/product?sku=<sap_article_number> — one article record, its primary page and variant options.
//
// Variants are other articles of the same series on the same primary page:
//   sizes     — one article per shaft Ø, preferring the current material combination
//   materials — material combinations available at the current shaft Ø
//   versions  — further articles with the same Ø and materials (differ in seat or other dimensions)
import { getCatalog } from '../shared/catalog.mjs'

const HIDDEN = new Set(['search', '_compact', '_title'])
const MAX_VERSIONS = 24
const bySku = (a, b) => a.sku.localeCompare(b.sku)

function variants(p, family) {
  if (!p.series || family.length < 2) return null
  const sizeMap = new Map()
  for (const r of [...family].sort(bySku)) {
    if (r.shaftD == null) continue
    const cur = sizeMap.get(r.shaftD)
    const exact = r.materialCombination === p.materialCombination
    if (!cur || (exact && !cur.exact)) sizeMap.set(r.shaftD, { shaftD: r.shaftD, sku: r.sku, exact })
  }
  const sameSize = family.filter((r) => r.shaftD === p.shaftD)
  const matMap = new Map()
  for (const r of sameSize.sort(bySku)) if (r.materialCombination && !matMap.has(r.materialCombination)) matMap.set(r.materialCombination, r.sku)
  if (p.materialCombination) matMap.set(p.materialCombination, matMap.get(p.materialCombination) ?? p.sku)
  const versions = sameSize.filter((r) => r.materialCombination === p.materialCombination && r.sku !== p.sku)

  return {
    familySize: family.length,
    sizes: [...sizeMap.values()].sort((a, b) => a.shaftD - b.shaftD),
    materials: [...matMap].map(([combination, sku]) => ({ combination, sku })).sort((a, b) => a.combination.localeCompare(b.combination)),
    versions: versions.slice(0, MAX_VERSIONS).map((r) => ({ sku: r.sku, otherDims: r.otherDims, seatType: r.seatType })),
    moreVersions: Math.max(0, versions.length - MAX_VERSIONS),
  }
}

export function GET(request) {
  const sku = new URL(request.url).searchParams.get('sku') || ''
  const cat = getCatalog()
  const p = cat.bySku.get(sku)
  if (!p) return Response.json({ error: 'Not found' }, { status: 404, headers: { 'Cache-Control': 'no-store' } })
  return Response.json(
    {
      product: Object.fromEntries(Object.entries(p).filter(([k]) => !HIDDEN.has(k))),
      variants: variants(p, cat.familyOf(p)),
    },
    { headers: { 'Cache-Control': 'public, max-age=60, s-maxage=86400, stale-while-revalidate=604800' } },
  )
}
