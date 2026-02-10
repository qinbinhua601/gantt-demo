# Content Security Policy (CSP) Implementation Guide

## Overview

This project has been refactored to implement **CSP with Strict Dynamic and Nonce** for enhanced security against XSS (Cross-Site Scripting) attacks.

## What is CSP Strict Dynamic with Nonce?

- **CSP (Content Security Policy)**: A browser security feature that restricts resource loading
- **Strict Dynamic**: Allows only scripts with the correct nonce or from trusted sources (https/http)
- **Nonce**: A cryptographically random token generated per request, making it impossible to predict

## Architecture

### Files Added/Modified

1. **`api/nonce.js`** - API endpoint that generates and returns nonce (fallback)
2. **`api/index.js`** - Vercel function that injects nonce into HTML for production
3. **`src/nonce.js`** - Utilities for nonce management and dynamic script loading
4. **`src/main.jsx`** - Enhanced to initialize nonce early
5. **`index.html`** - Updated with nonce meta tag placeholder
6. **`vite.config.js`** - Configured to set CSP headers in development
7. **`vercel.json`** - Updated build configuration

## How It Works

### Development Flow
1. Vite dev server generates a nonce on each request
2. Nonce is set in the `Content-Security-Policy` header
3. Nonce is available in `window.__CSP_NONCE__` for runtime use

### Production Flow (Vercel)
1. Request comes to `api/index.js` (or root handler)
2. A random nonce is generated
3. Nonce is injected into the HTML meta tag: `<meta property="csp-nonce" content="..." />`
4. CSP header is set with the nonce
5. The frontend initializes the nonce from the meta tag

## CSP Policy Breakdown

```
default-src 'self'                           # Default: only from same origin
script-src 'strict-dynamic' 'nonce-XXX' https: http:  # Scripts with nonce or from https/http
style-src 'self' 'unsafe-inline' https:     # Styles from same origin (inline needed for React)
img-src 'self' data: https: http:           # Images from multiple sources
font-src 'self' data: https:                # Fonts from same origin or data URLs
connect-src 'self' https: http:             # API calls allowed
frame-ancestors 'none'                       # Prevent embedding in iframes
base-uri 'self'                              # Base URL restrictions
form-action 'self'                           # Form submissions to same origin
```

## Using Dynamic Script Loading

If you need to load scripts dynamically, use the helper function:

```javascript
import { loadScriptWithNonce } from './src/nonce.js';

// Load external script with nonce
await loadScriptWithNonce('/path/to/script.js');

// Or for inline scripts
import { executeScriptWithNonce } from './src/nonce.js';
executeScriptWithNonce('console.log("Hello with nonce")');
```

## Important Notes

### ✅ What Works
- Module scripts (via Vite/React)
- Inline styles (CSS-in-JS frameworks like Ant Design)
- External images and fonts from trusted sources
- Dynamic script loading via `loadScriptWithNonce()`

### ⚠️ What Requires Attention
- **Third-party scripts**: Must be loaded with `loadScriptWithNonce()` or added to CSP allowlist
- **Eval or Function constructor**: Not allowed by default; use transpilation instead
- **Unsafe-eval**: Not included in the policy
- **Inline JavaScript**: Must have the correct nonce attribute

### 🔄 CSP Policy Updates
If you need to allow additional resources:

**Development**: Update `vite.config.js` > `server.middlewares[0]` CSP header
**Production**: Update `api/index.js` CSP header

Both should match for consistency.

## Testing

### Chrome DevTools
1. Open DevTools (F12)
2. Go to **Console** tab
3. Check for CSP violations (red warnings)
4. Check **Network** tab for blocked resources

### Browser Console
```javascript
// Check if nonce is initialized
console.log(window.__CSP_NONCE__);

// Verify CSP meta tag
console.log(document.querySelector('meta[property="csp-nonce"]').content);
```

## Deployment

### Vercel
The app automatically uses `api/index.js` to serve HTML with dynamic nonce injection.

### GitHub Pages (if needed)
For static hosting, you'll need to:
1. Generate nonce at build time, or
2. Use a service worker to inject nonce, or
3. Switch to a dynamic hosting platform

## Security Considerations

1. **Nonce Generation**: Uses `crypto.randomBytes()` which is cryptographically secure
2. **Frequency**: New nonce per request prevents nonce reuse attacks
3. **Predictability**: 16-byte nonce (128-bit) is cryptographically strong
4. **Transport**: Always use HTTPS in production to prevent MITM attacks

## Troubleshooting

### Script Not Loading
- Check browser console for CSP violations
- Verify the script has the correct nonce attribute
- Use `loadScriptWithNonce()` for third-party scripts

### Styles Not Applied
- Inline styles (CSS-in-JS) are allowed per policy
- External stylesheets must be from trusted origins

### Meta Tag Shows Empty
- In development: Check Vite middleware is running
- In production: Verify `api/index.js` is being called
- Try hard refresh (Ctrl+Shift+R on Windows, Cmd+Shift+R on Mac)

## References

- [MDN: Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [OWASP: Content-Security-Policy Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html)
- [CSP Strict Dynamic](https://csp.withgoogle.com/docs/strict-dynamic/)
