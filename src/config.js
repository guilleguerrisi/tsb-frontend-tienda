const API_URL =
  window.location.hostname === 'localhost'
    ? 'http://localhost:5000'
    : 'https://tsb-backend-tienda-production.up.railway.app';

const config = {
  API_URL,
  modoDesarrollo: false // 🔁 Cambialo a false para abrir al público
};

export default config;
