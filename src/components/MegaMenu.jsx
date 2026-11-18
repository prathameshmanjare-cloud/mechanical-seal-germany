// Mega menus generated from the SAP Parts category tree (categories.csv).
// Side list: second-level pages of a section. Main panel: the hovered page plus its children.
import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight, Atom, Award, BookOpen, Boxes, Building2, CircleDot, Cog, Disc3, Droplets, Factory, Fan, FlaskConical,
  Gauge, Headphones, Hexagon, Info, Layers, MessageSquareQuote, Ruler, Search, Settings2, ShieldCheck, Sparkles,
  Truck, Users, Wind, Wrench, Zap,
} from 'lucide-react'
import { pageById, sections, totals } from '../lib/site'

// Icon by keyword in the page title; first match wins.
const ICONS = [
  [/^shop$/i, Boxes], [/^oem/i, Search], [/^contact$/i, MessageSquareQuote], [/^about/i, Users], [/^technology$/i, Atom], [/^industries$/i, Factory], [/^applications$/i, Settings2],
  [/spring/i, Cog], [/bellows/i, Layers], [/cartridge/i, CircleDot], [/hygienic|sanitary|wastewater|water/i, Droplets],
  [/special equipment/i, Settings2], [/special/i, Hexagon], [/seat/i, Disc3], [/component/i, Boxes], [/other/i, Layers],
  [/find|search/i, Search], [/information/i, Info], [/pump/i, Factory], [/seal manufacturer/i, Building2],
  [/positive displacement/i, Gauge], [/compressor|refrigeration/i, Wind], [/mixing|agitat/i, Fan],
  [/process/i, FlaskConical], [/infrastructure|utilit/i, Building2], [/heavy/i, Wrench], [/energy|agri/i, Zap],
  [/tribology|surface/i, Atom], [/material/i, Layers], [/knowledge/i, BookOpen], [/experience/i, Award],
  [/emerging/i, Sparkles], [/company/i, Users], [/engineering|development/i, Ruler], [/manufactur/i, Factory],
  [/quality|traceab/i, ShieldCheck], [/logistic|supply/i, Truck], [/support|request/i, MessageSquareQuote],
]
function TitleIcon({ title, ...props }) {
  const Icon = ICONS.find(([re]) => re.test(title))?.[1] ?? ArrowRight
  return <Icon {...props} />
}

const fmt = (n) => n.toLocaleString('en')
const countLabel = (p) => (p.type === 'listing' ? (p.productCount ? `${fmt(p.productCount)} articles` : 'Identification on request') : 'Technical guide')

const SHOP_STRIP = [[Boxes, `${fmt(totals.products)} catalogue articles`], [Search, 'Search by SKU, series or shaft Ø'], [MessageSquareQuote, 'Quotation on request']]
const STRIP = [[Search, 'Identification by OEM number, drawing or dimensions'], [Headphones, 'Engineering review before quotation']]


/* Warm the browser cache with menu images so panels open fully painted. */
let warmed = false
export function preloadMegaImages() {
  if (warmed || typeof window === 'undefined') return
  warmed = true
  const urls = new Set()
  for (const s of sections) {
    if (s.image) urls.add(s.image)
    for (const id of s.children) if (pageById(id).image) urls.add(pageById(id).image)
  }
  urls.forEach((src) => {
    const img = new Image()
    img.decoding = 'async'
    img.src = src
  })
}

export default function MegaMenu({ id, onFind, onClose }) {
  const section = pageById(id)
  const groups = section.children.map(pageById)
  const [cur, setCur] = useState(groups[0]?.id)
  const group = groups.find((g) => g.id === cur) ?? groups[0]
  const kids = group.children.map(pageById)
  const strip = section.url === '/shop/' ? SHOP_STRIP : STRIP

  return (
    <div className="mega" role="menu" onClick={(e) => e.target.closest('a') && onClose?.()}>
      <aside className="mega__side">
        <div className="mega__side-title"><TitleIcon title={section.title} size={22} strokeWidth={1.6} /> {section.title}</div>
        <ul>
          {groups.map((g) => {
            return (
              <li key={g.id}>
                <Link
                  to={g.url}
                  className={`mega__cat ${cur === g.id ? 'is-active' : ''}`}
                  onMouseEnter={() => setCur(g.id)}
                  onFocus={() => setCur(g.id)}
                >
                  <TitleIcon title={g.title} size={19} strokeWidth={1.6} />
                  <span>{g.title}</span>
                  <ArrowRight size={16} className="mega__cat-go" />
                </Link>
              </li>
            )
          })}
        </ul>
      </aside>

      <div className="mega__main">
        <div className="mega__head">
          <h3>{group.title}</h3>
          <Link to={section.url} className="mega__all">All of {section.title} <ArrowRight size={16} /></Link>
        </div>
        <div className="mega__tree" key={group.id}>
          <Link to={group.url} className="mega__lead">
            {group.image && <span className="mega__lead-img"><img src={group.image} alt="" /><i className="mega__rep">Representative illustration</i></span>}
            <span className="mega__lead-txt">
              <small>{countLabel(group)}</small>
              <strong>{group.title}</strong>
              <em className="mega__tag">{group.productCount ? 'View articles' : group.type === 'listing' ? 'Open page' : 'Read guide'} <ArrowRight size={14} /></em>
            </span>
          </Link>
          {kids.length > 0 ? (
            <ul className="mega__links">
              {kids.map((k, i) => (
                <li key={k.id} style={{ '--i': i }}>
                  <Link to={k.url}>
                    <span>
                      <strong>{k.title}</strong>
                      <small>{countLabel(k)}</small>
                    </span>
                    <ArrowRight size={15} />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mega__none">Open {group.title} for the full technical overview.</p>
          )}
        </div>
        <ul className="mega__strip">
          {strip.map(([I, t]) => <li key={t}><I size={16} strokeWidth={1.8} aria-hidden="true" /> {t}</li>)}
        </ul>
      </div>

      <aside className="mega__cta">
        <h3>Can&rsquo;t find the part?</h3>
        <p>Send the OEM number, dimensions or a drawing. Our engineers check fit, duty and materials before quoting.</p>
        {section.image && (
          <figure className="mega__fig">
            <img key={section.image} src={section.image} alt="" />
            <figcaption>Representative illustration</figcaption>
          </figure>
        )}
        <button type="button" className="btn btn--primary mega__find" onClick={onFind}>
          <Search size={17} /> Search the catalogue <ArrowRight size={16} />
        </button>
      </aside>
    </div>
  )
}
