import React, { useState } from 'react';
import './ModalContacto.css';

const ModalContacto = ({ carrito, onCerrar }) => {
  const [modo, setModo] = useState('whatsapp'); // 'whatsapp' o 'contacto'
  const [nombre, setNombre] = useState('');
  const [contacto, setContacto] = useState('');
  const [comentario, setComentario] = useState('');

  const handleEnviar = async () => {
    if (modo === 'contacto' && !contacto.trim()) {
      alert('Por favor ingresá un medio de contacto (teléfono o correo).');
      return;
    }

    const pedido = {
      fecha_pedido: new Date().toISOString(),
      cliente_tienda: 'cliente_web',
      array_pedido: JSON.stringify(carrito),
      contacto_cliente: contacto ? `${nombre} - ${contacto}` : '',
      mensaje_cliente: comentario || ''

    };

    try {
      const response = await fetch('https://tsb-backend-tienda-production.up.railway.app/api/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pedido)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Error HTTP ${response.status}`);
      }

      const idPedido = data.data.id;

      const link = `https://www.bazaronlinesalta.com.ar/verpedido?id=${idPedido}`;

      if (modo === 'whatsapp') {
        const mensaje = `Hola, quisiera solicitar un presupuesto: ${link}`;
        const telefono = '5493875537070';
        const url = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;
        window.open(url, '_blank');
      } else {
        alert('Gracias por tu mensaje. Te contactaremos a la brevedad.');
      }

      onCerrar();
    } catch (err) {
      console.error('❌ Error al guardar pedido:', err);
      alert('Ocurrió un error al guardar el pedido.');
    }
  };

  return (
    <div className="modal-contacto-overlay">
      <div className="modal-contacto-contenido">
        <button className="cerrar-modal" onClick={onCerrar}>×</button>
        <h2>¿Cómo querés enviar tu presupuesto?</h2>

        <div className="opciones-envio">
          <label>
            <input
              type="radio"
              name="modo"
              value="whatsapp"
              checked={modo === 'whatsapp'}
              onChange={() => setModo('whatsapp')}
            />{' '}
            Enviar por WhatsApp
          </label>
          <label>
            <input
              type="radio"
              name="modo"
              value="contacto"
              checked={modo === 'contacto'}
              onChange={() => setModo('contacto')}
            />{' '}
            Dejar mis datos para que me contacten
          </label>
        </div>

        {modo === 'contacto' && (
          <div className="formulario-contacto">
            <input
              type="text"
              placeholder="Nombre (opcional)"
              value={nombre}
              onChange={e => setNombre(e.target.value)}
            />
            <input
              type="text"
              placeholder="Teléfono o correo (obligatorio)"
              value={contacto}
              onChange={e => setContacto(e.target.value)}
            />
            <textarea
              placeholder="Mensaje adicional (opcional)"
              value={comentario}
              onChange={e => setComentario(e.target.value)}
            />
          </div>
        )}

        <button className="boton-enviar-modal" onClick={handleEnviar}>
          Siguiente
        </button>
      </div>
    </div>
  );
};

export default ModalContacto;