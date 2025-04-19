import React from 'react';
import { useNavigate } from 'react-router-dom';
import './BotonFlotante.css';

const BotonFlotante = () => {
  const navigate = useNavigate();

  const irAlCarrito = () => {
    navigate('/carrito');
  };

  const modalAbierto = document.body.classList.contains('modal-abierto');

  if (modalAbierto) return null;

  return (
    <div className="boton-flotante-container">
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
