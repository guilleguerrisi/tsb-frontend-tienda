import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Categorias.css';
import config from '../config';

const Categorias = () => {
  const [categorias, setCategorias] = useState([]);
  const [categoriaActiva, setCategoriaActiva] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const res = await fetch(`${config.API_URL}/api/categorias`);
        const data = await res.json();
        setCategorias(data);
      } catch (error) {
        console.error('Error al cargar las categorías:', error);
      }
    };

    fetchCategorias();
  }, []);

  const seleccionar = (grcat) => {
    setCategoriaActiva(grcat);
    navigate(`/productos?grcat=${encodeURIComponent(grcat)}`);
  };

  return (
    <div className="categorias-container">
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
