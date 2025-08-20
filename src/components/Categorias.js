// src/components/Categorias.js
import React, { useEffect, useState, useRef, useCallback } from 'react';
import './Categorias.css';
import config from '../config';

const Categorias = ({ onSeleccionarCategoria }) => {
  const [categorias, setCategorias] = useState([]);
  const [categoriaActiva] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const inputRef = useRef(null);

  // Carga todas las categorías (ordenadas por el backend por catcat ASC)
  const cargarTodas = useCallback(async () => {
    try {
      const res = await fetch(`${config.API_URL}/api/categorias`);
      const data = await res.json();
      setCategorias(data); // ✅ confiar en el orden del backend
    } catch (error) {
      console.error('Error al cargar todas las categorías:', error);
      setCategorias([]);
    }
  }, []);

  // Busca categorías (el backend también devuelve ordenadas por catcat ASC)
  const buscarCategorias = useCallback(async (texto) => {
    try {
      const res = await fetch(
        `${config.API_URL}/api/buscar-categorias?palabra=${encodeURIComponent(texto)}`
      );
      const data = await res.json();
      setCategorias(data); // ✅ confiar en el orden del backend
    } catch (error) {
      console.error('Error al buscar categorías:', error);
      setCategorias([]);
    }
  }, []);

  // Montaje inicial
  useEffect(() => {
    cargarTodas();
  }, [cargarTodas]);

  // Reacciona a cambios en 'busqueda' (filtrado en vivo)
  useEffect(() => {
    if (busqueda.trim() === '') {
      cargarTodas();
    } else {
      buscarCategorias(busqueda);
    }
  }, [busqueda, cargarTodas, buscarCategorias]);

  // Abrir resultados en nueva pestaña cuando se envía el buscador
  const handleSubmitBusqueda = (e) => {
    e.preventDefault();
    const q = (busqueda || '').trim();
    if (!q) return;

    const clienteID = localStorage.getItem('clienteID') || '';
    const url =
      `/productos?buscar=${encodeURIComponent(q)}` +
      (clienteID ? `&clienteID=${encodeURIComponent(clienteID)}` : '');

    window.open(url, '_blank');
  };

  return (
    <div className="categorias-container">
      {/* Buscador con botón a la derecha */}
      <form
        onSubmit={handleSubmitBusqueda}
        className="buscador-row"
        style={{ display: 'flex', gap: '8px', width: '100%' }}
      >
        <div style={{ position: 'relative', flex: 1 }}>
          <input
            ref={inputRef}
            type="text"
            className="input-busqueda"
            placeholder="🔎 Buscar producto o marca..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)} // ← sigue filtrando en vivo
            style={{
              padding: '0.6rem 1rem',
              borderRadius: '30px',
              border: '1px solid #ccc',
              fontSize: '1rem',
              width: '100%',
              boxSizing: 'border-box',
              paddingRight: '2.4rem', // espacio para la ✕
            }}
          />

          {busqueda && (
            <button
              type="button" // no enviar el form
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
                color: '#aaa',
              }}
              title="Borrar búsqueda"
              aria-label="Borrar búsqueda"
            >
              ✕
            </button>
          )}
        </div>

        <button
          type="submit"
          className="btn-buscar"
          style={{
            padding: '0.6rem 1rem',
            borderRadius: '30px',
            border: '1px solid #3498db',
            background: '#3498db',
            color: '#fff',
            fontWeight: 700,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
          aria-label="Buscar"
        >
          Buscar
        </button>
      </form>

      {categorias.length === 0 && busqueda.trim() !== '' ? (
        <div
          style={{
            marginTop: '1.5rem',
            textAlign: 'center',
            color: '#333',
            padding: '1rem',
          }}
        >
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
              transition: 'background-color 0.3s',
            }}
          >
            📲 Toca aquí para consultar por WhatsApp
          </a>
        </div>
      ) : (
        categorias.map((cat, index) => {
          const clienteID = localStorage.getItem('clienteID') || '';
          // 🔄 Ahora abrimos con ?buscar=catXXXXX (consistente con el backend)
          const url =
            `/productos?buscar=${encodeURIComponent(cat.grcat)}` +
            (clienteID ? `&clienteID=${encodeURIComponent(clienteID)}` : '') +
            `&nombre=${encodeURIComponent(cat.grandescategorias)}`;

          return (
            <a
              key={cat?.id || index}
              href={url}
              className={`categoria-boton ${categoriaActiva === cat.grcat ? 'activa' : ''}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {cat.imagen_url && (
                <img
                  src={cat.imagen_url}
                  alt={cat.grandescategorias}
                  className="categoria-imagen"
                />
              )}
              <span className="categoria-nombre">{cat.grandescategorias}</span>
            </a>
          );
        })
      )}
    </div>
  );
};

export default Categorias;
