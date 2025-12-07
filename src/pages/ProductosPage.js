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
  const [buscar, setBuscar] = useState('');
  const [copiado, setCopiado] = useState(false);

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

  // Construir el link limpio
  const linkCategoria = (() => {
    const valor = (buscar || grcat || '').trim();
    if (!valor) return '';
    const base = window.location.origin;
    return `${base}/productos?buscar=${encodeURIComponent(valor)}`;
  })();

  const copiarAlPortapapeles = async () => {
    if (!linkCategoria) return;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(linkCategoria);
      } else {
        const el = document.createElement('textarea');
        el.value = linkCategoria;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
      }
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch (e) {
      console.error('No se pudo copiar el link:', e);
    }
  };

  if (!grcat && !buscar) {
    return <div style={{ padding: '2rem', color: '#333' }}>Cargando productos...</div>;
  }

  return (
    <div className="App">
      {/* ===== Header ===== */}
      <header className="header header--with-cta">
        <button
          className="flotante-boton secundaria header-categorias-btn"
          onClick={() => navigate('/')}
        >
          ← Categorías
        </button>
        <h1>TIENDA SALTA BAZAR</h1>
        <CarritoLink />
      </header>

      {/* ===== Instructivo ===== */}
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
              Indicanos un WhatsApp para enviarte el presupuesto.<br />
              👉 El vendedor revisará <strong>precio y stock</strong> y luego <strong>vos podrás confirmar o no el pedido</strong>.
            </span> 
          </li>
        </ol>

        {/* === Botón de copiar link (visible para todos) === */}
        {linkCategoria && (
          <div style={{ marginTop: '12px' }}>
            <button
              onClick={copiarAlPortapapeles}
              style={{
                padding: '10px 18px',
                borderRadius: '30px',
                border: 'none',
                background: '#3DAAFF',
                color: '#fff',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 3px 6px rgba(0,0,0,0.2)',
              }}
            >
              🔗 Copiar link de categoría
            </button>

            {copiado && (
              <div
                style={{
                  marginTop: '8px',
                  color: '#2ecc71',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                }}
              >
                ✅ Link copiado al portapapeles
              </div>
            )}
          </div>
        )}
      </div>

      {/* ===== Productos ===== */}
      <ProductList grcat={grcat} buscar={buscar} />

      <BotonFlotante />

      {/* ===== Footer ===== */}
      <div className="footer" style={{ textAlign: 'center', padding: '2rem', color: 'white' }}>
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
