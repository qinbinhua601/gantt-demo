import crypto from 'crypto';

export default function handler(req, res) {
  // Generate a random nonce
  const nonce = crypto.randomBytes(16).toString('base64');
  
  // Set CSP header with strict-dynamic and nonce
  const cspHeader = `
    default-src 'self';
    script-src 'strict-dynamic' 'nonce-${nonce}' https: http:;
    style-src 'self' 'unsafe-inline' https:;
    img-src 'self' data: https: http:;
    font-src 'self' data: https:;
    connect-src 'self' https: http:;
    frame-ancestors 'none';
    base-uri 'self';
    form-action 'self';
  `.replace(/\s+/g, ' ').trim();
  
  res.setHeader('Content-Security-Policy', cspHeader);
  res.setHeader('Content-Type', 'application/json');
  
  res.status(200).json({ nonce });
}
