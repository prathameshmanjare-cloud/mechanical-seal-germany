import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X, ArrowRight, ChevronDown, Search, Check } from 'lucide-react'
import SearchBar from './SearchBar'
import MegaMenu from './MegaMenu'
import { applications, products } from '../data'

const SRC = 'https://www.mechanical-seal-germany.com'

const menus = [
  {
    label: 'Products',
    mega: true,
    items: products.slice(0, 10).map((p) => ({ to: `/products/${p.slug}`, label: p.name, hint: p.code })),
    footer: { to: '/products', label: 'View all products' },
  },
  {
    label: 'Applications',
    mega: true,
    items: applications.map((a) => ({ to: `/applications#${a.id}`, label: a.label, hint: a.text })),
    footer: { to: '/applications', label: 'All industries & applications' },
  },
  { label: 'Technology', to: '/technology' },
  {
    label: 'Support',
    mega: true,
    items: [
      { to: '/contact', label: 'Request a Quote', hint: 'Reply within 24 hours' },
      { to: '/products', label: 'Data sheets', hint: 'Download per product type' },
      { to: '/contact', label: 'Technical support', hint: 'Talk to our engineers' },
    ],
  },
  {
    label: 'Company',
    mega: true,
    items: [
      { to: '/about', label: 'About us', hint: 'German specialist since 2009' },
      { to: '/contact', label: 'Contact', hint: 'Leverkusen, Germany' },
      { to: '/impressum', label: 'Imprint', hint: 'Legal information' },
    ],
  },
]

export function Logo({ light = false }) {
  return (
    <Link to="/" className={`logo ${light ? 'logo--light' : ''}`} aria-label="Mechanical Seals Germany, home">
      <svg className="logo__mark" viewBox="0 0 64 44" aria-hidden="true">
        <path className="logo__b1" d="M2 42 L18 2 H32 L16 42 Z" />
        <path className="logo__b2" d="M22 42 L38 2 H52 L36 42 Z" />
        <path className="logo__b3" d="M42 42 L50 22 H62 L54 42 Z" />
      </svg>
      <span className="logo__text">
        <strong>Mechanical Seal</strong>
        <small>Germany</small>
      </span>
    </Link>
  )
}

function Dropdown({ menu, open, onToggle, onFind, onClose, onEnter, onLeave }) {
  return (
    <div
      className={`dd ${open ? 'is-open' : ''} ${menu.mega ? 'dd--mega' : ''}`}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      <button className="dd__btn" onClick={onToggle} aria-expanded={open}>
        {menu.label} <ChevronDown size={15} />
      </button>
      {open && menu.mega && <MegaMenu name={menu.label} onFind={onFind} onClose={onClose} />}
      {open && !menu.mega && (
        <div className={`dd__panel ${menu.wide ? 'dd__panel--wide' : ''}`}>
          <div className="dd__grid">
            {menu.items.map((i) => (
              <Link key={i.to + i.label} to={i.to} className="dd__item">
                <strong>{i.label}</strong>
                {i.hint && <small>{i.hint}</small>}
              </Link>
            ))}
          </div>
          {menu.footer && (
            <Link to={menu.footer.to} className="dd__footer">
              {menu.footer.label} <ArrowRight size={14} />
            </Link>
          )}
        </div>
      )}
    </div>
  )
}

export default function Header() {
  const [open, setOpen] = useState(false)
  const [menu, setMenu] = useState(null)
  const [scrolled, setScrolled] = useState(false)
  const hoverTimer = useRef(null)
  const canHover = () => window.matchMedia('(hover: hover) and (min-width: 1025px)').matches
  const hoverOpen = (label) => {
    if (!canHover()) return
    clearTimeout(hoverTimer.current)
    hoverTimer.current = setTimeout(() => {
      const el = document.activeElement
      if (el?.classList.contains('dd__btn') && el.textContent.trim() !== label) el.blur()
      setMenu(label)
    }, 90)
  }
  const hoverClose = () => {
    if (!canHover()) return
    clearTimeout(hoverTimer.current)
    hoverTimer.current = setTimeout(() => setMenu(null), 220)
  }
  useEffect(() => () => clearTimeout(hoverTimer.current), [])
  const { pathname } = useLocation()
  const nav = useNavigate()
  const navRef = useRef(null)

  useEffect(() => {
    setOpen(false)
    setMenu(null)
  }, [pathname])

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])

  useEffect(() => {
    const close = (e) => navRef.current && !navRef.current.contains(e.target) && setMenu(null)
    const esc = (e) => e.key === 'Escape' && setMenu(null)
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', esc)
    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('keydown', esc)
    }
  }, [])

  const findSeal = () => {
    setMenu(null)
    if (pathname !== '/') nav('/')
    setTimeout(() => window.dispatchEvent(new Event('open-search')), pathname === '/' ? 0 : 450)
  }

  const openSearch = () => {
    if (pathname === '/') window.dispatchEvent(new Event('open-search'))
    else nav('/products')
  }

  return (
    <header className={`header ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="container header__inner" ref={navRef}>
        <button className="icon-btn header__burger" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
        <Logo light />
        <span className="header__divider" />
        <nav className="nav">
          {menus.map((m) => m.to ? (
            <NavLink key={m.label} to={m.to} className="dd__btn">{m.label}</NavLink>
          ) : (
            <Dropdown
              key={m.label}
              menu={m}
              open={menu === m.label}
              onToggle={() => {
                clearTimeout(hoverTimer.current)
                setMenu(canHover() ? m.label : menu === m.label ? null : m.label)
              }}
              onEnter={() => hoverOpen(m.label)}
              onLeave={hoverClose}
              onFind={findSeal}
              onClose={() => setMenu(null)}
            />
          ))}
        </nav>
        <div className="header__tools">
          <button className="icon-btn" onClick={openSearch} aria-label="Search">
            <Search size={20} />
          </button>
          <div className={`dd dd--lang ${menu === 'lang' ? 'is-open' : ''}`}>
            <button className="dd__btn" onClick={() => setMenu(menu === 'lang' ? null : 'lang')} aria-expanded={menu === 'lang'}>
              EN <ChevronDown size={15} />
            </button>
            {menu === 'lang' && (
              <div className="dd__panel dd__panel--right">
                <span className="dd__item dd__item--row is-current"><strong>English</strong><Check size={14} /></span>
                <a href={SRC} className="dd__item dd__item--row" target="_blank" rel="noreferrer"><strong>Deutsch</strong><small>DE</small></a>
              </div>
            )}
          </div>
          <Link to="/contact" className="btn btn--quote">
            Request a Quote <ArrowRight size={16} />
          </Link>
        </div>
      </div>
      {menus.some((m) => m.mega && m.label === menu) && createPortal(<div className="mega-backdrop" aria-hidden="true" />, document.body)}
      {open && (
        <div className="mobile-nav">
          <SearchBar size="sm" placeholder="Search seals or type numbers…" />
          {menus.map((m) => m.to ? (
            <NavLink key={m.label} to={m.to} className="mobile-nav__link">{m.label}</NavLink>
          ) : (
            <details key={m.label}>
              <summary>{m.label} <ChevronDown size={15} /></summary>
              {m.items.map((i) => (
                <NavLink key={i.to + i.label} to={i.to}>{i.label}</NavLink>
              ))}
            </details>
          ))}
          <Link to="/contact" className="btn btn--primary">Request a Quote <ArrowRight size={14} /></Link>
        </div>
      )}
    </header>
  )
}
