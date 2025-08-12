import React, { useState, useEffect } from 'react';
import './Carrito.css';
import { useCarrito } from '../contexts/CarritoContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import ModalContacto from './ModalContacto';
import config from '../config';

const Carrito = () => {
  const { carrito, cambiarCantidad, eliminarDelCarrito, reemplazarCarrito, carritoEditadoManualmente } = useCarrito();
  const [mostrarModal, setMostrarModal] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const idPedido = params.get("id");

  // 🔄 Si accedemos con /carrito?id=XX, cargamos ese carrito desde el backend
  useEffect(() => {
    const cargarPedido = async () => {
      if (!idPedido || carritoEditadoManualmente) return;

      try {
        const res = await fetch(`${config.API_URL}/api/pedidos/${idPedido}`);
        const data = await res.json();

        if (res.ok && data.array_pedido) {
          const carritoCargado = JSON.parse(data.array_pedido);
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

  const enviarPorWhatsApp = () => {
    if (!idPedido) {
      alert("No se encontró el ID del pedido.");
      return;
    }
    const linkPedido = `${window.location.origin}/carrito?id=${idPedido}`;
    const mensaje = encodeURIComponent(`Hola, quisiera consultar por estos productos: ${linkPedido}`);
    window.open(`https://wa.me/5493875537070?text=${mensaje}`, '_blank');
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
                        setTimeout(() => {
                          cambiarCantidad(item.codigo_int, item.cantidad - 1);
                        }, 100);
                      }}
                    >
                      –
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={item.cantidad || 1}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => {
                        const nuevaCantidad = parseInt(e.target.value);
                        if (!isNaN(nuevaCantidad)) {
                          setTimeout(() => {
                            cambiarCantidad(item.codigo_int, nuevaCantidad);
                          }, 200);
                        }
                      }}
                      onBlur={(e) => {
                        if (e.target.value === '' || Number(e.target.value) < 1) {
                          cambiarCantidad(item.codigo_int, 1);
                        }
                      }}
                      className="cantidad-input"
                    />
                    <button
                      type="button"
                      className="btn-cantidad"
                      onClick={() => {
                        setTimeout(() => {
                          cambiarCantidad(item.codigo_int, item.cantidad + 1);
                        }, 100);
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
                  El costo de envío oscila entre $5.000 y $15.000 dependiendo el destino. Hacemos Envíos locales con servicio de mensajeria.<br />
                </p>
              </div>
            </div>
          </div>

          {/* ✅ NUEVO: bloque de cierre y acciones */}
          <section className="contacto-final">
            <h3 className="contacto-title">¡Felicidades, tu Nota de pedido está lista!</h3>
            <p className="contacto-subtitle">
              Ahora solo infórmanos de ella para poder avanzar. <br className="br-desktop"/>
              <strong>¿Cómo deseas contactarnos?</strong>
            </p>

            <div className="contact-actions">
              <button className="cta whatsapp" onClick={enviarPorWhatsApp}>
                <span className="cta-icon">🟢</span>
                <span className="cta-text">WhatsApp</span>
              </button>

              <a href="tel:+543875537070" className="cta call">
                <span className="cta-icon">📞</span>
                <span className="cta-text">Llamar</span>
              </a>

              <button className="cta email" onClick={() => setMostrarModal(true)}>
                <span className="cta-icon">✉️</span>
                <span className="cta-text">Contactar</span>
              </button>
            </div>

            {idPedido && (
              <p className="contacto-help">
                Informanos este numero de pedido <span className="chip">#{idPedido}</span> para continuar.
              </p>
            )}
          </section>
        </>
      )}

      {mostrarModal && (
        <ModalContacto
          carrito={carrito}
          onCerrar={() => setMostrarModal(false)}
        />
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
          TIENDA SALTA BAZAR · DEPÓSITO EN CASEROS 1041 - SALTA CAPITAL <br />
          (Entre calles Islas Malvinas y Jujuy) <br />
          Lunes a Viernes de 10:30 a 13:30 y de 17:00 a 19:00 hs · Sábado cerrado
        </p>
      </div>
    </div>
  );
};

export default Carrito;
