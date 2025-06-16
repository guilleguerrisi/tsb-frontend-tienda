import React, { useState, useEffect } from 'react';
import './Carrito.css';
import { useCarrito } from '../contexts/CarritoContext';
import { Link, useLocation } from 'react-router-dom';
import ModalContacto from './ModalContacto';
import config from '../config';

const Carrito = () => {

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);
  const { carrito, cambiarCantidad, eliminarDelCarrito, reemplazarCarrito } = useCarrito();


  const [mostrarModal, setMostrarModal] = useState(false);
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const idPedido = params.get("id");

  // 🔄 Si accedemos con /carrito?id=XX, cargamos ese carrito desde el backend
  useEffect(() => {
    const cargarPedido = async () => {
      if (!idPedido) return;

      try {
        const res = await fetch(`${config.API_URL}/api/pedidos/${idPedido}`);
        const data = await res.json();

        if (res.ok && data.array_pedido) {
          const carritoCargado = JSON.parse(data.array_pedido);
          reemplazarCarrito(carritoCargado);

        } else {
          alert('No se pudo cargar el presupuesto.');
        }
      } catch (error) {
        console.error('Error al cargar pedido desde carrito:', error);
        alert('Error al conectar con el servidor.');
      }
    };

    cargarPedido();
  }, [idPedido, reemplazarCarrito]);




  const total = carrito.reduce(
    (acc, item) => acc + item.price * (item.cantidad || 1),
    0
  );

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
                      onClick={() => cambiarCantidad(item.codigo_int, item.cantidad - 1)}
                    >
                      –
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={item.cantidad || 1}
                      onChange={(e) => cambiarCantidad(item.codigo_int, parseInt(e.target.value) || 1)}
                      className="cantidad-input"
                    />
                    <button
                      type="button"
                      className="btn-cantidad"
                      onClick={() => cambiarCantidad(item.codigo_int, item.cantidad + 1)}
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
                onClick={() => eliminarDelCarrito(index)}
              >
                Quitar
              </button>
            </div>
          ))
        )}
      </div>

      {carrito.length > 0 && (
        <div className="carrito-summary">
          <div className="carrito-total-box">
            <div className="carrito-total-icono">🧾</div>
            <div className="carrito-total-contenido">
              <h2 className="carrito-total-titulo">Total nota de pedido:</h2>
              <p className="carrito-total-monto">
                ${new Intl.NumberFormat('es-AR').format(total)}
              </p>
              <p className="carrito-total-envio">
                Envío sin cargo en Salta Capital para pedidos desde $80.000.<br />
                Pedidos menores, solo se abona $3.000 de envío.
              </p>
            </div>
          </div>

          <button
            className="enviar-whatsapp-button"
            onClick={() => setMostrarModal(true)}
          >
            📩 Solicitar revisión de pedido
          </button>
        </div>
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
          Los precios incluyen IVA y están sujetos a confirmación junto con la disponibilidad de stock. La operación será válida
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
