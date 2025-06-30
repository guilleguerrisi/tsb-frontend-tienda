import React, { useEffect, useState, useRef } from 'react';
import './Categorias.css';
import config from '../config';

const Categorias = ({ onSeleccionarCategoria }) => {
  const [categorias, setCategorias] = useState([]);
  const [categoriaActiva] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const inputRef = useRef(null);

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

  return (
    <div className="categorias-container">
      <div style={{ position: 'relative', width: '100%' }}>
        <input
          ref={inputRef}
          type="text"
          className="input-busqueda"
          placeholder="🔎 Buscar producto o marca..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{
            padding: '0.6rem 1rem',
            borderRadius: '30px',
            border: '1px solid #ccc',
            fontSize: '1rem',
            width: '100%',
            boxSizing: 'border-box'
          }}
        />

        {busqueda && (
          <button
            onClick={() => {
              setBusqueda('');
              setTimeout(() => inputRef.current?.focus(), 0);
            }}
            style={{
              position: 'absolute',
              right: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'transparent',
              border: 'none',
              fontSize: '1.2rem',
              cursor: 'pointer',
              color: '#aaa'
            }}
            title="Borrar búsqueda"
          >
            ✕
          </button>
        )}
      </div>

      {categorias.length === 0 && busqueda.trim() !== '' ? (
        <div style={{ marginTop: '1.5rem', textAlign: 'center', color: '#333', padding: '1rem' }}>
          <p style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>
            ❌ No hemos encontrado el producto.
          </p>
          <a
            href={`https://wa.me/5493875537070?text=${encodeURIComponent(
              `Hola, no encontré "${busqueda}" en la página, ¿podrían ayudarme?`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block',
              backgroundColor: '#25D366',
              color: 'white',
              padding: '10px 20px',
              borderRadius: '25px',
              fontWeight: 'bold',
              textDecoration: 'none',
              fontSize: '1rem',
              boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
              transition: 'background-color 0.3s'
            }}
          >
            📲 Toca aquí para consultar por WhatsApp
          </a>
        </div>
      ) : (
        categorias.map((cat, index) => (
          <button
            key={index}
            className={`categoria-boton ${categoriaActiva === cat.grcat ? 'activa' : ''}`}
            onClick={() => {
              const clienteID = localStorage.getItem('clienteID') || '';
              const url = `/productos?grcat=${encodeURIComponent(cat.grcat)}&clienteID=${encodeURIComponent(clienteID)}`;
              window.open(url, '_blank');
            }}

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
        ))

      )}
    </div>
  );
};

export default Categorias;
