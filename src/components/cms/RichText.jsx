import { Link } from 'react-router-dom'
import { ArrowRight, ArrowUpRight, BookOpen, CircleCheck, ClipboardList, ScanSearch, TriangleAlert, Wrench } from 'lucide-react'
import { pages } from '../../lib/site'

// Page titles → URLs, so list items that name a catalogue page become internal links.
const byTitle = new Map(pages.map((p) => [p.title.toLowerCase(), p.url]))

// The Word export flattens some lists into one paragraph: "Lead text. - Term: description - Term: description".
// Split those back into a lead and { term, desc } items. Returns null when the paragraph is plain prose.
function inlineList(text) {
  const parts = text.split(/\s+-\s+(?=[^:]{2,80}:\s)/)
  if (parts.length < 2) return null
  const [lead, ...rest] = parts
  return {
    lead,
    items: rest.map((t) => {
      const i = t.indexOf(':')
      return { term: t.slice(0, i).trim(), desc: t.slice(i + 1).trim() }
    }),
  }
}

// "Term. Description" bullets get a bold term; short bullets stay as a single line.
function bullet(text) {
  const m = text.match(/^([^.]{2,60})\.\s+(.+)$/)
  return m ? { term: m[1], desc: m[2] } : { term: text.replace(/\.$/, ''), desc: '' }
}

// Classifies a section by its shape and heading so each kind gets a layout that suits it.
function kindOf(s) {
  if (s.blocks.some((b) => b.ul) || s.blocks.some((b) => b.p && inlineList(b.p))) return 'list'
  if (/risk|failure|boundary/i.test(s.h || '')) return 'note'
  if (/support|sap parts|how we work|approach/i.test(s.h || '')) return 'service'
  return 'prose'
}

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

function Item({ term, desc }) {
  const url = byTitle.get(term.toLowerCase())
  const body = (
    <>
      <strong className="rti__term">{term}{url && <ArrowUpRight size={15} aria-hidden="true" />}</strong>
      {desc && <span className="rti__desc">{desc}</span>}
    </>
  )
  return <li className={`rti ${desc ? '' : 'rti--short'}`}>{url ? <Link to={url} className="rti__link">{body}</Link> : body}</li>
}

// Heading + lead on top, items as a card grid underneath.
function ListSection({ s, H }) {
  const lead = []
  const items = []
  for (const b of s.blocks) {
    if (b.ul) items.push(...b.ul.map(bullet))
    else {
      const il = inlineList(b.p)
      if (il) {
        lead.push(il.lead)
        items.push(...il.items)
      } else lead.push(b.p)
    }
  }
  const rich = items.some((it) => it.desc)
  return (
    <section className="rt__list" data-reveal>
      <header className="rt__list-head">
        <H className="rt__h">{s.h}</H>
        {lead.map((p, i) => <p key={i}>{p}</p>)}
      </header>
      <ul className={`rti-grid ${rich ? '' : 'rti-grid--short'} ${items.length === 2 || items.length === 4 ? 'rti-grid--pairs' : ''}`}>
        {items.map((it, i) => <Item key={i} {...it} />)}
      </ul>
    </section>
  )
}

const ICON = { prose: BookOpen, note: TriangleAlert, service: Wrench }

function Card({ s, H, kind, n }) {
  const Icon = /identif/i.test(s.h || '') ? ScanSearch : ICON[kind]
  return (
    <section className={`rtc rtc--${kind}`} data-reveal style={{ '--d': n }}>
      <span className="rtc__ico" aria-hidden="true"><Icon size={18} strokeWidth={1.8} /></span>
      {s.h && <H className="rt__h">{s.h}</H>}
      <Blocks blocks={s.blocks} />
    </section>
  )
}

// Engineering-detail group: a numbered band, heading left and explanation right.
function Band({ group, items }) {
  const [eyebrow, title] = group.h.includes('—') ? group.h.split(/\s*—\s*/) : [null, group.h]
  return (
    <section className="rt__band" data-reveal>
      <header className="rt__band-head">
        {eyebrow && <span className="rt__eyebrow">{eyebrow}</span>}
        <h2>{title.charAt(0).toUpperCase() + title.slice(1)}</h2>
      </header>
      <ol className="rt__steps">
        {items.map((s, i) => (
          <li key={i} className="rt__step">
            <span className="rt__num">{String(i + 1).padStart(2, '0')}</span>
            <h3>{s.h}</h3>
            <div className="rt__step-body"><Blocks blocks={s.blocks} /></div>
          </li>
        ))}
      </ol>
    </section>
  )
}

function Checklist({ s, H }) {
  const lead = s.blocks.filter((b) => b.p)
  const items = s.blocks.flatMap((b) => b.ul || [])
  return (
    <section className={`rt__check ${items.length ? '' : 'rt__check--plain'}`} data-reveal>
      <div className="rt__check-head">
        <span className="rtc__ico" aria-hidden="true"><ClipboardList size={18} strokeWidth={1.8} /></span>
        <H className="rt__h">{s.h}</H>
        {lead.map((b, i) => <p key={i}>{b.p}</p>)}
        <Link to="/contact/" className="rt__check-link">Send these details <ArrowRight size={15} /></Link>
      </div>
      {items.length > 0 && <ul>
        {items.map((li) => <li key={li}><CircleCheck size={18} strokeWidth={1.8} aria-hidden="true" /> <span>{li}</span></li>)}
      </ul>}
    </section>
  )
}

function Cluster({ cards }) {
  const n = cards.length
  return (
    <div className={`rt__cluster rt__cluster--${Math.min(n, 4)} ${n > 3 && n % 2 ? 'rt__cluster--odd' : ''}`}>
      {cards.map((c, i) => <Card key={i} {...c} n={i} />)}
    </div>
  )
}

// Renders parsed editorial sections as structured blocks: list sections as card grids, short prose and
// notes as clustered cards, the engineering-detail group as a numbered band and the checklist as a panel.
// The intro is the page lead; the CTA renders as a side box (CtaBox) unless includeCta is set,
// e.g. on Contact where the enquiry form takes that place.
export default function RichText({ sections, includeCta = false }) {
  const shown = sections.filter((s) => s.kind !== 'intro' && (s.kind !== 'cta' || includeCta))
  // The last group label opens the engineering-detail band; any earlier label is an ordinary heading.
  const bandAt = shown.findLastIndex((s) => s.kind === 'group')
  const out = []
  let cards = []
  const flush = () => {
    if (cards.length) out.push(<Cluster key={`c${out.length}`} cards={cards} />)
    cards = []
  }

  for (let i = 0; i < shown.length; i++) {
    const s = shown[i]
    if (i === bandAt) {
      flush()
      const items = []
      while (i + 1 < shown.length && !shown[i + 1].kind) items.push(shown[++i])
      out.push(<Band key={`b${i}`} group={s} items={items} />)
      continue
    }
    if (s.kind === 'group') {
      flush()
      out.push(<h2 key={i} className="rt__group">{s.h}</h2>)
      continue
    }
    if (s.kind === 'checklist') {
      flush()
      out.push(<Checklist key={i} s={s} H="h2" />)
      continue
    }
    const kind = kindOf(s)
    if (kind === 'list') {
      flush()
      out.push(<ListSection key={i} s={s} H="h2" />)
    } else cards.push({ s, H: 'h2', kind })
  }
  flush()
  return <div className="rt">{out}</div>
}
