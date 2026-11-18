import CmsHero from './CmsHero'

// "Label: value Label: value" lines from the Word export are split onto separate lines.
const lines = (text) => text.split(/\s+(?=(?:Email|Register number):)/)

export default function LegalTemplate({ page, content }) {
  return (
    <div className="cms cms--legal" data-page={page.id}>
      <CmsHero page={page} />
      <section className="sheet cms__sheet">
        <div className="container">
          <article className="legal">
            {content?.sections.map((s, i) => (
              <section key={i}>
                {s.h && <h2>{s.h}</h2>}
                {s.blocks.map((b, j) => (b.p ? <p key={j}>{lines(b.p).map((l, k) => <span key={k}>{l}</span>)}</p> : null))}
              </section>
            ))}
          </article>
        </div>
      </section>
    </div>
  )
}
