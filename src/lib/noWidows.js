// Keeps the last two words of every text block together (non-breaking space),
// so no line of copy ever ends with a single word on its own.
const NBSP = ' '
const SKIP = 'script, style, svg, textarea, input, select, option, code, pre, [contenteditable], [data-allow-widow]'
const MAX_GLUE = 24 // never glue word pairs longer than this (avoids overflow in narrow boxes)

const isInline = (el) => getComputedStyle(el).display.startsWith('inline')

function blockOf(node) {
  let el = node.parentElement
  while (el && el !== document.body && isInline(el)) el = el.parentElement
  return el
}

// Last non-empty text node inside a block, ignoring nested blocks.
function lastTextNode(block) {
  const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT, {
    acceptNode: (n) => (n.nodeValue.trim() && blockOf(n) === block ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP),
  })
  let last = null
  while (walker.nextNode()) last = walker.currentNode
  return last
}

function glue(root) {
  const blocks = new Set()
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  while (walker.nextNode()) {
    const n = walker.currentNode
    if (!n.nodeValue.trim() || n.parentElement?.closest(SKIP)) continue
    const b = blockOf(n)
    if (b) blocks.add(b)
  }
  for (const block of blocks) {
    const words = block.textContent.trim().split(/\s+/)
    if (words.length < 3) continue
    const node = lastTextNode(block)
    if (!node) continue
    const text = node.nodeValue
    const m = text.match(/(\S+)[ \t\n]+(\S+)\s*$/)
    if (!m || m[1].length + m[2].length + 1 > MAX_GLUE) continue
    const at = m.index + m[1].length
    const next = text.slice(0, at) + NBSP + text.slice(at).replace(/^[ \t\n]+/, '')
    if (next !== text) node.nodeValue = next
  }
}

export function startNoWidows(root = document.getElementById('root')) {
  if (!root || typeof MutationObserver === 'undefined') return
  let queued = false
  const observer = new MutationObserver(() => schedule())
  const run = () => {
    queued = false
    observer.disconnect()
    glue(root)
    observer.observe(root, { childList: true, subtree: true, characterData: true })
  }
  const schedule = () => {
    if (queued) return
    queued = true
    setTimeout(run, 30)
  }
  schedule()
}
