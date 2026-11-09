import { useSearchParams } from 'react-router-dom'
import { Search } from 'lucide-react'
import ProductCard from '../components/ProductCard'
import { matchProducts } from '../components/SearchBar'
import { categories } from '../data'

export default function Products() {
  const [params, setParams] = useSearchParams()
  const q = params.get('q') || ''
  const cat = params.get('cat') || 'all'
  const list = matchProducts(q).filter((p) => cat === 'all' || p.category === cat)

  const update = (key, val) => {
    const next = new URLSearchParams(params)
    if (val && val !== 'all') next.set(key, val)
    else next.delete(key)
    setParams(next, { replace: true })
  }

  return (
    <section className="section container page">
      <div className="section__head">
        <span className="eyebrow">Product range</span>
        <h1 className="h2">All mechanical seals</h1>
        <p>Our own designs for pumps, mixers, compressors and special applications.</p>
      </div>
      <div className="filters">
        <label className="search search--sm filters__search">
          <Search size={15} className="search__icon" />
          <input value={q} onChange={(e) => update('q', e.target.value)} placeholder="Filter by name, type or feature…" />
        </label>
        <div className="tabs">
          <button className={cat === 'all' ? 'is-active' : ''} onClick={() => update('cat', 'all')}>All</button>
          {categories.map((c) => (
            <button key={c.id} className={cat === c.id ? 'is-active' : ''} onClick={() => update('cat', c.id)}>{c.label}</button>
          ))}
        </div>
      </div>
      <p className="results-count">{list.length} product{list.length === 1 ? '' : 's'}</p>
      {list.length ? (
        <div className="grid">{list.map((p) => <ProductCard key={p.slug} p={p} />)}</div>
      ) : (
        <div className="empty">No products match “{q}”. Try another term or send us an enquiry.</div>
      )}
    </section>
  )
}
