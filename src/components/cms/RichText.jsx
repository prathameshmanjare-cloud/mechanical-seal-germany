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
      <Link to="/contact/" className="btn btn--blue">Send an enquiry <ArrowRight size={16} /></Link>
    </aside>
  )
}

// Renders parsed editorial sections. Intro and CTA sections are handled by the page templates.
export default function RichText({ sections }) {
  return (
    <div className="rt">
      {sections.map((s, i) => {
        if (s.kind === 'intro' || s.kind === 'cta') return null
        if (s.kind === 'group') return <h2 key={i} className="rt__group">{s.h}</h2>
        if (s.kind === 'checklist') {
          return (
            <section key={i} className="rt__section rt__check">
              <h3><ClipboardList size={18} strokeWidth={1.8} /> {s.h}</h3>
              <Blocks blocks={s.blocks} />
            </section>
          )
        }
        return (
          <section key={i} className="rt__section">
            {s.h && <h3>{s.h}</h3>}
            <Blocks blocks={s.blocks} />
          </section>
        )
      })}
    </div>
  )
}
