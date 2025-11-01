import React, { useState, useEffect } from 'react';
import './Carrito.css';
import { useCarrito } from '../contexts/CarritoContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import config from '../config';

const Carrito = () => {
  const { carrito, cambiarCantidad, eliminarDelCarrito, reemplazarCarrito, carritoEditadoManualmente } = useCarrito();
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const idPedido = params.get("id");

  // 🧠 Buffer local para escribir cantidades sin "peleas" con el estado global
  const [draftCarrito, setDraftCarrito] = useState({}); // { [codigo_int]: "texto" }

  // 📞 Teléfono de contacto
  const [telefono, setTelefono] = useState('');
  const [guardandoTelefono, setGuardandoTelefono] = useState(false);
  const [mensajeOk, setMensajeOk] = useState('');

  const getCantidadStr = (codigo, actual) =>
    draftCarrito[codigo] ?? String(actual ?? 1);

  const commitCantidad = (codigo, actual) => {
    const raw = draftCarrito[codigo];
    if (raw === undefined) return; // nada que confirmar

    let n = parseInt(raw, 10);
    if (isNaN(n)) n = actual ?? 1;
    n = Math.max(1, n); // carrito: mínimo 1

    if (n !== actual) cambiarCantidad(codigo, n);

    setDraftCarrito(prev => {
      const cp = { ...prev };
      delete cp[codigo];
      return cp;
    });
  };

  // 🔄 Si accedemos con /carrito?id=XX, cargamos ese carrito desde el backend
  useEffect(() => {
    const cargarPedido = async () => {
      if (!idPedido || carritoEditadoManualmente) return;

      try {
        const res = await fetch(`${config.API_URL}/api/pedidos/${idPedido}`);
        const data = await res.json();

        if (res.ok && data.array_pedido) {
          const carritoCargado = JSON.parse(data.array_pedido);
          // traer contacto si viene
          if (data.contacto_cliente) setTelefono(String(data.contacto_cliente));
          reemplazarCarrito(carritoCargado);
        } else {
          alert('El pedido no existe o fue eliminado. Se generará uno nuevo.');
          navigate('/carrito', { replace: true });
        }
      } catch (error) {
        console.error('Error al cargar pedido desde carrito:', error);
        alert('Error al conectar con el servidor.');
        navigate('/carrito', { replace: true });
      }
    };

    cargarPedido();
  }, [idPedido, carritoEditadoManualmente, reemplazarCarrito, navigate]);

  const total = carrito.reduce(
    (acc, item) => acc + item.price * (item.cantidad || 1),
    0
  );

  // 🔧 Normalización simple (opcional): quita espacios y mantiene +, dígitos
  const normalizarTelefono = (t) => t.replace(/[^\d+]/g, '').trim();

  const handleSolicitarPresupuesto = async () => {
    try {
      setMensajeOk('');
      const t = normalizarTelefono(telefono);

      if (!t) {
        alert('Por favor, ingresá un número de WhatsApp.');
        return;
      }
      if (t.length < 8) {
        alert('El número parece demasiado corto. Revisalo, por favor.');
        return;
      }

      setGuardandoTelefono(true);

      const payload = {
        contacto_cliente: t,
        array_pedido: JSON.stringify(carrito),
      };

      // Si existe el pedido, actualizamos; si no, lo creamos
      let nuevoId = idPedido;

      if (idPedido) {
        const res = await fetch(`${config.API_URL}/api/pedidos/${idPedido}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const err = await res.text();
          throw new Error(`PATCH /api/pedidos/${idPedido} -> ${err}`);
        }
      } else {
        const res = await fetch(`${config.API_URL}/api/pedidos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(`POST /api/pedidos -> ${JSON.stringify(data)}`);
        }
        // Soportar distintas respuestas (id directo o array)
        nuevoId = data?.id ?? data?.[0]?.id ?? data?.nuevoId ?? null;
        if (nuevoId) {
          // Redirigimos para mantener el flujo actual (link compartible)
          navigate(`/carrito?id=${nuevoId}`, { replace: true });
        }
      }

      setMensajeOk('¡Listo! Te contactaremos lo antes posible para coordinar detalles del presupuesto');
    } catch (e) {
      console.error('Error al guardar teléfono del pedido:', e);
      alert('No pudimos guardar el número. Intentá nuevamente en unos segundos.');
    } finally {
      setGuardandoTelefono(false);
    }
  };

  return (
    <div className="carrito-container">
      <h1 className="carrito-title">DETALLE DE NOTA DE PEDIDO</h1>

      <div className="carrito-items">
        {carrito.length === 0 ? (
          <p>Tu carrito está vacío.</p>
        ) : (
          carrito.map((item, index) => (
            <div className="carrito-item" key={index}>
              <img
                src={item.imagen1}
                alt={item.descripcion_corta}
                className="carrito-item-image"
              />
              <div className="carrito-item-details">
                <h3>{item.codigo_int}</h3>
                <p>{item.descripcion_corta}</p>
                <p className="carrito-item-price">
                  Precio unitario: ${new Intl.NumberFormat('es-AR').format(item.price)}
                </p>
                <div className="carrito-cantidad-subtotal">
                  <label>Cantidad:</label>
                  <div className="cantidad-wrapper">
                    <button
                      type="button"
                      className="btn-cantidad"
                      onClick={() => {
                        setDraftCarrito(prev => {
                          const cp = { ...prev }; delete cp[item.codigo_int]; return cp;
                        });
                        cambiarCantidad(item.codigo_int, Math.max(1, (item.cantidad || 1) - 1));
                      }}
                    >
                      –
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={getCantidadStr(item.codigo_int, item.cantidad)}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => {
                        const v = e.target.value;
                        setDraftCarrito(prev => ({ ...prev, [item.codigo_int]: v }));
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') commitCantidad(item.codigo_int, item.cantidad || 1);
                      }}
                      onBlur={() => commitCantidad(item.codigo_int, item.cantidad || 1)}
                      className="cantidad-input"
                    />
                    <button
                      type="button"
                      className="btn-cantidad"
                      onClick={() => {
                        setDraftCarrito(prev => {
                          const cp = { ...prev }; delete cp[item.codigo_int]; return cp;
                        });
                        cambiarCantidad(item.codigo_int, (item.cantidad || 1) + 1);
                      }}
                    >
                      +
                    </button>
                  </div>
                  <span className="subtotal">
                    Subtotal: ${new Intl.NumberFormat('es-AR').format(item.price * (item.cantidad || 1))}
                  </span>
                </div>
              </div>
              <button
                className="eliminar-button"
                onClick={() => eliminarDelCarrito(item)}
              >
                Quitar
              </button>
            </div>
          ))
        )}
      </div>

      {carrito.length > 0 && (
        <>
          <div className="carrito-summary">
            <div className="carrito-total-box">
              <div className="carrito-total-icono">🧾</div>
              <div className="carrito-total-contenido">
                <h2 className="carrito-total-titulo">Total nota de pedido:</h2>
                <p className="carrito-total-monto">
                  ${new Intl.NumberFormat('es-AR').format(total)}
                </p>
                <p className="carrito-total-envio">
                  * Los precios mayoristas aplican a partir de los $95.000 a valor mayorista. De igual forma, solicita la revisión de tu pedido para confirmarlo. El costo de envío oscila entre $5.000 y $15.000 dependiendo el destino y volumen del pedido. Hacemos envíos locales con servicio de mensajería o con el transporte que vos nos indiques si es para fuera de Salta Capital.<br />
                </p>
              </div>
            </div>
          </div>

          {/* ✅ NUEVO: bloque de cierre y captura de WhatsApp */}
          <section className="contacto-final">
            <h3 className="contacto-title">¡Felicidades, tu Nota de pedido está lista!</h3>
            <p className="contacto-subtitle">
              <strong>¿A qué número de WhatsApp podemos enviarte el presupuesto?</strong><br className="br-desktop" />
              Dejanos tu número y te lo mandamos en minutos.
            </p>

            <div className="telefono-box"> 
              <input
                type="tel"
                inputMode="tel"
                placeholder="Ej: +54 387 5xx xxxx"
                className="telefono-input"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
              />
              <button
                className="telefono-btn"
                onClick={handleSolicitarPresupuesto}
                disabled={guardandoTelefono}
                title={idPedido ? 'Guardar número en este pedido' : 'Crear pedido y guardar número'}
              >
                {guardandoTelefono ? 'Guardando…' : 'Solicitar presupuesto'}
              </button>
            </div>

            {idPedido && (
              <p className="contacto-help">
                N° de pedido <span className="chip">#{idPedido}</span>
              </p>
            )}

            {mensajeOk && <p className="ok-msg">{mensajeOk}</p>}
          </section>
        </>
      )}

      <div className="volver-contenedor">
        <Link to="/" className="volver-button">
          ← Seguir viendo productos
        </Link>
      </div>

      <div className="carrito-footer">
        <p className="leyenda-precio">
          ⚠️ La nota de pedido tiene carácter informativo y no implica compromiso de compra ni obligación de parte del vendedor.
          Los precios están sujetos a confirmación junto con la disponibilidad de stock. La operación será válida
          únicamente una vez confirmada por el vendedor.
        </p>

        <p className="info-contacto">
          TIENDA SALTA BAZAR · VENTA ONLINE DE PRODUCTOS DE BAZAR GASTRONÓMICO PARA RESTAURANTES, CONFITERÍAS Y HOGAR - SALTA CAPITAL <br />
          <br />
          Lunes a Viernes · Sábados y Domingos CERRADO
        </p>
      </div>
    </div>
  );
};

export default Carrito;
