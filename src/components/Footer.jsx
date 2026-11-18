import { Link } from 'react-router-dom'
import { MapPin, Phone, Mail } from 'lucide-react'
import { company } from '../data'
import { menus } from '../lib/nav'
import { pageById, sections } from '../lib/site'

import { Logo } from './Header'

const shop = menus.find((m) => m.to === '/shop/')
const legal = pageById('P209')
const year = new Date().getFullYear()

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__grid">
        <div>
          <Logo light />
          <p className="footer__lead">
            German sealing engineering since {company.since}. Integrated manufacturing, tribology and custom development.
          </p>
        </div>
        <div>
          <h4>{shop.label}</h4>
          {shop.items.map((i) => (
            <Link key={i.to} to={i.to}>{i.label}</Link>
          ))}
        </div>
        <div>
          <h4>Explore</h4>
          {sections.filter((s) => s.url !== '/shop/').map((s) => (
            <Link key={s.id} to={s.url}>{s.title}</Link>
          ))}
        </div>
        <div>
          <h4>Contact</h4>
          <span className="footer__row"><MapPin size={14} /> {company.street}, {company.city}</span>
          <a className="footer__row" href={`tel:${company.phone.replace(/\s/g, '')}`}><Phone size={14} /> {company.phone}</a>
          <a className="footer__row" href={`mailto:${company.email}`}><Mail size={14} /> {company.email}</a>
        </div>
      </div>
      <div className="container footer__bottom">
        <span>© {year} {company.operator}</span>
        <Link to={legal.url}>{legal.title}</Link>
      </div>
    </footer>
  )
}
