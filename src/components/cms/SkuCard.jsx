import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { formatNumber } from '../../lib/listing'

// One article record. Only supplied values are shown; nothing is defaulted.
export default function SkuCard({ p }) {
  const specs = [
    ['Shaft Ø', p.shaftD != null && `${formatNumber(p.shaftD)} mm`],
    ['Rotating face', p.rotatingFace],
    ['Stationary face', p.stationaryFace],
    ['Secondary seal', p.secondarySeal],
    ['Series', p.series],
  ].filter(([, v]) => v)

  return (
    <article className="sku">
      <div className="sku__media">
        {p.image && <img src={p.image} alt="" loading="lazy" width="160" height="120" />}
        <span className="sku__rep">Representative image</span>
      </div>
      <div className="sku__body">
        <span className="sku__type">{p.sealType}</span>
        <h3>{p.title}</h3>
        <code className="sku__id">{p.sku}</code>
        <dl className="sku__specs">
          {specs.map(([k, v]) => (
            <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
          ))}
        </dl>
        {p.refManufacturer && p.refManufacturer !== 'SAP Parts' && (
          <p className="sku__ref">Catalogue reference: {p.refManufacturer}{p.mpn ? ` ${p.mpn}` : ''}</p>
        )}
      </div>
      <Link to={`/contact/?sku=${encodeURIComponent(p.sku)}`} className="sku__cta">
        Request a quote <ArrowRight size={14} />
      </Link>
    </article>
  )
}
