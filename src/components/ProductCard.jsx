import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'

export default function ProductCard({ p }) {
  return (
    <Link to={`/products/${p.slug}`} className="pcard">
      <div className="pcard__media">
        {p.image ? <img src={p.image} alt={p.name} loading="lazy" /> : <span className="ph">{p.code}</span>}
        <span className="chip chip--float">{p.code}</span>
      </div>
      <div className="pcard__body">
        <h3>{p.name}</h3>
        <p>{p.short}</p>
        {p.types.length > 0 && <small className="pcard__meta">{p.types.length} type{p.types.length > 1 ? 's' : ''} · data sheets</small>}
        <span className="pcard__link">
          View details <ArrowUpRight size={14} />
        </span>
      </div>
    </Link>
  )
}
