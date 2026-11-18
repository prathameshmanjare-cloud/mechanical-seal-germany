import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ArrowRight, Check, Mail, Phone, MapPin } from 'lucide-react'
import { company } from '../../data'

const tel = (n) => `tel:${n.replace(/\s/g, '')}`

// Enquiry form for the Contact page. Pre-fills the reference from ?sku= or ?product= links.
export default function QuoteForm() {
  const [params] = useSearchParams()
  const [sent, setSent] = useState(false)
  const preset = params.get('sku') || params.get('product') || ''

  const submit = (e) => {
    e.preventDefault()
    const f = new FormData(e.target)
    const body = [...f.entries()].map(([k, v]) => `${k}: ${v}`).join('\n')
    const subject = `Enquiry: ${f.get('Reference') || 'technical support'}`
    window.location.href = `mailto:${company.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    setSent(true)
  }

  return (
    <div className="cquote">
      <form className="quote" onSubmit={submit}>
        <h2>Send an enquiry</h2>
        <div className="quote__row">
          <input name="Full name" placeholder="Full name*" required aria-label="Full name" autoComplete="name" />
          <input name="Company" placeholder="Company*" required aria-label="Company" autoComplete="organization" />
        </div>
        <div className="quote__row">
          <input name="Email" type="email" placeholder="Email*" required aria-label="Email" autoComplete="email" />
          <input name="Phone" type="tel" placeholder="Phone" aria-label="Phone" autoComplete="tel" />
        </div>
        <input name="Reference" defaultValue={preset} placeholder="SAP Parts SKU, OEM number or seal reference" aria-label="SKU, OEM number or seal reference" />
        <textarea
          name="Message"
          rows={5}
          required
          placeholder="Shaft and seat dimensions, medium, pressure, temperature, speed, existing materials…*"
          aria-label="Operating data and message"
        />
        <button type="submit" className="btn btn--primary quote__submit">
          {sent ? <><Check size={16} /> Opening your email app…</> : <>Send enquiry <ArrowRight size={16} /></>}
        </button>
      </form>
      <ul className="cquote__direct">
        <li><Phone size={16} /> <a href={tel(company.phone)}>{company.phone}</a></li>
        <li><Mail size={16} /> <a href={`mailto:${company.email}`}>{company.email}</a></li>
        <li><MapPin size={16} /> <span>{company.street}, {company.city}</span></li>
      </ul>
    </div>
  )
}
