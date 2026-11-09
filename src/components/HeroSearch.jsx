import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, ArrowRight, Info, TrendingUp } from 'lucide-react'
import { searchSeals } from '../data'

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)
const BASE = 'Search by type no., product name or seal family…'
const HINTS = [BASE, 'Try “MBC+”', 'Try “Type 16HT metal bellows”', 'Try “API 682 double cartridge”', 'Try “Agitator”']

/* Types the placeholder out letter by letter, holds, erases, moves to the next hint. */
function useTypedHint(enabled) {
  const [text, setText] = useState(BASE)
  useEffect(() => {
    if (!enabled || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setText(BASE)
      return
    }
    let i = 0
    let n = HINTS[0].length
    let dir = 0
    let t
    const tick = () => {
      const word = HINTS[i]
      if (dir === 0) { t = setTimeout(() => { dir = -1; tick() }, i === 0 ? 3200 : 1600); return }
      n += dir
      setText(word.slice(0, n) || '\u200b')
      if (dir === -1 && n <= 0) { i = (i + 1) % HINTS.length; dir = 1 }
      else if (dir === 1 && n >= HINTS[i].length) dir = 0
      t = setTimeout(tick, dir === -1 ? 22 : 55)
    }
    tick()
    return () => clearTimeout(t)
  }, [enabled])
  return text
}

export default function HeroSearch({ popular = [] }) {
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const nav = useNavigate()
  const box = useRef(null)
  const input = useRef(null)
  const results = useMemo(() => searchSeals(q, 5), [q])
  const [focused, setFocused] = useState(false)
  const hint = useTypedHint(!focused && !q)

  useEffect(() => {
    const close = (e) => box.current && !box.current.contains(e.target) && setOpen(false)
    const focus = () => {
      input.current?.scrollIntoView({ block: 'center', behavior: 'smooth' })
      input.current?.focus({ preventScroll: true })
      setOpen(true)
    }
    const key = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        focus()
      }
    }
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', key)
    window.addEventListener('open-search', focus)
    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('keydown', key)
      window.removeEventListener('open-search', focus)
    }
  }, [])

  const go = (path) => {
    setOpen(false)
    nav(path)
  }

  const onKey = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, results.length - 1)) }
    if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)) }
    if (e.key === 'Escape') { setOpen(false); input.current?.blur() }
  }

  const submit = (e) => {
    e.preventDefault()
    if (open && results[active]) go(`/products/${results[active].slug}`)
    else if (q.trim()) go(`/products?q=${encodeURIComponent(q)}`)
  }

  const showMenu = open && q.trim()

  return (
    <form ref={box} className={`hsearch ${showMenu ? 'is-open' : ''}`} onSubmit={submit} role="search">
      <div className="hsearch__field">
        <Search size={22} className="hsearch__icon" />
        <input
          ref={input}
          value={q}
          onChange={(e) => { setQ(e.target.value); setOpen(true); setActive(0) }}
          onFocus={() => { setOpen(true); setFocused(true) }}
          onBlur={() => setFocused(false)}
          onKeyDown={onKey}
          placeholder={focused ? BASE : hint}
          aria-label="Search seals"
          aria-expanded={!!showMenu}
          aria-controls="hsearch-results"
          autoComplete="off"
        />
        <kbd className="hsearch__kbd" aria-hidden="true">{isMac ? '⌘' : 'Ctrl'} K</kbd>
        <button type="submit" className="hsearch__go" aria-label="Search">
          <ArrowRight size={20} />
        </button>
      </div>
      {popular.length > 0 && (
        <div className="hsearch__popular">
          <span>Popular searches:</span>
          {popular.map((t, i) => (
            <button
              type="button"
              key={t}
              style={{ '--i': i }}
              onClick={() => {
                setQ(t)
                setActive(0)
                setOpen(true)
                input.current?.focus()
              }}
            >
              {i === 0 && <TrendingUp size={15} />}
              {t}
            </button>
          ))}
        </div>
      )}
      {showMenu && (
        <div className="hsearch__menu" id="hsearch-results" role="listbox">
          {results.length ? (
            results.map((r, i) => (
              <button
                type="button"
                role="option"
                aria-selected={i === active}
                key={r.key}
                className={`hsearch__item ${i === active ? 'is-active' : ''}`}
                onMouseEnter={() => setActive(i)}
                onClick={() => go(`/products/${r.slug}`)}
              >
                <span className="hsearch__thumb">
                  {r.image ? <img src={r.image} alt="" loading="lazy" /> : null}
                </span>
                <span className="hsearch__text">
                  <strong>{r.title}</strong>
                  <small>
                    Type No. <b>{r.code}</b>
                    <i />
                    {r.family}
                  </small>
                </span>
                <span className="hsearch__badge">{r.match}</span>
                <ArrowRight size={18} className="hsearch__arrow" />
              </button>
            ))
          ) : (
            <div className="hsearch__empty">
              No exact match for “{q}”. Press Enter to search the catalogue or send us the OEM reference.
            </div>
          )}
          <div className="hsearch__hint">
            <Info size={15} /> Search by type number · product name · seal family
          </div>
        </div>
      )}
    </form>
  )
}
