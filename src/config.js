const API_URL =
  window.location.hostname === 'localhost'
    ? 'http://localhost:5000'
    : 'https://tsb-backend-tienda-production.up.railway.app';

export default API_URL;
