import React from 'react';
import { Link } from 'react-router-dom';
import { useCarrito } from '../contexts/CarritoContext';

const CarritoLink = () => {
  const { carrito } = useCarrito();

  return (
    <Link to="/carrito" className="carrito-link">
      Ver presupuesto ({carrito.length})
    </Link>
  );
};

export default CarritoLink;
