import { Link } from 'react-router-dom'
import { ArrowRight, Compass, Cpu, FlaskConical, Layers, Mail, MailOpen, MapPin, Phone, Settings, ShoppingBag } from 'lucide-react'
import { company } from '../data'
import { menus } from '../lib/nav'
import { pageById, sections } from '../lib/site'

import { Logo } from './Header'

const shop = menus.find((m) => m.to === '/shop/')
const legal = pageById('P209')
const year = new Date().getFullYear()

// Technology column: the first three Technology pages as cards,
// and the emerging-technologies page as the highlighted "New" link.
const technology = sections.find((s) => s.url === '/technology/')
const techPages = (technology?.children ?? []).map(pageById)
const techCards = techPages.slice(0, 3)
const techNew = techPages.find((p) => /emerging/i.test(p.title))
const TECH_ICONS = [Settings, FlaskConical, Cpu]

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__grid">
        <div className="footer__brand">
          <Logo light />
          <p className="footer__lead">
            German sealing engineering since {company.since}. Integrated manufacturing, tribology and custom development.
          </p>
        </div>

        <nav className="footer__col" aria-label={shop.label}>
          <h4><ShoppingBag size={26} strokeWidth={1.6} aria-hidden="true" /> {shop.label}</h4>
          {shop.items.map((i) => (
            <Link key={i.to} to={i.to}>{i.label}</Link>
          ))}
        </nav>

        <nav className="footer__col" aria-label="Explore">
          <h4><Compass size={26} strokeWidth={1.6} aria-hidden="true" /> Explore</h4>
          {sections.filter((s) => s.url !== '/shop/').map((s) => (
            <Link key={s.id} to={s.url}>{s.title}</Link>
          ))}
        </nav>

        {technology && (
          <nav className="footer__col footer__tech" aria-label={technology.title}>
            <h4><Layers size={26} strokeWidth={1.6} aria-hidden="true" /> {technology.title}</h4>
            {techCards.map((p, i) => {
              const Icon = TECH_ICONS[i] ?? Settings
              return (
                <Link key={p.id} to={p.url} className="footer__card" title={p.title}>
                  <Icon size={30} strokeWidth={1.5} aria-hidden="true" />
                  <span>
                    <strong>{p.title}</strong>
                  </span>
                  <ArrowRight size={22} aria-hidden="true" />
                </Link>
              )
            })}
            {techNew && (
              <Link to={techNew.url} className="footer__new">
                <em>New</em>
                <span>{techNew.title}</span>
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
            )}
          </nav>
        )}

        <div className="footer__col footer__contact">
          <h4><MailOpen size={26} strokeWidth={1.6} aria-hidden="true" /> Contact</h4>
          <span className="footer__row"><MapPin size={22} strokeWidth={1.6} aria-hidden="true" /> <span>{company.street},<br />{company.city}</span></span>
          <a className="footer__row" href={`tel:${company.phone.replace(/\s/g, '')}`}><Phone size={22} strokeWidth={1.6} aria-hidden="true" /> {company.phone}</a>
          <a className="footer__row" href={`mailto:${company.email}`}><Mail size={22} strokeWidth={1.6} aria-hidden="true" /> {company.email}</a>
        </div>
      </div>

      <div className="container footer__bottom">
        <span>© {year} {company.operator}</span>
        <nav aria-label="Legal"><Link to={legal.url}>{legal.title}</Link></nav>
      </div>
    </footer>
  )
}
