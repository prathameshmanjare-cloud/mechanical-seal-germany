import path from 'node:path'
import { pathToFileURL } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Serves the Vercel Functions in api/ during `vite dev` and `vite preview`, so local
// listings hit the same handlers as production (/api/search, /api/product).
function vercelApi() {
  const handle = async (req, res, next) => {
    const match = req.url.match(/^\/api\/([a-z-]+)(?:\?|$)/)
    if (!match) return next()
    try {
      const mod = await import(pathToFileURL(path.resolve('api', `${match[1]}.js`)).href)
      const handler = mod[req.method] ?? mod.default
      if (typeof handler !== 'function') { res.statusCode = 405; return res.end() }
      const out = await handler(new Request(new URL(req.url, `http://${req.headers.host}`), { method: req.method, headers: req.headers }))
      res.statusCode = out.status
      out.headers.forEach((v, k) => res.setHeader(k, v))
      res.end(Buffer.from(await out.arrayBuffer()))
    } catch (err) {
      if (err.code === 'ERR_MODULE_NOT_FOUND') return next()
      console.error(err)
      res.statusCode = 500
      res.end('API error')
    }
  }
  return {
    name: 'vercel-api',
    configureServer: (server) => { server.middlewares.use(handle) },
    configurePreviewServer: (server) => { server.middlewares.use(handle) },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), vercelApi()],
})
