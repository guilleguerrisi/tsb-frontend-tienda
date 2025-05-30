import React, { useState, useEffect } from 'react';
import './Carrito.css';
import { useCarrito } from '../contexts/CarritoContext';
import { Link, useLocation } from 'react-router-dom';
import ModalContacto from './ModalContacto';
import config from '../config';

const Carrito = () => {
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
      <h1 className="carrito-title">DETALLE DE PRESUPUESTO</h1>

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
          <div className="carrito-total-opcion2">
            <p className="opcion2-titulo">🛒 Opción minorista:</p>
            <p className="opcion2-texto">
              <strong>Total:</strong>{' '}
              <span className="monto-clave">
                ${new Intl.NumberFormat('es-AR').format(total)}
              </span><br />
              <span className="info-retiro">
                Envío a domicilio sin cargo en la ciudad de Salta Capital, para compras desde $80.000. Para montos inferires solo abonrías $3.000 de envío.
              </span>
            </p>
          </div>

          <div className="carrito-total-opcion2">
            <p className="opcion2-titulo">💼 Opción mayorista (15% de descuento sobre el Total):</p>
            <p className="opcion2-texto">
              Abonás <strong>el 20%</strong> ahora por transferencia: <span className="monto-clave">
                ${new Intl.NumberFormat('es-AR').format(Math.round(total * 0.85 * 0.20))}
              </span><br />
              y el <strong>80%</strong> restante al momento del retiro, 2 días hábiles después: <span className="monto-clave">
                ${new Intl.NumberFormat('es-AR').format(Math.round(total * 0.85 * 0.80))}
              </span><br />
              <em>(Este método aplica un 15% de descuento sobre el precio total)</em><br /><br />
              <strong>Total con descuento:</strong>{' '}
              <span className="monto-clave">
                ${new Intl.NumberFormat('es-AR').format(Math.round(total * 0.85))}
              </span><br />
              <strong>Ahorrás:</strong>{' '}
              <span className="monto-clave">
                ${new Intl.NumberFormat('es-AR').format(Math.round(total * 0.15))}
              </span><br /><br />
              <span className="info-retiro">
                SE RETIRA POR DEPOSITO EN CASEROS 1041 - SALTA CAPITAL (Entre calles Islas Malvinas y Jujuy).<br />
                ESTAMOS DE LUNES A VIERNES DE 10:30 A 13:30 Y DE 17:00 A 19:00 HS - SÁBADO CERRADO.
              </span>
              <span className="beneficio-restriccion">
                ⚠️ Este beneficio es exclusivo para pedidos que se retiren a los 2 días hábiles luego del día de la transferencia.
                No aplica para compras inmediatas en el local físico.
              </span>
            </p>
          </div>

          <button
            className="enviar-whatsapp-button"
            onClick={() => setMostrarModal(true)}
          >
            📩 Solicitar revision de presupuesto
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

      <p className="leyenda-precio">
        ⚠️ Los precios exhibidos en esta web son aproximados y tienen carácter informativo.
        El precio final y stock será confirmado por el vendedor una vez revisada tu solicitud de presupuesto.
      </p>

      <p className="info-contacto">
        {`TIENDA SALTA BAZAR
DEPOSITO EN CASEROS 1041 - SALTA CAPITAL (Entre calles Islas Malvinas y Jujuy)
ESTAMOS DE LUNES A VIERNES DE 10:30 A 13:30 Y DE 17:00 A 19:00 HS - SABADO CERRADO`}
      </p>


    </div>
  );
};

export default Carrito;
