// Renders any page of the SAP Parts category tree with the template for its page type.
import { useEffect, useState } from 'react'
import ListingTemplate from '../components/cms/ListingTemplate'
import InfoTemplate from '../components/cms/InfoTemplate'
import LegalTemplate from '../components/cms/LegalTemplate'
import QuoteForm from '../components/cms/QuoteForm'
import { useHead } from '../lib/head'
import { pageById, loadPageContent } from '../lib/site'

const CONTACT = '/contact/'

export default function CmsPage({ id }) {
  const page = pageById(id)
  const [content, setContent] = useState(null)
  useHead(page.seo)

  // Routes mount this with key={id}, so state starts fresh per page.
  useEffect(() => {
    let live = true
    loadPageContent(id).then((c) => live && setContent(c)).catch(() => live && setContent({ sections: [] }))
    return () => { live = false }
  }, [id])

  if (page.type === 'legal') return <LegalTemplate page={page} content={content} />
  if (page.type === 'listing') return <ListingTemplate page={page} content={content} />
  return <InfoTemplate page={page} content={content} aside={page.url === CONTACT ? <QuoteForm /> : null} />
}
