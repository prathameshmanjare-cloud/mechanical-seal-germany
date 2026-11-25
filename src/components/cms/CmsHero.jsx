import PageHero from '../PageHero'
import { trail } from '../../lib/site'

// Page header for category-tree pages; crumbs come from the tree.
export default function CmsHero({ page, lead, image, children }) {
  const crumbs = trail(page.id).map((p) => (p.id === page.id ? { label: p.title } : { label: p.title, to: p.url }))
  const parents = trail(page.id).slice(0, -1)
  const eyebrow = parents.at(-1)?.title ?? 'Mechanical seal catalogue'
  return (
    <PageHero crumbs={crumbs} eyebrow={eyebrow} title={page.title} text={lead} image={image} imageAlt={`${page.title}, representative illustration`}>
      {children}
    </PageHero>
  )
}
