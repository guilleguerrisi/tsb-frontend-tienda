import React, { useEffect, useState } from 'react';
import './ProductList.css';
import { useCarrito } from '../contexts/CarritoContext';
import config from '../config'; // ✅


function ProductList({ grcat }) {
  const { carrito, agregarAlCarrito } = useCarrito();
  const [mercaderia, setProductos] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [indiceImagen, setIndiceImagen] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);



  const obtenerCantidad = (codigo_int) => {
    const item = carrito.find(p => p.codigo_int === codigo_int);
    return item?.cantidad || 0;
  };

  const modificarCantidad = (producto, delta) => {
    agregarAlCarrito(producto, delta);
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
    let arrayImagenes = [];

    try {
      if (Array.isArray(producto.imagearray)) {
        arrayImagenes = producto.imagearray;
      } else if (
        typeof producto.imagearray === 'string' &&
        producto.imagearray.trim().startsWith('[')
      ) {
        arrayImagenes = JSON.parse(producto.imagearray);
      }
    } catch {
      arrayImagenes = [];
    }

    if (!Array.isArray(arrayImagenes)) arrayImagenes = [];

    // 🟡 Extraer solo URLs válidas
    arrayImagenes = arrayImagenes
      .map((img) => typeof img === 'string' ? img : img?.imagenamostrar)
      .filter((url) => typeof url === 'string' && url.trim() !== '');

    setProductoSeleccionado({
      ...producto,
      imagearray: arrayImagenes
    });

    arrayImagenes.forEach((url) => {
      const img = new Image();
      img.src = url;
    });

    setIndiceImagen(0);
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
        ).map(([grupo, productos]) => {
          // 🔽 Acá sí o sí forzamos el orden por fechaordengrupo
          const productosOrdenados = productos.sort((a, b) =>
            (b.fechaordengrupo || '').localeCompare(a.fechaordengrupo || '')
          );
          return (
            <div key={grupo} className="grupo-productos">
              <h2 style={{ padding: "1rem", marginBottom: "0" }}>{grupo}</h2>
              <div className="product-container">
                {productosOrdenados.map((producto, index) => {
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
                      {(() => {
                        let autorizado = false;
                        try {
                          const raw = localStorage.getItem('usuario_admin');
                          if (
                            raw &&
                            raw !== 'undefined' &&
                            raw !== 'null' &&
                            typeof raw === 'string' &&
                            raw.trim().startsWith('{')
                          ) {
                            const user = JSON.parse(raw);
                            autorizado = user?.autorizado === true;
                          }
                        } catch {
                          autorizado = false;
                        }

                        const Imagen = (
                          <img
                            src={producto.imagen1}
                            alt={producto.descripcion_corta}
                            className="product-image"
                            onContextMenu={(e) => e.preventDefault()}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "/imagenes/no-disponible.jpg";
                            }}
                          />
                        );

                        if (autorizado) {
                          return (
                            <div>
                              {Imagen}
                              <a
                                href={`https://tsb-frontend-mercaderia-production-3b78.up.railway.app/?id=${producto.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-hyperlink"
                                style={{
                                  fontSize: '0.65rem',
                                  opacity: 0.4,
                                  display: 'block',
                                  marginTop: '0.25rem',
                                  textAlign: 'right',
                                  pointerEvents: 'auto'
                                }}
                                onMouseDown={(e) => {
                                  if (![0, 1].includes(e.button)) e.preventDefault();
                                }}
                              >
                                🔗
                              </a>
                            </div>
                          );
                        } else {
                          return (
                            <div onClick={() => abrirModal(producto)} style={{ cursor: 'pointer' }}>
                              {Imagen}
                            </div>
                          );
                        }
                      })()}

                      {/* 👇 SOLO UN BLOQUE DE product-info */}
                      <div className="product-info">
                        <h3>
                          {precioCalculado
                            ? `$ ${new Intl.NumberFormat('es-AR').format(precioCalculado)}`
                            : 'Precio no disponible'}
                        </h3>
                        <p>{producto.descripcion_corta}</p>
                        <p><strong>Codigo:</strong> {producto.codigo_int}</p>

                        {enCarrito && (
                          <span className="etiqueta-presupuesto">
                            <span className="tilde-verde">✔</span> Agregado al pedido
                          </span>
                        )}

                        {/* 🔥 Contenedor nuevo para agrupar cantidad + botón en móviles */}
                        <div className="bottom-row">
                          <div className="control-cantidad">
                            <button onClick={() => modificarCantidad(producto, -1)} className="btn-menos">−</button>
                            <input
                              type="number"
                              min="0"
                              value={obtenerCantidad(producto.codigo_int)}
                              onFocus={(e) => {
                                e.target.select(); // selecciona todo el número
                              }}
                              onChange={(e) => {
                                const nueva = parseInt(e.target.value) || 0;
                                const actual = obtenerCantidad(producto.codigo_int);
                                modificarCantidad(producto, nueva - actual);
                              }}
                              onBlur={(e) => {
                                if (e.target.value === '' || Number(e.target.value) < 1) {
                                  modificarCantidad(producto, 1 - obtenerCantidad(producto.codigo_int));
                                }
                              }}
                              className="cantidad-input"
                            />

                            <button onClick={() => modificarCantidad(producto, 1)} className="btn-mas">+</button>
                          </div>

                          <button className="btn-vermas" onClick={() => abrirModal(producto)}>
                            Ficha
                          </button>
                        </div>
                      </div>

                    </div>
                  );




                })}
              </div>
            </div>
          );
        })
      )}

      {productoSeleccionado && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={cerrarModal}>×</button>
            <div className="carrusel-imagenes">
              {productoSeleccionado.imagearray?.length > 1 && (
                <button
                  onClick={() =>
                    setIndiceImagen((prev) =>
                      prev === 0
                        ? productoSeleccionado.imagearray.length - 1
                        : prev - 1
                    )
                  }
                  className="flecha-carrusel izquierda"
                >
                  ‹
                </button>
              )}

              <img
                src={
                  productoSeleccionado.imagearray?.[indiceImagen] ||
                  productoSeleccionado.imagen1 ||
                  "/imagenes/no-disponible.jpg"
                }
                alt={productoSeleccionado.descripcion_corta}
                className="modal-image"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/imagenes/no-disponible.jpg";
                }}
              />

              {productoSeleccionado.imagearray?.length > 1 && (
                <button
                  onClick={() =>
                    setIndiceImagen((prev) =>
                      prev === productoSeleccionado.imagearray.length - 1
                        ? 0
                        : prev + 1
                    )
                  }
                  className="flecha-carrusel derecha"
                >
                  ›
                </button>
              )}
            </div>

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

            <div className="control-cantidad" style={{ marginTop: '1rem' }}>
              <button onClick={() => modificarCantidad(productoSeleccionado, -1)} className="btn-menos">−</button>
              <input
                type="number"
                min="0"
                value={obtenerCantidad(productoSeleccionado.codigo_int)}
                onFocus={(e) => e.target.select()}
                onChange={(e) => {
                  const nueva = parseInt(e.target.value) || 0;
                  const actual = obtenerCantidad(productoSeleccionado.codigo_int);

                  if (window.__timeoutCantidadFicha) {
                    clearTimeout(window.__timeoutCantidadFicha);
                  }

                  window.__timeoutCantidadFicha = setTimeout(() => {
                    modificarCantidad(productoSeleccionado, nueva - actual);
                  }, 300);
                }}
                onBlur={(e) => {
                  if (e.target.value === '' || Number(e.target.value) < 1) {
                    modificarCantidad(productoSeleccionado, 1 - obtenerCantidad(productoSeleccionado.codigo_int));
                  }
                }}
                className="cantidad-input"
              />


              <button onClick={() => modificarCantidad(productoSeleccionado, 1)} className="btn-mas">+</button>
            </div>



            <button className="btn-seguir" onClick={cerrarModal}>
              ← Seguir viendo productos
            </button>
          </div>
        </div>
      )}
    </div>
  );


}

export default ProductList;
