// Template B — information page (deck slide 7): hero, structured technical copy, related links.
// No storefront faceting on these pages.
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import CmsHero from './CmsHero'
import RichText, { CtaBox } from './RichText'
import { ctaOf, introOf } from '../../lib/content'
import { pageById, related } from '../../lib/site'

function Related({ page }) {
  const items = related(page)
  const parent = page.parent && pageById(page.parent)
  if (!items.length && !parent) return null
  return (
    <nav className="relnav" aria-label="Related pages">
      <h2>{page.children.length ? 'In this section' : 'Related topics'}</h2>
      <ul>
        {items.map((p) => (
          <li key={p.id}>
            <Link to={p.url}>{p.title} <ArrowRight size={14} /></Link>
          </li>
        ))}
      </ul>
      {parent && <Link to={parent.url} className="relnav__up">Back to {parent.title}</Link>}
    </nav>
  )
}

export default function InfoTemplate({ page, content, aside }) {
  return (
    <div className="cms cms--info" data-page={page.id}>
      <CmsHero page={page} lead={introOf(content)} />
      <div className="pbody">
        <div className="container cms__grid">
          <article className="cms__body">
            {content ? <RichText sections={content.sections} includeCta={Boolean(aside)} /> : <div className="skel skel--text" aria-busy="true" />}
          </article>
          <aside className="cms__side">
            {aside}
            <Related page={page} />
            {content && !aside && <CtaBox section={ctaOf(content)} />}
          </aside>
        </div>
      </div>
    </div>
  )
}
