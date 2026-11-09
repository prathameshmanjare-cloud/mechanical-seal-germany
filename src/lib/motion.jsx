import { useEffect, useRef, useState } from 'react'

export const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/* Adds .is-in to every [data-reveal] inside root once it scrolls into view.
   Children of a [data-stagger] parent get an incremental --i for staggered delays. */
export function useReveal(rootRef) {
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    root.querySelectorAll('[data-stagger]').forEach((group) => {
      ;[...group.children].forEach((el, i) => el.style.setProperty('--i', i))
    })
    const els = root.querySelectorAll('[data-reveal]')
    if (reducedMotion() || !('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('is-in'))
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-in')
            io.unobserve(e.target)
          }
        })
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.12 },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [rootRef])
}

/* Counts from 0 to `to` once the element is visible. */
export function CountUp({ to, duration = 1600, suffix = '', prefix = '' }) {
  const ref = useRef(null)
  const [val, setVal] = useState(0)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (reducedMotion()) {
      setVal(to)
      return
    }
    let raf
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      io.disconnect()
      const t0 = performance.now()
      const tick = (t) => {
        const p = Math.min(1, (t - t0) / duration)
        const eased = 1 - Math.pow(1 - p, 4)
        setVal(Math.round(to * eased))
        if (p < 1) raf = requestAnimationFrame(tick)
      }
      raf = requestAnimationFrame(tick)
    }, { threshold: 0.6 })
    io.observe(el)
    return () => {
      io.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [to, duration])
  return (
    <span ref={ref} className="countup">
      {prefix}{val}{suffix}
    </span>
  )
}

/* Pointer-driven 3D tilt. Writes --rx, --ry (deg) and --px, --py (0..1) on the element. */
export function useTilt(ref, max = 10) {
  useEffect(() => {
    const el = ref.current
    if (!el || reducedMotion() || window.matchMedia('(hover: none)').matches) return
    let raf
    let target = { x: 0.5, y: 0.5 }
    let cur = { x: 0.5, y: 0.5 }
    const loop = () => {
      cur.x += (target.x - cur.x) * 0.08
      cur.y += (target.y - cur.y) * 0.08
      el.style.setProperty('--ry', `${(cur.x - 0.5) * max * 2}deg`)
      el.style.setProperty('--rx', `${(0.5 - cur.y) * max * 2}deg`)
      el.style.setProperty('--px', cur.x.toFixed(3))
      el.style.setProperty('--py', cur.y.toFixed(3))
      if (Math.abs(target.x - cur.x) > 0.001 || Math.abs(target.y - cur.y) > 0.001) raf = requestAnimationFrame(loop)
      else raf = null
    }
    const kick = () => { if (!raf) raf = requestAnimationFrame(loop) }
    const move = (e) => {
      const r = el.getBoundingClientRect()
      target = { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height }
      kick()
    }
    const leave = () => { target = { x: 0.5, y: 0.5 }; kick() }
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerleave', leave)
    return () => {
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerleave', leave)
      cancelAnimationFrame(raf)
    }
  }, [ref, max])
}

/* Scroll progress of an element through the viewport: 0 when its top hits the
   bottom of the screen, 1 when its bottom leaves the top. Written to --p. */
export function useScrollProgress(ref) {
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (reducedMotion()) {
      el.style.setProperty('--p', '0.5')
      return
    }
    let raf
    const update = () => {
      raf = null
      const r = el.getBoundingClientRect()
      const vh = window.innerHeight
      const p = Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height)))
      el.style.setProperty('--p', p.toFixed(4))
    }
    const on = () => { if (!raf) raf = requestAnimationFrame(update) }
    update()
    window.addEventListener('scroll', on, { passive: true })
    window.addEventListener('resize', on)
    return () => {
      window.removeEventListener('scroll', on)
      window.removeEventListener('resize', on)
      cancelAnimationFrame(raf)
    }
  }, [ref])
}

/* Cursor spotlight for cards: sets --mx/--my in px on hover. */
export function spotlight(e) {
  const r = e.currentTarget.getBoundingClientRect()
  e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`)
  e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`)
}
