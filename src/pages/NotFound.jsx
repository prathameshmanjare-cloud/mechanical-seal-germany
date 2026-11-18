import { Link } from 'react-router-dom'
import { useEffect } from 'react'
import PageHero from '../components/PageHero'

export default function NotFound() {
  useEffect(() => { document.title = 'Page not found | SAP Parts' }, [])
  return (
    <>
      <PageHero crumbs={[{ label: 'Page not found' }]} title="Page not found" text="The page you requested does not exist or has moved." />
      <section className="sheet">
        <div className="container">
          <div className="empty">
            Try the <Link to="/shop/">Shop</Link> or <Link to="/contact">contact our engineers</Link>.
          </div>
        </div>
      </section>
    </>
  )
}
