import path from 'node:path'
import { pathToFileURL } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Serves the Vercel Functions in api/ during `vite dev` and `vite preview`, so local
// listings hit the same handlers as production (/api/search, /api/product).
// In dev, modules load through Vite's SSR loader so edits to api/ and shared/ apply without a restart.
function vercelApi() {
  const handler = (load) => async (req, res, next) => {
    const match = req.url.match(/^\/api\/([a-z-]+)(?:\?|$)/)
    if (!match) return next()
    try {
      const mod = await load(match[1])
      const handler = mod[req.method] ?? mod.default
      if (typeof handler !== 'function') { res.statusCode = 405; return res.end() }
      const out = await handler(new Request(new URL(req.url, `http://${req.headers.host}`), { method: req.method, headers: req.headers }))
      res.statusCode = out.status
      out.headers.forEach((v, k) => res.setHeader(k, v))
      res.end(Buffer.from(await out.arrayBuffer()))
    } catch (err) {
      if (err.code === 'ERR_MODULE_NOT_FOUND' || /Failed to load url|does not exist/i.test(err.message)) return next()
      console.error(err)
      res.statusCode = 500
      res.end('API error')
    }
  }
  return {
    name: 'vercel-api',
    configureServer: (server) => { server.middlewares.use(handler((name) => server.ssrLoadModule(`/api/${name}.js`))) },
    configurePreviewServer: (server) => { server.middlewares.use(handler((name) => import(pathToFileURL(path.resolve('api', `${name}.js`)).href))) },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), vercelApi()],
  resolve: { alias: { '@': path.resolve(import.meta.dirname, 'src') } },
})
