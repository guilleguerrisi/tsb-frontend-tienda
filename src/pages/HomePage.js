import React from 'react';
import Categorias from '../components/Categorias';
import CarritoLink from '../components/CarritoLink';
import { FaWhatsapp } from 'react-icons/fa';

const HomePage = () => {
 

  const manejarSeleccionCategoria = (grcat) => {
  const clienteID = localStorage.getItem('clienteID') || '';
  const url =
    `/productos?buscar=${encodeURIComponent(grcat)}` +
    (clienteID ? `&clienteID=${encodeURIComponent(clienteID)}` : '');
  window.open(url, '_blank');
};



  return (
    <div className="App">
      <header className="header">
        <h1>TIENDA SALTA BAZAR</h1>
        <CarritoLink />
      </header>

      <Categorias onSeleccionarCategoria={manejarSeleccionCategoria} />

      <div className="footer" style={{ textAlign: 'center', padding: '2rem', color: 'white' }}>
        <p>Todos los derechos reservados &copy; 2025</p>
        <p>Desarrollado por: Tienda Salta Bazar</p>
        <p>Dirección: Caseros 1041, Salta Capital</p>
        <p>
          <FaWhatsapp style={{ color: '#25D366', marginRight: '8px' }} />
          <a
            href="https://wa.me/5493875537070"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: '#ffffff',
              textDecoration: 'underline',
              fontWeight: 'bold',
            }}
          >
            3875537070
          </a>
        </p>
        <a
          href="https://wa.me/5493875537070"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-block',
            marginTop: '10px',
            padding: '10px 20px',
            backgroundColor: '#25D366',
            color: '#fff',
            borderRadius: '25px',
            textDecoration: 'none',
            fontWeight: 'bold',
            fontSize: '1rem',
            boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
          }}
        >
          📲 Contactar por WhatsApp
        </a>
      </div>
    </div>
  );
};

export default HomePage;
