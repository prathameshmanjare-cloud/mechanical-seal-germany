import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

export function Crumbs({ items }) {
  return (
    <nav className="crumbs" aria-label="Breadcrumb">
      <Link to="/">Home</Link>
      {items.map((c) => (
        <span key={c.label}>
          <ChevronRight size={13} aria-hidden="true" />
          {c.to ? <Link to={c.to}>{c.label}</Link> : <span aria-current="page">{c.label}</span>}
        </span>
      ))}
    </nav>
  )
}

// Page header: breadcrumb, optional eyebrow, H1, lead, slot (search, SKU) and optional representative image.
export default function PageHero({ crumbs, eyebrow, title, text, image, imageAlt, children }) {
  return (
    <header className={`phead ${image ? 'phead--img' : ''}`}>
      <div className="container phead__inner">
        <div className="phead__text">
          <Crumbs items={crumbs} />
          {eyebrow && <p className="phead__eyebrow">{eyebrow}</p>}
          <h1 className="phead__title">{title}</h1>
          {text && <p className="phead__lead">{text}</p>}
          {children}
        </div>
        {image && (
          <figure className="phead__fig">
            <img src={image} alt={imageAlt || ''} width="480" height="360" fetchPriority="high" />
            <figcaption>Representative illustration</figcaption>
          </figure>
        )}
      </div>
    </header>
  )
}
