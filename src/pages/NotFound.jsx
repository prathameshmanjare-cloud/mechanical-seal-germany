import { useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ChevronLeft, ArrowRight, Home, ShoppingBag, MessageSquare } from 'lucide-react'

// Interactive 404: a real cartridge seal (photo cut-out) turns like a compass needle to face the pointer,
// in the middle of a topographic map with a route and clickable pins. See docs/404-seal-page-prompt.md.

const STIFF = 0.06
const DAMP = 0.82
const IDLE_MS = 2500
const IDLE_SPEED = 0.024 // deg per ms (≈24°/s, clockwise)

// Stage coordinates (viewBox 0 0 1600 760). Pins use the same numbers as percentages.
const VB_W = 1600
const VB_H = 760
const ROUTE = 'M230,600 C300,500 380,640 470,530 S500,300 640,170 S900,40 1030,140 S1240,270 1330,190'
const ROUTE_2 = 'M1330,190 C1500,250 1520,480 1380,600'
const SPUR = 'M560,250 C470,210 400,260 300,170'
const DEAD_END = { x: 300, y: 170 }
const PINS = [
  { to: '/', label: 'Home', icon: Home, x: 230, y: 600 },
  { to: '/shop/', label: 'Shop', icon: ShoppingBag, x: 1330, y: 190 },
  { to: '/contact/', label: 'Engineers', icon: MessageSquare, x: 1380, y: 600 },
]
const pct = (x, y) => ({ left: `${(x / VB_W) * 100}%`, top: `${(y / VB_H) * 100}%` })

// Topographic contour lines: wobbly closed loops around a few "hills", smoothed with Catmull-Rom.
function loop(cx, cy, r, seed, k) {
  const n = 48
  const pts = []
  for (let i = 0; i < n; i++) {
    const t = (i / n) * Math.PI * 2
    const w = 1 + 0.13 * Math.sin(3 * t + seed) + 0.07 * Math.sin(5 * t + seed * 2 + k * 0.35) + 0.04 * Math.cos(7 * t - seed + k * 0.2)
    pts.push([cx + Math.cos(t) * r * w * 1.35, cy + Math.sin(t) * r * w])
  }
  let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n]
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6]
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6]
    d += `C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`
  }
  return d + 'Z'
}
const HILLS = [
  { cx: 260, cy: 220, seed: 0.4, count: 9, step: 34 },
  { cx: 1380, cy: 700, seed: 2.1, count: 11, step: 36 },
  { cx: 1440, cy: 110, seed: 4.2, count: 6, step: 30 },
  { cx: 520, cy: 880, seed: 5.3, count: 7, step: 32 },
]
const CONTOURS = HILLS.flatMap((h) =>
  Array.from({ length: h.count }, (_, k) => ({ d: loop(h.cx, h.cy, 26 + k * h.step, h.seed, k), major: k % 4 === 3 })),
)

function Topo() {
  return (
    <svg className="nf-topo" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <pattern id="nfGrid" width="80" height="80" patternUnits="userSpaceOnUse">
          <path d="M80,0 L0,0 0,80" fill="none" stroke="currentColor" strokeWidth="1" opacity=".35" />
        </pattern>
      </defs>
      <rect width="1600" height="900" fill="url(#nfGrid)" />
      {CONTOURS.map((c, i) => (
        <path key={i} d={c.d} fill="none" stroke="currentColor" strokeWidth={c.major ? 1.6 : 1} opacity={c.major ? 0.9 : 0.55} />
      ))}
    </svg>
  )
}

function Route() {
  return (
    <svg className="nf-route" viewBox={`0 0 ${VB_W} ${VB_H}`} aria-hidden="true">
      <defs>
        <mask id="nfDraw" maskUnits="userSpaceOnUse" x="0" y="0" width={VB_W} height={VB_H}>
          <path className="nf-route__draw" d={ROUTE} pathLength="1" />
          <path className="nf-route__draw nf-route__draw--2" d={ROUTE_2} pathLength="1" />
          <path className="nf-route__draw nf-route__draw--3" d={SPUR} pathLength="1" />
        </mask>
      </defs>
      <g mask="url(#nfDraw)">
        <path className="nf-route__casing" d={`${ROUTE} ${ROUTE_2}`} />
        <path className="nf-route__line" d={`${ROUTE} ${ROUTE_2}`} />
        <path className="nf-route__spur" d={SPUR} />
      </g>
      <g transform={`translate(${DEAD_END.x} ${DEAD_END.y})`}>
        <g className="nf-route__x">
          <circle r="26" className="nf-route__x-ring" />
          <path d="M-11,-11 L11,11 M11,-11 L-11,11" />
        </g>
      </g>
    </svg>
  )
}

export default function NotFound() {
  const { pathname } = useLocation()
  const rootRef = useRef(null)
  const sealRef = useRef(null)
  const spinRef = useRef(null)

  useEffect(() => { document.title = 'Page not found | SAP Parts' }, [])

  useEffect(() => {
    const root = rootRef.current
    const seal = sealRef.current
    const spin = spinRef.current
    if (!root || !seal || !spin) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const s = { cur: 0, vel: 0, target: 0, tx: 0, ty: 0, ttx: 0, tty: 0, lastMove: -Infinity, prev: performance.now(), raf: 0 }

    const onMove = (e) => {
      const r = seal.getBoundingClientRect()
      const dx = e.clientX - (r.left + r.width / 2)
      const dy = e.clientY - (r.top + r.height / 2)
      const deg = (Math.atan2(dy, dx) * 180) / Math.PI + 90
      s.target += ((((deg - s.target) % 360) + 540) % 360) - 180
      const reach = Math.max(window.innerWidth, window.innerHeight) / 2
      s.ttx = Math.max(-1, Math.min(1, dx / reach))
      s.tty = Math.max(-1, Math.min(1, dy / reach))
      s.lastMove = performance.now()
    }
    const onLeave = () => { s.ttx = 0; s.tty = 0; s.lastMove = -Infinity }
    const onSpin = () => { s.target += 720; s.lastMove = -Infinity }

    const tick = (now) => {
      const dt = Math.min(48, now - s.prev)
      s.prev = now
      if (now - s.lastMove > IDLE_MS) {
        s.target += dt * IDLE_SPEED
        s.ttx *= 0.96
        s.tty *= 0.96
      }
      s.vel = (s.vel + (s.target - s.cur) * STIFF) * DAMP
      s.cur += s.vel
      s.tx += (s.ttx - s.tx) * 0.08
      s.ty += (s.tty - s.ty) * 0.08
      spin.style.transform = `rotate(${s.cur.toFixed(2)}deg)`
      seal.style.setProperty('--nf-rx', (-s.ty * 12).toFixed(2) + 'deg')
      seal.style.setProperty('--nf-ry', (s.tx * 12).toFixed(2) + 'deg')
      root.style.setProperty('--nf-px', (s.tx * -18).toFixed(2) + 'px')
      root.style.setProperty('--nf-py', (s.ty * -18).toFixed(2) + 'px')
      s.raf = requestAnimationFrame(tick)
    }

    root.addEventListener('pointermove', onMove)
    root.addEventListener('pointerleave', onLeave)
    seal.addEventListener('click', onSpin)
    s.raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(s.raf)
      root.removeEventListener('pointermove', onMove)
      root.removeEventListener('pointerleave', onLeave)
      seal.removeEventListener('click', onSpin)
    }
  }, [])

  return (
    <section className="nf" ref={rootRef}>
      <div className="nf-bg" aria-hidden="true">
        <Topo />
        <div className="nf-bg__inner">
          <span className="nf-bg__num">404</span>
        </div>
      </div>

      <div className="nf-stage">
        <Route />
        {PINS.map(({ to, label, icon: Icon, x, y }, i) => (
          <Link key={to} to={to} className="nf-pin" style={{ ...pct(x, y), '--d': i }}>
            <span className="nf-pin__head"><Icon size={18} aria-hidden="true" /></span>
            <span className="nf-pin__label">{label}</span>
          </Link>
        ))}
        <span className="nf-deadend" style={pct(DEAD_END.x, DEAD_END.y)} aria-hidden="true">You are here</span>

        <button type="button" className="nf-seal" ref={sealRef} aria-label="Spin the seal">
          <span className="nf-seal__shadow" aria-hidden="true" />
          <span className="nf-seal__tilt">
            <svg className="nf-seal__dial" viewBox="-100 -100 200 200" aria-hidden="true">
              <circle r="97" className="nf-seal__dial-ring" />
              <circle r="91" className="nf-seal__dial-ticks" pathLength="144" />
              {['N', 'E', 'S', 'W'].map((l, i) => (
                <text key={l} transform={`rotate(${i * 90}) translate(0 -80)`} className="nf-seal__dial-label">{l}</text>
              ))}
            </svg>
            <span className="nf-seal__spin" ref={spinRef}>
              <span className="nf-seal__needle" aria-hidden="true" />
              <img src="/img/404/cartridge-seal.webp" alt="" width="520" height="520" className="nf-seal__img" draggable="false" />
            </span>
          </span>
        </button>
      </div>

      <div className="nf-copy">
        <p className="nf-copy__path"><strong>404</strong><span>{pathname}</span></p>
        <h1>Uh-oh! This page isn&rsquo;t on our map</h1>
        <p className="nf-copy__sub">Our seal spun off course. We&rsquo;ll guide you back to parts you know.</p>
        <div className="nf-copy__actions">
          <Link to="/" className="nf-btn nf-btn--primary"><ChevronLeft size={18} aria-hidden="true" /> Take me home</Link>
          <Link to="/shop/" className="nf-btn nf-btn--ghost">Browse the Shop <ArrowRight size={16} aria-hidden="true" /></Link>
        </div>
        <p className="nf-copy__help">Looking for a part number? <Link to="/contact/">Contact our engineers</Link></p>
      </div>
    </section>
  )
}
