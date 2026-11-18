// Legacy URLs -> new category-tree routes. Mirrored as 301s in vercel.json (scripts/postbuild.mjs checks they match).
export const LEGACY_REDIRECTS = {
  // Previous version of this site
  '/products': '/shop/',
  '/products/cartridge-seals': '/shop/cartridge-mechanical-seals/',
  '/products/metal-bellows': '/shop/bellows-mechanical-seals/metal-bellows/',
  '/products/splitted-seals': '/shop/special-mechanical-seals/split-seals/',
  '/products/agitator-seals': '/applications/mixing-agitation/',
  '/products/elastomer-bellows': '/shop/bellows-mechanical-seals/rubber-bellows/',
  '/products/high-pressure': '/shop/special-mechanical-seals/high-pressure-designs/',
  '/products/stationary-seals': '/shop/stationary-seal-seats/',
  '/products/sterile-seals': '/shop/hygienic-mechanical-seals/',
  '/products/custom-seals': '/shop/special-mechanical-seals/custom-engineered-seals/',
  '/products/seal-faces': '/shop/mechanical-seal-components/seal-face-sets/',
  '/about': '/about-us/',
  '/impressum': '/legal-notice/',
  // Original mechanical-seal-germany.com pages
  '/index.html': '/',
  '/produkte.html': '/shop/',
  '/cartridges.html': '/shop/cartridge-mechanical-seals/',
  '/metallfaltenbalg.html': '/shop/bellows-mechanical-seals/metal-bellows/',
  '/geteilte-gleitringdichtungen.html': '/shop/special-mechanical-seals/split-seals/',
  '/ruehrwerksdichtungen.html': '/applications/mixing-agitation/',
  '/gummibalg-gleitringdichtungen.html': '/shop/bellows-mechanical-seals/rubber-bellows/',
  '/hochdruck-gleitringdichtungen.html': '/shop/special-mechanical-seals/high-pressure-designs/',
  '/stationaere-gleitringdichtungen.html': '/shop/stationary-seal-seats/',
  '/sterildichtungen.html': '/shop/hygienic-mechanical-seals/',
  '/sonderdichtungen.html': '/shop/special-mechanical-seals/custom-engineered-seals/',
  '/sic-wc-kohle-keramik-anfertigung-nach-zeichnung.html': '/shop/mechanical-seal-components/seal-face-sets/',
  '/radialwellendichtringe.html': '/shop/',
  '/drehdurchfuehrungen.html': '/shop/',
  '/wehrtechnik.html': '/shop/',
  '/impressum.html': '/legal-notice/',
}
// Any other /products/<slug> from the previous version
export const LEGACY_FALLBACK = { from: '/products/:slug', to: '/shop/' }
