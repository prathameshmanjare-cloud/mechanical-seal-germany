import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Ruler, Atom, Factory, ShieldCheck } from 'lucide-react'
import PageHero from '../components/PageHero'
import { photos } from '../data'
import { useReveal, useScrollProgress } from '../lib/motion'

const features = [
  [Ruler, 'Precision Design', 'Engineered for optimum sealing performance.'],
  [Atom, 'Advanced Materials', 'High-grade, wear and chemical resistant materials.'],
  [Factory, 'Manufacturing Excellence', 'Precision machining with strict quality control.'],
  [ShieldCheck, 'Reliability & Longevity', 'Consistent performance for demanding applications.'],
]

export default function Technology() {
  const root = useRef(null)
  const vis = useRef(null)
  useReveal(root)
  useScrollProgress(vis)

  return (
    <div ref={root} className="tech">
      <PageHero
        crumbs={[{ label: 'Technology' }]}
        title="Our Technology"
        text="Advanced engineering, high-quality materials and precision manufacturing for reliable sealing solutions."
        img={photos.cnc}
        pos="60% 50%"
        variant="phero--tall"
      />
      <section className="techx">
        <div className="container techx__grid">
          <div className="techx__visual prec__visual" ref={vis} aria-hidden="true">
            <div className="techx__glow" />
            <div className="prec__parts">
              <img src="/img/cut/part-seat.webp" alt="" className="prec__seat" draggable="false" />
              <img src="/img/cut/part-rotor.webp" alt="" className="prec__rotor" draggable="false" />
            </div>
            <div className="techx__floor" />
          </div>
          <ul className="techx__list" data-stagger>
            {features.map(([Icon, t, d]) => (
              <li key={t} data-reveal>
                <span className="techx__icon"><Icon size={22} strokeWidth={1.6} /></span>
                <div>
                  <strong>{t}</strong>
                  <p>{d}</p>
                </div>
              </li>
            ))}
            <li data-reveal className="techx__cta">
              <Link to="/contact" className="btn btn--white">Talk to an Engineer <ArrowRight size={16} /></Link>
            </li>
          </ul>
        </div>
      </section>
    </div>
  )
}
