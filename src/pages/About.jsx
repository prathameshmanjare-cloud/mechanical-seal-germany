import { Link } from 'react-router-dom'
import { ArrowRight, Check } from 'lucide-react'
import { company, companyGallery } from '../data'

export default function About() {
  return (
    <>
      <section className="section container page">
        <div className="section__head">
          <span className="eyebrow">About us</span>
          <h1 className="h2">Engineering reliability. Preventing failure. Delivering solutions.</h1>
        </div>
        <div className="split">
          <div className="split__copy prose">
            <p>
              {company.name}, operated by {company.operator} in Leverkusen, stands for advanced sealing
              solutions and uncompromising engineering expertise. Since {company.since}, we have been
              developing and supplying high-performance sealing technology for demanding industrial
              applications across Europe.
            </p>
            <p>
              We are specialists in static and dynamic sealing technology, combining decades of industry
              experience with a deep understanding of real-world applications. Our strength lies not only in
              supplying components, but in analysing, engineering and optimising sealing systems to ensure
              maximum operational reliability.
            </p>
          </div>
          <div className="promise">
            <span className="eyebrow">Beyond supply</span>
            <p className="promise__text">
              We think ahead, analyse in depth and develop solutions that create measurable added value.
              Through intelligent procurement and efficient logistics we ensure:
            </p>
            <ul className="checks">
              {['Reduced costs', 'Minimised operational risks', 'Reliable availability', 'Maximum planning security'].map((t) => (
                <li key={t}><Check size={14} /> {t}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>
      {companyGallery.length > 0 && (
        <section className="section section--tight container">
          <div className="section__head">
            <span className="eyebrow">Inside Leverkusen</span>
            <h2>Our workshop & production</h2>
          </div>
          <div className="gallery">
            {companyGallery.map((g) => (
              <figure key={g.image}>
                <img src={g.image} alt={g.label} loading="lazy" />
                <figcaption>{g.label}</figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}
      <section className="container">
        <div className="cta">
          <div>
            <h2>Let’s solve your sealing challenge.</h2>
            <p>Fast response times and precise implementation, even in critical situations.</p>
          </div>
          <Link to="/contact" className="btn btn--accent">Contact us <ArrowRight size={14} /></Link>
        </div>
      </section>
    </>
  )
}
