import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import crypto from 'crypto'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const devKeyPath = path.join(__dirname, 'dev-certs', 'localhost-key.pem')
const devCertPath = path.join(__dirname, 'dev-certs', 'localhost-cert.pem')

function cspNonceDevPlugin() {
  return {
    name: 'csp-nonce-dev',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url === '/api/csp-report') {
          let body = ''
          req.on('data', chunk => {
            body += chunk
          })
          req.on('end', () => {
            try {
              const contentType = req.headers['content-type'] || ''
              const payload = contentType.includes('application/json') && body
                ? JSON.parse(body)
                : body
              console.log('CSP Violation Report:', payload)
            } catch (error) {
              console.error('CSP report handler error:', error)
            }
            res.statusCode = 204
            res.end()
          })
          return
        }

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
            report-uri /api/csp-report;
            report-to csp-endpoint;
          `.replace(/\s+/g, ' ').trim()

          res.setHeader('Content-Security-Policy', cspHeader)
          res.setHeader('Content-Security-Policy-Report-Only', cspHeader)
          res.setHeader('Report-To', JSON.stringify({
            group: 'csp-endpoint',
            max_age: 10886400,
            endpoints: [{ url: '/api/csp-report' }]
          }))
          res.setHeader('Reporting-Endpoints', 'csp-endpoint="/api/csp-report"')

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
  base: "/",
  server: {
    open: true,
    https: {
      key: fs.readFileSync(devKeyPath),
      cert: fs.readFileSync(devCertPath)
    }
  }
})