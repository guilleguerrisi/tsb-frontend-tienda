import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './BotonFlotante.css';

const BotonFlotante = () => {
  const navigate = useNavigate();
  const [mostrar, setMostrar] = useState(true);
  let ultimaPosicion = 0;

  const irAlCarrito = () => {
    navigate('/carrito');
  };

  const modalAbierto = document.body.classList.contains('modal-abierto');
  if (modalAbierto) return null;

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setMostrar(scrollY < ultimaPosicion || scrollY < 10);
      ultimaPosicion = scrollY;
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className={`boton-flotante-container ${mostrar ? 'visible' : 'oculto'}`}>
      <button className="flotante-boton secundaria" onClick={() => navigate('/')}>
        ← Categorías
      </button>
      <button className="flotante-boton primaria" onClick={irAlCarrito}>
        Ver presupuesto
      </button>
    </div>
  );
};

export default BotonFlotante;
