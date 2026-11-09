import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Mail, Phone, MapPin, Clock, ArrowRight, Check, ChevronDown } from 'lucide-react'
import PageHero from '../components/PageHero'
import { company, photos, products } from '../data'

export default function Contact() {
  const [params] = useSearchParams()
  const [sent, setSent] = useState(false)
  const preset = params.get('product') || ''
  const options = products.map((p) => p.name)
  if (preset && !options.includes(preset)) options.unshift(preset)

  const submit = (e) => {
    e.preventDefault()
    const f = new FormData(e.target)
    const body = [...f.entries()].map(([k, v]) => `${k}: ${v}`).join('\n')
    window.location.href = `mailto:${company.email}?subject=${encodeURIComponent('Request a Quote: ' + (f.get('Product') || ''))}&body=${encodeURIComponent(body)}`
    setSent(true)
  }

  const tel = company.phone.replace(/\s/g, '')

  return (
    <>
      <PageHero
        crumbs={[{ label: 'Contact' }]}
        title="Get in Touch"
        text="Have a question, need a quote or technical support? Our team is here to help."
        img={photos.office}
        pos="70% 40%"
      />
      <section className="sheet">
        <div className="container contact2">
          <ul className="contact2__info">
            <li>
              <span className="contact2__icon"><Mail size={22} strokeWidth={1.6} /></span>
              <div><strong>Email Us</strong><a href={`mailto:${company.email}`}>{company.email}</a></div>
            </li>
            <li>
              <span className="contact2__icon"><Phone size={22} strokeWidth={1.6} /></span>
              <div><strong>Call Us</strong><a href={`tel:${tel}`}>{company.phone}</a><a href={`tel:${company.mobile.replace(/\s/g, '')}`}>{company.mobile}</a></div>
            </li>
            <li>
              <span className="contact2__icon"><MapPin size={22} strokeWidth={1.6} /></span>
              <div><strong>Our Location</strong><span>{company.street}<br />{company.city}<br />{company.country} (Head Office)</span></div>
            </li>
            <li>
              <span className="contact2__icon"><Clock size={22} strokeWidth={1.6} /></span>
              <div><strong>Working Hours</strong><span>Mon – Fri, 8:00 – 17:00 (CET)</span></div>
            </li>
          </ul>

          <form className="quote" onSubmit={submit}>
            <h2>Request a Quote</h2>
            <div className="quote__row">
              <input name="Full name" placeholder="Full Name*" required aria-label="Full name" />
              <input name="Company" placeholder="Company Name*" required aria-label="Company name" />
            </div>
            <div className="quote__row">
              <input name="Email" type="email" placeholder="Email Address*" required aria-label="Email address" />
              <input name="Phone" type="tel" placeholder="Phone Number" aria-label="Phone number" />
            </div>
            <label className="quote__select">
              <select name="Product" defaultValue={preset} aria-label="Product or part number">
                <option value="">Product / Part Number*</option>
                {options.map((o) => <option key={o} value={o}>{o}</option>)}
                <option value="Other / OEM reference">Other / OEM reference</option>
              </select>
              <ChevronDown size={16} />
            </label>
            <textarea name="Message" rows={5} placeholder="Your Requirement / Message*" required aria-label="Your requirement or message" />
            <button type="submit" className="btn btn--blue quote__submit">
              {sent ? <><Check size={16} /> Opening your email app…</> : <>Submit Request <ArrowRight size={16} /></>}
            </button>
          </form>
        </div>
      </section>
    </>
  )
}
