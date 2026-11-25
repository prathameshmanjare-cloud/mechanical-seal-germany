import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { cleanArt } from '../lib/site'

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
          {eyebrow && <p className="phead__eyebrow" data-reveal>{eyebrow}</p>}
          <h1 className="phead__title" data-reveal style={{ '--d': 1 }}>{title}</h1>
          {text && <p className="phead__lead">{text}</p>}
          {children}
        </div>
        {image && (
          <figure className="phead__fig" data-reveal data-parallax="-0.06" style={{ '--d': 2 }}>
            <img src={cleanArt(image)} alt={imageAlt || ''} width="480" height="360" fetchPriority="high" />
            <figcaption>Images are representative</figcaption>
          </figure>
        )}
      </div>
    </header>
  )
}
