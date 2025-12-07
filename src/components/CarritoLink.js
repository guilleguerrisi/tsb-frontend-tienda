import React from "react";
import { Link } from "react-router-dom";
import { useCarrito } from "../contexts/CarritoContext";

const CarritoLink = () => {
  const { carrito, pedidoID } = useCarrito();

  const totalItems = carrito.reduce((acc, p) => acc + p.cantidad, 0);

  return (
    <Link
      to={`/carrito${pedidoID ? `?id=${pedidoID}` : ""}`}
      className="
        inline-block
        px-4 py-2
        rounded-full
        font-semibold text-white text-sm
        bg-orange-500 hover:bg-orange-600
        shadow-md active:scale-95 transition
      "
    >
      Ver tu pedido ({totalItems})
    </Link>
  );
};

export default CarritoLink;
