#!/usr/bin/env node
// Runs after `vite build`:
//   - writes one static HTML shell per category-tree page with its own <title>, description, canonical
//     and Open Graph tags, so crawlers and link previews see them without running JavaScript
//   - writes dist/app.html, the generic shell for client-only routes (/product/<sku>/, 404s)
//   - writes sitemap.xml (index), sitemap-pages.xml, sitemap-products.xml and robots.txt
//   - fails if vercel.json redirects drift from src/lib/redirects.js
//
// SITE_URL overrides the production origin (default https://www.mechanical-seal-germany.com).
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getCatalog } from '../shared/catalog.mjs'
import { LEGACY_FALLBACK, LEGACY_REDIRECTS } from '../src/lib/redirects.js'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DIST = path.join(ROOT, 'dist')
const SITE = (process.env.SITE_URL || 'https://www.mechanical-seal-germany.com').replace(/\/$/, '')
const site = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/generated/site.json'), 'utf8'))
const shell = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8')
const errors = []

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

function withHead(html, { title, description, canonical }) {
  const swap = (re, tag) => {
    if (!re.test(html)) errors.push(`index.html is missing ${re}`)
    html = html.replace(re, tag)
  }
  swap(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`)
  swap(/<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="${esc(description)}" />`)
  swap(/<meta property="og:title" content="[^"]*" \/>/, `<meta property="og:title" content="${esc(title)}" />`)
  swap(/<meta property="og:description" content="[^"]*" \/>/, `<meta property="og:description" content="${esc(description)}" />`)
  if (canonical) {
    swap(/<link rel="canonical" href="[^"]*" \/>/, `<link rel="canonical" href="${esc(SITE + canonical)}" />`)
    swap(/<meta property="og:url" content="[^"]*" \/>/, `<meta property="og:url" content="${esc(SITE + canonical)}" />`)
  } else {
    html = html.replace(/\s*<link rel="canonical" href="[^"]*" \/>/, '').replace(/\s*<meta property="og:url" content="[^"]*" \/>/, '')
  }
  return html
}

// ---------- HTML shells ----------

fs.writeFileSync(
  path.join(DIST, 'app.html'),
  withHead(shell, { title: 'SAP Parts | Mechanical seal catalogue', description: 'Find mechanical seals by SAP Parts SKU, OEM reference, shaft diameter, manufacturer or seal type.' }),
)

for (const p of site.pages) {
  const file = p.url === '/' ? path.join(DIST, 'index.html') : path.join(DIST, p.url, 'index.html')
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, withHead(shell, { title: p.seo.title, description: p.seo.description, canonical: p.seo.canonical }))
}

// ---------- Sitemaps ----------

const today = new Date().toISOString().slice(0, 10)
const urlset = (locs) =>
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${locs.map((l) => `  <url><loc>${esc(SITE + l)}</loc><lastmod>${today}</lastmod></url>`).join('\n')}\n</urlset>\n`

const pageUrls = site.pages.map((p) => p.seo.canonical)
const productUrls = getCatalog(ROOT).rows.map((r) => `/product/${encodeURIComponent(r.sku)}/`)
if (productUrls.length > 50000) errors.push('sitemap-products.xml exceeds 50,000 URLs; split it')

fs.writeFileSync(path.join(DIST, 'sitemap-pages.xml'), urlset(pageUrls))
fs.writeFileSync(path.join(DIST, 'sitemap-products.xml'), urlset(productUrls))
fs.writeFileSync(
  path.join(DIST, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${['sitemap-pages.xml', 'sitemap-products.xml']
    .map((f) => `  <sitemap><loc>${SITE}/${f}</loc><lastmod>${today}</lastmod></sitemap>`)
    .join('\n')}\n</sitemapindex>\n`,
)
fs.writeFileSync(path.join(DIST, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${SITE}/sitemap.xml\n`)

// ---------- vercel.json consistency ----------

const vercel = JSON.parse(fs.readFileSync(path.join(ROOT, 'vercel.json'), 'utf8'))
const expected = [...Object.entries(LEGACY_REDIRECTS), [LEGACY_FALLBACK.from, LEGACY_FALLBACK.to]]
const actual = (vercel.redirects || []).map((r) => [r.source, r.destination])
if (JSON.stringify(expected) !== JSON.stringify(actual)) errors.push('vercel.json redirects differ from src/lib/redirects.js')
if (!vercel.rewrites?.some((r) => r.destination === '/app.html')) errors.push('vercel.json must rewrite client routes to /app.html')

console.log(`[postbuild] ${site.pages.length} page shells, ${productUrls.length} product URLs in sitemap, origin ${SITE}`)
if (errors.length) {
  for (const e of errors) console.error('[postbuild] ' + e)
  process.exit(1)
}
