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

    if (Array.isArray(producto.imagearray)) {
      arrayImagenes = producto.imagearray;
    } else {
      try {
        arrayImagenes = JSON.parse(producto.imagearray);
      } catch {
        arrayImagenes = [];
      }
    }

    // 🟡 Extraer solo URLs si vienen como objetos
    arrayImagenes = arrayImagenes.map((img) =>
      typeof img === 'string' ? img : img.imagenamostrar
    ).filter(Boolean);

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
                    {(() => {
                      const user = JSON.parse(localStorage.getItem('usuario_admin'));
                      if (user?.autorizado) {
                        return (
                          <a
                            href={`https://tsb-frontend-mercaderia-production-3b78.up.railway.app/?id=${producto.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.preventDefault()} // bloquea clic izquierdo
                            onMouseDown={(e) => {
                              if (e.button !== 1) e.preventDefault(); // solo deja ruedita
                            }}
                          >
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
                          </a>
                        );
                      } else {
                        return (
                          <img
                            src={producto.imagen1}
                            alt={producto.descripcion_corta}
                            className="product-image"
                            onClick={() => abrirModal(producto)}
                            onContextMenu={(e) => e.preventDefault()}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "/imagenes/no-disponible.jpg";
                            }}
                          />
                        );
                      }
                    })()}
                
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
