// src/components/Categorias.js
import React, { useEffect, useState, useRef, useCallback } from 'react';
import './Categorias.css';
import config from '../config';

const Categorias = ({ onSeleccionarCategoria }) => {
  const [rubros, setRubros] = useState([]);
  const [rubroSeleccionado, setRubroSeleccionado] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const inputRef = useRef(null);

  // Cargar rubros principales (únicos desde BD)
  const cargarRubros = useCallback(async () => {
    try {
      const res = await fetch(`${config.API_URL}/api/rubros`);
      const data = await res.json();
      setRubros(data || []);
    } catch (error) {
      console.error('Error al cargar rubros:', error);
      setRubros([]);
    }
  }, []);

  // Cargar todas las categorías (ordenadas por el backend)
  const cargarTodas = useCallback(async () => {
    try {
      const res = await fetch(`${config.API_URL}/api/categorias`);
      const data = await res.json();
      setCategorias(data || []);
    } catch (error) {
      console.error('Error al cargar todas las categorías:', error);
      setCategorias([]);
    }
  }, []);

  // Buscar categorías por palabra
  const buscarCategorias = useCallback(async (texto) => {
    try {
      const res = await fetch(
        `${config.API_URL}/api/buscar-categorias?palabra=${encodeURIComponent(texto)}`
      );
      const data = await res.json();
      setCategorias(data || []);
    } catch (error) {
      console.error('Error al buscar categorías:', error);
      setCategorias([]);
    }
  }, []);

  // Montaje inicial: rubros + todas las categorías
  useEffect(() => {
    cargarRubros();
    cargarTodas();
  }, [cargarRubros, cargarTodas]);

  // Reacciona a cambios en 'busqueda'
  useEffect(() => {
    if (busqueda.trim() === '') {
      // sin búsqueda → mantenemos categorías completas (para subrubros)
      cargarTodas();
    } else {
      // con búsqueda → reseteamos rubro y buscamos por texto
      setRubroSeleccionado(null);
      buscarCategorias(busqueda);
    }
  }, [busqueda, cargarTodas, buscarCategorias]);

  // Enviar búsqueda en nueva pestaña
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

      {/* 🔍 BUSCADOR */}
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
            onChange={(e) => setBusqueda(e.target.value)}
            style={{
              padding: '0.6rem 1rem',
              borderRadius: '30px',
              border: '1px solid #ccc',
              fontSize: '1rem',
              width: '100%',
              boxSizing: 'border-box',
              paddingRight: '2.4rem',
            }}
          />

          {busqueda && (
            <button
              type="button"
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

      {/* =============================================
         🔎 MODO BÚSQUEDA — SI HAY TEXTO EN BUSQUEDA
         ============================================= */}
      {busqueda.trim() !== '' ? (
        categorias.length === 0 ? (
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
                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
              }}
            >
              📲 Toca aquí para consultar por WhatsApp
            </a>
          </div>
        ) : (
          categorias.map((cat, index) => {
            const clienteID = localStorage.getItem('clienteID') || '';
            const url =
              `/productos?buscar=${encodeURIComponent(cat.grcat)}` +
              (clienteID ? `&clienteID=${encodeURIComponent(clienteID)}` : '') +
              `&nombre=${encodeURIComponent(cat.grandescategorias)}`;

            return (
              <a
                key={cat?.id || index}
                href={url}
                className="categoria-boton"
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
        )
      ) : (
        /* =============================================
           🧩 MODO RUBROS — SIN BÚSQUEDA
           ============================================= */
        <>
          {/* Lista de RUBROS principales */}
          {!rubroSeleccionado &&
            rubros.map((rubro, index) => (
              <button
                key={index}
                onClick={() => setRubroSeleccionado(rubro)}
                className="categoria-boton"
              >
                {rubro.toUpperCase()}
              </button>
            ))}

          {/* Subcategorías del rubro seleccionado */}
          {rubroSeleccionado && (
            <>
              <button
                onClick={() => setRubroSeleccionado(null)}
                className="categoria-boton"
                style={{ background: '#444', color: 'white' }}
              >
                ← VOLVER
              </button>

              {categorias
                .filter((cat) => (cat.rubros || '').trim() === rubroSeleccionado)
                .map((cat, index) => {
                  const clienteID = localStorage.getItem('clienteID') || '';
                  const url =
                    `/productos?buscar=${encodeURIComponent(cat.grcat)}` +
                    (clienteID ? `&clienteID=${encodeURIComponent(clienteID)}` : '') +
                    `&nombre=${encodeURIComponent(cat.grandescategorias)}`;

                  return (
                    <a
                      key={cat?.id || index}
                      href={url}
                      className="categoria-boton"
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
                })}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Categorias;
