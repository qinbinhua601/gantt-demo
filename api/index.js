import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  // Only handle GET requests for HTML pages
  if (req.method !== 'GET') {
    return res.status(405).end('Method not allowed');
  }

  // Generate a random nonce
  const nonce = crypto.randomBytes(16).toString('base64');
  
  // Set CSP header with strict-dynamic and nonce
  const cspHeader = `default-src 'self'; script-src 'strict-dynamic' 'nonce-${nonce}' https: http:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: https: http:; font-src 'self' data: https:; connect-src 'self' https: http:; frame-ancestors 'none'; base-uri 'self'; form-action 'self';`;
  
  res.setHeader('Content-Security-Policy', cspHeader);
  res.setHeader('Cache-Control', 'no-store');
  
  // Read the index.html and inject the nonce
  try {
    const indexPath = path.join(process.cwd(), 'dist', 'index.html');
    let html = fs.readFileSync(indexPath, 'utf-8');
    
    // Inject nonce into HTML placeholders and all script tags
    html = html
      .replace(/__CSP_NONCE_META__/g, nonce)
      .replace(/__CSP_NONCE_ATTR__/g, nonce);
    html = html.replace(
      /<script(?![^>]*\bnonce=)([\s\S]*?)>/g,
      `<script nonce="${nonce}"$1>`
    );
    
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send(html);
  } catch (error) {
    console.error('Error serving index.html:', error);
    res.status(500).end('Internal server error');
  }
}
