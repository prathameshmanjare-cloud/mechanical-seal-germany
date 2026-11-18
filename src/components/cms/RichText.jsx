import { Link } from 'react-router-dom'
import { ArrowRight, ClipboardList } from 'lucide-react'

function Blocks({ blocks }) {
  return blocks.map((b, i) =>
    b.ul ? (
      <ul key={i}>{b.ul.map((li) => <li key={li}>{li}</li>)}</ul>
    ) : (
      <p key={i}>{b.p}</p>
    ),
  )
}

export function CtaBox({ section }) {
  return (
    <aside className="ccta">
      <div>
        <h2>{section?.h || 'Engineering enquiry'}</h2>
        {section ? <Blocks blocks={section.blocks} /> : <p>Send us the seal reference, equipment data, drawing or dimensions.</p>}
      </div>
      <Link to="/contact/" className="btn btn--primary">Send an enquiry <ArrowRight size={16} /></Link>
    </aside>
  )
}

// Renders parsed editorial sections. The intro is the page lead; the CTA section normally renders as a
// side box (CtaBox) unless includeCta is set, e.g. on Contact where the enquiry form takes that place.
// Section headings are h2; after a group label (itself an h2) they nest as h3 until the next group.
export default function RichText({ sections, includeCta = false }) {
  let inGroup = false
  return (
    <div className="rt">
      {sections.map((s, i) => {
        if (s.kind === 'intro' || (s.kind === 'cta' && !includeCta)) return null
        if (s.kind === 'group') {
          inGroup = true
          return <h2 key={i} className="rt__group">{s.h}</h2>
        }
        const H = inGroup ? 'h3' : 'h2'
        if (s.kind === 'checklist') {
          return (
            <section key={i} className="rt__section rt__check">
              <H className="rt__h"><ClipboardList size={18} strokeWidth={1.8} /> {s.h}</H>
              <Blocks blocks={s.blocks} />
            </section>
          )
        }
        return (
          <section key={i} className="rt__section">
            {s.h && <H className="rt__h">{s.h}</H>}
            <Blocks blocks={s.blocks} />
          </section>
        )
      })}
    </div>
  )
}
