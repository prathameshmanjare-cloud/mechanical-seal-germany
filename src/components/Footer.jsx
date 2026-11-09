import { Link } from 'react-router-dom'
import { MapPin, Phone, Mail } from 'lucide-react'
import { company, products } from '../data'
import { Logo } from './Header'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__grid">
        <div>
          <Logo light />
          <p className="footer__lead">
            Design, development and manufacturing of mechanical seals in Germany. Operated by {company.operator} since {company.since}.
          </p>
        </div>
        <div>
          <h4>Products</h4>
          {products.slice(0, 6).map((p) => (
            <Link key={p.slug} to={`/products/${p.slug}`}>{p.name}</Link>
          ))}
        </div>
        <div>
          <h4>Company</h4>
          <Link to="/about">About us</Link>
          <Link to="/products">All products</Link>
          <Link to="/contact">Request a quote</Link>
        </div>
        <div>
          <h4>Contact</h4>
          <span className="footer__row"><MapPin size={14} /> {company.street}, {company.city}</span>
          <a className="footer__row" href={`tel:${company.phone.replace(/\s/g, '')}`}><Phone size={14} /> {company.phone}</a>
          <a className="footer__row" href={`mailto:${company.email}`}><Mail size={14} /> {company.email}</a>
        </div>
      </div>
      <div className="container footer__bottom">
        <span>© {new Date().getFullYear()} {company.name}</span>
        <Link to="/impressum">Impressum · Datenschutz</Link>
      </div>
    </footer>
  )
}
