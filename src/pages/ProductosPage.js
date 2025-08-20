// src/pages/ProductosPage.jsx
import React, { useEffect, useState } from 'react';
import ProductList from '../components/ProductList';
import CarritoLink from '../components/CarritoLink';
import BotonFlotante from '../components/BotonFlotante';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaWhatsapp } from 'react-icons/fa';
import './ProductosPage.css';

const ProductosPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [grcat, setGrcat] = useState('');
  const [buscar, setBuscar] = useState(''); // ✅ nuevo: soporte de búsqueda

  // Persistir clienteID si viene en la URL
  const clienteID = new URLSearchParams(location.search).get('clienteID');
  useEffect(() => {
    if (clienteID) {
      localStorage.setItem('clienteID', clienteID);
    }
  }, [clienteID]);

  // Leer parámetros y setear título
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const valorGrcat = params.get('grcat') || '';
    const q = params.get('buscar') || '';
    const nombre = params.get('nombre');

    // Si no hay ni categoría ni búsqueda, volvemos al Home
    if (!valorGrcat && !q) {
      navigate('/');
      return;
    }

    setGrcat(valorGrcat);
    setBuscar(q);

    if (nombre) {
      const nombreDecodificado = decodeURIComponent(nombre);
      document.title = `Bazar - ${nombreDecodificado}`;
    } else if (q) {
      document.title = `Bazar - Resultados para "${q}"`;
    } else {
      document.title = 'Bazar - Productos';
    }
  }, [location, navigate]);

  // Pequeño fallback mientras se parsean los params
  if (!grcat && !buscar) {
    return <div style={{ padding: '2rem', color: '#333' }}>Cargando productos...</div>;
  }

  return (
    <div className="App">
      {/* ===== Header con botón de Categorías alineado a Carrito ===== */}
      <header className="header header--with-cta">
        <button
          className="flotante-boton secundaria header-categorias-btn"
          onClick={() => navigate('/')}
          aria-label="Volver a categorías"
        >
          ← Categorías
        </button>

        <h1>TIENDA SALTA BAZAR</h1>

        <CarritoLink />
      </header>

      {/* ===== Instructivo arriba de las tarjetas ===== */}
      <div className="pedido-instructivo">
        <h3 className="pi-titulo">🛒 Cómo hacer tu pedido</h3>

        <ol className="pi-lista">
          <li>
            <strong>Elegí tus productos</strong>
            <span>Buscá por categoría o palabra y agregá al carrito lo que necesites.</span>
          </li>
          <li>
            <strong>Revisá tu pedido</strong>
            <span>Entrá a “Ver tu pedido” para confirmar cantidades y ver el total.</span>
          </li>
          <li>
            <strong>Enviá tu solicitud</strong>
            <span>
              Mandanos tu nota de pedido por WhatsApp, llamada o contacto online.<br />
              👉 El vendedor revisará <strong>precio y stock</strong> y luego <strong>vos podrás confirmar o no el pedido</strong>.
            </span>
          </li>
        </ol>
      </div>

      {/* ✅ Pasamos tanto grcat como buscar; ProductList prioriza grcat si viene */}
      <ProductList grcat={grcat} buscar={buscar} />

      <BotonFlotante />

      <div className="footer" style={{ textAlign: 'center', padding: '2rem', color: 'white' }}>
        {/* Botón destacado de WhatsApp ARRIBA del texto del footer */}
        <a
          href="https://wa.me/5493875537070"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Contactar por WhatsApp"
          style={{
            display: 'inline-block',
            marginBottom: '18px',
            padding: '12px 24px',
            backgroundColor: '#25D366',
            color: '#fff',
            borderRadius: '30px',
            textDecoration: 'none',
            fontWeight: 'bold',
            fontSize: '1rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.25)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
          }}
        >
          📲 Contactar por WhatsApp
        </a>

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

        <p>Todos los derechos reservados &copy; 2025</p>
        <p>Desarrollado por: Tienda Salta Bazar</p>
      </div>
    </div>
  );
};

export default ProductosPage;
