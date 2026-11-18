// Home (P001): search first, then the shop families, the other site sections and the editorial copy.
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, CalendarDays, Factory, Hash, Layers, Ruler, Search, Settings, Wrench } from 'lucide-react'
import RichText, { CtaBox } from './RichText'
import { ctaOf, introOf } from '../../lib/content'
import { pageById, sections, totals } from '../../lib/site'

const SHOP = '/shop/'
const FIND = 'P041' // OEM Replacement > Find a Replacement
const FIND_ICONS = [Hash, Factory, Wrench, Ruler]
const fmt = (n) => n.toLocaleString('en')

function HomeSearch() {
  const [q, setQ] = useState('')
  const nav = useNavigate()
  const go = (e) => {
    e.preventDefault()
    const v = q.trim()
    nav(v ? `${SHOP}?q=${encodeURIComponent(v)}` : SHOP)
  }
  return (
    <form className="search search--lg cms-search home__search" role="search" onSubmit={go}>
      <Search size={18} className="search__icon" aria-hidden="true" />
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="SAP Parts SKU, OEM number, series or shaft Ø…" aria-label="Search the catalogue" />
      <button type="submit" className="btn btn--primary search__btn">Search <ArrowRight size={16} aria-hidden="true" /></button>
    </form>
  )
}

export default function HomeTemplate({ page, content }) {
  const shop = sections.find((s) => s.url === SHOP)
  const families = shop.children.map(pageById)
  const others = sections.filter((s) => s.url !== SHOP)
  const finders = (pageById(FIND)?.children || []).map(pageById)

  return (
    <div className="cms cms--home" data-page={page.id}>
      <section className="home__hero">
        <div className="container home__inner">
          <div className="home__intro">
            <p className="home__eyebrow">Mechanical seal catalogue</p>
            <h1 className="home__title">
              Find the Right <span className="home__title-accent">Mechanical Seal</span>
            </h1>
            <p className="home__lead">{introOf(content) || 'Find your mechanical seal by OEM reference, SAP Parts SKU, dimensions, manufacturer or seal type.'}</p>
            <HomeSearch />
            <ul className="home__facts">
              <li><Layers size={26} strokeWidth={1.6} aria-hidden="true" /><span><strong>{fmt(totals.products)}</strong>Articles</span></li>
              <li><Settings size={26} strokeWidth={1.6} aria-hidden="true" /><span><strong>{families.length}</strong>Seal families</span></li>
              <li><CalendarDays size={26} strokeWidth={1.6} aria-hidden="true" /><span><strong>Since 2009</strong>in sealing engineering</span></li>
            </ul>
          </div>
          <div className="home__art" aria-hidden="true" />
          {finders.length > 0 && (
            <nav className="home__finders" aria-label="Ways to find a replacement">
              <p className="home__finders-title">Find a replacement by</p>
              {finders.map((f, i) => {
                const Icon = FIND_ICONS[i % FIND_ICONS.length]
                return (
                  <Link key={f.id} to={f.url} className="home__finder">
                    <Icon size={20} aria-hidden="true" />
                    <span>{f.title.replace(/^Search by /, '')}</span>
                    <ArrowRight size={18} aria-hidden="true" />
                  </Link>
                )
              })}
            </nav>
          )}
        </div>
        <span className="home__hero-note" aria-hidden="true">Representative illustration</span>
      </section>

      <div className="pbody">
        <section className="container home__families">
          <div className="section-head">
            <h2>Shop by seal family</h2>
            <Link to={SHOP} className="link-arrow">All {fmt(totals.products)} articles <ArrowRight size={15} /></Link>
          </div>
          <div className="home__grid">
            {families.map((f) => (
              <Link key={f.id} to={f.url} className="home__fam">
                {f.image && <img src={f.image} alt="" loading="lazy" width="240" height="180" />}
                <span>
                  <strong>{f.title}</strong>
                  <small>{f.productCount ? `${fmt(f.productCount)} articles` : 'Identification on request'}</small>
                </span>
              </Link>
            ))}
          </div>
          <p className="home__note">Images are representative illustrations of each seal family.</p>
        </section>

        <section className="container home__sections">
          <div className="section-head">
            <h2>Find by reference, equipment or topic</h2>
          </div>
          <div className="subcats__grid">
            {others.map((s) => (
              <Link key={s.id} to={s.url} className="subcat">
                <span>
                  <strong>{s.title}</strong>
                  <small>{s.children.slice(0, 3).map((c) => pageById(c).title).join(' · ')}</small>
                </span>
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            ))}
          </div>
        </section>

        {content && (
          <div className="container split cms__editorial">
            <RichText sections={content.sections} />
            <aside className="split__aside"><CtaBox section={ctaOf(content)} /></aside>
          </div>
        )}
      </div>
    </div>
  )
}
