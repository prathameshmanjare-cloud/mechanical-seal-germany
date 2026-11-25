// Home (P001): search first, then the shop families, the other site sections and the editorial copy.
import { Link } from 'react-router-dom'
import {
  ArrowRight, Building2, CalendarDays, Factory, FlaskConical, Hash, Headset, Layers, Package, Ruler, Settings, Warehouse,
  Wrench,
} from 'lucide-react'
import HomeEngineering from './HomeEngineering'
import SmartSearch from '../SmartSearch'
import { introOf } from '../../lib/content'
import { pageById, sections, totals } from '../../lib/site'

const SHOP = '/shop/'
const FIND = 'P041' // OEM Replacement > Find a Replacement
const FIND_ICONS = [Hash, Factory, Wrench, Ruler]
const fmt = (n) => n.toLocaleString('en')

// Icon per top-level section in the "Find by reference" grid, by keyword in its title.
const EXPLORE_ICONS = [
  [/oem|replacement/i, Settings], [/manufacturer/i, Factory], [/application/i, Layers], [/industr/i, Warehouse],
  [/technolog/i, FlaskConical], [/about/i, Building2], [/contact/i, Headset],
]
const exploreIcon = (title) => EXPLORE_ICONS.find(([re]) => re.test(title))?.[1] ?? Layers

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
            <p className="home__eyebrow" data-reveal style={{ '--d': 0 }}>Mechanical seal catalogue</p>
            <h1 className="home__title" data-reveal style={{ '--d': 1 }}>
              Find the Right <span className="home__title-accent">Mechanical Seal</span>
            </h1>
            <p className="home__lead" data-reveal style={{ '--d': 2 }}>{introOf(content) || 'Find your mechanical seal by OEM reference, SAP Parts SKU, dimensions, manufacturer or seal type.'}</p>
            <div data-reveal style={{ '--d': 3 }}><SmartSearch hotkey className="cms-search home__ss" /></div>
            <ul className="home__facts" data-reveal style={{ '--d': 4 }}>
              <li><Layers size={26} strokeWidth={1.6} aria-hidden="true" /><span><strong data-count={totals.products}>{fmt(totals.products)}</strong>Articles</span></li>
              <li><Settings size={26} strokeWidth={1.6} aria-hidden="true" /><span><strong>{families.length}</strong>Seal families</span></li>
              <li><CalendarDays size={26} strokeWidth={1.6} aria-hidden="true" /><span><strong>Since 2009</strong>in sealing engineering</span></li>
            </ul>
          </div>
          <div className="home__art" aria-hidden="true" />
        </div>
        <span className="home__hero-note" aria-hidden="true">Images are representative</span>
      </section>

      {finders.length > 0 && (
        <div className="container home__finders-wrap">
          <nav className="home__finders" aria-label="Ways to find a replacement" data-reveal style={{ '--d': 5 }}>
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
        </div>
      )}

      <section className="fams" aria-labelledby="fams-title">
        <div className="container">
          <div className="fams__head" data-reveal>
            <div>
              <p className="fams__eyebrow">Explore our range</p>
              <h2 id="fams-title" className="fams__title">Shop by <span>Seal Family</span></h2>
              <p className="fams__lead">A complete range of mechanical seals and components for diverse industrial applications.</p>
            </div>
            <ul className="fams__stats">
              <li><Layers size={24} strokeWidth={1.6} aria-hidden="true" /><span><strong>{families.length}</strong>Seal families</span></li>
              <li><Package size={24} strokeWidth={1.6} aria-hidden="true" /><span><strong data-count={totals.products}>{fmt(totals.products)}</strong>Articles</span></li>
              <li><CalendarDays size={24} strokeWidth={1.6} aria-hidden="true" /><span><strong>Since 2009</strong>in sealing engineering</span></li>
            </ul>
          </div>

          <div className="fams__grid">
            {families.map((f, i) => (
              <Link key={f.id} to={f.url} className={`fam ${i === 0 ? 'fam--featured' : ''}`} data-reveal data-spotlight style={{ '--d': i % 4 }}>
                <span className="fam__media">
                  {f.image && <img src={f.image.replace('/img/category/', '/img/category/clean/')} alt="" loading="lazy" width="800" height="600" />}
                </span>
                <span className="fam__body">
                  <span className="fam__text">
                    <strong data-allow-widow>{f.title}</strong>
                    {f.productCount > 0 && <small>{fmt(f.productCount)} articles</small>}
                  </span>
                  <span className="fam__go"><ArrowRight size={18} aria-hidden="true" /></span>
                </span>
              </Link>
            ))}
          </div>

          <div className="fams__foot" data-reveal>
            <p className="fams__note">Images are representative.</p>
            <Link to={SHOP} className="btn btn--primary fams__all">View all {fmt(totals.products)} articles <ArrowRight size={17} aria-hidden="true" /></Link>
          </div>
        </div>
      </section>

      <section className="explore" aria-labelledby="explore-title">
        <div className="container">
          <div data-reveal>
          <p className="explore__eyebrow">Explore</p>
          <h2 id="explore-title" className="explore__title">Find by Reference, Equipment or Topic</h2>
          <p className="explore__lead">Quickly access replacement solutions, manufacturers, applications and technical resources for mechanical seals and related equipment.</p>
          </div>
          <div className="explore__grid">
            {others.map((s, i) => {
              const Icon = exploreIcon(s.title)
              return (
                <Link key={s.id} to={s.url} className="xcard" data-reveal data-spotlight style={{ '--d': i % 4 }}>
                  <span className="xcard__icon"><Icon size={26} strokeWidth={1.6} aria-hidden="true" /></span>
                  <strong className="xcard__title">{s.title}</strong>
                  <span className="xcard__foot">
                    <small>{s.children.slice(0, 2).map((c) => pageById(c).title).join(' · ')}</small>
                    <span className="xcard__go"><ArrowRight size={17} aria-hidden="true" /></span>
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {content && <HomeEngineering content={content} />}
    </div>
  )
}
