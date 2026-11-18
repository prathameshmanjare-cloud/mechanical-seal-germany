# SAP Parts webshop (V7.1)

React + Vite site for the SAP Parts mechanical seal catalogue, built from the client's developer package
(`content/sap-parts/`: 210 pages, 38,881 articles). Deployed on Vercel at https://www.mechanical-seal-germany.com.

## Commands

```bash
npm install
npm run dev       # content build + Vite dev server (API mounted at /api)
npm run build     # content build + vite build + postbuild (page shells, sitemaps, robots)
npm run preview   # serves dist/ with the API
npm run content   # regenerate src/generated + public/data only
```

## How it fits together

| Path | Role |
|---|---|
| `content/sap-parts/` | Client package: category tree, page texts, product CSV (gzipped), filter tables, import notes, QA report |
| `scripts/build-content.mjs` | Validates the package and writes `src/generated/site.json` (page tree, SEO, filters) and `public/data/pages/*.json` (parsed copy). Fails on duplicate routes/SKUs or broken links |
| `shared/catalog.mjs` | Loads and normalises products (used by the build and the API) |
| `shared/search.mjs` | Search/filter/sort rules shared by API and UI |
| `api/search.js`, `api/product.js` | Vercel Functions for listings and article pages |
| `scripts/postbuild.mjs` | Per-page HTML shells with SEO tags, `app.html` for client routes, sitemaps, robots; checks `vercel.json` redirects |
| `src/lib/redirects.js` | Old URLs → new routes (mirrored as 301s in `vercel.json`) |

Templates: Home, Listing (Template A), Information (Template B), Legal, Product (`/product/<sku>/`).

## Open items before go-live

- **Legal review:** the Legal Notice shows the street address from company data (`src/data.js`); it is not in the
  client's text. Directors, register and VAT come from the client text as supplied.
- **Enquiries** go to `europe@sapparts.com` via the visitor's mail app (no server-side form yet).
- **Data governance:** all articles are flagged `PUBLISHED`/approved in the package although the package notes say
  values are not independently verified. Product pages carry a verify-before-ordering note.
- **Images** are 8 representative category renders; per-page and per-SKU images are still to be produced.
- **First deploy check:** open `/api/search?scope=P005` on the deployment and confirm `"total": 5211`
  (proves the CSV files are bundled with the functions).
- **SEO owner review:** URL policy, canonicals, the 38,881-URL product sitemap and indexability.
