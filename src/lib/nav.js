import { pageById, sections } from './site'

// Header menu definitions: one per top-level section of the category tree.
export const menus = sections.map((s) => ({
  id: s.id,
  label: s.title,
  to: s.url,
  mega: s.children.length > 0,
  items: s.children.map(pageById).map((c) => ({ to: c.url, label: c.title })),
}))
