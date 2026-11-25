// Mega menus generated from the SAP Parts category tree (categories.csv).
// Side list: second-level pages of a section. Main panel: the hovered page plus its children.
import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight, Atom, ChevronRight, Award, BookOpen, Box, Boxes, Building2, CircleDot, Cog, Disc3, Droplets, Factory, Fan, FlaskConical,
  Gauge, Hexagon, Info, Layers, MessageSquareQuote, Ruler, Search, Settings2, ShieldCheck, Sparkles,
  Truck, Users, Wind, Wrench, Zap,
} from 'lucide-react'
import { pageById, sections } from '../lib/site'

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
// Menu art: copies of the category images with the studio backdrop flattened to pure white
// (scripts/flatfield-images.py), so with multiply blending the seals sit straight on the card.
const art = (src) => src && src.replace('/img/category/', '/img/category/clean/')
// Only real figures are shown; pages without articles carry no filler label.
const countLabel = (p) => (p.productCount ? `${fmt(p.productCount)} articles` : null)

const viewAllLabel = (g) => (g.type === 'listing' ? `View All ${g.title.replace(/ Mechanical/, '')}` : `Open ${g.title}`)

/* Warm the browser cache with menu images so panels open fully painted. */
let warmed = false
export function preloadMegaImages() {
  if (warmed || typeof window === 'undefined') return
  warmed = true
  const urls = new Set()
  for (const s of sections) {
    if (s.image) urls.add(art(s.image))
    for (const id of s.children) if (pageById(id).image) urls.add(art(pageById(id).image))
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
  const isShop = section.url === '/shop/'
  const dense = kids.length > 6

  return (
    <div className="mega" role="menu" onClick={(e) => e.target.closest('a') && onClose?.()}>
      <aside className="mega__side">
        <div className="mega__side-title">
          {isShop ? <Box size={24} strokeWidth={1.6} /> : <TitleIcon title={section.title} size={24} strokeWidth={1.6} />}
          <span>{isShop ? 'Shop by Category' : section.title}</span>
          <i aria-hidden="true" />
        </div>
        <ul>
          {groups.map((g) => (
            <li key={g.id}>
              <Link
                to={g.url}
                className={`mega__cat ${cur === g.id ? 'is-active' : ''}`}
                onMouseEnter={() => setCur(g.id)}
                onFocus={() => setCur(g.id)}
              >
                <TitleIcon title={g.title} size={22} strokeWidth={1.5} />
                <span>{g.title}</span>
                {cur === g.id ? <ArrowRight size={19} className="mega__cat-go" /> : <ChevronRight size={18} className="mega__cat-go" />}
              </Link>
            </li>
          ))}
        </ul>
      </aside>

      <div className="mega__main">
        <div className="mega__head">
          <h3>{group.title}</h3>
          <Link to={group.url} className="mega__all">{viewAllLabel(group)} <ArrowRight size={17} /></Link>
        </div>

        <div className={`mega__tree ${dense ? 'is-dense' : ''}`} key={group.id}>
          <Link to={group.url} className="mega__lead">
            <span className="mega__lead-img">{group.image && <img src={art(group.image)} alt="" />}</span>
            <span className="mega__lead-txt">
              <strong>{countLabel(group) ?? 'Overview'}</strong>
              <span className="mega__lead-go"><ArrowRight size={18} /></span>
            </span>
          </Link>
          {kids.length > 0 ? (
            <ul className="mega__links">
              {kids.map((k, i) => (
                <li key={k.id} style={{ '--i': i }}>
                  <Link to={k.url}>
                    <span className="mega__link-txt">
                      <strong>{k.title}</strong>
                      {countLabel(k) && <small>{countLabel(k)}</small>}
                    </span>
                    {!dense && k.image && <img src={art(k.image)} alt="" loading="lazy" />}
                    <span className="mega__link-go"><ArrowRight size={16} /></span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mega__none">Open {group.title} for the full technical overview.</p>
          )}
        </div>

        <p className="mega__rep">Images are representative.</p>
      </div>

      <aside className="mega__cta">
        <h3>Can&rsquo;t find the part?</h3>
        <p>Send the OEM number, dimensions or a drawing.</p>
        {section.image && (
          <figure className="mega__fig">
            <img key={section.image} src={art(section.image)} alt="" />
          </figure>
        )}
        <button type="button" className="mega__find" onClick={onFind}>
          <Search size={19} /> <span>Search the catalogue</span> <ArrowRight size={18} />
        </button>
      </aside>
    </div>
  )
}
