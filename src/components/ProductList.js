import React, { useEffect, useState } from "react";
import { useCarrito } from "../contexts/CarritoContext";
import config from "../config";


// Detecta si un producto realmente tiene un link de video válido
const tieneVideo = (v) => {

  if (!v) return false;
  if (typeof v !== "string") return false;

  const limpio = v.trim().toLowerCase();
  if (limpio === "" || limpio === "null" || limpio === "undefined") return false;

  return true;
};

// Convierte cualquier link de YouTube en formato embed
const convertirYoutubeEmbed = (url = "") => {
  if (!url) return null;

  const limpio = url.trim();

  let id = null;

  // Shorts
  if (limpio.includes("youtube.com/shorts/")) {
    id = limpio.split("shorts/")[1].split("?")[0];
  }

  // watch?v=
  else if (limpio.includes("watch?v=")) {
    id = limpio.split("watch?v=")[1].split("&")[0];
  }

  // youtu.be
  else if (limpio.includes("youtu.be/")) {
    id = limpio.split("youtu.be/")[1].split("?")[0];
  }

  if (!id) return null;

  return `https://www.youtube.com/embed/${id}`;
};





function ProductList({ grcat, buscar }) {
  const { carrito, agregarAlCarrito } = useCarrito();

  const [mercaderia, setProductos] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [indiceImagen, setIndiceImagen] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [draftCantidades, setDraftCantidades] = useState({});

  const redondearCentena = (n) => Math.round(n / 100) * 100;
  const formatoAR = (n) => `$ ${new Intl.NumberFormat("es-AR").format(n)}`;

  const calcularPrecioMinorista = (p) => {
    const base = Number(p.costosiniva);
    const ivaFactor = 1 + (Number(p.iva || 0) / 100);
    const margenDB = 1 + (Number(p.margen || 0) / 100);
    if (!Number.isFinite(base)) return 0;
    return redondearCentena(base * ivaFactor * margenDB);
  };

  const obtenerCantidad = (codigo_int) => {
    const item = carrito.find((p) => p.codigo_int === codigo_int);
    return item?.cantidad || 0;
  };

  const getCantidadStr = (codigo) =>
    draftCantidades[codigo] ?? String(obtenerCantidad(codigo));

  const modificarCantidad = (producto, delta) => {
    const precioMinorista = calcularPrecioMinorista(producto);
    const prodConPrecio = {
      ...producto,
      __usarPrecioOnline: false,
      __usarPrecioMinorista: true,
      __noRecalcularPrecio: true,
      price: precioMinorista,
    };
    agregarAlCarrito(prodConPrecio, delta);
  };

  const commitCantidad = (producto, minimo = 0) => {
    const codigo = producto.codigo_int;
    const raw = draftCantidades[codigo];
    if (raw === undefined) return;

    const actual = obtenerCantidad(codigo);
    let n = parseInt(raw, 10);
    if (isNaN(n)) n = actual;
    if (typeof minimo === "number") n = Math.max(minimo, n);

    const delta = n - actual;
    if (delta !== 0) modificarCantidad(producto, delta);

    setDraftCantidades((prev) => {
      const cp = { ...prev };
      delete cp[codigo];
      return cp;
    });
  };

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        setCargando(true);
        setError(null);

        const params = new URLSearchParams();
        if (buscar?.trim()) params.set("buscar", buscar.trim());
        else if (grcat?.trim()) params.set("buscar", grcat.trim());

        const url = `${config.API_URL}/api/mercaderia${params.toString() ? `?${params}` : ""
          }`;

        const res = await fetch(url);
        const data = await res.json();

        if (Array.isArray(data)) setProductos(data);
        else throw new Error("Formato incorrecto en respuesta.");
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar los productos.");
        setProductos([]);
      } finally {
        setCargando(false);
      }
    };

    fetchProductos();
  }, [grcat, buscar]);

  const abrirModal = (producto) => {
    let slides = [];

    try {
      // Si es string traído desde la DB → parsear
      if (typeof producto.imagearray === "string") {
        slides = JSON.parse(producto.imagearray);
      }
      // Si ya es array → usarlo tal cual
      else if (Array.isArray(producto.imagearray)) {
        slides = producto.imagearray;
      }
    } catch {
      slides = [];
    }

    // FILTRAR elementos inválidos
    slides = slides.filter(
      (s) => s && typeof s.url === "string" && s.url.trim() !== ""
    );

    // Si NO hay slides, mostrar un slide vacío controlado
    if (slides.length === 0) {
      slides = [{ tipo: "empty", url: null }];
    }

    setProductoSeleccionado({
      ...producto,
      slides,
    });

    setIndiceImagen(0);
    document.body.classList.add("modal-abierto");
  };



  const cerrarModal = () => {
    setProductoSeleccionado(null);
    document.body.classList.remove("modal-abierto");
  };

  useEffect(() => {
    const handleKey = (e) => e.key === "Escape" && cerrarModal();
    if (productoSeleccionado) window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [productoSeleccionado]);

  // ---------- RENDER PRINCIPAL ----------
  return (
    <>
      <div className="w-full">
        {cargando && (
          <div className="flex justify-center items-center h-64 text-xl text-gray-700">
            Cargando productos…
          </div>
        )}

        {error && (
          <div className="text-center text-red-600 font-semibold py-4">
            {error}
          </div>
        )}

        {!cargando && !error && mercaderia.length === 0 && (
          <p className="p-8 text-center text-gray-700 text-lg">
            No hay productos para esta categoría.
          </p>
        )}

        {Object.entries(
          mercaderia.reduce((acc, prod) => {
            const grupo = prod.grupo || "Sin grupo";
            if (!acc[grupo]) acc[grupo] = [];
            acc[grupo].push(prod);
            return acc;
          }, {})
        ).map(([grupo, productos]) => {
          const ordenados = productos.sort((a, b) =>
            (b.fechaordengrupo || "").localeCompare(a.fechaordengrupo || "")
          );

          return (
            <div key={grupo} className="mt-8">
              <h2 className="text-xl font-bold text-white pl-4 border-l-4 border-blue-500 mb-4">
                {grupo}
              </h2>

              <div
                className="
                  grid 
                  grid-cols-1 
                  sm:grid-cols-2 
                  lg:grid-cols-3 
                  xl:grid-cols-4 
                  gap-4 
                  p-3 
                  max-w-[1600px] 
                  mx-auto
                "
              >
                {ordenados.map((producto, index) => {
                  const precio = calcularPrecioMinorista(producto);
                  const enCarrito = carrito.some(
                    (p) => p.codigo_int === producto.codigo_int
                  );

                  const autorizado = (() => {
                    try {
                      const raw = localStorage.getItem("usuario_admin");
                      if (
                        raw &&
                        raw !== "undefined" &&
                        raw !== "null" &&
                        raw.trim().startsWith("{")
                      ) {
                        return JSON.parse(raw)?.autorizado === true;
                      }
                    } catch { }
                    return false;
                  })();

                  return (
                    <div
                      key={index}
                      className="
    relative
    bg-white 
    rounded-xl 
    shadow-sm 
    hover:shadow-md 
    transition-shadow 
    p-4 
    flex flex-row          /* MOBILE: HORIZONTAL */
    sm:flex-col            /* PC: VERTICAL */
    gap-4 
    border border-gray-100
    h-[160px]              /* MOBILE: MÁS CHICA */
    sm:h-auto
  "
                    >
                      {/* BADGE VIDEO */}
                      {tieneVideo(producto.video1) && (

                        <span className="absolute top-3 left-3 bg-red-600 text-white text-xs px-2 py-1 rounded-md shadow-md">
                          🎥 VIDEO
                        </span>
                      )}

                      {/* IMAGEN – MOBILE IZQUIERDA, PC NORMAL */}
                      <div
                        className="
      cursor-pointer 
      flex justify-center items-center 
      bg-white
      w-[110px] h-full     /* MOBILE */
      sm:w-full sm:h-64    /* PC */
    "
                        onClick={() => !autorizado && abrirModal(producto)}
                      >
                        <img
                          src={producto.imagen1}
                          alt={producto.descripcion_corta}
                          className="
        w-full 
        h-full 
        object-contain 
        rounded-lg 
        bg-white
        select-none
      "
                          onContextMenu={(e) => e.preventDefault()}
                          onError={(e) => (e.target.src = '/imagenes/no-disponible.jpg')}
                        />
                      </div>

                      {/* CONTENIDO */}
                      <div className="flex flex-col flex-1 justify-between sm:gap-3">

                        {/* LINK ADMIN */}
                        {autorizado && (
                          <a
                            href={`https://tsb-frontend-mercaderia-production-3b78.up.railway.app/?id=${producto.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 text-[0.7rem] self-end hover:text-gray-600"
                          >
                            🔗 admin
                          </a>
                        )}

                        {/* PRECIO */}
                        <div className="text-left">
                          <p className="text-[0.75rem] font-semibold text-gray-500">Precio</p>
                          <p className="text-xl sm:text-2xl font-bold text-black">
                            {precio ? formatoAR(precio) : 'Sin precio'}
                          </p>
                        </div>

                        {/* DESCRIPCIÓN */}
                        <p className="text-[0.8rem] sm:text-sm text-gray-800 leading-tight line-clamp-2 sm:line-clamp-none">
                          {producto.descripcion_corta}
                        </p>

                        {/* CÓDIGO */}
                        <p className="text-xs text-gray-600">
                          <strong className="font-semibold text-gray-800">Código:</strong>{' '}
                          {producto.codigo_int}
                        </p>

                        {/* ETIQUETA AGREGADO */}
                        {enCarrito && (
                          <p className="text-green-600 text-sm font-semibold flex items-center gap-1">
                            ✔ Agregado al pedido
                          </p>
                        )}

                        {/* CONTROLES */}
                        <div className="mt-auto flex items-center justify-between sm:flex-col sm:gap-3">

                          {/* CANTIDAD */}
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => {
                                setDraftCantidades((p) => {
                                  const cp = { ...p };
                                  delete cp[producto.codigo_int];
                                  return cp;
                                });
                                modificarCantidad(producto, -1);
                              }}
                              className="
            w-8 h-8 sm:w-9 sm:h-9 
            flex items-center justify-center 
            bg-[#3483FA] text-white 
            rounded-lg text-lg font-bold 
            hover:bg-[#2968C8] active:scale-95
          "
                            >
                              −
                            </button>

                            <input
                              type="number"
                              min="0"
                              className="
            w-14 sm:w-16 
            text-center border border-gray-300 rounded-lg 
            p-1 text-sm font-semibold 
            focus:ring-2 focus:ring-[#3483FA33]
          "
                              value={getCantidadStr(producto.codigo_int)}
                              onFocus={(e) => e.target.select()}
                              onChange={(e) =>
                                setDraftCantidades((p) => ({
                                  ...p,
                                  [producto.codigo_int]: e.target.value,
                                }))
                              }
                              onBlur={() => commitCantidad(producto, 0)}
                              onKeyDown={(e) => e.key === 'Enter' && commitCantidad(producto, 0)}
                            />

                            <button
                              onClick={() => {
                                setDraftCantidades((p) => {
                                  const cp = { ...p };
                                  delete cp[producto.codigo_int];
                                  return cp;
                                });
                                modificarCantidad(producto, 1);
                              }}
                              className="
            w-8 h-8 sm:w-9 sm:h-9
            flex items-center justify-center 
            bg-[#3483FA] text-white 
            rounded-lg text-lg font-bold 
            hover:bg-[#2968C8] active:scale-95
          "
                            >
                              +
                            </button>
                          </div>

                          {/* BOTÓN FICHA */}
                          <button
                            type="button"
                            onClick={() => abrirModal(producto)}
                            className="
          w-[90px] sm:w-full
          bg-[#3483FA] hover:bg-[#2968C8]
          text-white
          py-1.5 sm:py-2 
          rounded-lg
          font-semibold text-xs sm:text-sm
          shadow-md
          active:scale-95
        "
                          >
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
        })}
      </div>

      {/* ---------- MODAL ---------- */}
      {productoSeleccionado && (() => {
        const precioFicha = calcularPrecioMinorista(productoSeleccionado);
        const totalSlides = productoSeleccionado.slides.length;



        return (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[9999] p-4"
            onClick={cerrarModal}
          >
            <div
              className="bg-white rounded-xl shadow-xl max-w-lg w-full px-5 pt-8 pb-5 relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* BOTÓN CERRAR (SEPARADO DE LA IMAGEN) */}
              <button
                className="absolute top-3 right-4 text-3xl text-gray-500 hover:text-gray-800 z-50 focus:outline-none"
                onClick={cerrarModal}
              >
                ×
              </button>

              {/* CARRUSEL IMAGEN / VIDEO */}
              {/* CARRUSEL IMAGEN / VIDEO */}
              <div className="relative flex justify-center items-center mb-4">

                {/* BOTÓN ANTERIOR */}
                {totalSlides > 1 && (
                  <button
                    onClick={() =>
                      setIndiceImagen((prev) => (prev === 0 ? totalSlides - 1 : prev - 1))
                    }
                    className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white text-gray-700 px-3 py-1 rounded-full shadow focus:outline-none"
                  >
                    ‹
                  </button>
                )}

                {/* CONTENIDO DEL SLIDE */}
                {/* Mostrar slide actual */}
                {(() => {
                  const slide = productoSeleccionado.slides[indiceImagen];

                  // 🛑 Si no hay slide → error controlado
                  if (!slide) {
                    return (
                      <div className="w-full text-center py-10 text-gray-500">
                        Sin imágenes ni videos disponibles
                      </div>
                    );
                  }

                  // 🛑 Si el slide marcó vacío
                  if (slide.tipo === "empty") {
                    return (
                      <div className="w-full text-center py-10 text-gray-500">
                        Sin imágenes ni videos disponibles
                      </div>
                    );
                  }

                  // 🎥 VIDEO
                  if (slide.tipo === "video") {
                    return (
                      <div className="relative w-full">
                        <span className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded shadow">
                          🎥 VIDEO
                        </span>
                        <div className="w-full rounded-lg overflow-hidden bg-black aspect-video">
                          <iframe
                            src={convertirYoutubeEmbed(slide.url) + "?autoplay=1&mute=1"}
                            className="w-full h-full"
                            title="Video del producto"
                            allow="autoplay; encrypted-media"
                            allowFullScreen
                          ></iframe>

                        </div>
                      </div>
                    );
                  }

                  // 🖼 FOTO
                  return (
                    <img
                      src={slide.url}
                      alt="imagen del producto"
                      className="max-h-[360px] max-w-[85%] mx-auto object-contain rounded-lg bg-white"
                      onError={(e) => (e.target.src = "/imagenes/no-disponible.jpg")}
                    />
                  );
                })()}



                {/* BOTÓN SIGUIENTE */}
                {totalSlides > 1 && (
                  <button
                    onClick={() =>
                      setIndiceImagen((prev) => (prev === totalSlides - 1 ? 0 : prev + 1))
                    }
                    className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white text-gray-700 px-3 py-1 rounded-full shadow focus:outline-none"
                  >
                    ›
                  </button>
                )}
              </div>


              {/* PRECIO EN NEGRO, DISCRETO */}
              <div className="text-left mb-3">
                <p className="text-xs font-semibold text-gray-500">Precio</p>
                <p className="text-2xl font-bold text-black">
                  {precioFicha ? formatoAR(precioFicha) : "Sin precio"}
                </p>
              </div>


              {/* DESCRIPCIÓN */}
              <p className="text-gray-800 text-base mb-2">
                {productoSeleccionado.descripcion_corta}
              </p>

              {/* CÓDIGO */}
              <p className="text-sm text-gray-600 mb-4">
                <strong>Código:</strong> {productoSeleccionado.codigo_int}
              </p>

              {/* CONTROL DE CANTIDAD (AZUL ML) */}
              <div className="flex justify-center items-center gap-3 mb-4">
                <button
                  className="
                    w-10 h-10 
                    bg-[#3483FA] text-white 
                    rounded-md text-xl font-bold 
                    hover:bg-[#2968C8] active:scale-95 
                    transition focus:outline-none
                  "
                  onClick={() => modificarCantidad(productoSeleccionado, -1)}
                >
                  −
                </button>

                <input
                  type="number"
                  value={getCantidadStr(productoSeleccionado.codigo_int)}
                  min="0"
                  className="
                    w-20 border border-[#3483FA] rounded-md 
                    p-2 text-center text-lg font-semibold
                    focus:outline-none focus:ring-2 focus:ring-[#3483FA55]
                  "
                  onFocus={(e) => e.target.select()}
                  onChange={(e) =>
                    setDraftCantidades((prev) => ({
                      ...prev,
                      [productoSeleccionado.codigo_int]: e.target.value,
                    }))
                  }
                  onBlur={() => commitCantidad(productoSeleccionado, 0)}
                />

                <button
                  className="
                    w-10 h-10 
                    bg-[#3483FA] text-white 
                    rounded-md text-xl font-bold 
                    hover:bg-[#2968C8] active:scale-95 
                    transition focus:outline-none
                  "
                  onClick={() => modificarCantidad(productoSeleccionado, 1)}
                >
                  +
                </button>
              </div>

              {/* CERRAR MODAL */}
              <button
                className="
                  w-full bg-gray-100 border rounded-lg 
                  py-2 text-gray-700 font-semibold 
                  hover:bg-gray-200 transition
                  focus:outline-none
                "
                onClick={cerrarModal}
              >
                ← Seguir viendo productos
              </button>
            </div>
          </div>
        );
      })()}
    </>
  );
}

export default ProductList;
