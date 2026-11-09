import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { MapPin, Phone, Mail, Smartphone, Send, Check } from 'lucide-react'
import { company } from '../data'

export default function Contact() {
  const [params] = useSearchParams()
  const [sent, setSent] = useState(false)
  const product = params.get('product') || ''

  const submit = (e) => {
    e.preventDefault()
    const f = new FormData(e.target)
    const body = [...f.entries()].map(([k, v]) => `${k}: ${v}`).join('\n')
    window.location.href = `mailto:${company.email}?subject=${encodeURIComponent('RFQ ' + (f.get('product') || ''))}&body=${encodeURIComponent(body)}`
    setSent(true)
  }

  return (
    <section className="section container page">
      <div className="section__head">
        <span className="eyebrow">Request for quotation</span>
        <h1 className="h2">Tell us what you need</h1>
        <p>Send a part number, drawing reference or operating data. We reply within 24 hours.</p>
      </div>
      <div className="contact">
        <form className="form" onSubmit={submit}>
          <div className="form__row">
            <label>Name<input name="name" required /></label>
            <label>Company<input name="company" /></label>
          </div>
          <div className="form__row">
            <label>Email<input name="email" type="email" required /></label>
            <label>Phone<input name="phone" /></label>
          </div>
          <label>Product / part number<input name="product" defaultValue={product} /></label>
          <label>Message<textarea name="message" rows={5} placeholder="Shaft diameter, medium, pressure, temperature, quantity…" /></label>
          <button className="btn btn--primary" type="submit">
            {sent ? <><Check size={14} /> Opening email…</> : <><Send size={14} /> Send enquiry</>}
          </button>
        </form>
        <aside className="contact__info">
          <div className="info-row"><MapPin size={16} /><div><strong>Address</strong><span>{company.street}<br />{company.city}, {company.country}</span></div></div>
          <div className="info-row"><Phone size={16} /><div><strong>Phone</strong><a href={`tel:${company.phone.replace(/\s/g, '')}`}>{company.phone}</a></div></div>
          <div className="info-row"><Smartphone size={16} /><div><strong>Mobile</strong><a href={`tel:${company.mobile.replace(/\s/g, '')}`}>{company.mobile}</a></div></div>
          <div className="info-row"><Mail size={16} /><div><strong>Email</strong><a href={`mailto:${company.email}`}>{company.email}</a></div></div>
          <iframe
            title="Map"
            className="map"
            loading="lazy"
            src="https://www.openstreetmap.org/export/embed.html?bbox=6.98%2C51.03%2C7.04%2C51.06&layer=mapnik"
          />
        </aside>
      </div>
    </section>
  )
}
