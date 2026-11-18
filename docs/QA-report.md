# QA report: SAP Parts webshop V7.1

Date: 18 November 2026 · Branch `phase-1-content-pipeline` · Local build (dev server, `vite preview` and isolated build). Not yet run on a Vercel deployment.

Re-run the automated part at any time with `npm run qa`.

## Summary

| | Result |
|---|---|
| Package acceptance checklist (12 items) | **11 pass, 1 manual** (client data approval) |
| Deck go-live tests (slide 20) | **All pass** locally |
| Browser crawl, all 210 pages | 0 errors · 1 H1 per page · every paragraph of the client copy present · no broken images · no heading-level skips |
| Fixed during QA | Mega-menu images lacked the representative-image label; headings jumped from H1 to H3 on 191 pages; unknown-SKU page had no H1 |

## Package acceptance checklist (`04_Anleitung`)

| # | Check | Result | Evidence |
|---|---|---|---|
| 1 | Every article resolves by SKU to exactly one primary page | Pass | 38,881 / 38,881 articles; 0 with more or fewer than one primary link; product API returns the page |
| 2 | Every page id has a route; `/shop/other/` registered | Pass | 210 / 210 built routes; `/shop/other/` lists 16,278 articles |
| 3 | No orphan pages or duplicate routes | Pass | 0 duplicate URLs; 210 / 210 pages reachable from the 10 top-level pages |
| 4 | Diameter, both faces and elastomer shown separately | Pass | Separate API fields and separate rows on cards and product pages |
| 5 | Numeric filter: 20 mm does not match 200 mm | Pass | Range 20–20 returns exactly the 1,151 articles with d1 = 20; text search "20" never matches 200 |
| 6 | Material filters respect all three components | Pass | Carbon / SiC / FKM returns 8,681 articles, each matching all three |
| 7 | Query by part number and SKU | Pass | Exact SKU, lower-case SKU, manufacturer part no., OEM no., equipment model and series alias all found; an exact SKU links straight to its page |
| 8 | Missing values omitted, not defaulted | Pass | No "Unknown" or empty facet values; diameter facet covers the 35,890 articles that have a value; balance facet counts only its 136 values |
| 9 | Category image carries representative disclosure | Pass (after fix) | Hero, cards, product page, Home and mega menu all label the artwork; only the package's 8 category images are deployed |
| 10 | Paging and multi-filter performance on 38,881 articles | Pass | Catalogue load (cold start) ~0.3 s; six facets + two filters + sort + page 40 ~37 ms; text search ~9 ms |
| 11 | No inferred brand association or stock claims | Pass | No stock, delivery, certification or affiliation wording in the UI; product pages carry a "catalogue reference only, no endorsement or certified interchangeability" note |
| 12 | Approval state and assumed values reviewed by client | **Manual** | All 38,881 rows are flagged `PUBLISHED` + approved, yet `manufacturer_verified` and `material_data_status` are empty for every row and the package says values are not independently verified |

## Deck go-live tests (slide 20)

| Area | Result |
|---|---|
| Search: exact SKU, alias, OEM code, model, free text | Pass (checklist item 7) |
| Filters: d1 numeric range, materials, dependent options, counts, URL restore | Pass. Loading a URL with range, material, sort and page 2 restores every control; counts in one facet change with selections in another |
| Listing: blank, narrow and large result sets; sort; pagination | Pass. 0 results shows guidance and "Request identification"; 6 results show no pager; 38,881 results page to 1,621; diameter sort is ordered |
| Content: client text, heading hierarchy, accessibility, correct image | Pass. All copy present on all 210 pages; heading levels fixed; no unnamed buttons or links and no unlabeled inputs on the sampled templates; `lang="en"` |
| Relationships: one SKU on several pages; evidence-linked compatibility only | Not applicable yet. The package has primary links only and no compatibility records; nothing is inferred |
| Integrity: no phantom products, fake certifications or copied artwork | Pass. Every listed article comes from the package CSV; old-site images and PDFs are removed |

## Open items before go-live

These need people or a deployment and cannot be closed in code.

1. **Client data approval (item 12).** Confirm the articles may be published while the package says values are unverified. Product pages show a verify-before-ordering note in the meantime.
2. **Legal review.**
   - Street address added to the Legal Notice from company data; it is not in the client's text.
   - Managing directors appear on one line ("Johannes Orlowski Steven Kumar Chugh"), exactly as supplied.
3. **Factual statements in the client copy to confirm.**
   - "approximately 200 OEM customers" (P173, P177).
   - The EU drinking-water date "31 December 2026" (P195), which is weeks away.
4. **Package copy quality.** Generated product descriptions contain phrases such as "this other – lkh series" and lower-cased series names ("typ 13 / 13n"); fix them in the source CSV.
5. **First Vercel deploy checks.**
   - `/api/search?scope=P005` returns `"total": 5211`, which proves the CSV files are bundled with the functions.
   - One redirect works, e.g. `/cartridges.html` → `/shop/cartridge-mechanical-seals/`.
   - View the page source of `/shop/` and confirm its own title and canonical.
6. **Status codes.** Unknown URLs show a "not found" page but return HTTP 200. Returning a real 404 needs server-side routing; it is not required by the checklist.
7. **Images.** Eight representative category renders cover all pages; the deck asks for a technically accurate primary image per page, and SKU photos or drawings later.
8. **Enquiries** open the visitor's mail app (`mailto:` to europe@sapparts.com). A server-side form with spam protection is advisable before launch.
9. **SEO owner review.** URL policy, canonicals and the 38,881-URL product sitemap.
