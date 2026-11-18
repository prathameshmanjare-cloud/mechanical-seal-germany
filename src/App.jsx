import { useEffect } from 'react'
import { Navigate, Routes, Route, useLocation } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import CmsPage from './pages/CmsPage'
import NotFound from './pages/NotFound'
import ProductPage from './pages/ProductPage'
import { pages } from './lib/site'
import { LEGACY_FALLBACK, LEGACY_REDIRECTS } from './lib/redirects'

function ScrollTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export default function App() {
  return (
    <>
      <ScrollTop />
      <Header />
      <main>
        <Routes>
          <Route path="/product/:sku" element={<ProductPage />} />
          {pages.map((p) => (
            <Route key={p.id} path={p.url} element={<CmsPage key={p.id} id={p.id} />} />
          ))}
          {Object.entries(LEGACY_REDIRECTS).map(([from, to]) => (
            <Route key={from} path={from} element={<Navigate to={to} replace />} />
          ))}
          <Route path={LEGACY_FALLBACK.from} element={<Navigate to={LEGACY_FALLBACK.to} replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </>
  )
}
