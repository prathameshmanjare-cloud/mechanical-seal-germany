// Home editorial block ("Selection and engineering checks" down to the enquiry checklist).
// All copy comes from the page content (public/data/pages/P001.json); this file only lays it out.
import { Link } from 'react-router-dom'
import {
  ArrowLeftRight, ArrowRight, Check, CircleDot, ClipboardList, Droplet, Factory, Gauge, Layers, MessageSquareMore,
  Package, Search, Settings, Target, Workflow,
} from 'lucide-react'

const pick = (table, text, fallback) => table.find(([re]) => re.test(text))?.[1] ?? fallback

const CHECK_ICONS = [
  [/search/i, Search], [/manufacturer/i, Factory], [/shaft/i, Gauge], [/face|material/i, Layers],
  [/elastomer/i, Droplet], [/design/i, CircleDot], [/availab/i, Package],
]
const TOPIC_ICONS = [
  [/engineering$/i, Settings], [/identification|replacement support/i, ArrowLeftRight], [/workflow|verification/i, Workflow],
  [/material|surface/i, Layers], [/enquiry/i, Target],
]

// Short explanations for check items whose source text is only a label ("Search.").
const CHECK_NOTES = {
  search: 'Identify the correct seal or equivalent from verified data.',
  manufacturer: 'Verify the original manufacturer and series.',
  'seal design': 'Match the design, arrangement and installation type.',
  availability: 'Check stock and lead time for the required variant.',
}

// "Shaft diameter. Confirm all related dimensions…" -> { title, note }
function splitCheck(text) {
  const i = text.indexOf('. ')
  const title = (i === -1 ? text : text.slice(0, i)).replace(/\.$/, '').trim()
  const note = i === -1 ? CHECK_NOTES[title.toLowerCase()] : text.slice(i + 2).trim()
  return { title, note }
}

const firstP = (s) => s.blocks.find((b) => b.p)?.p
const firstUl = (s) => s.blocks.find((b) => b.ul)?.ul ?? []

// Groups the flat section list: lead checks, labelled groups with their items, checklist and CTA.
function model(content) {
  const secs = content.sections.filter((s) => s.kind !== 'intro')
  const cta = secs.find((s) => s.kind === 'cta')
  const checklist = secs.find((s) => s.kind === 'checklist')
  const checks = secs.find((s) => !s.kind && s.blocks.some((b) => b.ul))
  const groups = []
  for (const s of secs) {
    if (s.kind === 'group') groups.push({ h: s.h, items: [] })
    else if (!s.kind && s !== checks && groups.length) groups.at(-1).items.push(s)
  }
  return { checks, groups, checklist, cta }
}

export default function HomeEngineering({ content }) {
  const { checks, groups, checklist, cta } = model(content)
  const [g1, g2] = groups
  const g2Cols = g2?.items.slice(0, 2) ?? []
  const notes = g2?.items.slice(2) ?? []
  const [lead1, ...rest1] = g1?.items ?? []

  return (
    <section className="eng" aria-labelledby="eng-title">
      {checks && (
        <div className="container eng__top">
          <div className="eng__checks" data-reveal>
            <p className="eng__eyebrow eng__eyebrow--bar">Engineering support</p>
            <h2 id="eng-title" className="eng__title">{checks.h}</h2>
            {firstP(checks) && <p className="eng__lead">{firstP(checks)}</p>}
            <ul className="eng__list">
              {firstUl(checks).map((t, i) => {
                const { title, note } = splitCheck(t)
                const Icon = pick(CHECK_ICONS, title, Check)
                return (
                  <li key={t} data-reveal style={{ '--d': i }}>
                    <span className="eng__ico"><Icon size={21} strokeWidth={1.7} aria-hidden="true" /></span>
                    <span><strong>{title}</strong>{note && <small>{note}</small>}</span>
                  </li>
                )
              })}
            </ul>
          </div>

          <div className="eng__aside">
            {cta && (
              <aside className="eng__cta" data-parallax="0.05" data-reveal data-spotlight style={{ '--d': 2 }}>
                <h2 className="eng__cta-h">
                  <span className="eng__cta-ico"><MessageSquareMore size={22} strokeWidth={1.7} aria-hidden="true" /></span>
                  {cta.h}
                </h2>
                {firstP(cta) && <p>{firstP(cta)}</p>}
                <Link to="/contact/" className="eng__cta-btn">Send an enquiry <ArrowRight size={18} aria-hidden="true" /></Link>
              </aside>
            )}
            <img className="eng__seal" data-parallax="-0.14" data-reveal style={{ '--d': 4 }} src="/img/category/clean/spring-mechanical-seals.webp" alt="" loading="lazy" width="800" height="600" />
          </div>
        </div>
      )}

      <div className="container eng__body">
        {g1 && (
          <div className="eng__row eng__row--3" data-reveal data-parallax="0.04">
            {lead1 && (
              <article className="eng__col glass">
                <p className="eng__eyebrow">{g1.h}</p>
                <h3>{lead1.h}</h3>
                <p>{firstP(lead1)}</p>
              </article>
            )}
            {rest1.map((s) => {
              const Icon = pick(TOPIC_ICONS, s.h, Settings)
              return (
                <article key={s.h} className="eng__col glass">
                  <span className="eng__ico eng__ico--sm"><Icon size={20} strokeWidth={1.8} aria-hidden="true" /></span>
                  <h3>{s.h}</h3>
                  <p>{firstP(s)}</p>
                </article>
              )
            })}
          </div>
        )}

        {g2 && (
          <div className="eng__detail" data-reveal>
            <p className="eng__eyebrow">{g2.h}</p>
            <div className="eng__row eng__row--2">
              {g2Cols.map((s) => {
                const Icon = pick(TOPIC_ICONS, s.h, Settings)
                return (
                  <article key={s.h} className="eng__feat glass">
                    <span className="eng__ico"><Icon size={22} strokeWidth={1.7} aria-hidden="true" /></span>
                    <div>
                      <h3>{s.h}</h3>
                      <p>{firstP(s)}</p>
                    </div>
                  </article>
                )
              })}
            </div>
          </div>
        )}

        {notes.map((s) => {
          const Icon = pick(TOPIC_ICONS, s.h, Target)
          return (
            <aside key={s.h} className="eng__note glass" data-reveal data-spotlight>
              <h3><span className="eng__ico"><Icon size={22} strokeWidth={1.7} aria-hidden="true" /></span>{s.h}</h3>
              <p>{firstP(s)}</p>
            </aside>
          )
        })}

        {checklist && (
          <section className="eng__need glass" aria-labelledby="eng-need" data-reveal data-spotlight>
            <div className="eng__need-head">
              <span className="eng__ico eng__ico--plain"><ClipboardList size={22} strokeWidth={1.7} aria-hidden="true" /></span>
              <div>
                <h3 id="eng-need">{checklist.h}</h3>
                {firstP(checklist) && <p>{firstP(checklist)}</p>}
              </div>
            </div>
            <ul className="eng__need-list">
              {firstUl(checklist).map((t, i) => (
                <li key={t} data-reveal style={{ '--d': i }}><span className="eng__tick"><Check size={16} strokeWidth={2.4} aria-hidden="true" /></span>{t}</li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </section>
  )
}
