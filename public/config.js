// Frontend API Configuration
// Resolves API URL from multiple fallbacks so the frontend can be deployed separately from backend.
(function(){
  const metaEl = (typeof document !== 'undefined' && document.querySelector) ? document.querySelector('meta[name="api-url"]') : null;
  const metaApi = metaEl ? metaEl.getAttribute('content') : null;

  // Allow manual override via global before this script runs: `window.__API_URL__ = 'https://api...'`
  const globalApi = (typeof window !== 'undefined' && window.__API_URL__) ? window.__API_URL__ : null;

  const API_URL = globalApi || metaApi || (window.location.hostname === 'localhost' ? 'http://localhost:3000' : window.location.origin);

  window.API_CONFIG = {
    apiUrl: API_URL,
    endpoints: {
      clone: `${API_URL.replace(/\/$/, '')}/api/clone`,
      health: `${API_URL.replace(/\/$/, '')}/api/health`
    }
  };
})();
