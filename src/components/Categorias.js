import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Categorias.css';
import config from '../config';

const Categorias = () => {
  const [categorias, setCategorias] = useState([]);
  const [categoriaActiva, setCategoriaActiva] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const navigate = useNavigate();

  const cargarTodas = async () => {
    try {
      const res = await fetch(`${config.API_URL}/api/categorias`);
      const data = await res.json();
      setCategorias(data);
    } catch (error) {
      console.error('Error al cargar todas las categorías:', error);
    }
  };

  const buscarCategorias = async (texto) => {
    try {
      const res = await fetch(`${config.API_URL}/api/buscar-categorias?palabra=${encodeURIComponent(texto)}`);
      const data = await res.json();
      setCategorias(data);
    } catch (error) {
      console.error('Error al buscar categorías:', error);
    }
  };

  useEffect(() => {
    cargarTodas();
  }, []);

  useEffect(() => {
    if (busqueda.trim() === '') {
      cargarTodas();
    } else {
      buscarCategorias(busqueda);
    }
  }, [busqueda]);

  const seleccionar = (grcat) => {
    setCategoriaActiva(grcat);
    navigate(`/productos?grcat=${encodeURIComponent(grcat)}`);
  };

  return (
    <div className="categorias-container">
      <input
        type="text"
        className="input-busqueda"
        placeholder="🔎 Buscar producto..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        style={{
          marginBottom: '1rem',
          padding: '0.6rem 1rem',
          borderRadius: '12px',
          border: '1px solid #ccc',
          fontSize: '1rem',
          width: '100%',
          maxWidth: '500px'
        }}
      />

      {categorias.map((cat, index) => (
        <button
          key={index}
          className={`categoria-boton ${categoriaActiva === cat.grcat ? 'activa' : ''}`}
          onClick={() => seleccionar(cat.grcat)}
        >
          {cat.imagen_url && (
            <img
              src={cat.imagen_url}
              alt={cat.grandescategorias}
              className="categoria-imagen"
            />
          )}
          <span className="categoria-nombre">{cat.grandescategorias}</span>
        </button>
      ))}
    </div>
  );
};

export default Categorias;
