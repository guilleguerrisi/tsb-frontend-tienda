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
  const [nombreCategoria, setNombreCategoria] = useState('');

  const clienteID = new URLSearchParams(location.search).get('clienteID');

  useEffect(() => {
    if (clienteID) {
      localStorage.setItem('clienteID', clienteID);
    }
  }, [clienteID]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const valor = params.get('grcat');

    if (!valor) {
      navigate('/');
    } else {
      setGrcat(valor);
    }

    // Capturar el nombre de la categoría desde location.state
    const nombre = location.state?.nombreCategoria;
    if (nombre) {
      setNombreCategoria(nombre);
    }

  }, [location, navigate]);

  useEffect(() => {
    if (nombreCategoria) {
      document.title = `Bazar - ${nombreCategoria}`;
    }
  }, [nombreCategoria]);

  if (!grcat) {
    return <div style={{ padding: '2rem', color: '#333' }}>Cargando categoría...</div>;
  }

  return (
    <div className="App">
      <header className="header">
        <h1>TIENDA SALTA BAZAR</h1>
        <CarritoLink />
      </header>

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
