// Predictive catalogue search, used in the home hero, on listing pages and in the mobile menu.
// Typing asks /api/suggest (debounced, cached, cancelled when outdated) and shows shortcuts (shaft size,
// brands, series, designs, materials), the best article matches and matching pages. Keyboard: ↑ ↓ move,
// Enter opens the highlighted entry (or an exact article match, or the full result list), Tab accepts the
// inline completion, Esc closes. "/" or Ctrl/⌘ K focuses the primary search box from anywhere on the page.
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight, ArrowUpRight, Clock, Cog, CornerDownLeft, Droplets, Factory, FileText, FlaskConical, Layers, Ruler, Search,
  SearchX, Sparkles, Tag, TrendingUp, Wrench, X,
} from 'lucide-react'
import { productUrl } from '../lib/site'

const SHOP = '/shop/'
const CONTACT = '/contact/'
const RECENT_KEY = 'sap-parts:recent-searches'
const MAX_RECENT = 5
const HINTS = ['EagleBurgmann', 'Ø 25 mm', 'SiC/SiC/FKM', 'Typ 13 / 13N', 'Alfa Laval', 'cartridge seal', 'an OEM part number']

const KIND_ICON = {
  size: Ruler, brand: Factory, equipment: Wrench, series: Tag, design: Layers,
  material: FlaskConical, elastomer: Droplets, combination: FlaskConical, application: Cog,
}
const fmt = (n) => n.toLocaleString('en')
const shopQuery = (q) => (q ? `${SHOP}?q=${encodeURIComponent(q)}` : SHOP)

// ---------- data ----------

const cache = new Map()
function fetchSuggest(q, scope, signal) {
  const key = `${scope || ''}|${q.toLowerCase()}`
  if (cache.has(key)) return Promise.resolve(cache.get(key))
  const params = new URLSearchParams({ q })
  if (scope) params.set('scope', scope)
  return fetch(`/api/suggest?${params}`, { signal })
    .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
    .then((d) => {
      cache.set(key, d)
      if (cache.size > 300) cache.delete(cache.keys().next().value)
      return d
    })
}
const cachedKey = (q, scope) => `${scope || ''}|${q.toLowerCase()}`

function readRecent() {
  try {
    const v = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]')
    return Array.isArray(v) ? v.filter((x) => typeof x === 'string').slice(0, MAX_RECENT) : []
  } catch {
    return []
  }
}
function writeRecent(list) {
  try { localStorage.setItem(RECENT_KEY, JSON.stringify(list)) } catch { /* private mode */ }
}

// ---------- small pieces ----------

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// Wraps every occurrence of the typed words in <mark>.
function Hl({ text, q }) {
  if (!text) return null
  const tokens = q.trim().split(/\s+/).filter(Boolean).sort((a, b) => b.length - a.length).map(escapeRe)
  if (!tokens.length) return text
  return String(text).split(new RegExp(`(${tokens.join('|')})`, 'ig')).map((part, i) => (i % 2 ? <mark key={i}>{part}</mark> : part))
}

// Types and erases example queries in the empty field ("Search EagleBurgmann…").
function useTypewriter(words, active) {
  const [text, setText] = useState('')
  useEffect(() => {
    if (!active) return undefined
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setText(words[0])
      return undefined
    }
    let w = 0
    let i = 0
    let erasing = false
    let timer
    const tick = () => {
      const word = words[w]
      if (!erasing) {
        i++
        setText(word.slice(0, i))
        if (i >= word.length) { erasing = true; timer = setTimeout(tick, 1700); return }
        timer = setTimeout(tick, 60 + Math.random() * 60)
      } else {
        i--
        setText(word.slice(0, i))
        if (i <= 0) { erasing = false; w = (w + 1) % words.length; timer = setTimeout(tick, 380); return }
        timer = setTimeout(tick, 28)
      }
    }
    timer = setTimeout(tick, 900)
    return () => clearTimeout(timer)
  }, [active, words])
  return text
}

// Keeps the fixed-position panel under the field while the page scrolls or resizes.
function usePanelPosition(anchorRef, open, minWidth) {
  const [pos, setPos] = useState(null)
  useLayoutEffect(() => {
    if (!open) return undefined
    let frame = 0
    const place = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const r = anchorRef.current?.getBoundingClientRect()
        if (!r) return
        const width = Math.min(Math.max(r.width, minWidth), window.innerWidth - 16)
        const left = Math.min(Math.max(8, r.left), window.innerWidth - width - 8)
        setPos({ top: r.bottom + 8, left, width, maxHeight: Math.max(220, window.innerHeight - r.bottom - 20) })
      })
    }
    place()
    window.addEventListener('scroll', place, true)
    window.addEventListener('resize', place)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', place, true)
      window.removeEventListener('resize', place)
    }
  }, [anchorRef, open, minWidth])
  return pos
}

// ---------- component ----------

export default function SmartSearch({
  size = 'lg', scope = null, initial = '', onSubmit, hotkey = false, className = '', label = 'Search the catalogue',
  button = true, placeholder = 'Search by part number, OEM code, brand, series, material or shaft Ø',
}) {
  const nav = useNavigate()
  const uid = useId()
  const listId = `${uid}-list`
  const wrapRef = useRef(null)
  const inputRef = useRef(null)
  const panelRef = useRef(null)

  const [q, setQ] = useState(initial)
  const [open, setOpen] = useState(false)
  const [focused, setFocused] = useState(false)
  const [data, setData] = useState(null)
  const [popular, setPopular] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [active, setActive] = useState(-1)
  const [recent, setRecent] = useState(readRecent)

  const query = q.trim()
  const pos = usePanelPosition(wrapRef, open, size === 'lg' ? 580 : 300)
  const hint = useTypewriter(HINTS, !q && !focused)

  // Fetch suggestions for what is typed (or the popular list for an empty field).
  useEffect(() => {
    if (!open) return undefined
    const ctrl = new AbortController()
    const delay = cache.has(cachedKey(query, scope)) ? 0 : 110
    setLoading(true)
    const timer = setTimeout(() => {
      fetchSuggest(query, scope, ctrl.signal)
        .then((d) => {
          if (query) setData(d)
          else setPopular(d.popular || [])
          setError(false)
          setLoading(false)
          setActive(-1)
        })
        .catch((e) => {
          if (e.name === 'AbortError') return
          setError(true)
          setLoading(false)
        })
    }, delay)
    return () => {
      clearTimeout(timer)
      ctrl.abort()
    }
  }, [query, scope, open])

  // Close on a click outside the field and the panel.
  useEffect(() => {
    if (!open) return undefined
    const onDown = (e) => {
      if (wrapRef.current?.contains(e.target) || panelRef.current?.contains(e.target)) return
      setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('touchstart', onDown, { passive: true })
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('touchstart', onDown)
    }
  }, [open])

  // "/" or Ctrl/⌘ K focuses this box.
  useEffect(() => {
    if (!hotkey) return undefined
    const onKey = (e) => {
      const t = e.target
      const typing = t instanceof HTMLElement && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))
      if ((e.key === '/' && !typing) || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k')) {
        e.preventDefault()
        inputRef.current?.focus()
        inputRef.current?.select()
        setOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [hotkey])

  const remember = useCallback((term) => {
    const t = term.trim()
    if (!t) return
    setRecent((prev) => {
      const next = [t, ...prev.filter((x) => x.toLowerCase() !== t.toLowerCase())].slice(0, MAX_RECENT)
      writeRecent(next)
      return next
    })
  }, [])
  const forget = (term) => {
    setRecent((prev) => {
      const next = term ? prev.filter((x) => x !== term) : []
      writeRecent(next)
      return next
    })
    inputRef.current?.focus()
  }

  const finish = () => {
    setOpen(false)
    setActive(-1)
    inputRef.current?.blur()
  }

  const submit = (term = query) => {
    remember(term)
    finish()
    const fresh = data && data.q === term ? data : null
    if (fresh?.exact) return nav(productUrl(fresh.exact.sku))
    if (onSubmit) return onSubmit(term)
    nav(shopQuery(term))
  }

  // ----- build the entries (one flat list, so the arrow keys walk every group in order) -----

  // While the next answer loads, the previous one stays on screen (no flicker between keystrokes).
  const fresh = query ? data : null
  const shown = fresh?.corrected || query
  const items = []
  const groups = []
  const add = (group, item) => {
    item.index = items.length
    items.push(item)
    let g = groups.find((x) => x.key === group.key)
    if (!g) groups.push((g = { ...group, items: [] }))
    g.items.push(item)
  }

  if (!query) {
    for (const r of recent) add({ key: 'recent', title: 'Recent searches', clear: true }, { kind: 'recent', key: `r-${r}`, term: r, go: () => submit(r) })
    for (const e of popular || []) add({ key: 'popular', title: 'Popular right now', chips: true }, { kind: 'chip', key: `p-${e.url}`, e, go: () => { remember(e.value); finish(); nav(e.url) } })
  } else if (fresh) {
    for (const e of fresh.quick || []) add({ key: 'quick', title: 'Jump to', tiles: true }, { kind: 'entity', key: `e-${e.url}`, e, go: () => { remember(e.value); finish(); nav(e.url) } })
    for (const p of fresh.products || []) add({ key: 'products', title: 'Articles', count: fresh.total }, { kind: 'product', key: `s-${p.sku}`, p, go: () => { remember(query); finish(); nav(productUrl(p.sku)) } })
    for (const p of fresh.pages || []) add({ key: 'pages', title: 'Pages' }, { kind: 'page', key: `g-${p.url}`, p, go: () => { remember(query); finish(); nav(p.url) } })
    if (fresh.total > 0) add({ key: 'all' }, { kind: 'all', key: 'all', go: () => submit(fresh.corrected || query) })
    else add({ key: 'help' }, { kind: 'help', key: 'help', go: () => { finish(); nav(CONTACT) } })
  }

  const activeItem = items[active]
  const empty = query && fresh && !fresh.total && !(fresh.quick || []).length && !(fresh.pages || []).length

  // Inline completion ("eagle" → "eagleBurgmann", shown faintly; Tab or → accepts).
  const complete = fresh && fresh.q === query && q === query && fresh.complete?.toLowerCase().startsWith(q.toLowerCase()) ? fresh.complete : null
  const ghost = complete ? complete.slice(q.length) : ''
  const acceptGhost = () => {
    setQ(complete)
    setActive(-1)
  }

  // Keep the highlighted entry in view.
  useEffect(() => {
    if (active < 0) return
    panelRef.current?.querySelector(`[data-idx="${active}"]`)?.scrollIntoView({ block: 'nearest' })
  }, [active])

  const onKeyDown = (e) => {
    const n = items.length
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        if (!open) { setOpen(true); return }
        if (n) setActive((a) => (a + 1) % n)
        break
      case 'ArrowUp':
        e.preventDefault()
        if (n) setActive((a) => (a <= 0 ? n - 1 : a - 1))
        break
      case 'Enter':
        e.preventDefault()
        if (open && activeItem) activeItem.go()
        else submit()
        break
      case 'Escape':
        if (open) { e.preventDefault(); setOpen(false); setActive(-1) }
        else if (q) { e.preventDefault(); setQ('') }
        break
      case 'Tab':
        if (ghost && !e.shiftKey) { e.preventDefault(); acceptGhost() }
        break
      case 'ArrowRight':
        if (ghost && e.currentTarget.selectionStart === q.length) { e.preventDefault(); acceptGhost() }
        break
      default:
    }
  }

  const status = !query ? '' : loading && !fresh ? 'Searching…' : fresh ? (fresh.total ? `${fmt(fresh.total)} matching articles` : 'No matching articles') : ''

  const panel = open && pos && (items.length > 0 || query || loading) && (
    <div
      ref={panelRef}
      className={`ssp ${loading ? 'is-loading' : ''}`}
      style={{ top: pos.top, left: pos.left, width: pos.width, maxHeight: pos.maxHeight }}
      onMouseDown={(e) => e.preventDefault() /* keep focus in the field */}
    >
      <span className="ssp__bar" aria-hidden="true" />
      <div className="ssp__scroll" id={listId} role="listbox" aria-label="Search suggestions">
        {fresh?.corrected && (
          <p className="ssp__fix">
            <Sparkles size={15} aria-hidden="true" />
            <span>No match for “{query}”. Showing results for <button type="button" onClick={() => setQ(fresh.corrected)}>{fresh.corrected}</button></span>
          </p>
        )}

        {query && !fresh && loading && (
          <div className="ssp__skel" aria-hidden="true">
            {[0, 1, 2, 3].map((i) => <span key={i} style={{ '--i': i }}><i /><b /></span>)}
          </div>
        )}
        {query && !fresh && error && <p className="ssp__note">Suggestions are unavailable right now. Press Enter to search.</p>}

        {empty && (
          <div className="ssp__empty">
            <SearchX size={30} strokeWidth={1.5} aria-hidden="true" />
            <strong>No direct match for “{query}”</strong>
            <p>Check the number for typos, try fewer characters, or send us the reference, drawing or dimensions and we identify the seal.</p>
          </div>
        )}

        {!query && !items.length && (
          <p className="ssp__note">Search by article number, OEM reference, brand, series, material or shaft diameter.</p>
        )}

        {groups.map((g) => (
          <div key={g.key} className={`ssp__group ssp__group--${g.key}`} role="group" aria-label={g.title || undefined}>
            {g.title && (
              <div className="ssp__head">
                {g.key === 'recent' ? <Clock size={13} aria-hidden="true" /> : g.key === 'popular' ? <TrendingUp size={13} aria-hidden="true" /> : null}
                <span>{g.title}</span>
                {g.count != null && <em>{fmt(g.count)} {g.count === 1 ? 'match' : 'matches'}</em>}
                {g.clear && <button type="button" className="ssp__clear" onClick={() => forget(null)}>Clear</button>}
              </div>
            )}
            <div className={g.tiles ? 'ssp__tiles' : g.chips ? 'ssp__chips' : 'ssp__rows'}>
              {g.items.map((it) => (
                <Entry key={it.key} it={it} q={shown} active={it.index === active} listId={listId} exactSku={fresh?.exact?.sku} total={fresh?.total} query={fresh?.corrected || query}
                  onHover={() => setActive(it.index)} onForget={forget} />
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="ssp__foot" aria-hidden="true">
        <span><kbd>↑</kbd><kbd>↓</kbd> navigate</span>
        <span><kbd>↵</kbd> open</span>
        {ghost && <span><kbd>Tab</kbd> complete</span>}
        <span><kbd>Esc</kbd> close</span>
      </div>
    </div>
  )

  return (
    <form
      ref={wrapRef}
      className={`ss ss--${size} ${focused ? 'is-focused' : ''} ${open && items.length ? 'is-open' : ''} ${className}`}
      role="search"
      onSubmit={(e) => { e.preventDefault(); submit() }}
    >
      <div className="ss__field">
        <Search size={size === 'lg' ? 19 : 17} className="ss__icon" aria-hidden="true" />
        <div className="ss__input">
          {!q && (
            <span className="ss__placeholder" aria-hidden="true">
              {focused ? placeholder : <>Search <b>{hint}</b><i className="ss__caret" /></>}
            </span>
          )}
          {ghost && <span className="ss__ghost" aria-hidden="true"><span>{q}</span>{ghost}</span>}
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => { setQ(e.target.value); setOpen(true); setActive(-1) }}
            onFocus={() => { setFocused(true); setOpen(true) }}
            onBlur={() => setFocused(false)}
            onKeyDown={onKeyDown}
            role="combobox"
            aria-label={label}
            aria-expanded={Boolean(panel)}
            aria-controls={listId}
            aria-autocomplete="both"
            aria-activedescendant={activeItem ? `${listId}-${activeItem.index}` : undefined}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            enterKeyHint="search"
            maxLength={120}
          />
        </div>
        {loading && query && <span className="ss__spin" aria-hidden="true" />}
        {q && (
          <button type="button" className="ss__x" aria-label="Clear search" onClick={() => { setQ(''); setActive(-1); inputRef.current?.focus() }}>
            <X size={15} />
          </button>
        )}
        {hotkey && !q && !focused && <kbd className="ss__kbd" aria-hidden="true">/</kbd>}
        {button && <button type="submit" className="ss__btn">Search <ArrowRight size={16} aria-hidden="true" /></button>}
      </div>
      <span className="sr-only" aria-live="polite">{status}</span>
      {panel && createPortal(panel, document.body)}
    </form>
  )
}

function Entry({ it, q, active, listId, exactSku, total, query, onHover, onForget }) {
  const common = {
    id: `${listId}-${it.index}`,
    role: 'option',
    'aria-selected': active,
    'data-idx': it.index,
    onMouseMove: active ? undefined : onHover,
    onClick: it.go,
  }

  if (it.kind === 'recent') {
    return (
      <div {...common} className={`ssp__row ssp__row--recent ${active ? 'is-active' : ''}`}>
        <Clock size={15} className="ssp__ico" aria-hidden="true" />
        <span className="ssp__title">{it.term}</span>
        <button type="button" className="ssp__forget" aria-label={`Remove ${it.term}`} onClick={(e) => { e.stopPropagation(); onForget(it.term) }}>
          <X size={13} />
        </button>
      </div>
    )
  }

  if (it.kind === 'chip') {
    const Icon = KIND_ICON[it.e.kind] || Tag
    return (
      <div {...common} className={`ssp__chip ${active ? 'is-active' : ''}`} title={it.e.kindLabel}>
        <Icon size={13} aria-hidden="true" />
        {it.e.value}
      </div>
    )
  }

  if (it.kind === 'entity') {
    const Icon = KIND_ICON[it.e.kind] || Tag
    return (
      <div {...common} className={`ssp__tile ssp__tile--${it.e.kind} ${active ? 'is-active' : ''}`}>
        <span className="ssp__badge"><Icon size={16} aria-hidden="true" /></span>
        <span className="ssp__txt">
          <strong><Hl text={it.e.value} q={q} /></strong>
          <small>{it.e.kindLabel} · {fmt(it.e.count)} {it.e.count === 1 ? 'article' : 'articles'}</small>
        </span>
        <ArrowUpRight size={15} className="ssp__go" aria-hidden="true" />
      </div>
    )
  }

  if (it.kind === 'product') {
    const p = it.p
    const meta = [p.refManufacturer && p.refManufacturer !== 'SAP Parts' ? p.refManufacturer : null, p.series, p.shaftD != null ? `Ø ${p.shaftD} mm` : null, p.materialCombination].filter(Boolean)
    const ref = p.oemPn || p.mpn
    return (
      <div {...common} className={`ssp__row ssp__row--product ${active ? 'is-active' : ''}`}>
        <span className="ssp__thumb">{p.image ? <img src={p.image} alt="" width="44" height="44" loading="lazy" /> : <Layers size={18} />}</span>
        <span className="ssp__txt">
          <strong className="ssp__title"><Hl text={p.title} q={q} /></strong>
          <small>
            <code><Hl text={p.sku} q={q} /></code>
            {ref && <> · Ref. <Hl text={ref} q={q} /></>}
            {meta.length > 0 && <> · {meta.join(' · ')}</>}
          </small>
        </span>
        {exactSku === p.sku && <span className="ssp__exact">Exact match</span>}
        <ArrowRight size={15} className="ssp__go" aria-hidden="true" />
      </div>
    )
  }

  if (it.kind === 'page') {
    const p = it.p
    return (
      <div {...common} className={`ssp__row ssp__row--page ${active ? 'is-active' : ''}`}>
        <FileText size={16} className="ssp__ico" aria-hidden="true" />
        <span className="ssp__txt">
          <strong className="ssp__title"><Hl text={p.title} q={q} /></strong>
          <small>{[p.section, p.count ? `${fmt(p.count)} articles` : null].filter(Boolean).join(' · ') || 'Information'}</small>
        </span>
        <ArrowRight size={15} className="ssp__go" aria-hidden="true" />
      </div>
    )
  }

  if (it.kind === 'all') {
    return (
      <div {...common} className={`ssp__all ${active ? 'is-active' : ''}`}>
        <Search size={15} aria-hidden="true" />
        <span>See all <b>{fmt(total)}</b> results for “{query}”</span>
        <CornerDownLeft size={14} className="ssp__enter" aria-hidden="true" />
      </div>
    )
  }

  return (
    <div {...common} className={`ssp__all ssp__all--help ${active ? 'is-active' : ''}`}>
      <Wrench size={15} aria-hidden="true" />
      <span>Request identification for “{query}”</span>
      <ArrowRight size={14} className="ssp__enter" aria-hidden="true" />
    </div>
  )
}
