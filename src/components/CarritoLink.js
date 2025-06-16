import React from 'react';
import { Link } from 'react-router-dom';
import { useCarrito } from '../contexts/CarritoContext';

const CarritoLink = () => {
  const { carrito } = useCarrito();

  return (
    <Link to="/carrito" className="carrito-link">
      Ver tu pedido ({carrito.length})
    </Link>
  );
};

export default CarritoLink;
