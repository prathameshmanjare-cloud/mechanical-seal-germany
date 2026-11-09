import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight, Check, Clock, Megaphone, ShieldCheck, Factory, Truck, FileText, Send, Wrench, Thermometer, Gauge,
} from 'lucide-react'
import SearchBar from '../components/SearchBar'
import ProductCard from '../components/ProductCard'
import { categories, company, industries, notice, products, services, typeCount } from '../data'

const popular = ['Cartridge', 'API 682', 'Metal bellows', 'Agitator', 'Sterile', 'WP11']

export default function Home() {
  const [cat, setCat] = useState('all')
  const nav = useNavigate()
  const shown = cat === 'all' ? products.slice(0, 8) : products.filter((p) => p.category === cat)
  const cartridge = products[0]
  const bellows = products[1]

  return (
    <>
      {/* Hero */}
      <section className="hero container">
        <div className="hero__card">
          <div className="hero__copy">
            <span className="eyebrow">German engineering · Since {company.since}</span>
            <h1>
              Precision mechanical seals,<br />
              <span className="muted">engineered in Germany.</span>
            </h1>
            <p className="lead">
              Cartridge, bellows, agitator and custom seals. Our own designs, built with ISO-certified
              partners and shipped from Leverkusen.
            </p>
            <SearchBar size="lg" />
            <div className="hero__tags">
              <span>Popular:</span>
              {popular.map((t) => (
                <button key={t} onClick={() => nav(`/products?q=${encodeURIComponent(t)}`)}>{t}</button>
              ))}
            </div>
            <div className="hero__badges">
              <span><Clock size={14} /> 24 h quotation</span>
              <span><ShieldCheck size={14} /> ISO-certified partners</span>
              <span><Truck size={14} /> Europe-wide delivery</span>
            </div>
          </div>
          <div className="hero__visual">
            <div className="hero__img">
              <img src={cartridge.image} alt="Cartridge mechanical seal" />
            </div>
            <div className="callout callout--a"><Thermometer size={13} /> up to 450 °C</div>
            <div className="callout callout--b"><Gauge size={13} /> API 682 · 60 bar</div>
            <div className="hero__spec">
              <span>TYPE D · ATEX</span>
              <span>Double cartridge · stationary</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="container stats">
        {[
          ['2009', 'Founded in Leverkusen'],
          [`${typeCount}+`, 'Seal types with data sheets'],
          ['450 °C', 'Max. cartridge temperature'],
          ['24 h', 'Quotation turnaround'],
        ].map(([n, l]) => (
          <div key={l} className="stat">
            <strong>{n}</strong>
            <span>{l}</span>
          </div>
        ))}
      </section>

      {/* Customer notice (from original homepage) */}
      <section className="container">
        <div className="notice">
          <span className="notice__icon"><Megaphone size={16} /></span>
          <div>
            <strong>{notice.title}</strong>
            <span>{notice.text}</span>
          </div>
          <Link to="/contact?product=Cartridge%20SQE%20%2F%20DB" className="link">Ask for prices <ArrowRight size={14} /></Link>
        </div>
      </section>

      {/* Two designs */}
      <section className="section container">
        <div className="section__head">
          <span className="eyebrow">Two core families</span>
          <h2>Cartridge units & component seals</h2>
          <p>Both built from premium face materials. The assembly concept is what sets them apart.</p>
        </div>
        <div className="duo">
          {[
            {
              p: cartridge, tag: 'CR', title: 'Cartridge seals',
              text: 'Pre-assembled, pre-set units that drop into the pump and remove installation errors. Single or double, with or without protective sleeve.',
              chips: ['Pre-assembled', 'API 682', '450 °C', 'ATEX'],
              list: ['Fast, error-free installation', 'Single, double and sterile designs', 'Stationary and rotating versions'],
            },
            {
              p: bellows, tag: 'CP', title: 'Component seals',
              text: 'Metal bellows, elastomer bellows and balanced high-pressure seals for OEM and repair, matched to your installation space.',
              chips: ['Metal bellows', 'Elastomer', 'Balanced', 'To drawing'],
              list: ['Compact for tight housings', 'High temperature and pressure options', 'SiC, WC, carbon and ceramic faces'],
            },
          ].map((d) => (
            <article key={d.tag} className="duo__card">
              <div className="duo__media">
                <span className="chip chip--float">{d.tag}</span>
                <img src={d.p.image} alt={d.title} />
              </div>
              <div className="duo__body">
                <h3>{d.title}</h3>
                <p>{d.text}</p>
                <div className="chips">{d.chips.map((c) => <span key={c} className="chip">{c}</span>)}</div>
                <ul className="checks">
                  {d.list.map((l) => <li key={l}><Check size={14} /> {l}</li>)}
                </ul>
                <Link to={`/products/${d.p.slug}`} className="link">Explore {d.title.toLowerCase()} <ArrowRight size={14} /></Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Dark band */}
      <section className="dark">
        <div className="container dark__inner">
          <span className="eyebrow eyebrow--light">German engineering, quality & manufacturing</span>
          <h2>We do not offer low-quality copies.</h2>
          <p>
            Whether you need a cartridge seal, a pre-assembled sealing unit or a single mechanical seal,
            we provide our own designs, developed to the highest technical standards and built with
            ISO-certified manufacturing partners.
          </p>
          <div className="dark__actions">
            <Link to="/products" className="btn btn--accent">See our products <ArrowRight size={14} /></Link>
            <Link to="/contact" className="btn btn--ghost">Start an RFQ</Link>
          </div>
          <div className="dark__stats">
            <div><strong>60 bar</strong><span>API 682 cartridges</span></div>
            <div><strong>450 °C</strong><span>Metal bellows cartridges</span></div>
            <div><strong>ISO</strong><span>Certified manufacturing</span></div>
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="section container">
        <div className="section__head section__head--row">
          <div>
            <span className="eyebrow">Product range</span>
            <h2>Shop by category</h2>
          </div>
          <Link to="/products" className="link">View all <ArrowRight size={14} /></Link>
        </div>
        <div className="tabs">
          <button className={cat === 'all' ? 'is-active' : ''} onClick={() => setCat('all')}>All</button>
          {categories.map((c) => (
            <button key={c.id} className={cat === c.id ? 'is-active' : ''} onClick={() => setCat(c.id)}>{c.label}</button>
          ))}
        </div>
        <div className="grid">
          {shown.map((p) => <ProductCard key={p.slug} p={p} />)}
        </div>
      </section>

      {/* Specialist */}
      <section className="section container split">
        <div className="split__copy">
          <span className="eyebrow">Your German specialist</span>
          <h2>Engineering reliability. Preventing failure.</h2>
          <p>
            Operated by {company.operator} in Leverkusen, we have developed and supplied high-performance
            sealing technology for demanding industrial applications across Europe since {company.since}.
            Our mission: prevent technical failure before it occurs.
          </p>
          <ul className="checks">
            <li><Check size={14} /> Static and dynamic sealing specialists</li>
            <li><Check size={14} /> Failure analysis and system optimisation</li>
            <li><Check size={14} /> Intelligent procurement and efficient logistics</li>
          </ul>
          <div className="dark__actions">
            <Link to="/about" className="btn btn--primary">More about us</Link>
            <Link to="/contact" className="btn btn--outline">Talk to our team</Link>
          </div>
        </div>
        <div className="promise">
          <span className="eyebrow">Our promise</span>
          {[
            [Clock, 'Reduced costs', 'Smart sourcing and fast response.'],
            [ShieldCheck, 'Minimised risk', 'Engineered for your real operating data.'],
            [Factory, 'Reliable availability', 'Stock and partner network in Europe.'],
            [Wrench, 'Planning security', 'Precise implementation, even in critical situations.'],
          ].map(([Icon, t, d]) => (
            <div key={t} className="promise__row">
              <span className="promise__icon"><Icon size={16} /></span>
              <div><strong>{t}</strong><span>{d}</span></div>
            </div>
          ))}
        </div>
      </section>

      {/* Industries + services */}
      <section className="section section--tint">
        <div className="container">
          <div className="section__head">
            <span className="eyebrow">Where our seals work</span>
            <h2>Trusted across industries</h2>
            <p>Multiple demanding sectors, one sealing standard.</p>
          </div>
          <div className="industries">
            {industries.map((name, i) => (
              <div key={name} className="industry">
                <span>{String(i + 1).padStart(2, '0')}</span>
                {name}
              </div>
            ))}
          </div>
          <div className="services">
            {services.map((s) => (
              <Link key={s.title} to={s.to} className="service">
                <h3>{s.title}</h3>
                <p>{s.text}</p>
                <span className="service__more">Learn more <ArrowRight size={13} /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How to order */}
      <section className="section container">
        <div className="section__head">
          <span className="eyebrow">How to order</span>
          <h2>From part number to delivery</h2>
        </div>
        <div className="steps">
          {[
            [FileText, 'Send your data', 'OEM part number, drawing or operating conditions.'],
            [Wrench, 'We engineer & match', 'Our team selects or designs the right seal.'],
            [Send, 'Quote in 24 h', 'Clear offer, then fast delivery across Europe.'],
          ].map(([Icon, t, d], i) => (
            <div key={t} className="step">
              <span className="step__n">0{i + 1}</span>
              <Icon size={18} />
              <h3>{t}</h3>
              <p>{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container">
        <div className="cta">
          <div>
            <h2>Need a seal that does not fail?</h2>
            <p>Send us your requirements. We reply with a quotation within 24 hours.</p>
          </div>
          <Link to="/contact" className="btn btn--accent">Start RFQ <ArrowRight size={14} /></Link>
        </div>
      </section>
    </>
  )
}
