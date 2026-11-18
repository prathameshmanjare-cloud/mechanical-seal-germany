// Generic page rendered for every route in the SAP Parts category tree.
// Phase 1 renderer: proves routing, SEO fields, editorial copy and product data load.
// The full listing (Template A) and information (Template B) layouts replace this in phase 2.
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import PageHero from '../components/PageHero'
import { pageById, trail, loadPageContent, loadShard } from '../lib/site'

const PREVIEW = 24

function useHead(seo) {
  useEffect(() => {
    document.title = seo.title
    let meta = document.querySelector('meta[name="description"]')
    if (!meta) {
      meta = document.createElement('meta')
      meta.name = 'description'
      document.head.appendChild(meta)
    }
    meta.content = seo.description
    let link = document.querySelector('link[rel="canonical"]')
    if (!link) {
      link = document.createElement('link')
      link.rel = 'canonical'
      document.head.appendChild(link)
    }
    link.href = new URL(seo.canonical, window.location.origin).href
  }, [seo])
}

function Body({ sections }) {
  return sections.map((s, i) => (
    <section key={i} className="cms__section">
      {s.h && <h2>{s.h}</h2>}
      {s.blocks.map((b, j) =>
        b.ul ? (
          <ul key={j}>{b.ul.map((li) => <li key={li}>{li}</li>)}</ul>
        ) : (
          <p key={j}>{b.p}</p>
        ),
      )}
    </section>
  ))
}

const dims = (p) => [p.shaftD != null && `Ø ${p.shaftD} mm`, p.rotatingFace, p.stationaryFace, p.secondarySeal].filter(Boolean).join(' · ')

export default function CmsPage({ id }) {
  const page = pageById(id)
  const [content, setContent] = useState(null)
  const [preview, setPreview] = useState(null)
  useHead(page.seo)

  // Routes mount this with key={id}, so state starts fresh per page.
  useEffect(() => {
    let live = true
    loadPageContent(id).then((c) => live && setContent(c)).catch(() => live && setContent({ sections: [] }))
    if (page.shards.length) loadShard(page.shards[0]).then((rows) => live && setPreview(rows.slice(0, PREVIEW)))
    return () => { live = false }
  }, [id, page.shards])

  const crumbs = trail(id).map((p) => (p.id === id ? { label: p.title } : { label: p.title, to: p.url }))
  const children = page.children.map(pageById)

  return (
    <div className={`cms cms--${page.type}`} data-page={id}>
      <PageHero crumbs={crumbs} title={page.title} />
      <section className="sheet">
        <div className="container cms__grid">
          <article className="cms__body prose">
            {page.image && (
              <figure className="cms__figure">
                <img src={page.image} alt={`${page.title}: representative illustration`} loading="lazy" />
                <figcaption>Representative illustration, not an exact product drawing.</figcaption>
              </figure>
            )}
            {content ? <Body sections={content.sections} /> : <p className="cms__loading">Loading…</p>}
          </article>

          <aside className="cms__side">
            {children.length > 0 && (
              <nav className="cms__children" aria-label={`${page.title} sections`}>
                <h3>In this section</h3>
                <ul>
                  {children.map((c) => (
                    <li key={c.id}>
                      <Link to={c.url}>{c.title}</Link>
                      {c.productCount > 0 && <small> {c.productCount.toLocaleString('en')}</small>}
                    </li>
                  ))}
                </ul>
              </nav>
            )}
          </aside>
        </div>

        {page.type === 'listing' && (
          <div className="container cms__products">
            <h2>{page.productCount.toLocaleString('en')} products</h2>
            {page.filters.length > 0 && <p className="cms__note">Filters for this page: {page.filters.join(', ')}</p>}
            {page.productCount === 0 && (
              <div className="empty">No catalogue articles are assigned to this page yet. <Link to="/contact">Request identification</Link></div>
            )}
            {preview && (
              <ul className="cms__plist">
                {preview.map((p) => (
                  <li key={p.sku}>
                    <strong>{p.title}</strong>
                    <code>{p.sku}</code>
                    <span>{dims(p)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </section>
    </div>
  )
}
