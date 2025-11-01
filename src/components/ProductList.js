import React, { useEffect, useState } from 'react';
import './ProductList.css';
import { useCarrito } from '../contexts/CarritoContext';
import config from '../config'; // ✅

function ProductList({ grcat, buscar  }) {
  const { carrito, agregarAlCarrito } = useCarrito();
  const [mercaderia, setProductos] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [indiceImagen, setIndiceImagen] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // 🧠 Draft de cantidades por producto mientras el usuario escribe
  const [draftCantidades, setDraftCantidades] = useState({});

  const obtenerCantidad = (codigo_int) => {
    const item = carrito.find(p => p.codigo_int === codigo_int);
    return item?.cantidad || 0;
  };

  // Devuelve el string a mostrar en el input: draft si existe, si no la cantidad real
  const getCantidadStr = (codigo) =>
    draftCantidades[codigo] ?? String(obtenerCantidad(codigo));

  // Confirma el draft y lo vuelca al carrito (aplicando mínimo)
  const commitCantidad = (producto, cantidadMin = 0) => {
    const codigo = producto.codigo_int;
    const raw = draftCantidades[codigo];

    if (raw === undefined) return; // no hay nada que confirmar

    const actual = obtenerCantidad(codigo);
    let n = parseInt(raw, 10);
    if (isNaN(n)) n = actual; // si quedó vacío o no numérico, mantenemos actual
    if (typeof cantidadMin === 'number') n = Math.max(cantidadMin, n);

    const delta = n - actual;
    if (delta !== 0) modificarCantidad(producto, delta);

    // limpiar draft del producto
    setDraftCantidades(prev => {
      const cp = { ...prev };
      delete cp[codigo];
      return cp;
    });
  };

  // Siempre agrega usando precio online (20%)
  const modificarCantidad = (producto, delta) => {
    const prodConFlag = { ...producto, __usarPrecioOnline: true };
    agregarAlCarrito(prodConFlag, delta);
  };

useEffect(() => {
  const fetchProductos = async () => {
    try {
      setCargando(true);
      setError(null);

      const params = new URLSearchParams();
      if (buscar && buscar.trim() !== '') {
        // siempre priorizamos la búsqueda
        params.set('buscar', buscar.trim());
      } else if (grcat && grcat.trim() !== '') {
        // fallback: si solo vino grcat, lo usamos como texto de búsqueda
        params.set('buscar', grcat.trim());
      }

      const url = `${config.API_URL}/api/mercaderia${params.toString() ? `?${params.toString()}` : ''}`;

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
}, [grcat, buscar]);




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
      .map((img) => (typeof img === 'string' ? img : img?.imagenamostrar))
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

  // Helpers de precio
  const redondearCentena = (n) => Math.round(n / 100) * 100;
  const formatoAR = (n) => `$ ${new Intl.NumberFormat('es-AR').format(n)}`;

  const calcularPrecios = (p) => {
    const base = Number(p.costosiniva);
    const ivaFactor = 1 + (Number(p.iva || 0) / 100);
    const margenDB = 1 + (Number(p.margen || 0) / 100);
    const margenOnline = 1 + 0.40; // 20% fijo

    if (!Number.isFinite(base)) return { precioOnline: 0, precioSucursal: 0 };

    const precioOnline = redondearCentena(base * ivaFactor * margenOnline);
    const precioSucursal = redondearCentena(base * ivaFactor * margenDB);
    return { precioOnline, precioSucursal };
  };

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
          // 🔽 Forzar orden por fechaordengrupo (desc)
          const productosOrdenados = productos.sort((a, b) =>
            (b.fechaordengrupo || '').localeCompare(a.fechaordengrupo || '')
          );
          return (
            <div key={grupo} className="grupo-productos">
              <h2 style={{ padding: "1rem", marginBottom: "0" }}>{grupo}</h2>
              <div className="product-container">
                {productosOrdenados.map((producto, index) => {
                  const { precioOnline, precioSucursal } = calcularPrecios(producto);
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

                      {/* 👇 AHORA los precios van DENTRO de .product-info (esto arregla mobile) */}
                      <div className="product-info">
                        <div className="price-row">
                          <div className="price-box online">
                            <span className="price-label">Precio Mayorista</span>
                            <span className="price-value">
                              {precioOnline ? formatoAR(precioOnline) : 'No disponible'}
                            </span>
                          </div>
                          <div className="price-box sucursal">
                            <span className="price-label">Precio por Menor</span>
                            <span className="price-value">
                              {precioSucursal ? formatoAR(precioSucursal) : 'No disponible'}
                            </span>
                          </div>
                        </div>

                        <p className="desc">{producto.descripcion_corta}</p>
                        <p><strong>Codigo:</strong> {producto.codigo_int}</p>

                        {enCarrito && (
                          <span className="etiqueta-presupuesto">
                            <span className="tilde-verde">✔</span> Agregado al pedido
                          </span>
                        )}

                        <div className="bottom-row">
                          <div className="control-cantidad">
                            <button
                              onClick={() => {
                                setDraftCantidades(prev => {
                                  const cp = { ...prev }; delete cp[producto.codigo_int]; return cp;
                                });
                                modificarCantidad(producto, -1);
                              }}
                              className="btn-menos"
                            >
                              −
                            </button>

                            <input
                              type="number"
                              min="0" // tarjeta: mínimo 0
                              value={getCantidadStr(producto.codigo_int)}
                              onFocus={(e) => { e.target.select(); }}
                              onChange={(e) => {
                                const v = e.target.value; // guardamos string tal cual (incluye vacío)
                                setDraftCantidades(prev => ({ ...prev, [producto.codigo_int]: v }));
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') commitCantidad(producto, 0);
                              }}
                              onBlur={() => commitCantidad(producto, 0)}
                              className="cantidad-input"
                            />

                            <button
                              onClick={() => {
                                setDraftCantidades(prev => {
                                  const cp = { ...prev }; delete cp[producto.codigo_int]; return cp;
                                });
                                modificarCantidad(producto, 1);
                              }}
                              className="btn-mas"
                            >
                              +
                            </button>
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

      {productoSeleccionado && (() => {
        const { precioOnline, precioSucursal } = calcularPrecios(productoSeleccionado);
        return (
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

              {/* 👇 Precios también en la ficha */}
              <div className="price-row modal-prices">
                <div className="price-box online">
                  <span className="price-label">Precio Mayorista</span>
                  <span className="price-value">
                    {precioOnline ? formatoAR(precioOnline) : 'No disponible'}
                  </span>
                </div>
                <div className="price-box sucursal">
                  <span className="price-label">Precio por Menor</span>
                  <span className="price-value">
                    {precioSucursal ? formatoAR(precioSucursal) : 'No disponible'}
                  </span>
                </div>
              </div>

              <p>{productoSeleccionado.descripcion_corta}</p>
              <p><strong>Codigo:</strong> {productoSeleccionado.codigo_int}</p>

              <div className="control-cantidad" style={{ marginTop: '1rem' }}>
                <button
                  onClick={() => {
                    setDraftCantidades(prev => {
                      const cp = { ...prev }; delete cp[productoSeleccionado.codigo_int]; return cp;
                    });
                    modificarCantidad(productoSeleccionado, -1);
                  }}
                  className="btn-menos"
                >
                  −
                </button>

                <input
                  type="number"
                  min="0" // modal: mínimo 0
                  value={getCantidadStr(productoSeleccionado.codigo_int)}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => {
                    const v = e.target.value; // guardamos string tal cual
                    setDraftCantidades(prev => ({ ...prev, [productoSeleccionado.codigo_int]: v }));
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') commitCantidad(productoSeleccionado, 0);
                  }}
                  onBlur={() => commitCantidad(productoSeleccionado, 0)}
                  className="cantidad-input"
                />

                <button
                  onClick={() => {
                    setDraftCantidades(prev => {
                      const cp = { ...prev }; delete cp[productoSeleccionado.codigo_int]; return cp;
                    });
                    modificarCantidad(productoSeleccionado, 1);
                  }}
                  className="btn-mas"
                >
                  +
                </button>
              </div>

              <button className="btn-seguir" onClick={cerrarModal}>
                ← Seguir viendo productos
              </button>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

export default ProductList;
