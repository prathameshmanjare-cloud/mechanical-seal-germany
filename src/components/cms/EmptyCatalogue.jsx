// Empty state for a listing page that has no catalogue articles assigned yet.
import { Link } from 'react-router-dom'
import { ArrowRight, Box, Send, ShoppingBag } from 'lucide-react'

function Blueprint() {
  return (
    <svg className="ecat__blueprint" viewBox="0 0 260 230" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="1.2">
        <circle cx="160" cy="125" r="78" />
        <circle cx="160" cy="125" r="70" />
        <circle cx="160" cy="125" r="50" />
        <circle cx="160" cy="125" r="44" />
        <path d="M82 25v40M238 25v40M82 40h156" />
        <path d="M60 85h24M60 165h24M70 85v80" />
        <path d="M116 125H64M204 125h52" strokeDasharray="6 4" />
      </g>
      <g fill="currentColor">
        <path d="M82 40l9-4v8zM238 40l-9-4v8zM70 85l-4 9h8zM70 165l-4-9h8z" />
        <text x="148" y="34">ØD</text>
        <text x="26" y="131">Ød</text>
      </g>
    </svg>
  )
}

export default function EmptyCatalogue() {
  return (
    <section className="ecat" aria-labelledby="ecat-title">
      <div className="ecat__card">
        <svg className="ecat__waves" viewBox="0 0 1200 300" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id="ecatBlue" x1="0" x2="1">
              <stop offset="0" stopColor="#1f63d6" />
              <stop offset="1" stopColor="#7fb0f0" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="ecatBlueR" x1="0" x2="1">
              <stop offset="0" stopColor="#4d8fe8" stopOpacity="0" />
              <stop offset=".5" stopColor="#2f74de" />
              <stop offset="1" stopColor="#a9c9f3" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="ecatGold" x1="0" x2="1">
              <stop offset="0" stopColor="#f9c301" stopOpacity="0" />
              <stop offset=".45" stopColor="#f9c301" />
              <stop offset="1" stopColor="#f9c301" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d="M0 254c70 12 150 34 210 46H0z" fill="url(#ecatBlue)" />
          <path d="M820 300c60-16 130-22 200-14 30 4 52 9 80 14z" fill="url(#ecatBlueR)" opacity=".9" />
          <path d="M800 300c60-22 130-30 210-22" fill="none" stroke="url(#ecatGold)" strokeWidth="6" strokeLinecap="round" />
        </svg>
        <svg className="ecat__arc" viewBox="0 0 120 60" aria-hidden="true">
          <path d="M4 8c40-6 80 10 108 44" fill="none" stroke="url(#ecatArc)" strokeWidth="5" strokeLinecap="round" />
          <defs>
            <linearGradient id="ecatArc" x1="0" x2="1">
              <stop offset="0" stopColor="#f9c301" stopOpacity="0" />
              <stop offset=".6" stopColor="#f9c301" />
              <stop offset="1" stopColor="#f2b400" />
            </linearGradient>
          </defs>
        </svg>

        <div className="ecat__art">
          <img src="/img/empty/seal-pair-v2.webp" alt="" width="966" height="597" loading="lazy" decoding="async" />
        </div>

        <div className="ecat__body">
          <span className="ecat__chip"><Box size={18} strokeWidth={2} /> Catalogue</span>
          <h2 id="ecat-title" className="ecat__title">
            No catalogue articles are assigned to <span className="ecat__hl">this page yet</span>.
          </h2>
          <p className="ecat__lead">Search the full catalogue above, or send us the OEM number, drawing or dimensions for identification.</p>
          <div className="ecat__actions">
            <Link to="/shop/" className="ecat__btn ecat__btn--ghost"><ShoppingBag size={20} strokeWidth={1.8} /> Browse the shop</Link>
            <Link to="/contact/" className="ecat__btn ecat__btn--gold"><Send size={20} strokeWidth={1.8} /> Request identification <ArrowRight size={18} strokeWidth={2.2} /></Link>
          </div>
        </div>

        <Blueprint />
      </div>
    </section>
  )
}
