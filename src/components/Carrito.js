import React, { useState } from 'react';
import './Carrito.css';
import { useCarrito } from '../contexts/CarritoContext';
import { Link } from 'react-router-dom';
import ModalContacto from './ModalContacto';

const Carrito = () => {
  const { carrito, setCarrito, eliminarDelCarrito } = useCarrito();
  const [mostrarModal, setMostrarModal] = useState(false);


  const cambiarCantidad = (index, nuevaCantidad) => {
    if (nuevaCantidad < 1) return;

    const nuevoCarrito = [...carrito];
    nuevoCarrito[index] = {
      ...nuevoCarrito[index],
      cantidad: parseInt(nuevaCantidad),
    };

    setCarrito(nuevoCarrito);
  };

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
                      onClick={() => cambiarCantidad(index, item.cantidad - 1)}
                    >
                      –
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={item.cantidad || 1}
                      onChange={(e) => cambiarCantidad(index, e.target.value)}
                      className="cantidad-input"
                    />
                    <button
                      type="button"
                      className="btn-cantidad"
                      onClick={() => cambiarCantidad(index, item.cantidad + 1)}
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
          <div className="carrito-total">
            Total: ${new Intl.NumberFormat('es-AR').format(total)}
          </div>
  
          <button
            className="enviar-whatsapp-button"
            onClick={() => setMostrarModal(true)}
          >
            📩 Solicitar presupuesto
          </button>
        </div>
      )}
  
      {/* 🔵 Modal fuera del resumen */}
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
        El precio final será confirmado por el vendedor una vez revisada tu solicitud de presupuesto.
      </p>
    </div>
  );
  
};

export default Carrito;
