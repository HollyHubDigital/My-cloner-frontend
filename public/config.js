// Frontend API Configuration
const API_URL = process.env.REACT_APP_API_URL || 
                (window.location.hostname === 'localhost' ? 'http://localhost:3000' : window.location.origin);

window.API_CONFIG = {
  apiUrl: API_URL,
  endpoints: {
    clone: `${API_URL}/clone`,
    health: `${API_URL}/health`
  }
};
