const API_URL =
  window.location.hostname === 'localhost'
    ? 'http://localhost:5000'
    : 'http://192.168.100.70:5000';

export default API_URL;