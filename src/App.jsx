import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import About from './pages/About'
import Contact from './pages/Contact'
import Impressum from './pages/Impressum'
import Applications from './pages/Applications'
import Technology from './pages/Technology'
import CmsPage from './pages/CmsPage'
import NotFound from './pages/NotFound'
import { pages } from './lib/site'

// Routes still served by the legacy pages until their phase-2 templates exist.
const LEGACY = new Set(['/', '/contact/'])
const cmsRoutes = pages.filter((p) => !LEGACY.has(p.url))

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
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:slug" element={<ProductDetail />} />
          <Route path="/applications" element={<Applications />} />
          <Route path="/technology" element={<Technology />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/impressum" element={<Impressum />} />
          {cmsRoutes.map((p) => (
            <Route key={p.id} path={p.url} element={<CmsPage key={p.id} id={p.id} />} />
          ))}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </>
  )
}
