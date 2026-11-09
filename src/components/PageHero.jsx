import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

export function Crumbs({ items }) {
  return (
    <nav className="crumbs" aria-label="Breadcrumb">
      <Link to="/">Home</Link>
      {items.map((c) => (
        <span key={c.label}>
          <ChevronRight size={13} />
          {c.to ? <Link to={c.to}>{c.label}</Link> : <span aria-current="page">{c.label}</span>}
        </span>
      ))}
    </nav>
  )
}

export default function PageHero({ crumbs, title, text, img, pos = '70% 50%', variant = '', children }) {
  return (
    <section className={`phero ${variant}`}>
      {img && (
        <div className="phero__media" aria-hidden="true">
          <img src={img} alt="" style={{ objectPosition: pos }} fetchPriority="high" />
        </div>
      )}
      <div className="container phero__inner">
        <Crumbs items={crumbs} />
        <h1 className="phero__title">{title}</h1>
        {text && <p className="phero__text">{text}</p>}
        {children}
      </div>
    </section>
  )
}
