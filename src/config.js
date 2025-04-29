const API_URL =
  window.location.hostname === 'localhost'
    ? 'http://localhost:5000'
    : 'https://tsb-backend-tienda-production.up.railway.app';

const config = {
  API_URL,
  modoDesarrollo: true // 🔁 Cambialo a false para abrir al público
};

export default config;
