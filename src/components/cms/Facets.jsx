import { useState } from 'react'
import { ChevronDown, Search } from 'lucide-react'
import { filterDef, formatNumber } from '../../lib/listing'

const SHOW = 8

function EnumGroup({ id, options, selected, onToggle }) {
  const def = filterDef(id)
  const [open, setOpen] = useState(true)
  const [more, setMore] = useState(false)
  const [find, setFind] = useState('')
  const visible = options.filter((o) => o.count > 0 || selected.includes(o.value))
  const needle = find.trim().toLowerCase()
  const list = needle ? visible.filter((o) => o.value.toLowerCase().includes(needle)) : visible
  const shown = more || needle ? list : list.slice(0, SHOW)
  const searchable = def.typeahead || visible.length > 15

  return (
    <div className={`fgroup ${open ? 'is-open' : ''}`}>
      <button className="fgroup__head" onClick={() => setOpen(!open)} aria-expanded={open}>
        {def.label} <ChevronDown size={16} />
      </button>
      {open && (
        <div className="fgroup__body">
          {searchable && (
            <label className="ffind">
              <Search size={14} />
              <input value={find} onChange={(e) => setFind(e.target.value)} placeholder={`Find ${def.label.toLowerCase()}…`} aria-label={`Find ${def.label}`} />
            </label>
          )}
          {shown.map((o) => (
            <label key={o.value} className={`fcheck ${o.count === 0 ? 'is-zero' : ''}`}>
              <input type="checkbox" checked={selected.includes(o.value)} onChange={() => onToggle(id, o.value)} />
              <span className="fcheck__box" />
              <span className="fcheck__label">{o.value}</span>
              <span className="fcheck__count">{o.count.toLocaleString('en')}</span>
            </label>
          ))}
          {!needle && list.length > SHOW && (
            <button className="fmore" onClick={() => setMore(!more)}>
              {more ? 'Show fewer' : `Show all ${list.length}`}
            </button>
          )}
          {needle && !list.length && <span className="fnone">No match</span>}
        </div>
      )}
    </div>
  )
}

function RangeGroup({ id, facet, value, onRange }) {
  const def = filterDef(id)
  const [open, setOpen] = useState(true)
  const commit = (key) => (e) => {
    const n = parseFloat(e.target.value.replace(',', '.'))
    onRange(id, key, Number.isFinite(n) ? n : null)
  }
  const field = (key, ph) => (
    <input
      key={`${key}-${value?.[key] ?? ''}`}
      type="number"
      inputMode="decimal"
      step="any"
      min="0"
      defaultValue={value?.[key] ?? ''}
      placeholder={ph}
      onBlur={commit(key)}
      onKeyDown={(e) => e.key === 'Enter' && commit(key)(e)}
      aria-label={`${def.label} ${key === 'min' ? 'from' : 'to'} (${def.unit})`}
    />
  )
  return (
    <div className={`fgroup ${open ? 'is-open' : ''}`}>
      <button className="fgroup__head" onClick={() => setOpen(!open)} aria-expanded={open}>
        {def.label} ({def.unit}) <ChevronDown size={16} />
      </button>
      {open && (
        <div className="fgroup__body">
          <div className="frange">
            {field('min', facet ? formatNumber(facet.min) : 'from')}
            <span>–</span>
            {field('max', facet ? formatNumber(facet.max) : 'to')}
          </div>
          {facet && <small className="frange__hint">{formatNumber(facet.min)}–{formatNumber(facet.max)} {def.unit} available · {facet.count.toLocaleString('en')} articles</small>}
        </div>
      )}
    </div>
  )
}

export default function Facets({ ids, facets, sel, onToggle, onRange }) {
  return ids.map((id) => {
    const def = filterDef(id)
    if (!def?.field) return null
    if (def.type === 'number') {
      if (!facets[id] && !sel[id]) return null
      return <RangeGroup key={id} id={id} facet={facets[id]} value={sel[id]} onRange={onRange} />
    }
    if (!facets[id]) return null
    return <EnumGroup key={id} id={id} options={facets[id]} selected={sel[id] || []} onToggle={onToggle} />
  })
}
