import { Crumbs } from '../PageHero'
import { trail } from '../../lib/site'

// Dark page header: breadcrumb, H1, lead text, optional slot (search) and representative image.
export default function CmsHero({ page, lead, image, children }) {
  const crumbs = trail(page.id).map((p) => (p.id === page.id ? { label: p.title } : { label: p.title, to: p.url }))
  return (
    <section className={`phero cmsh ${image ? 'cmsh--img' : ''}`}>
      <div className="container phero__inner cmsh__inner">
        <div className="cmsh__text">
          <Crumbs items={crumbs} />
          <h1 className="phero__title">{page.title}</h1>
          {lead ? <p className="phero__text cmsh__lead">{lead}</p> : <p className="phero__text cmsh__lead cmsh__lead--ph" aria-hidden="true" />}
          {children}
        </div>
        {image && (
          <figure className="cmsh__fig">
            <img src={image} alt={`${page.title}, representative illustration`} width="600" height="450" fetchPriority="high" />
            <figcaption>Representative illustration</figcaption>
          </figure>
        )}
      </div>
    </section>
  )
}
