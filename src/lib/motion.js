// Page motion, applied by attribute so components stay plain markup:
//   data-reveal            fades/rises in when it enters the viewport (stagger with style="--d: n")
//   data-count="38881"     counts up to the number once visible (text already holds the final value)
//   data-spotlight         a soft light follows the pointer across the element (--mx / --my)
// Content is only hidden after this script adds `html.motion`, so without JS everything stays visible,
// and nothing moves for people who ask for reduced motion.
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
const fmt = (n) => Math.round(n).toLocaleString('en')

function countUp(el) {
  const to = Number(el.dataset.count)
  if (!Number.isFinite(to)) return
  const start = performance.now()
  const dur = 1100
  const tick = (t) => {
    const p = Math.min(1, (t - start) / dur)
    el.textContent = fmt(to * (1 - (1 - p) ** 3))
    if (p < 1) requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
}

export function startMotion() {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window) || reduced()) return
  document.documentElement.classList.add('motion')

  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue
        e.target.classList.add('is-in')
        if (e.target.dataset.count) countUp(e.target)
        io.unobserve(e.target)
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
  )

  const seen = new WeakSet()
  const scan = (root) => {
    root.querySelectorAll?.('[data-reveal], [data-count]').forEach((el) => {
      if (seen.has(el)) return
      seen.add(el)
      if (el.dataset.count) el.textContent = '0'
      io.observe(el)
    })
  }
  scan(document)
  new MutationObserver((muts) => {
    for (const m of muts) m.addedNodes.forEach((n) => n.nodeType === 1 && scan(n.parentElement || n))
  }).observe(document.body, { childList: true, subtree: true })

  // Scroll parallax: [data-parallax="0.1"] drifts by factor × its distance from the viewport centre (--py).
  let ticking = false
  const drift = () => {
    ticking = false
    const vh = window.innerHeight
    document.querySelectorAll('[data-parallax]').forEach((el) => {
      const r = el.getBoundingClientRect()
      if (r.bottom < -200 || r.top > vh + 200) return
      const y = (r.top + r.height / 2 - vh / 2) * Number(el.dataset.parallax || 0.1)
      el.style.setProperty('--py', `${y.toFixed(1)}px`)
    })
  }
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(drift) } }
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll, { passive: true })
  onScroll()

  // Pointer spotlight: one delegated listener, cheap CSS variables.
  document.addEventListener(
    'pointermove',
    (e) => {
      const el = e.target.closest?.('[data-spotlight]')
      if (!el) return
      const r = el.getBoundingClientRect()
      el.style.setProperty('--mx', `${e.clientX - r.left}px`)
      el.style.setProperty('--my', `${e.clientY - r.top}px`)
    },
    { passive: true },
  )
}
