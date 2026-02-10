/**
 * Get nonce from server and inject it into script tags
 */
export async function initializeNonce() {
  try {
    let nonce;
    
    // Check if nonce is already in meta tag (set by server)
    const metaNonce = document.querySelector('meta[property="csp-nonce"]');
    if (metaNonce) {
      nonce = metaNonce.content;
    } else {
      // Fallback: request nonce from API
      const response = await fetch('/api/nonce');
      const data = await response.json();
      nonce = data.nonce;
    }
    
    // Store nonce for use in dynamic script loading
    window.__CSP_NONCE__ = nonce;
    
    return nonce;
  } catch (error) {
    console.warn('Failed to initialize CSP nonce:', error);
    return null;
  }
}

/**
 * Load a script dynamically with the CSP nonce
 */
export function loadScriptWithNonce(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    
    if (window.__CSP_NONCE__) {
      script.nonce = window.__CSP_NONCE__;
    }
    
    script.onload = () => resolve(script);
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    
    document.head.appendChild(script);
  });
}

/**
 * Execute inline script with nonce (if needed)
 */
export function executeScriptWithNonce(code) {
  const script = document.createElement('script');
  script.textContent = code;
  
  if (window.__CSP_NONCE__) {
    script.nonce = window.__CSP_NONCE__;
  }
  
  document.head.appendChild(script);
}
