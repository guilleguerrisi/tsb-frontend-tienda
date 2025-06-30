import React, { useState } from 'react';
import './ModalContacto.css';
import { useCarrito } from '../contexts/CarritoContext';

const ModalContacto = ({ carrito, onCerrar }) => {
  const [modo, setModo] = useState('whatsapp'); // 'whatsapp' o 'contacto'
  const [nombre, setNombre] = useState('');
  const [contacto, setContacto] = useState('');
  const [comentario, setComentario] = useState('');
  const { pedidoID } = useCarrito();

  const handleEnviar = async () => {
    if (modo === 'contacto' && !contacto.trim()) {
      alert('Por favor ingresá un medio de contacto (teléfono o correo).');
      return;
    }

    if (!pedidoID) {
      alert('No se pudo identificar el pedido. Intentalo de nuevo más tarde.');
      return;
    }

    const link = `https://www.bazaronlinesalta.com.ar/carrito?id=${pedidoID}`;

    if (modo === 'whatsapp') {
      const mensaje = `Hola, quisiera solicitar un presupuesto: ${link}`;
      const telefono = '5493875537070';
      const url = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;
      window.open(url, '_blank');
    } else {
      alert('Gracias por tu mensaje. Te contactaremos a la brevedad.');
      // (opcional) acá podrías enviar una notificación interna si lo deseas
    }

    onCerrar();
  };

  return (
    <div className="modal-contacto-overlay">
      <div className="modal-contacto-contenido">
        <button className="cerrar-modal" onClick={onCerrar}>×</button>
        <h2>¿Cómo querés enviar tu nota de pedido?</h2>

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
            Quisiera que me contacten
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
