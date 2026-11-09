import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, FileText, ExternalLink, Info } from 'lucide-react'
import ProductCard from '../components/ProductCard'
import { categories, products } from '../data'

export default function ProductDetail() {
  const { slug } = useParams()
  const p = products.find((x) => x.slug === slug)

  if (!p) {
    return (
      <section className="section container page">
        <div className="empty">Product not found. <Link to="/products" className="link">Back to products</Link></div>
      </section>
    )
  }

  const related = products.filter((x) => x.category === p.category && x.slug !== p.slug).slice(0, 4)
  const cat = categories.find((c) => c.id === p.category)
  const sheets = p.types.reduce((n, t) => n + t.datasheets.length, 0)

  return (
    <>
      <section className="section container page">
        <Link to="/products" className="link link--muted"><ArrowLeft size={14} /> All products</Link>
        <div className="detail">
          <div className="detail__media">
            {p.image ? <img src={p.image} alt={p.name} /> : <span className="ph ph--lg">{p.code}</span>}
          </div>
          <div className="detail__body">
            <span className="eyebrow">{cat?.label} · {p.code}</span>
            <h1 className="h2">{p.heading}</h1>
            <p className="lead">{p.intro}</p>
            <div className="chips">{p.highlights.map((h) => <span key={h} className="chip">{h}</span>)}</div>
            {p.note && <p className="note"><Info size={14} /> {p.note}</p>}
            <div className="detail__facts">
              <div><strong>{p.types.length || '—'}</strong><span>Types</span></div>
              <div><strong>{sheets || '—'}</strong><span>Data sheets</span></div>
              <div><strong>24 h</strong><span>Quotation</span></div>
            </div>
            <div className="dark__actions">
              <Link to={`/contact?product=${encodeURIComponent(p.name)}`} className="btn btn--accent">
                Request quote <ArrowRight size={14} />
              </Link>
              <a href={p.link} target="_blank" rel="noreferrer" className="btn btn--outline">
                <ExternalLink size={14} /> Original page
              </a>
            </div>
          </div>
        </div>
      </section>

      {p.types.length > 0 && (
        <section className="section section--tight container">
          <div className="section__head section__head--row">
            <div>
              <span className="eyebrow">Available types</span>
              <h2>{p.types.length} {p.name.toLowerCase()} type{p.types.length > 1 ? 's' : ''}</h2>
            </div>
          </div>
          <div className="types">
            {p.types.map((t) => (
              <article key={t.name} className="type">
                <div className="type__media">
                  {t.image ? <img src={t.image} alt={t.name} loading="lazy" /> : <span className="ph">{p.code}</span>}
                </div>
                <div className="type__body">
                  <h3>{t.name}</h3>
                  <div className="type__actions">
                    {t.datasheets.map((d, i) => (
                      <a key={d} href={d} target="_blank" rel="noreferrer" className="type__sheet">
                        <FileText size={13} /> Data sheet{t.datasheets.length > 1 ? ` ${i + 1}` : ''}
                      </a>
                    ))}
                    <Link to={`/contact?product=${encodeURIComponent(t.name)}`} className="type__rfq">Request</Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {p.gallery?.length > 0 && (
        <section className="section section--tight container">
          <div className="section__head">
            <span className="eyebrow">Gallery</span>
            <h2>Examples from our work</h2>
          </div>
          <div className="gallery">
            {p.gallery.map((g) => (
              <figure key={g.image}>
                <img src={g.image} alt={g.label} loading="lazy" />
                {g.label && <figcaption>{g.label}</figcaption>}
              </figure>
            ))}
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="section container">
          <div className="section__head"><h2>Related products</h2></div>
          <div className="grid">{related.map((r) => <ProductCard key={r.slug} p={r} />)}</div>
        </section>
      )}
    </>
  )
}
