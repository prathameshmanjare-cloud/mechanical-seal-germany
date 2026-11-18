import CmsHero from './CmsHero'
import { company } from '../../data'

// "Label: value Label: value" lines from the Word export are split onto separate lines.
const lines = (text) => text.split(/\s+(?=(?:Email|Register number):)/)

export default function LegalTemplate({ page, content }) {
  return (
    <div className="cms cms--legal" data-page={page.id}>
      <CmsHero page={page} />
      <div className="pbody">
        <div className="container">
          <article className="legal">
            {/* Address is not part of the client's Legal Notice text; added from company data, pending legal review. */}
            <section>
              <h2>Provider</h2>
              <p>
                <span>{company.operator}</span>
                <span>{company.street}</span>
                <span>{company.city}</span>
                <span>{company.country}</span>
              </p>
            </section>
            {content?.sections.map((s, i) => (
              <section key={i}>
                {s.h && <h2>{s.h}</h2>}
                {s.blocks.map((b, j) => (b.p ? <p key={j}>{lines(b.p).map((l, k) => <span key={k}>{l}</span>)}</p> : null))}
              </section>
            ))}
          </article>
        </div>
      </div>
    </div>
  )
}
