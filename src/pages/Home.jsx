import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight, Settings2, Layers, ShieldCheck, FileText, Send, Wrench, Megaphone,
  Timer, BarChart3, BadgeCheck, Globe, Crosshair, Zap, Headphones,
} from 'lucide-react'
import HeroSearch from '../components/HeroSearch'
import { applications, notice, photos, searchIndex } from '../data'
import { appIcons } from './Applications'
import { CountUp, reducedMotion, spotlight, useReveal, useScrollProgress, useTilt } from '../lib/motion'

const typeTotal = Math.floor(searchIndex.filter((r) => !r.isFamily).length / 10) * 10

const range = [
  { slug: 'cartridge-seals', img: '/img/cut/range-cartridge.webp', title: 'Cartridge Seals', text: 'Pre-assembled, error-free installation.' },
  { slug: 'metal-bellows', img: '/img/cut/range-metal.webp', title: 'Metal Bellows Seals', text: 'High temperature, up to 450 °C.' },
  { slug: 'elastomer-bellows', img: '/img/cut/range-elastomer.webp', title: 'Elastomer Bellows', text: 'Flexible and cost-effective.' },
  { slug: 'custom-seals', img: '/img/cut/range-special.webp', title: 'Special Seals', text: 'Custom-engineered to your drawing.' },
]

const CYCLE = 4000

function Industries() {
  const items = applications.slice(0, 5)
  const [cur, setCur] = useState(0)
  const [hold, setHold] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (hold || reducedMotion()) return
    const t = setTimeout(() => setCur((c) => (c + 1) % items.length), CYCLE)
    return () => clearTimeout(t)
  }, [cur, hold, items.length])

  return (
    <section className="inds" ref={ref}>
      <div className="inds__photo" aria-hidden="true">
        <img src={photos.refinery} alt="" loading="lazy" />
      </div>
      <svg className="inds__edge" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <line x1="100" y1="0" x2="48" y2="100" pathLength="1" />
      </svg>
      <div className="inds__ring" aria-hidden="true">
        <img src="/img/hero-bg-sm.jpg" alt="" loading="lazy" />
      </div>

      <div className="container inds__inner">
        <div className="inds__copy">
          <span className="kicker kicker--light" data-reveal>Industries we serve</span>
          <h2 data-reveal>Trusted Sealing Solutions<br />Across <em>Key Industries</em></h2>
          <p data-reveal>Reliable mechanical seals for demanding environments, ensuring safety, efficiency and long service life.</p>
        </div>

        <div className="inds__tiles" data-stagger onMouseLeave={() => setHold(false)}>
          {items.map(({ id, label }, i) => {
            const Icon = appIcons[id]
            return (
              <div key={id} className="itile-wrap" data-reveal>
                <Link
                  to={`/applications#${id}`}
                  className={`itile ${i === cur ? 'is-active' : ''}`}
                  onMouseEnter={() => { setCur(i); setHold(true) }}
                  onFocus={() => { setCur(i); setHold(true) }}
                >
                  <Icon size={44} strokeWidth={1.25} />
                  <span className="itile__label">{label}</span>
                  <span className="itile__go"><ArrowRight size={15} /></span>
                </Link>
              </div>
            )
          })}
        </div>

        <div className="inds__bars" role="tablist" aria-label="Industries">
          {items.map((it, i) => (
            <button
              key={it.id}
              role="tab"
              aria-label={it.label}
              aria-selected={i === cur}
              className={i === cur ? 'is-active' : ''}
              onClick={() => { setCur(i); setHold(false) }}
            >
              <i key={`${cur}-${hold}`} style={{ animationDuration: `${CYCLE}ms`, animationPlayState: hold ? 'paused' : 'running' }} />
            </button>
          ))}
        </div>

        <div className="inds__stats" data-reveal>
          <div><BadgeCheck size={34} strokeWidth={1.3} /><span><strong><CountUp to={10} suffix="+" /></strong>Product Series</span></div>
          <div><Layers size={34} strokeWidth={1.3} /><span><strong><CountUp to={typeTotal} suffix="+" /></strong>Seal Types</span></div>
          <div><Globe size={34} strokeWidth={1.3} /><span><strong>Global</strong>Application Support</span></div>
          <div><ShieldCheck size={34} strokeWidth={1.3} /><span><strong>German</strong>Engineering Standards</span></div>
        </div>
      </div>
    </section>
  )
}

function Finder() {
  const ref = useRef(null)
  const stage = useRef(null)
  useTilt(stage, 8)
  return (
    <section className="finder2" ref={ref} id="finder">
      <div className="container">
      <div className="finder2__card">
      <div className="finder2__bg" aria-hidden="true" />
      <div className="finder2__inner">
        <div className="finder2__intro">
          <span className="finder2__pill" data-reveal><Crosshair size={18} strokeWidth={2} /> Product Finder</span>
          <h2 data-reveal>Find the Right<br /><em>Mechanical Seal</em></h2>
          <span className="finder2__bar" data-reveal />
          <p data-reveal>Search by type number, product name, or seal family and get the exact match instantly.</p>
        </div>

        <div className="finder2__search" data-reveal>
          <HeroSearch popular={['MBC+', '13HD', 'API 682', 'Agitator']} />
        </div>

        <div className="finder2__stage" ref={stage} aria-hidden="true" data-reveal>
          <svg className="finder2__arc" viewBox="0 0 400 400">
            <defs>
              <linearGradient id="fArc" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#1677ff" stopOpacity="0" />
                <stop offset=".45" stopColor="#3d9bff" />
                <stop offset="1" stopColor="#bfe0ff" stopOpacity=".2" />
              </linearGradient>
            </defs>
            <path d="M40 260 A 170 170 0 1 1 372 236" />
          </svg>
          <div className="finder2__disc"><span /><span /></div>
          <img src="/img/cut/finder-seal.webp" alt="" className="finder2__seal" draggable="false" />
        </div>

        <ul className="finder2__feats" data-stagger>
          {[
            [Zap, 'Instant', 'Results'],
            [Layers, 'Search by', 'Type / Name / Family'],
            [Crosshair, 'Accurate', 'Product Match'],
            [Headphones, 'Expert Support', 'for Selection'],
          ].map(([Icon, a, b], i) => (
            <li key={b} data-reveal>
              <span className="finder2__icon"><Icon size={24} strokeWidth={1.8} /></span>
              <span className={i === 1 ? 'is-flip' : ''}><strong>{a}</strong>{b}</span>
            </li>
          ))}
        </ul>
      </div>
      </div>
      </div>
    </section>
  )
}

function Precision() {
  const ref = useRef(null)
  useScrollProgress(ref)
  return (
    <section className="prec container" ref={ref}>
      <div className="prec__visual" aria-hidden="true">
        <svg className="prec__axis" viewBox="0 0 600 300" preserveAspectRatio="none">
          <line x1="0" y1="150" x2="600" y2="150" />
          <path d="M40 60 A 260 260 0 0 1 560 60" />
        </svg>
        <div className="prec__parts">
          <img src="/img/cut/part-seat.webp" alt="" className="prec__seat" draggable="false" />
          <img src="/img/cut/part-rotor.webp" alt="" className="prec__rotor" draggable="false" />
        </div>
        <span className="prec__tag prec__tag--a"><i />Stationary seat</span>
        <span className="prec__tag prec__tag--b"><i />Seal faces</span>
        <span className="prec__tag prec__tag--c"><i />Elastomer bellows & spring</span>
      </div>
      <div className="prec__copy">
        <span className="kicker" data-reveal>Engineering excellence</span>
        <h2 data-reveal>Precision in Every Component</h2>
        <p data-reveal>
          Every seal is our own design, built from premium SiC, WC, carbon and ceramic faces with
          ISO-certified manufacturing partners. German engineering standards you can rely on.
        </p>
        <div className="prec__points" data-stagger>
          {[
            [Settings2, 'Higher', 'Efficiency'],
            [Timer, 'Lower', 'Downtime'],
            [BarChart3, 'Longer', 'Equipment Life'],
          ].map(([Icon, a, b]) => (
            <div key={b} className="prec__point" data-reveal>
              <Icon size={26} strokeWidth={1.6} />
              <span>{a}<br />{b}</span>
            </div>
          ))}
        </div>
        <div className="prec__stats" data-stagger>
          <div data-reveal><strong><CountUp to={typeTotal} suffix="+" /></strong><span>Seal types</span></div>
          <div data-reveal><strong><CountUp to={450} suffix=" °C" /></strong><span>Max. temperature</span></div>
          <div data-reveal><strong><CountUp to={60} suffix=" bar" /></strong><span>API 682 pressure</span></div>
          <div data-reveal><strong><CountUp to={24} suffix=" h" /></strong><span>Quotation time</span></div>
        </div>
        <Link to="/about" className="btn btn--navy" data-reveal>
          Learn More <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  )
}

/* Seal centre and dial radius, as fractions of the hero image (1671 × 941). */
const DIAL = { x: 0.6, y: 0.455, r: 0.385, pos: [0.58, 0.5] }
const IMG_W = 1671
const IMG_H = 941
const T0 = 172
const STEP = 2
const TICKS = Array.from({ length: 65 }, (_, i) => T0 + i * STEP)

const polar = (deg, r) => {
  const a = (deg * Math.PI) / 180
  return [500 + r * Math.cos(a), 500 + r * Math.sin(a)]
}
const arc = (from, to, r) => {
  const [x1, y1] = polar(from, r)
  const [x2, y2] = polar(to, r)
  return `M${x1.toFixed(1)} ${y1.toFixed(1)} A${r} ${r} 0 ${to - from > 180 ? 1 : 0} 1 ${x2.toFixed(1)} ${y2.toFixed(1)}`
}

/* A quiet engineering gauge: hairline scale, numbered majors, one index marker. */
function Dial() {
  return (
    <svg className="dial" viewBox="0 0 1000 1000">
      <path d={arc(158, 350, 468)} className="dial__outer" pathLength="1" />
      <path d={arc(T0, T0 + 64 * STEP, 404)} className="dial__base" pathLength="1" />
      <g className="dial__ticks">
        {TICKS.map((deg, i) => {
          const major = i % 10 === 0
          const mid = !major && i % 5 === 0
          const [x1, y1] = polar(deg, 404)
          const [x2, y2] = polar(deg, major ? 436 : mid ? 424 : 416)
          const [tx, ty] = polar(deg, 458)
          return (
            <g key={deg} style={{ '--k': i }}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} className={major ? 'is-major' : mid ? 'is-mid' : ''} />
              {major && <text x={tx} y={ty} className="dial__num">{i}</text>}
            </g>
          )
        })}
      </g>
      <g className="dial__index">
        <g className="dial__follow">
          <path d="M500 86 L491 66 L509 66 Z" className="dial__marker" />
          <line x1="500" y1="92" x2="500" y2="128" className="dial__needle" />
        </g>
      </g>
    </svg>
  )
}

function HeroPhoto() {
  const ref = useRef(null)
  const frame = useRef(null)
  const dial = useRef(null)
  useTilt(ref, 1)

  useEffect(() => {
    const f = frame.current
    const d = dial.current
    if (!f || !d) return
    const place = () => {
      const W = f.offsetWidth
      const H = f.offsetHeight
      const pos = getComputedStyle(f.querySelector('img')).objectPosition.split(' ').map((v) => parseFloat(v) / 100)
      const k = Math.max(W / IMG_W, H / IMG_H)
      const dw = IMG_W * k
      const dh = IMG_H * k
      const ox = (W - dw) * (pos[0] ?? DIAL.pos[0])
      const oy = (H - dh) * (pos[1] ?? DIAL.pos[1])
      const size = DIAL.r * dh * 2 * (500 / 470)
      d.style.width = `${size}px`
      d.style.height = `${size}px`
      d.style.left = `${ox + DIAL.x * dw - size / 2}px`
      d.style.top = `${oy + DIAL.y * dh - size / 2}px`
    }
    place()
    const ro = new ResizeObserver(place)
    ro.observe(f)
    return () => ro.disconnect()
  }, [])

  return (
    <div className="hero2__photo" ref={ref} aria-hidden="true">
      <div className="hero2__frame" ref={frame}>
        <img
          src="/img/hero-bg.png"
          srcSet="/img/hero-bg-sm.jpg 836w, /img/hero-bg.png 1672w"
          sizes="100vw"
          alt=""
          fetchPriority="high"
          draggable="false"
        />
        <div className="hero2__dial" ref={dial}><Dial /></div>
      </div>
    </div>
  )
}

export default function Home() {
  const root = useRef(null)
  useReveal(root)

  return (
    <div ref={root} className="home">
      {/* Hero */}
      <section className="hero2">
        <div className="hero2__bg" aria-hidden="true" />
        <HeroPhoto />
        <div className="container hero2__inner">
          <div className="hero2__copy">
            <span className="kicker kicker--light hero2__in" style={{ '--d': 0 }}>Precision sealing solutions</span>
            <h1>
              <span className="line"><span style={{ '--d': 1 }}>Engineered Sealing</span></span>
              <span className="line"><span style={{ '--d': 2 }}>Solutions for</span></span>
              <span className="line line--accent"><span style={{ '--d': 3 }}>Critical Applications</span></span>
            </h1>
            <p className="hero2__lead hero2__in" style={{ '--d': 5 }}>
              High-performance mechanical seals designed in Germany for maximum reliability,
              efficiency and longer service life.
            </p>
            <div className="hero2__cta hero2__in" style={{ '--d': 6 }}>
              <Link to="/products" className="btn btn--white">Explore Products <ArrowRight size={16} /></Link>
              <Link to="/contact" className="btn btn--line"><FileText size={16} /> Request a Quote</Link>
            </div>
            <div className="hero2__trust hero2__in" style={{ '--d': 7 }}>
              <span><Settings2 size={26} strokeWidth={1.5} /> Reliable<br />Performance</span>
              <span><Layers size={26} strokeWidth={1.5} /> Precision<br />Engineering</span>
              <span><ShieldCheck size={26} strokeWidth={1.5} /> Longer<br />Service Life</span>
            </div>
          </div>
          <div className="hero2__spacer" />
        </div>
      </section>

      {/* Finder */}
      <Finder />

      {/* Range */}
      <section className="range2 container">
        <div className="range2__head">
          <div>
            <span className="kicker" data-reveal>Our product range</span>
            <h2 data-reveal>Mechanical Seals for<br />Diverse Applications</h2>
          </div>
          <Link to="/products" className="ulink" data-reveal>View All Products <ArrowRight size={15} /></Link>
        </div>
        <div className="range2__grid" data-stagger>
          {range.map((r) => (
            <Link key={r.slug} to={`/products/${r.slug}`} className="pc" onPointerMove={spotlight} data-reveal>
              <div className="pc__media"><img src={r.img} alt="" loading="lazy" draggable="false" /></div>
              <div className="pc__body">
                <div>
                  <h3>{r.title}</h3>
                  <p>{r.text}</p>
                </div>
                <span className="pc__go"><ArrowRight size={15} /></span>
              </div>
            </Link>
          ))}
        </div>
        <div className="notice notice--slim" data-reveal>
          <span className="notice__icon"><Megaphone size={16} /></span>
          <div>
            <strong>{notice.title}</strong>
            <span>{notice.text}</span>
          </div>
          <Link to="/contact?product=Cartridge%20SQE%20%2F%20DB" className="ulink">Ask for prices <ArrowRight size={14} /></Link>
        </div>
      </section>

      <Industries />

      <Precision />

      {/* How to order */}
      <section className="section section--tint">
        <div className="container">
          <div className="section__head">
            <span className="kicker" data-reveal>How to order</span>
            <h2 data-reveal>From type number to delivery</h2>
          </div>
          <div className="steps" data-stagger>
            {[
              [FileText, 'Send your data', 'OEM part number, drawing or operating conditions.'],
              [Wrench, 'We engineer & match', 'Our team selects or designs the right seal.'],
              [Send, 'Quote in 24 h', 'Clear offer, then fast delivery across Europe.'],
            ].map(([Icon, t, d], i) => (
              <div key={t} className="step" data-reveal>
                <span className="step__n">0{i + 1}</span>
                <Icon size={20} />
                <h3>{t}</h3>
                <p>{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container">
        <div className="cta" data-reveal>
          <div>
            <h2>Need a seal that does not fail?</h2>
            <p>Send us your requirements. We reply with a quotation within 24 hours.</p>
          </div>
          <Link to="/contact" className="btn btn--white">Request a Quote <ArrowRight size={16} /></Link>
        </div>
      </section>
    </div>
  )
}
