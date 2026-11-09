import { useMemo, useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, ArrowRight } from 'lucide-react'
import { products } from '../data'

export function matchProducts(q) {
  const s = q.trim().toLowerCase()
  if (!s) return products
  return products.filter((p) =>
    [p.name, p.code, p.short, ...p.highlights, ...p.types.map((t) => t.name)].join(' ').toLowerCase().includes(s),
  )
}

export default function SearchBar({ size = 'md', placeholder = 'Search seals, types or part numbers…' }) {
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const nav = useNavigate()
  const box = useRef(null)
  const results = useMemo(() => (q.trim() ? matchProducts(q).slice(0, 6) : []), [q])

  useEffect(() => {
    const close = (e) => box.current && !box.current.contains(e.target) && setOpen(false)
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  const go = (path) => {
    setOpen(false)
    setQ('')
    nav(path)
  }

  const onKey = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, results.length - 1)) }
    if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)) }
    if (e.key === 'Escape') setOpen(false)
  }

  const submit = (e) => {
    e.preventDefault()
    if (results[active] && open) go(`/products/${results[active].slug}`)
    else go(`/products?q=${encodeURIComponent(q)}`)
  }

  return (
    <form ref={box} className={`search search--${size}`} onSubmit={submit} role="search">
      <Search size={size === 'lg' ? 18 : 15} className="search__icon" />
      <input
        value={q}
        onChange={(e) => { setQ(e.target.value); setOpen(true); setActive(0) }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKey}
        placeholder={placeholder}
        aria-label="Search products"
      />
      {size === 'lg' && (
        <button type="submit" className="btn btn--primary search__btn">
          Search <ArrowRight size={14} />
        </button>
      )}
      {open && q.trim() && (
        <div className="search__menu">
          {results.length ? (
            results.map((p, i) => (
              <button
                type="button"
                key={p.slug}
                className={`search__item ${i === active ? 'is-active' : ''}`}
                onMouseEnter={() => setActive(i)}
                onClick={() => go(`/products/${p.slug}`)}
              >
                {p.image ? <img src={p.image} alt="" /> : <span className="search__ph" />}
                <span>
                  <strong>{p.name}</strong>
                  <small>{p.code}</small>
                </span>
              </button>
            ))
          ) : (
            <div className="search__empty">No match. Press Enter to send an enquiry.</div>
          )}
        </div>
      )}
    </form>
  )
}
