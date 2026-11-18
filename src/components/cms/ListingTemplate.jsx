// Template A — listing / search page (deck slides 5–6):
// search first, then context, filters, results with sort and paging, then editorial copy.
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowRight, ChevronDown, ChevronLeft, ChevronRight, Search, SlidersHorizontal, X } from 'lucide-react'
import CmsHero from './CmsHero'
import Facets from './Facets'
import SkuCard from './SkuCard'
import RichText, { CtaBox } from './RichText'
import { ctaOf, introOf } from '../../lib/content'
import { loadProducts, pageById } from '../../lib/site'
import { PAGE_SIZE, SORTS, compute, filterDef, formatNumber, prepare, readState } from '../../lib/listing'

const SHOP = '/shop/'

function ListingSearch({ initial, onSearch, scope }) {
  const [q, setQ] = useState(initial)
  return (
    <form className="search search--lg cms-search" role="search" onSubmit={(e) => { e.preventDefault(); onSearch(q.trim()) }}>
      <Search size={18} className="search__icon" />
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by SKU, OEM number, series or shaft Ø…" aria-label={`Search ${scope}`} />
      <button type="submit" className="btn btn--blue search__btn">Search</button>
    </form>
  )
}

function Pager({ page, pages, go }) {
  if (pages <= 1) return null
  const nums = [...new Set([1, page - 1, page, page + 1, pages])].filter((n) => n >= 1 && n <= pages).sort((a, b) => a - b)
  return (
    <nav className="pager" aria-label="Pagination">
      <button onClick={() => go(page - 1)} disabled={page === 1} aria-label="Previous page"><ChevronLeft size={16} /></button>
      {nums.map((n, i) => (
        <span key={n} className="pager__slot">
          {i > 0 && n - nums[i - 1] > 1 && <span className="pager__gap">…</span>}
          <button onClick={() => go(n)} aria-current={n === page ? 'page' : undefined}>{n}</button>
        </span>
      ))}
      <button onClick={() => go(page + 1)} disabled={page === pages} aria-label="Next page"><ChevronRight size={16} /></button>
    </nav>
  )
}

function Chips({ state, clear, clearAll }) {
  const chips = []
  if (state.q) chips.push({ key: 'q', label: `“${state.q}”`, off: () => clear('q') })
  for (const [id, s] of Object.entries(state.sel)) {
    const def = filterDef(id)
    if (Array.isArray(s)) for (const v of s) chips.push({ key: id + v, label: `${def.label}: ${v}`, off: () => clear(id, v) })
    else {
      const range = s.min != null && s.max != null ? (s.min === s.max ? formatNumber(s.min) : `${formatNumber(s.min)}–${formatNumber(s.max)}`) : s.min != null ? `≥ ${formatNumber(s.min)}` : `≤ ${formatNumber(s.max)}`
      chips.push({ key: id, label: `${def.label}: ${range} ${def.unit}`, off: () => clear(id) })
    }
  }
  if (!chips.length) return null
  return (
    <div className="catalog__chips">
      {chips.map((c) => <button key={c.key} onClick={c.off}>{c.label} <X size={13} /></button>)}
      <button className="catalog__clear" onClick={clearAll}>Clear all</button>
    </div>
  )
}

function SubCategories({ page }) {
  const kids = page.children.map(pageById)
  if (!kids.length) return null
  return (
    <div className="container subcats">
      <h2>Browse {page.title}</h2>
      <div className="subcats__grid">
        {kids.map((c) => (
          <Link key={c.id} to={c.url} className="subcat">
            {c.image && <img src={c.image} alt="" loading="lazy" width="96" height="72" />}
            <span>
              <strong>{c.title}</strong>
              {c.type === 'listing' && <small>{c.productCount ? `${c.productCount.toLocaleString('en')} articles` : 'Identification on request'}</small>}
            </span>
            <ArrowRight size={16} />
          </Link>
        ))}
      </div>
    </div>
  )
}

function Catalog({ page, params, setParams }) {
  const [rows, setRows] = useState(null)
  const [error, setError] = useState(false)
  const [drawer, setDrawer] = useState(false)
  const state = readState(params, page.filters)

  useEffect(() => {
    let live = true
    loadProducts(page).then((r) => live && setRows(prepare(r))).catch(() => live && setError(true))
    return () => { live = false }
  }, [page])

  const view = useMemo(() => rows && compute(rows, readState(params, page.filters), page.filters), [rows, params, page.filters])

  const edit = (fn, keepPage = false) => {
    const next = new URLSearchParams(params)
    fn(next)
    if (!keepPage) next.delete('page')
    setParams(next, { replace: true })
  }
  const toggle = (id, v) =>
    edit((n) => {
      const cur = n.getAll(id)
      n.delete(id)
      ;(cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v]).forEach((x) => n.append(id, x))
    })
  const range = (id, k, v) => edit((n) => (v == null ? n.delete(`${id}_${k}`) : n.set(`${id}_${k}`, String(v))))
  const clear = (id, v) =>
    edit((n) => {
      if (v == null) { n.delete(id); n.delete(`${id}_min`); n.delete(`${id}_max`); return }
      const rest = n.getAll(id).filter((x) => x !== v)
      n.delete(id)
      rest.forEach((x) => n.append(id, x))
    })
  const clearAll = () => setParams(new URLSearchParams(), { replace: true })
  const goPage = (p) => {
    edit((n) => (p > 1 ? n.set('page', String(p)) : n.delete('page')), true)
    document.getElementById('results')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  if (error) return <div className="container"><div className="empty">Product data could not be loaded. Please reload the page.</div></div>
  if (!view) {
    return (
      <div className="container catalog catalog--loading" aria-busy="true">
        <div className="filters2 skel" />
        <div className="catalog__grid sku-grid">{Array.from({ length: 6 }, (_, i) => <div key={i} className="sku skel" />)}</div>
      </div>
    )
  }

  const pages = Math.max(1, Math.ceil(view.results.length / PAGE_SIZE))
  const current = Math.min(state.page, pages)
  const slice = view.results.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE)
  const filtered = state.q || Object.keys(state.sel).length

  return (
    <div className="container catalog" id="results">
      <aside className={`filters2 ${drawer ? 'is-open' : ''}`} aria-label="Filters">
        <div className="filters2__title">
          Filter by
          <button className="icon-btn filters2__close" onClick={() => setDrawer(false)} aria-label="Close filters"><X size={18} /></button>
        </div>
        <Facets ids={page.filters} facets={view.facets} sel={state.sel} onToggle={toggle} onRange={range} />
        {filtered ? <button className="filters2__reset" onClick={clearAll}>Clear all filters</button> : null}
      </aside>

      <div className="catalog__main">
        <div className="catalog__bar">
          <strong aria-live="polite">
            {view.results.length.toLocaleString('en')} {view.results.length === 1 ? 'article' : 'articles'}
            {filtered ? <span className="catalog__of"> of {view.total.toLocaleString('en')}</span> : null}
          </strong>
          <div className="catalog__tools">
            <button className="btn btn--outline catalog__filter-btn" onClick={() => setDrawer(true)}>
              <SlidersHorizontal size={15} /> Filters
            </button>
            <label className="sortby">
              Sort:
              <select value={state.sort} onChange={(e) => edit((n) => (e.target.value === 'relevance' ? n.delete('sort') : n.set('sort', e.target.value)))}>
                {Object.entries(SORTS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
              <ChevronDown size={15} />
            </label>
          </div>
        </div>
        <Chips state={state} clear={clear} clearAll={clearAll} />

        {slice.length ? (
          <div className="sku-grid">{slice.map((p) => <SkuCard key={p.sku} p={p} />)}</div>
        ) : (
          <div className="empty nomatch">
            <strong>No article matches this combination.</strong>
            <p>Try removing a filter or widening the diameter range. If you cannot find the exact part, our engineers can identify it from an OEM number, drawing or dimensions.</p>
            <div className="nomatch__actions">
              <button className="btn btn--outline" onClick={clearAll}>Clear all filters</button>
              <Link to="/contact/" className="btn btn--blue">Request identification <ArrowRight size={15} /></Link>
            </div>
          </div>
        )}
        <Pager page={current} pages={pages} go={goPage} />
      </div>
    </div>
  )
}

export default function ListingTemplate({ page, content }) {
  const [params, setParams] = useSearchParams()
  const nav = useNavigate()
  const hasProducts = page.productCount > 0

  const onSearch = (q) => {
    if (!hasProducts) {
      nav(q ? `${SHOP}?q=${encodeURIComponent(q)}` : SHOP)
      return
    }
    const next = new URLSearchParams(params)
    if (q) next.set('q', q)
    else next.delete('q')
    next.delete('page')
    setParams(next, { replace: true })
  }

  return (
    <div className="cms cms--listing" data-page={page.id}>
      <CmsHero page={page} lead={introOf(content)} image={page.image}>
        <ListingSearch key={params.get('q') || ''} initial={params.get('q') || ''} onSearch={onSearch} scope={hasProducts ? page.title : 'all articles'} />
        {hasProducts && <p className="cmsh__meta">{page.productCount.toLocaleString('en')} articles in this category</p>}
      </CmsHero>

      <section className="sheet cms__sheet">
        <SubCategories page={page} />
        {hasProducts ? (
          <Catalog key={page.id} page={page} params={params} setParams={setParams} />
        ) : (
          <div className="container">
            <div className="empty nomatch">
              <strong>No catalogue articles are assigned to this page yet.</strong>
              <p>Search the full catalogue above, or send us the OEM number, drawing or dimensions for identification.</p>
              <div className="nomatch__actions">
                <Link to={SHOP} className="btn btn--outline">Browse the shop</Link>
                <Link to="/contact/" className="btn btn--blue">Request identification <ArrowRight size={15} /></Link>
              </div>
            </div>
          </div>
        )}

        {content && (
          <div className="container cms__editorial">
            <RichText sections={content.sections} />
            <CtaBox section={ctaOf(content)} />
          </div>
        )}
      </section>
    </div>
  )
}
