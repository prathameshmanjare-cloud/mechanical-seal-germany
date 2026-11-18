import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { formatNumber } from '../../lib/listing'
import { productUrl } from '../../lib/site'

// One article as a spec row. Only supplied values are shown; nothing is defaulted.
export default function SkuCard({ p }) {
  const url = productUrl(p.sku)
  const specs = [
    ['Shaft Ø', p.shaftD != null ? `${formatNumber(p.shaftD)} mm` : null],
    ['Rotating', p.rotatingFace],
    ['Stationary', p.stationaryFace],
    ['Secondary seal', p.secondarySeal],
  ]
  return (
    <article className="sku">
      <Link to={url} className="sku__media" tabIndex={-1} aria-hidden="true">
        {p.image && <img src={p.image} alt="" loading="lazy" width="96" height="72" />}
      </Link>
      <div className="sku__main">
        <span className="sku__type">{p.sealType}{p.series ? ` · ${p.series}` : ''}</span>
        <h3 className="sku__title"><Link to={url}>{p.title}</Link></h3>
        <code className="sku__id">{p.sku}</code>
        {p.refManufacturer && p.refManufacturer !== 'SAP Parts' && (
          <p className="sku__ref">Catalogue reference: {p.refManufacturer}{p.mpn ? ` ${p.mpn}` : ''}</p>
        )}
      </div>
      <dl className="sku__specs">
        {specs.map(([k, v]) => (
          <div key={k}><dt>{k}</dt><dd>{v ?? '—'}</dd></div>
        ))}
      </dl>
      <div className="sku__actions">
        <Link to={`/contact/?sku=${encodeURIComponent(p.sku)}`} className="btn btn--outline btn--sm">Request quote</Link>
        <Link to={url} className="sku__more">Details <ArrowRight size={14} /></Link>
      </div>
    </article>
  )
}
