import React, { useEffect, useState } from 'react';
import ProductList from '../components/ProductList';
import CarritoLink from '../components/CarritoLink';
import BotonFlotante from '../components/BotonFlotante';
import { useLocation, useNavigate } from 'react-router-dom';
import './ProductosPage.css';

const ProductosPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [grcat, setGrcat] = useState('');

  const clienteID = new URLSearchParams(location.search).get('clienteID');

  useEffect(() => {
    if (clienteID) {
      localStorage.setItem('clienteID', clienteID);
    }
  }, [clienteID]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const valor = params.get('grcat');
    const nombre = params.get('nombre'); // ✅ desde la URL, no state

    if (!valor) {
      navigate('/');
    } else {
      setGrcat(valor);
    }

    if (nombre) {
      const nombreDecodificado = decodeURIComponent(nombre);
      document.title = `Bazar - ${nombreDecodificado}`;
    } else {
      document.title = 'Bazar - Productos';
    }
  }, [location, navigate]);

  if (!grcat) {
    return <div style={{ padding: '2rem', color: '#333' }}>Cargando categoría...</div>;
  }

  return (
    <div className="App">
      <header className="header">
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

      <ProductList grcat={grcat} />

      <BotonFlotante />

      <div className="footer">
        <p>Todos los derechos reservados &copy; 2025</p>
        <p>Desarrollado por: Tienda Salta Bazar</p>
      </div>
    </div>
  );
};

export default ProductosPage;
