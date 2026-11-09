import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ArrowRight, FlaskConical, Fuel, Droplets, Zap, Factory, Cog } from 'lucide-react'
import PageHero from '../components/PageHero'
import { applications, photos } from '../data'

export const appIcons = { chemical: FlaskConical, 'oil-gas': Fuel, water: Droplets, power: Zap, process: Factory, general: Cog }

export default function Applications() {
  const { hash } = useLocation()
  useEffect(() => {
    if (!hash) return
    const el = document.getElementById(hash.slice(1))
    if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100)
  }, [hash])

  return (
    <>
      <PageHero
        crumbs={[{ label: 'Applications' }]}
        title="Industries & Applications"
        text="Our mechanical seals are trusted across a wide range of industries, ensuring reliable and efficient operation in critical processes."
        img={photos.refinery}
        pos="50% 60%"
      />
      <section className="sheet">
        <div className="container appgrid">
          {applications.map((a, i) => {
            const Icon = appIcons[a.id]
            return (
              <Link
                key={a.id}
                id={a.id}
                to={`/products?industry=${a.id}`}
                className={`appcard ${hash === `#${a.id}` ? 'is-target' : ''}`}
                style={{ '--i': i }}
              >
                <img src={a.img} alt="" loading="lazy" />
                <span className="appcard__icon"><Icon size={22} strokeWidth={1.6} /></span>
                <div className="appcard__body">
                  <div>
                    <h3>{a.label}</h3>
                    <p>{a.text}</p>
                  </div>
                  <span className="appcard__go"><ArrowRight size={15} /></span>
                </div>
              </Link>
            )
          })}
        </div>
      </section>
    </>
  )
}
