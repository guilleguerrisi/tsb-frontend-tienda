import React, { useEffect, useState } from 'react';
import './ProductList.css';
import { useCarrito } from '../contexts/CarritoContext';
import config from '../config'; // ✅


function ProductList({ grcat }) {
  const { carrito, agregarAlCarrito } = useCarrito();
  const [mercaderia, setProductos] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);


  const manejarClickRuedita = (e, producto) => {
    if (e.button === 1) { // Click del botón del medio
      const user = JSON.parse(localStorage.getItem('usuario_admin'));
      if (!user || !user.autorizado) return;
  
      const urlFicha = `https://tsb-frontend-mercaderia-production-3b78.up.railway.app/?id=${producto.id}`;
      window.open(urlFicha, '_blank');
    }
  };
  
  

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        setCargando(true);
        setError(null);

        let url = `${config.API_URL}/api/mercaderia`;

        if (grcat) {
          url += `?grcat=${encodeURIComponent(grcat)}`;
        }

        const res = await fetch(url);
        const data = await res.json();

        if (Array.isArray(data)) {
          setProductos(data);
        } else {
          throw new Error('La respuesta no es un array');
        }

      } catch (err) {
        setError('No se pudieron cargar los productos.');
        setProductos([]);
      } finally {
        setCargando(false);
      }
    };

    fetchProductos();
  }, [grcat]);

  const abrirModal = (producto) => {
    setProductoSeleccionado(producto);
    document.body.classList.add('modal-abierto');
  };

  const cerrarModal = () => {
    setProductoSeleccionado(null);
    document.body.classList.remove('modal-abierto');
  };

  useEffect(() => {
    const handleKeydown = (event) => {
      if (event.key === 'Escape') cerrarModal();
    };
    if (productoSeleccionado) {
      window.addEventListener('keydown', handleKeydown);
    }
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [productoSeleccionado]);

  if (cargando)
    return (
      <div className="loading-centered">
        <p>Cargando productos...</p>
      </div>
    );

  if (error) return <div className="error">{error}</div>;

  return (
    <div>
      {mercaderia.length === 0 ? (
        <p style={{ padding: "2rem", textAlign: "center" }}>
          No hay productos para esta categoría.
        </p>
      ) : (
        Object.entries(
          mercaderia.reduce((acc, prod) => {
            const grupo = prod.grupo || 'Sin grupo';
            if (!acc[grupo]) acc[grupo] = [];
            acc[grupo].push(prod);
            return acc;
          }, {})
        ).map(([grupo, productos]) => (
          <div key={grupo} className="grupo-productos">
            <h2 style={{ padding: "1rem", marginBottom: "0" }}>{grupo}</h2>
            <div className="product-container">
              {productos.map((producto, index) => {
                const precioCalculado = isNaN(producto.costosiniva)
                  ? 0
                  : Math.round(
                    (producto.costosiniva *
                      (1 + producto.iva / 100) *
                      (1 + producto.margen / 100)) / 100
                  ) * 100;

                const enCarrito = carrito.some(item => item.codigo_int === producto.codigo_int);

                return (
                  <div className="product-card" key={index}>
                    <img
                      src={producto.imagen1}
                      alt={producto.descripcion_corta}
                      className="product-image"
                      onClick={() => abrirModal(producto)}
                      onMouseDown={(e) => manejarClickRuedita(e, producto)}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/imagenes/no-disponible.jpg";
                      }}
                    />

                    <h3>
                      {precioCalculado
                        ? `$ ${new Intl.NumberFormat('es-AR').format(precioCalculado)}`
                        : 'Precio no disponible'}
                    </h3>
                    <p>{producto.descripcion_corta}</p>
                    <p><strong>Codigo:</strong> {producto.codigo_int}</p>

                    {enCarrito && (
                      <span className="etiqueta-presupuesto">
                        <span className="tilde-verde">✔</span> Agregado al presupuesto
                      </span>
                    )}

                    <button className='btn-vermas' onClick={() => abrirModal(producto)}>
                      Ver ficha
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}


      {productoSeleccionado && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={cerrarModal}>×</button>
            <img
              src={productoSeleccionado.imagen1}
              alt={productoSeleccionado.descripcion_corta}
              className="modal-image"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/imagenes/no-disponible.jpg";
              }}
            />
            <h2>
              <strong>
                {isNaN(productoSeleccionado.costosiniva)
                  ? 'Precio no disponible'
                  : `$ ${new Intl.NumberFormat('es-AR').format(
                    Math.round(
                      (productoSeleccionado.costosiniva *
                        (1 + productoSeleccionado.iva / 100) *
                        (1 + productoSeleccionado.margen / 100)) / 100
                    ) * 100
                  )}`}
              </strong>
            </h2>
            <p>{productoSeleccionado.descripcion_corta}</p>
            <p><strong>Codigo:</strong> {productoSeleccionado.codigo_int}</p>

            <button
              onClick={() => {
                const yaEsta = carrito.some(item => item.codigo_int === productoSeleccionado.codigo_int);
                agregarAlCarrito({
                  ...productoSeleccionado,
                  price: productoSeleccionado.costosiniva,
                  quitar: yaEsta
                });
              }}
              className={
                carrito.some(item => item.codigo_int === productoSeleccionado.codigo_int)
                  ? 'btn-quitar'
                  : 'btn-agregar'
              }
              style={{ marginTop: '1rem' }}
            >
              {carrito.some(item => item.codigo_int === productoSeleccionado.codigo_int)
                ? 'Quitar del presupuesto'
                : 'Agregar al presupuesto'}
            </button>

            <button
              className="btn-seguir"
              onClick={cerrarModal}
            >
              ← Seguir viendo productos
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductList;
