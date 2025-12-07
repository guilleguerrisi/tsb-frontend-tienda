
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useCarrito } from "../contexts/CarritoContext";
import config from "../config";

const Carrito = () => {
  const { carrito, cambiarCantidad, eliminarDelCarrito, reemplazarCarrito, carritoEditadoManualmente } = useCarrito();

  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const idPedido = params.get("id");

  const [draftCarrito, setDraftCarrito] = useState({});
  const [telefono, setTelefono] = useState("");
  const [guardandoTelefono, setGuardandoTelefono] = useState(false);
  const [mensajeOk, setMensajeOk] = useState("");

  const redondearCentena = (n) => Math.round(n / 100) * 100;
  const formatoAR = (n) => new Intl.NumberFormat("es-AR").format(n);

  const calcularPrecioMinorista = (p) => {
    const base = Number(p.costosiniva);
    const iva = 1 + (Number(p.iva || 0) / 100);
    const margen = 1 + (Number(p.margen || 0) / 100);
    if (!Number.isFinite(base)) return 0;
    return redondearCentena(base * iva * margen);
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const getCantidadStr = (codigo, actual) =>
    draftCarrito[codigo] ?? String(actual ?? 1);

  const commitCantidad = (codigo, actual) => {
    const raw = draftCarrito[codigo];
    if (raw === undefined) return;

    let n = parseInt(raw, 10);
    if (isNaN(n)) n = actual ?? 1;
    n = Math.max(1, n);

    if (n !== actual) cambiarCantidad(codigo, n);

    setDraftCarrito((prev) => {
      const cp = { ...prev };
      delete cp[codigo];
      return cp;
    });
  };

  useEffect(() => {
    const cargar = async () => {
      if (!idPedido || carritoEditadoManualmente) return;

      try {
        const url = `${config.API_URL}/api/pedidos/${idPedido}`;
        const res = await fetch(url);
        const data = await res.json();

        if (res.ok && data.array_pedido) {
          reemplazarCarrito(JSON.parse(data.array_pedido));
          if (data.contacto_cliente) setTelefono(String(data.contacto_cliente));
        } else {
          alert("El pedido no existe.");
          navigate("/carrito", { replace: true });
        }
      } catch {
        alert("Error al conectar con servidor");
        navigate("/carrito", { replace: true });
      }
    };

    cargar();
  }, [idPedido, carritoEditadoManualmente, navigate, reemplazarCarrito]);

  const total = carrito.reduce((acc, item) => {
    const precio = calcularPrecioMinorista(item);
    return acc + precio * (item.cantidad || 1);
  }, 0);

  const normalizarTelefono = (t) => t.replace(/[^\d+]/g, "").trim();

  const handleSolicitarPresupuesto = async () => {
    if (guardandoTelefono) return;

    try {
      setMensajeOk("");
      const t = normalizarTelefono(telefono);
      if (!t) return alert("Ingresá tu WhatsApp.");
      if (t.length < 8) return alert("Número demasiado corto.");

      setGuardandoTelefono(true);

      const payload = {
        contacto_cliente: t,
        array_pedido: JSON.stringify(carrito),
      };

      let nuevoID = idPedido;

      if (idPedido) {
        const res = await fetch(`${config.API_URL}/api/pedidos/${idPedido}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error();
        nuevoID = body?.data?.id ?? idPedido;
      } else {
        const res = await fetch(`${config.API_URL}/api/pedidos`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error();
        nuevoID = body?.data?.id ?? null;
        if (nuevoID) navigate(`/carrito?id=${nuevoID}`, { replace: true });
      }

      setMensajeOk("¡Perfecto! Te enviaremos el presupuesto.");
    } catch {
      alert("No se pudo guardar el número. Intentá nuevamente.");
    } finally {
      setGuardandoTelefono(false);
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 to-blue-300 p-6">

      {/* TÍTULO */}
      <h1 className="text-white text-4xl md:text-5xl font-bold text-center drop-shadow-lg mb-10">
        DETALLE DE NOTA DE PEDIDO
      </h1>

      {/* LISTA DE ITEMS */}
      <div className="flex flex-col gap-6 max-w-4xl mx-auto">
        {carrito.length === 0 ? (
          <p className="text-white text-center text-xl">Tu carrito está vacío.</p>
        ) : (
          carrito.map((item, index) => {
            const precio = calcularPrecioMinorista(item);
            const cantidad = item.cantidad || 1;
            const subtotal = precio * cantidad;

            return (
              <div
                key={index}
                className="bg-white shadow-xl rounded-xl p-5 flex flex-col md:flex-row gap-5 relative hover:scale-[1.01] transition-transform"
              >
                {/* IMAGEN */}
                <img
                  src={item.imagen1}
                  alt={item.descripcion_corta}
                  className="w-28 h-28 object-contain rounded-lg bg-gray-100 p-2"
                />

                {/* CONTENIDO */}
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-800">
                    {item.codigo_int}
                  </h3>

                  <p className="text-gray-700 text-base mt-1">
                    {item.descripcion_corta}
                  </p>

                  {/* PRECIO */}
                  <div className="inline-block mt-3 bg-blue-50 border-2 border-blue-300 px-4 py-2 rounded-lg">
                    <div className="text-sm font-bold text-blue-700">PRECIO</div>
                    <div className="text-2xl font-extrabold text-blue-900">
                      ${formatoAR(precio)}
                    </div>
                  </div>

                  {/* CANTIDAD + SUBTOTAL */}
                  <div className="mt-4 flex flex-wrap items-center gap-4">
                    <label className="font-semibold text-gray-700">Cantidad:</label>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setDraftCarrito((prev) => {
                            const cp = { ...prev };
                            delete cp[item.codigo_int];
                            return cp;
                          });
                          cambiarCantidad(item.codigo_int, Math.max(1, cantidad - 1));
                        }}
                        className="w-9 h-9 bg-blue-500 text-white rounded-md text-lg font-bold hover:bg-blue-600"
                      >
                        –
                      </button>

                      <input
                        type="number"
                        min="1"
                        value={getCantidadStr(item.codigo_int, cantidad)}
                        onFocus={(e) => e.target.select()}
                        onChange={(e) =>
                          setDraftCarrito((prev) => ({
                            ...prev,
                            [item.codigo_int]: e.target.value,
                          }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") commitCantidad(item.codigo_int, cantidad);
                        }}
                        onBlur={() => commitCantidad(item.codigo_int, cantidad)}
                        className="w-20 text-lg text-center border border-gray-300 rounded-md p-1 font-semibold"
                      />

                      <button
                        onClick={() => {
                          setDraftCarrito((prev) => {
                            const cp = { ...prev };
                            delete cp[item.codigo_int];
                            return cp;
                          });
                          cambiarCantidad(item.codigo_int, cantidad + 1);
                        }}
                        className="w-9 h-9 bg-blue-500 text-white rounded-md text-lg font-bold hover:bg-blue-600"
                      >
                        +
                      </button>
                    </div>

                    <span className="text-gray-900 font-bold text-lg">
                      Subtotal: ${formatoAR(subtotal)}
                    </span>
                  </div>
                </div>

                {/* ELIMINAR */}
                <button
                  onClick={() => eliminarDelCarrito(item)}
                  className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-lg shadow hover:bg-red-600"
                >
                  Quitar
                </button>
              </div>
            );
          })
        )}
      </div>
      {/* RESUMEN DEL TOTAL */}
      {carrito.length > 0 && (
        <div className="max-w-4xl mx-auto mt-10 bg-white/90 border-2 border-blue-500 p-6 rounded-xl shadow-lg flex items-start gap-5 flex-wrap">
          
          {/* Ícono */}
          <div className="text-4xl text-blue-600">🧾</div>

          {/* Contenido */}
          <div className="flex-1 min-w-[240px]">
            <h2 className="text-xl font-semibold text-blue-900">
              Total nota de pedido:
            </h2>

            <p className="text-3xl font-extrabold mt-2 text-gray-900">
              $ {formatoAR(total)}
            </p>

            <p className="text-gray-700 text-sm mt-2 leading-relaxed">
              * Los precios incluyen IVA. Finalizá la nota de pedido dejándonos un número de contacto para enviarte el presupuesto final con los descuentos correspondientes.
            </p>
          </div>
        </div>
      )}

      {/* BLOQUE FINAL DE CONTACTO */}
      {carrito.length > 0 && (
        <section className="max-w-3xl mx-auto mt-10 bg-white/80 border border-blue-200 p-6 rounded-xl shadow-md">
          
          <h3 className="text-center text-2xl font-bold text-gray-900 mb-2">
            ¡ÚLTIMO PASO!
          </h3>

          <p className="text-center text-gray-700 mb-4 text-base">
            <strong>¿A qué número de WhatsApp podemos enviarte el presupuesto?</strong>
          </p>

          {/* Caja de Teléfono */}
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 max-w-2xl mx-auto">
            
            <input
              type="tel"
              placeholder="Ej: +54 387 5xx xxxx"
              className="h-14 text-lg border-2 border-blue-200 rounded-xl px-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-300/30"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
            />

            {/* Botón guardar */}
            <button
              onClick={handleSolicitarPresupuesto}
              disabled={guardandoTelefono}
              className={`h-14 px-6 rounded-xl font-bold text-white transition-all 
                ${guardandoTelefono ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700 active:scale-95"}
              `}
            >
              {guardandoTelefono ? "Guardando…" : "Solicitar presupuesto"}
            </button>
          </div>

          {/* Número de pedido */}
          {idPedido && (
            <p className="text-center text-gray-600 mt-3">
              N° de pedido:{" "}
              <span className="inline-block px-3 py-1 rounded-full bg-blue-100 border border-blue-300 text-blue-800 font-semibold">
                #{idPedido}
              </span>
            </p>
          )}

          {/* Mensaje OK */}
          {mensajeOk && (
            <p className="text-center text-green-700 font-semibold mt-3">
              {mensajeOk}
            </p>
          )}
        </section>
      )}


      {/* BOTÓN VOLVER */}
      <div className="max-w-4xl mx-auto mt-10 flex justify-end">
        <button
          onClick={() => navigate("/")}
          className="px-6 py-3 rounded-full bg-orange-500 text-white font-bold text-lg shadow-md hover:bg-orange-600 transition active:scale-95"
        >
          ← Seguir viendo productos
        </button>
      </div>

      {/* FOOTER / LEYENDA */}
      <div className="max-w-4xl mx-auto mt-10 bg-white/40 backdrop-blur-md p-6 rounded-xl shadow-md">
        <p className="text-gray-800 italic leading-relaxed">
          ⚠️ La nota de pedido tiene carácter informativo y no implica compromiso
          de compra ni obligación de parte del vendedor.  
          El precio final puede variar según disponibilidad, stock y descuentos aplicables.
        </p>
          </div>
    </div>
  );
};

export default Carrito;

