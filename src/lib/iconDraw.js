// Plays the clockwise icon draw-in once when each icon scrolls into view.
const DRAW_MS = 950

export function startIconDraw(root = document.getElementById('root')) {
  if (!root || typeof IntersectionObserver === 'undefined') return
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
  const seen = new WeakSet()
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue
      const svg = e.target
      io.unobserve(svg)
      svg.classList.add('icon-draw')
      setTimeout(() => svg.classList.remove('icon-draw'), DRAW_MS)
    }
  }, { threshold: 0.6 })
  const scan = () => {
    root.querySelectorAll('svg.lucide').forEach((svg) => {
      if (seen.has(svg)) return
      seen.add(svg)
      // Normalise every stroke to length 1 so one dash setting draws any shape fully
      svg.querySelectorAll('path, circle, line, polyline, polygon, rect, ellipse').forEach((el) => el.setAttribute('pathLength', '1'))
      if (svg.closest('.btn, .dd__btn, .ulink, .mega__all, .mega__tag, .hsearch__go, .mega__cat-go, .ostep__link, .pc__go, .appcard__go, .mega__go')) return
      io.observe(svg)
    })
  }
  let t = null
  new MutationObserver(() => { clearTimeout(t); t = setTimeout(scan, 60) }).observe(root, { childList: true, subtree: true })
  scan()
}
