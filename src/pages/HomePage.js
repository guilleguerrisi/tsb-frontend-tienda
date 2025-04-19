import React from 'react';
import Categorias from '../components/Categorias';
import CarritoLink from '../components/CarritoLink';
import { useNavigate } from 'react-router-dom';


const HomePage = () => {
  const navigate = useNavigate();

  const manejarSeleccionCategoria = (grcat) => {
    navigate(`/productos?grcat=${encodeURIComponent(grcat)}`); // ✅ enviamos grcat como state
  };

  return (
    <div className="App">
      <header className="header">
        <h1>TIENDA SALTA BAZAR</h1>
        <CarritoLink />
      </header>

      <Categorias onSeleccionarCategoria={manejarSeleccionCategoria} />

      <div className="footer">
        <p>Todos los derechos reservados &copy; 2025</p>
        <p>Desarrollado por: Tienda Salta Bazar</p>
      </div>
    </div>
  );
};

export default HomePage;
