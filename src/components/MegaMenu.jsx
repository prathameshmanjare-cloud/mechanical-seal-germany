import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight, Layers, Boxes, CircleDot, Cog, Rows3, Fan, Hexagon, Settings2, Search,
  FlaskConical, Flame, Droplets, Zap, Factory, Wrench, Building2, FileText, Headphones,
  MessageSquareQuote, Phone, CheckCircle2, Thermometer, Gauge, Clock3, Award, Mail, MapPin, Scale, Cpu, Info, Users, Globe2, ShieldCheck,
} from 'lucide-react'
import { products, applications, company, legal, photos } from '../data'

const bySlug = Object.fromEntries(products.map((p) => [p.slug, p]))
const productCard = (slug, sub) => {
  const p = bySlug[slug]
  return p && { to: `/products/${p.slug}`, title: p.name, sub: sub ?? p.code, image: p.image, ph: p.code, text: p.short, chips: p.highlights }
}
const cardsOf = (slugs, sub) => slugs.map((s) => productCard(s, sub)).filter(Boolean)

const featured = ['cartridge-seals', 'metal-bellows', 'splitted-seals', 'agitator-seals', 'elastomer-bellows', 'high-pressure']

const appIcons = { chemical: FlaskConical, 'oil-gas': Flame, water: Droplets, power: Zap, process: Factory, general: Wrench }
const SEAL = '/img/cut/range-cartridge.webp'
const chipIcon = (t) => (/°C/.test(t) ? Thermometer : /bar/.test(t) ? Gauge : CheckCircle2)
const accents = ['#1677ff']
const tel = (n) => `tel:${n.replace(/\s/g, '')}`

/* Each menu: side list of groups; hovering a group swaps the card grid. */
export const megaMenus = {
  Products: {
    sideTitle: 'Browse Products',
    sideIcon: Layers,
    heading: () => 'Product Categories',
    all: { to: '/products', label: 'View All Products' },
    strip: [[Thermometer, 'Up to 450 °C'], [Gauge, 'API 682 up to 60 bar'], [ShieldCheck, 'Quotation within 24 h']],
    groups: [
      { id: 'all', label: 'All Products', to: '/products', icon: Boxes, cards: cardsOf(featured) },
      { id: 'cartridge', label: 'Cartridge Seals', to: '/products?type=cartridge', icon: CircleDot, cards: cardsOf(['cartridge-seals', 'splitted-seals', 'stationary-seals']) },
      { id: 'mechanical', label: 'Mechanical Seals', to: '/products?type=component', icon: Cog, cards: cardsOf(['high-pressure', 'stationary-seals', 'externally-mounted', 'wp11-water-pump']) },
      { id: 'bellows', label: 'Bellows Seals', to: '/products?q=bellows', icon: Rows3, cards: cardsOf(['metal-bellows', 'elastomer-bellows']) },
      { id: 'agitator', label: 'Agitator Seals', to: '/products?app=Agitators', icon: Fan, cards: cardsOf(['agitator-seals', 'splitted-seals', 'sterile-seals']) },
      { id: 'special', label: 'Special Seals', to: '/products?type=special', icon: Hexagon, cards: cardsOf(['sterile-seals', 'rotary-unions', 'seal-faces', 'defense-applications', 'radial-shaft-seals', 'metallic-rings-carbon-segments']) },
      { id: 'custom', label: 'Customized Seals', to: '/products/custom-seals', icon: Settings2, cards: cardsOf(['custom-seals', 'seal-faces', 'splitted-seals']) },
    ],
    cta: { title: ['Need the', 'Right Seal?'], text: 'Get expert guidance to select the best mechanical seal for your application.', image: SEAL, find: true },
  },

  Applications: {
    sideTitle: 'Browse Industries',
    sideIcon: Factory,
    heading: (g) => `Recommended for ${g.label}`,
    all: { to: '/applications', label: 'All Industries & Applications' },
    strip: [[Factory, 'Matched to your process'], [Gauge, 'Up to 450 °C & 60 bar'], [Settings2, 'Custom designs on request']],
    groups: applications.map((a) => ({
      id: a.id,
      label: a.label,
      to: `/applications#${a.id}`,
      icon: appIcons[a.id] ?? Factory,
      cards: cardsOf(a.products),
      cta: { image: a.img, title: a.label, text: a.text },
    })),
    cta: { title: ['Not Sure', 'What Fits?'], text: 'Tell us your medium, pressure and temperature. We match the seal to your process.', photo: true, find: true },
  },

  Support: {
    sideTitle: 'Customer Support',
    sideIcon: Headphones,
    heading: (g) => g.heading,
    all: { to: '/contact', label: 'Contact Support' },
    strip: [[Clock3, 'Reply within 24 hours'], [Headphones, 'German engineers'], [ShieldCheck, 'Quotes for any seal type']],
    groups: [
      {
        id: 'quote', label: 'Request a Quote', to: '/contact', icon: MessageSquareQuote, heading: 'Get a Quote',
        cards: [
          { to: '/contact', title: 'Request a Quote', sub: 'Reply within 24 hours', text: 'Send your seal type, drawing or operating data and get a tailored offer from our engineers.', tag: 'Start request', icon: MessageSquareQuote, bg: '/img/quote-bg.webp' },
          { href: tel(company.phone), title: 'Call Sales', sub: company.phone, tag: 'Call now', icon: Phone },
          { href: `mailto:${company.email}`, title: 'Email Us', sub: company.email, tag: 'Send email', icon: Mail },
          { to: '/products/custom-seals', title: 'Custom Seal Inquiry', sub: 'Built to your drawing', tag: 'Start inquiry', icon: Settings2 },
        ],
      },
      {
        id: 'sheets', label: 'Data Sheets', to: '/products', icon: FileText, heading: 'Data Sheets by Product',
        cards: cardsOf(featured, 'Data sheet & types'),
      },
      {
        id: 'tech', label: 'Technical Support', to: '/contact', icon: Headphones, heading: 'Technical Support',
        cards: [
          { to: '/contact', title: 'Talk to an Engineer', sub: 'Selection & troubleshooting', text: 'Get help choosing materials, solving leakage problems or replacing a seal from another brand.', tag: 'Contact engineer', icon: Headphones },
          { to: '/technology', title: 'Technology & Materials', sub: 'Faces, elastomers, design', tag: 'Explore', icon: Cpu },
          { to: '/applications', title: 'Application Guide', sub: 'Seals by industry', tag: 'Browse', icon: Factory },
          { href: tel(company.mobile), title: 'Mobile Hotline', sub: company.mobile, tag: 'Call now', icon: Phone },
        ],
      },
    ],
    cta: { title: ['Need the', 'Right Seal?'], text: 'Use our seal finder to search by type number, product or application.', image: SEAL, find: true },
  },

  Company: {
    sideTitle: 'Our Company',
    sideIcon: Building2,
    heading: (g) => g.heading,
    all: { to: '/about', label: 'About Mechanical Seals Germany' },
    strip: [[Award, `Since ${company.since}`], [MapPin, `${company.city.replace(/^\d+\s/, '')}, ${company.country}`], [Cog, 'Own seal designs']],
    groups: [
      {
        id: 'about', label: 'About Us', to: '/about', icon: Info, heading: 'Who We Are',
        cards: [
          { to: '/about', title: 'About Us', sub: `German specialist since ${company.since}`, text: 'Mechanical seal specialists designing and supplying seals for pumps, agitators and special equipment.', tag: 'Our story', icon: Users, bg: '/img/about-bg.jpg' },
          { to: '/technology', title: 'Our Technology', sub: 'Precision design & materials', tag: 'Explore', icon: Cpu },
          { to: '/applications', title: 'Industries We Serve', sub: 'From chemical to power', tag: 'Browse', icon: Globe2 },
          { to: '/products', title: 'Product Range', sub: 'Full mechanical seal portfolio', tag: 'View range', icon: Boxes },
        ],
      },
      {
        id: 'contact', label: 'Contact', to: '/contact', icon: MapPin, heading: 'Get in Touch',
        cards: [
          { to: '/contact', title: 'Visit Us', sub: `${company.street}, ${company.city}`, text: `${company.operator}, ${company.street}, ${company.city}, ${company.country}.`, tag: 'Get directions', icon: MapPin },
          { href: tel(company.phone), title: 'Phone', sub: company.phone, tag: 'Call now', icon: Phone },
          { href: `mailto:${company.email}`, title: 'Email', sub: company.email, tag: 'Send email', icon: Mail },
          { to: '/contact', title: 'Contact Form', sub: 'Reply within 24 hours', tag: 'Open form', icon: MessageSquareQuote },
        ],
      },
      {
        id: 'legal', label: 'Legal', to: '/impressum', icon: Scale, heading: 'Legal Information',
        cards: [
          { to: '/impressum', title: 'Imprint', sub: company.operator, text: `Company details, management and registration of ${company.operator}.`, tag: 'Read imprint', icon: Scale },
          { to: '/impressum', title: 'Privacy', sub: 'Data protection notice', tag: 'Read', icon: ShieldCheck },
          { to: '/impressum', title: 'Company Register', sub: `${legal.register} · VAT ${legal.vat}`, tag: 'Details', icon: FileText },
        ],
      },
    ],
    cta: { title: ['Work', 'With Us'], text: `${company.operator}, ${company.city}, ${company.country}. Engineering mechanical seals since ${company.since}.`, image: photos.office, photo: true, contact: true },
  },
}

function Card({ c, i, feature }) {
  const Icon = c.icon
  const inner = Icon ? (
    <>
      {feature && <span className="mega__rings" aria-hidden="true"><i /><i /><i /></span>}
      <span className="mega__img mega__img--icon"><Icon size={feature ? 30 : 24} strokeWidth={1.7} /></span>
      <span className="mega__txt">
        <strong>{c.title}</strong>
        <small>{c.sub}</small>
        {feature && c.text && <span className="mega__desc">{c.text}</span>}
        {c.tag && <em className="mega__tag">{c.tag} <ArrowRight size={14} /></em>}
      </span>
    </>
  ) : (
    <>
      {feature && <span className="mega__rings mega__rings--light" aria-hidden="true"><i /><i /><i /></span>}
      <span className="mega__img mega__img--prod">{c.image ? <img src={c.image} alt="" /> : <span className="ph">{c.ph}</span>}</span>
      <span className="mega__txt">
        <small className="mega__code">{c.sub}</small>
        <strong>{c.title}</strong>
        {feature && c.text && <span className="mega__desc">{c.text}</span>}
        {feature && c.chips?.length > 0 && (
          <span className="mega__chips">{c.chips.slice(0, 2).map((t) => { const I = chipIcon(t); return <i key={t}><I size={14} /> {t}</i> })}</span>
        )}
        <em className="mega__tag">{feature ? 'View details' : 'View seal'} <ArrowRight size={14} /></em>
      </span>
    </>
  )
  const cls = `mega__card ${Icon ? 'mega__card--icon' : 'mega__card--prod'} ${feature ? 'mega__card--feature' : ''} ${feature && c.bg ? 'mega__card--photo' : ''}`
  const props = { className: cls, style: { '--i': i, ...(c.accent && { '--accent': c.accent }), ...(feature && c.bg && { '--bg': `url(${c.bg})` }) } }
  return c.href ? <a href={c.href} {...props}>{inner}</a> : <Link to={c.to} {...props}>{inner}</Link>
}

export default function MegaMenu({ name = 'Products', onFind, onClose }) {
  const cfg = megaMenus[name]
  const [cur, setCur] = useState(cfg.groups[0].id)
  const group = cfg.groups.find((g) => g.id === cur) ?? cfg.groups[0]
  const iconMode = group.cards.every((c) => c.icon)
  const cards = group.cards.slice(0, iconMode ? 4 : 5).map((c, i) => ({ ...c, accent: c.accent ?? (iconMode ? undefined : accents[i % accents.length]) }))
  const cta = { ...cfg.cta, ...(cfg.cta.photo && group.cta) }
  const SideIcon = cfg.sideIcon

  return (
    <div className="mega" role="menu" onClick={(e) => e.target.closest('a') && onClose?.()}>
      <aside className="mega__side">
        <div className="mega__side-title"><SideIcon size={22} strokeWidth={1.6} /> {cfg.sideTitle}</div>
        <ul>
          {cfg.groups.map(({ id, label, to, icon: Icon }) => (
            <li key={id}>
              <Link
                to={to}
                className={`mega__cat ${cur === id ? 'is-active' : ''}`}
                onMouseEnter={() => setCur(id)}
                onFocus={() => setCur(id)}
              >
                <Icon size={19} strokeWidth={1.6} />
                <span>{label}</span>
                <ArrowRight size={16} className="mega__cat-go" />
              </Link>
            </li>
          ))}
        </ul>
        <img className="mega__skyline" src={photos.refinery} alt="" aria-hidden="true" />
        <svg className="mega__swoosh" viewBox="0 0 280 120" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 120 C 90 110, 170 70, 280 0 L280 120 Z" />
          <path d="M60 120 C 140 95, 210 55, 280 14" className="mega__swoosh-line" />
        </svg>
      </aside>

      <div className="mega__main">
        <div className="mega__head">
          <h3>{cfg.heading(group)}</h3>
          <Link to={cfg.all.to} className="mega__all">{cfg.all.label} <ArrowRight size={16} /></Link>
        </div>
        <div className={`mega__grid ${iconMode ? 'mega__grid--icons' : 'mega__grid--products'}`} key={cur}>
          {cards.map((c, i) => <Card key={c.title + i} c={c} i={i} feature={i === 0} />)}
        </div>
        {cfg.strip && (
          <ul className="mega__strip">
            {cfg.strip.map(([I, t]) => <li key={t}><I size={20} strokeWidth={1.8} /> {t}</li>)}
          </ul>
        )}
      </div>

      <aside className="mega__cta">
        <h3>{Array.isArray(cta.title) ? <>{cta.title[0]}<br /><em>{cta.title[1]}</em></> : cta.title}</h3>
        <p>{cta.text}</p>
        <div className={`mega__seal ${cta.photo ? 'mega__seal--photo' : ''}`} aria-hidden="true">
          <img key={cta.image} src={cta.image} alt="" />
        </div>
        {cta.find && (
          <button type="button" className="btn btn--white mega__find" onClick={onFind}>
            <Search size={17} /> Find the Right Seal <ArrowRight size={16} />
          </button>
        )}
        {cta.contact && (
          <Link to="/contact" className="btn btn--white mega__find">
            <MessageSquareQuote size={17} /> Request a Quote <ArrowRight size={16} />
          </Link>
        )}
      </aside>
    </div>
  )
}
