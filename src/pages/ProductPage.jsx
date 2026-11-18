// Canonical article page: /product/<sap_article_number>/
// Shows only supplied values. Images are representative category artwork, never SKU photography.
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowRight, Check, Copy, Info, MessageSquareQuote, Search } from 'lucide-react'
import PageHero from '../components/PageHero'
import { useHead } from '../lib/head'
import { pageById, productUrl, trail } from '../lib/site'
import { formatNumber } from '../lib/listing'

const mm = (v) => (v == null ? null : `${formatNumber(v)} mm`)

// "d3=34.0; d7=35.0; seat=G6 / G4" -> [['d3', '34.0'], …]
const parseDims = (s) =>
  (s || '')
    .split(';')
    .map((x) => x.trim().split('='))
    .filter(([k, v]) => k && v)
    .map(([k, v]) => [k.trim(), v.trim()])

function SpecGroup({ title, rows, note }) {
  const shown = rows.filter(([, v]) => v != null && v !== '')
  if (!shown.length) return null
  return (
    <section className="pspec">
      <h2>{title}</h2>
      <dl>
        {shown.map(([k, v]) => (
          <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
        ))}
      </dl>
      {note && <p className="pspec__note">{note}</p>}
    </section>
  )
}

function Chips({ label, options, current }) {
  if (!options || options.length < 2) return null
  return (
    <div className="pvar">
      <span className="pvar__label">{label}</span>
      <div className="pvar__opts">
        {options.map((o) =>
          o.sku === current ? (
            <span key={o.key} className="pvar__opt is-current" aria-current="true">{o.label}</span>
          ) : (
            <Link key={o.key} to={productUrl(o.sku)} className={`pvar__opt ${o.dim ? 'is-dim' : ''}`} title={o.dim ? 'Different material combination' : undefined}>
              {o.label}
            </Link>
          ),
        )}
      </div>
    </div>
  )
}

function CopySku({ sku }) {
  const [done, setDone] = useState(false)
  const copy = () =>
    navigator.clipboard?.writeText(sku).then(() => {
      setDone(true)
      setTimeout(() => setDone(false), 1600)
    })
  return (
    <button type="button" className="pcopy" onClick={copy} aria-label={`Copy article number ${sku}`}>
      <code>{sku}</code> {done ? <Check size={14} /> : <Copy size={14} />}
    </button>
  )
}

function NotFoundSku({ sku }) {
  useHead({ title: 'Article not found | SAP Parts', description: '', canonical: '/shop/' })
  return (
    <>
    <PageHero crumbs={[{ label: 'Shop', to: '/shop/' }, { label: 'Article not found' }]} title="Article not found" />
    <div className="pbody">
      <div className="container">
        <div className="empty nomatch">
          <strong>No article with the number “{sku}”.</strong>
          <p>The article number may have changed or contain a typing error. Search the catalogue or send us the reference for identification.</p>
          <div className="nomatch__actions">
            <Link to={`/shop/?q=${encodeURIComponent(sku)}`} className="btn btn--outline"><Search size={15} /> Search the catalogue</Link>
            <Link to={`/contact/?sku=${encodeURIComponent(sku)}`} className="btn btn--primary">Request identification <ArrowRight size={15} /></Link>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}

function Product({ data }) {
  const { product: p, variants: v } = data
  const page = pageById(p.pageId)
  useHead({
    title: `${p.title} | SAP Parts`,
    description: (p.description || p.title).slice(0, 155),
    canonical: productUrl(p.sku),
  })

  const crumbs = [...trail(p.pageId).map((x) => ({ label: x.title, to: x.url })), { label: p.sku }]
  const dims = parseDims(p.otherDims)
  const isReference = p.refManufacturer && p.refManufacturer !== 'SAP Parts'
  const quote = `/contact/?sku=${encodeURIComponent(p.sku)}`

  const sizes = v?.sizes.map((s) => ({ key: s.shaftD, sku: s.sku, label: `Ø ${formatNumber(s.shaftD)}`, dim: !s.exact }))
  const materials = v?.materials.map((m) => ({ key: m.combination, sku: m.sku, label: m.combination.replaceAll('/', ' / ') }))

  return (
    <div className="pdp">
      <PageHero crumbs={crumbs} eyebrow={`${p.sealType}${p.series ? ` · ${p.series}` : ''}`} title={p.title}>
        <CopySku sku={p.sku} />
      </PageHero>

      <div className="pbody pdp__sheet">
        <div className="container pdp__top">
          <figure className="pdp__media">
            {p.image && <img src={p.image} alt={`${p.sealType || 'Mechanical seal'}, representative illustration`} width="600" height="450" />}
            <figcaption><Info size={14} /> Representative illustration of the seal family, not a photograph or drawing of this article.</figcaption>
          </figure>

          <div className="pdp__buy">
            <dl className="pdp__key">
              {[
                ['Shaft Ø', mm(p.shaftD)],
                ['Rotating face', p.rotatingFace],
                ['Stationary face', p.stationaryFace],
                ['Secondary seal', p.secondarySeal],
                ['Configuration', p.configuration],
              ]
                .filter(([, val]) => val)
                .map(([k, val]) => <div key={k}><dt>{k}</dt><dd>{val}</dd></div>)}
            </dl>

            {v && (
              <div className="pdp__variants">
                <Chips label="Shaft diameter (mm)" options={sizes} current={p.sku} />
                <Chips label="Face / face / elastomer" options={materials} current={p.sku} />
                <p className="pvar__hint">{v.familySize} articles in the {p.series} series on this page.</p>
              </div>
            )}

            <div className="pdp__actions">
              <Link to={quote} className="btn btn--primary btn--lg"><MessageSquareQuote size={16} /> Request a quote</Link>
              {page && <Link to={page.url} className="btn btn--outline">All {page.title}</Link>}
            </div>
            <p className="pdp__verify">
              Dimensions and materials come from the SAP Parts article master. Please confirm them against your drawing or existing seal before ordering; our engineers check the fit on request.
            </p>
          </div>
        </div>

        <div className="container pdp__body">
          <div className="pdp__specs">
            <SpecGroup
              title="Identity & classification"
              rows={[['Article number', p.sku], ['Seal design', p.sealType], ['Series', p.series], ['Category', page?.title]]}
            />
            <SpecGroup
              title="Dimensions"
              rows={[['Shaft diameter d1', mm(p.shaftD)], ['Stationary seat OD', mm(p.seatOd)], ['Installed length', mm(p.installLength)], ...dims]}
              note={dims.length ? 'Additional designations (d3, l1 …) are drawing-specific and listed as supplied; values in mm unless stated.' : null}
            />
            <SpecGroup
              title="Materials"
              rows={[['Rotating face', p.rotatingFace], ['Stationary face', p.stationaryFace], ['Secondary seal', p.secondarySeal], ['Combination', p.materialCombination]]}
            />
            <SpecGroup
              title="Design"
              rows={[['Configuration', p.configuration], ['Spring design', p.springDesign], ['Hydraulic balance', p.balance], ['Stationary seat type', p.seatType], ['Application reference', p.application]]}
            />
            <SpecGroup
              title="Catalogue references"
              rows={[
                ['Reference manufacturer', isReference ? p.refManufacturer : null],
                ['Manufacturer part number', p.mpn],
                ['OEM part number', p.oemPn],
                ['Equipment manufacturer', p.equipmentManufacturer],
                ['Equipment model', p.equipmentModel],
              ]}
              note="Manufacturer and equipment names identify catalogue references only. They do not indicate endorsement by, or affiliation with, those companies, or certified interchangeability."
            />
          </div>

          <aside className="pdp__aside">
            {p.description && (
              <section className="pdp__desc">
                <h2>About this article</h2>
                <p>{p.description}</p>
              </section>
            )}
            {v?.versions.length > 0 && (
              <section className="pdp__versions">
                <h2>Other versions, same Ø and materials</h2>
                <ul>
                  {v.versions.map((x) => (
                    <li key={x.sku}>
                      <Link to={productUrl(x.sku)}>
                        <code>{x.sku}</code>
                        {(x.seatType || x.otherDims) && <small>{x.seatType || x.otherDims}</small>}
                      </Link>
                    </li>
                  ))}
                </ul>
                {v.moreVersions > 0 && <p className="pvar__hint">+ {v.moreVersions} more in the category listing.</p>}
              </section>
            )}
          </aside>
        </div>
      </div>
    </div>
  )
}

export default function ProductPage() {
  const { sku } = useParams()
  const [state, setState] = useState({ sku: null })

  useEffect(() => {
    const ctrl = new AbortController()
    fetch(`/api/product?sku=${encodeURIComponent(sku)}`, { signal: ctrl.signal })
      .then(async (r) => setState({ sku, status: r.status, data: r.ok ? await r.json() : null }))
      .catch((e) => e.name !== 'AbortError' && setState({ sku, status: 0 }))
    return () => ctrl.abort()
  }, [sku])

  if (state.sku !== sku) {
    return (
      <div className="pdp" aria-busy="true">
        <header className="phead"><div className="container"><div className="skel pdp__skel-title" /></div></header>
        <div className="pbody"><div className="container pdp__top"><div className="skel pdp__skel-media" /><div className="skel pdp__skel-media" /></div></div>
      </div>
    )
  }
  if (state.status === 404) return <NotFoundSku sku={sku} />
  if (!state.data) {
    return (
      <div className="pbody"><div className="container"><div className="empty">Article data could not be loaded. Please reload the page.</div></div></div>
    )
  }
  return <Product data={state.data} />
}
