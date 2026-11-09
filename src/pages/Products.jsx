import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowRight, ChevronDown, X, SlidersHorizontal } from 'lucide-react'
import PageHero from '../components/PageHero'
import { matchProducts } from '../components/SearchBar'
import { applications, categories, equipment, faceMaterials } from '../data'

const materialsOf = (p) => (p.category === 'elements' && p.slug !== 'seal-faces' ? [] : faceMaterials.slice(0, 3))

const groups = [
  { key: 'type', label: 'Seal Type', options: categories.map((c) => ({ id: c.id, label: c.label })), test: (p, v) => p.category === v },
  { key: 'app', label: 'Application', options: ['Pumps', 'Compressors', 'Agitators', 'Other'].map((x) => ({ id: x, label: x })), test: (p, v) => (equipment[p.slug] || []).includes(v) },
  { key: 'mat', label: 'Material', options: faceMaterials.slice(0, 3).map((x) => ({ id: x, label: x })), test: (p, v) => materialsOf(p).includes(v) },
]

const sorts = {
  relevant: { label: 'Most Relevant', fn: () => 0 },
  name: { label: 'Name (A–Z)', fn: (a, b) => a.name.localeCompare(b.name) },
  types: { label: 'Most Types', fn: (a, b) => b.types.length - a.types.length },
}

function FilterGroup({ g, selected, toggle, base }) {
  const [open, setOpen] = useState(true)
  return (
    <div className={`fgroup ${open ? 'is-open' : ''}`}>
      <button className="fgroup__head" onClick={() => setOpen(!open)} aria-expanded={open}>
        {g.label} <ChevronDown size={16} />
      </button>
      {open && (
        <div className="fgroup__body">
          {g.options.map((o) => {
            const count = base.filter((p) => g.test(p, o.id)).length
            return (
              <label key={o.id} className="fcheck">
                <input type="checkbox" checked={selected.includes(o.id)} onChange={() => toggle(g.key, o.id)} />
                <span className="fcheck__box" />
                <span>{o.label} ({count})</span>
              </label>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function Products() {
  const [params, setParams] = useSearchParams()
  const [mobileOpen, setMobileOpen] = useState(false)
  const q = params.get('q') || ''
  const industry = applications.find((a) => a.id === params.get('industry'))
  const sort = params.get('sort') || 'relevant'
  const sel = Object.fromEntries(groups.map((g) => [g.key, params.getAll(g.key)]))

  const base = useMemo(() => {
    let list = matchProducts(q)
    if (industry) list = list.filter((p) => industry.products.includes(p.slug))
    return list
  }, [q, industry])

  const list = useMemo(() => {
    const out = base.filter((p) => groups.every((g) => !sel[g.key].length || sel[g.key].some((v) => g.test(p, v))))
    return [...out].sort(sorts[sort].fn)
  }, [base, sel, sort])

  const edit = (fn) => {
    const next = new URLSearchParams(params)
    fn(next)
    setParams(next, { replace: true })
  }
  const toggle = (key, val) =>
    edit((n) => {
      const cur = n.getAll(key)
      n.delete(key)
      ;(cur.includes(val) ? cur.filter((x) => x !== val) : [...cur, val]).forEach((v) => n.append(key, v))
    })
  const reset = () => setParams(new URLSearchParams(), { replace: true })

  return (
    <>
      <PageHero
        crumbs={[{ label: 'Products' }]}
        title="Our Products"
        text="A comprehensive range of mechanical seals engineered for reliable and efficient operation in diverse applications."
        img="/img/hero-bg.png"
        pos="80% 55%"
      />
      <section className="sheet">
        <div className="container catalog">
          <aside className={`filters2 ${mobileOpen ? 'is-open' : ''}`}>
            <div className="filters2__title">
              Filter Products
              <button className="icon-btn filters2__close" onClick={() => setMobileOpen(false)} aria-label="Close filters"><X size={18} /></button>
            </div>
            {groups.map((g) => (
              <FilterGroup key={g.key} g={g} selected={sel[g.key]} toggle={toggle} base={base} />
            ))}
            <button className="filters2__reset" onClick={reset}>Reset Filters</button>
          </aside>

          <div className="catalog__main">
            <div className="catalog__bar">
              <strong>{list.length} Product{list.length === 1 ? '' : 's'} Found</strong>
              <div className="catalog__tools">
                <button className="btn btn--outline catalog__filter-btn" onClick={() => setMobileOpen(true)}>
                  <SlidersHorizontal size={15} /> Filters
                </button>
                <label className="sortby">
                  Sort By:
                  <select value={sort} onChange={(e) => edit((n) => n.set('sort', e.target.value))}>
                    {Object.entries(sorts).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                  <ChevronDown size={15} />
                </label>
              </div>
            </div>
            {(q || industry) && (
              <div className="catalog__chips">
                {q && <button onClick={() => edit((n) => n.delete('q'))}>Search: “{q}” <X size={13} /></button>}
                {industry && <button onClick={() => edit((n) => n.delete('industry'))}>{industry.label} <X size={13} /></button>}
              </div>
            )}
            {list.length ? (
              <div className="catalog__grid">
                {list.map((p, i) => (
                  <Link key={p.slug} to={`/products/${p.slug}`} className="pc pc--cat" style={{ '--i': i % 6 }}>
                    <div className="pc__media">
                      {p.image ? <img src={p.image} alt={p.name} loading="lazy" /> : <span className="ph">{p.code}</span>}
                    </div>
                    <div className="pc__body">
                      <div>
                        <h3>{p.name}</h3>
                        <p>{p.short}</p>
                      </div>
                      <span className="pc__go"><ArrowRight size={15} /></span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="empty">
                No products match these filters. <button className="filters2__reset" onClick={reset}>Reset Filters</button>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  )
}
