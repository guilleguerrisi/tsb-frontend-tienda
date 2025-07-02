import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './BotonFlotante.css';

const BotonFlotante = () => {
  const navigate = useNavigate();
  const [mostrar, setMostrar] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const ultimaPosicion = React.useRef(0);


  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setMostrar(scrollY < ultimaPosicion.current || scrollY < 10);
      ultimaPosicion.current = scrollY;

    };

    const checkModal = () => {
      setModalAbierto(document.body.classList.contains('modal-abierto'));
    };

    window.addEventListener('scroll', handleScroll);
    const observer = new MutationObserver(checkModal);
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

    checkModal();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, []);

  if (modalAbierto) return null;

  return (
    <div className={`boton-flotante-container ${mostrar ? 'visible' : 'oculto'}`}>
      <button className="flotante-boton secundaria" onClick={() => navigate('/')}>
        ← Categorías
      </button>
      <button
        className="flotante-boton primaria"
        onClick={() => {
          const pedidoID = localStorage.getItem('pedidoID');
          navigate(`/carrito${pedidoID ? `?id=${pedidoID}` : ''}`);
        }}
      >
        Ver tu pedido
      </button>
    </div>
  );

};

export default BotonFlotante;
