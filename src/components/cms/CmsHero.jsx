import PageHero from '../PageHero'
import { trail } from '../../lib/site'

// Page header for category-tree pages; crumbs come from the tree.
export default function CmsHero({ page, lead, image, children }) {
  const crumbs = trail(page.id).map((p) => (p.id === page.id ? { label: p.title } : { label: p.title, to: p.url }))
  return (
    <PageHero crumbs={crumbs} title={page.title} text={lead} image={image} imageAlt={`${page.title}, representative illustration`}>
      {children}
    </PageHero>
  )
}
