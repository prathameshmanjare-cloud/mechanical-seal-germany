import { useEffect } from 'react'

function upsert(selector, create) {
  let el = document.head.querySelector(selector)
  if (!el) {
    el = create()
    document.head.appendChild(el)
  }
  return el
}

// Sets <title>, meta description and canonical link for the current page.
export function useHead({ title, description, canonical }) {
  useEffect(() => {
    document.title = title
    upsert('meta[name="description"]', () => Object.assign(document.createElement('meta'), { name: 'description' })).content = description || ''
    upsert('link[rel="canonical"]', () => Object.assign(document.createElement('link'), { rel: 'canonical' })).href = new URL(canonical, window.location.origin).href
  }, [title, description, canonical])
}
