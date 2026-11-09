import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Menu, X, ArrowRight, Phone } from 'lucide-react'
import SearchBar from './SearchBar'
import { company } from '../data'

const links = [
  { to: '/', label: 'Home' },
  { to: '/products', label: 'Products' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
]

export default function Header() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { pathname } = useLocation()

  useEffect(() => {
    setOpen(false)
  }, [pathname])
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])

  return (
    <>
      <div className="topbar">
        <span className="dot" /> Express RFQ: receive your quotation within 24 hours.
        <a href={`tel:${company.phone.replace(/\s/g, '')}`} className="topbar__phone">
          <Phone size={12} /> {company.phone}
        </a>
      </div>
      <header className={`header ${scrolled ? 'is-scrolled' : ''}`}>
        <div className="container header__inner">
          <button className="icon-btn header__burger" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
          <Link to="/" className="brand">
            <span className="brand__mark">MSG</span>
            <span className="brand__text">
              Mechanical Seals<small>Germany</small>
            </span>
          </Link>
          <nav className="nav">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.to === '/'}>
                {l.label}
              </NavLink>
            ))}
          </nav>
          <div className="header__search">
            <SearchBar size="sm" placeholder="Search products…" />
          </div>
          <Link to="/contact" className="btn btn--accent">
            Start RFQ <ArrowRight size={14} />
          </Link>
        </div>
        {open && (
          <div className="mobile-nav">
            <SearchBar size="sm" placeholder="Search products…" />
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.to === '/'}>
                {l.label}
              </NavLink>
            ))}
          </div>
        )}
      </header>
    </>
  )
}
