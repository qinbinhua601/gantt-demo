import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import crypto from 'crypto'
import fs from 'fs'
import path from 'path'

function cspNonceDevPlugin() {
  return {
    name: 'csp-nonce-dev',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url === '/' || req.url === '/gantt-demo/') {
          const nonce = crypto.randomBytes(16).toString('base64')
          const cspHeader = `
            default-src 'self';
            script-src 'strict-dynamic' 'nonce-${nonce}' https: http:;
            style-src 'self' 'unsafe-inline' https:;
            img-src 'self' data: https: http:;
            font-src 'self' data: https:;
            connect-src 'self' https: http: ws: wss:;
            frame-ancestors 'none';
            base-uri 'self';
            form-action 'self';
          `.replace(/\s+/g, ' ').trim()

          res.setHeader('Content-Security-Policy', cspHeader)

          try {
            const htmlPath = path.join(server.config.root, 'index.html')
            let html = fs.readFileSync(htmlPath, 'utf-8')
            html = html
              .replace(/__CSP_NONCE_META__/g, nonce)
              .replace(/__CSP_NONCE_ATTR__/g, nonce)

            const transformed = await server.transformIndexHtml(req.url, html)
            const withNonce = transformed.replace(
              /<script(?![^>]*\bnonce=)([\s\S]*?)>/g,
              `<script nonce="${nonce}"$1>`
            )

            res.setHeader('Content-Type', 'text/html; charset=utf-8')
            res.end(withNonce)
            return
          } catch (error) {
            return next(error)
          }
        }

        next()
      })
    }
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [cspNonceDevPlugin(), react()],
  base: "/gantt-demo/",
  server: {
    open: true
  }
})