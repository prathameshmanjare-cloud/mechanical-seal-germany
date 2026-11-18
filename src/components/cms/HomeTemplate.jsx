// Home (P001): search first, then the shop families, the other site sections and the editorial copy.
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Search } from 'lucide-react'
import RichText, { CtaBox } from './RichText'
import { ctaOf, introOf } from '../../lib/content'
import { pageById, sections, totals } from '../../lib/site'

const SHOP = '/shop/'
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
      <Search size={18} className="search__icon" />
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="SAP Parts SKU, OEM number, series or shaft Ø…" aria-label="Search the catalogue" />
      <button type="submit" className="btn btn--blue search__btn">Search</button>
    </form>
  )
}

export default function HomeTemplate({ page, content }) {
  const shop = sections.find((s) => s.url === SHOP)
  const families = shop.children.map(pageById)
  const others = sections.filter((s) => s.url !== SHOP)
  const heroImages = families.filter((f) => f.image).slice(0, 3)

  return (
    <div className="cms cms--home" data-page={page.id}>
      <section className="phero home__hero">
        <div className="container phero__inner home__inner">
          <div>
            <h1 className="phero__title home__title">SAP Parts mechanical seal catalogue</h1>
            <p className="phero__text home__lead">{introOf(content) || 'Find your mechanical seal by OEM reference, SAP Parts SKU, dimensions, manufacturer or seal type.'}</p>
            <HomeSearch />
            <ul className="home__facts">
              <li><strong>{fmt(totals.products)}</strong> catalogue articles</li>
              <li><strong>{families.length}</strong> seal families</li>
              <li><strong>{others.length + 1}</strong> sections from shop to engineering support</li>
            </ul>
          </div>
          <div className="home__art" aria-hidden="true">
            {heroImages.map((f, i) => <img key={f.id} src={f.image} alt="" className={`home__art-${i}`} width="300" height="225" />)}
            <span className="home__art-note">Representative illustrations</span>
          </div>
        </div>
      </section>

      <section className="sheet cms__sheet">
        <div className="container subcats home__families">
          <div className="home__head">
            <h2>Shop by seal family</h2>
            <Link to={SHOP} className="mega__all">All {fmt(totals.products)} articles <ArrowRight size={16} /></Link>
          </div>
          <div className="home__grid">
            {families.map((f) => (
              <Link key={f.id} to={f.url} className="home__fam">
                {f.image && <img src={f.image} alt="" loading="lazy" width="240" height="180" />}
                <strong>{f.title}</strong>
                <small>{f.productCount ? `${fmt(f.productCount)} articles` : 'Identification on request'}</small>
              </Link>
            ))}
          </div>
        </div>

        <div className="container subcats home__sections">
          <h2>Find by reference, equipment or topic</h2>
          <div className="subcats__grid">
            {others.map((s) => (
              <Link key={s.id} to={s.url} className="subcat">
                <span>
                  <strong>{s.title}</strong>
                  <small>{s.children.slice(0, 3).map((c) => pageById(c).title).join(' · ')}</small>
                </span>
                <ArrowRight size={16} />
              </Link>
            ))}
          </div>
        </div>

        {content && (
          <div className="container cms__editorial">
            <RichText sections={content.sections} />
            <CtaBox section={ctaOf(content)} />
          </div>
        )}
      </section>
    </div>
  )
}
