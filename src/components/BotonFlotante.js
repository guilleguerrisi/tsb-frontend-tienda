import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

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
      setModalAbierto(document.body.classList.contains("modal-abierto"));
    };

    window.addEventListener("scroll", handleScroll);
    const observer = new MutationObserver(checkModal);
    observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });

    checkModal();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      observer.disconnect();
    };
  }, []);

  if (modalAbierto) return null;

  return (
   <div
  className={`
    fixed bottom-6 left-1/2 -translate-x-1/2 
    flex gap-4 w-full justify-center z-[1000]
    px-6   /* agrega margen lateral */
    transition-all duration-300
    ${mostrar ? "opacity-100 visible" : "opacity-0 invisible"}
  `}
>
  {/* Botón Categorías */}
  <button
    onClick={() => navigate("/")}
    className="
      flex-1 max-w-[140px] px-4 py-2.5
      rounded-full font-bold text-white text-base
      bg-blue-500 hover:bg-blue-600 
      shadow-lg active:scale-95 transition-transform
    "
  >
    ← Categorías
  </button>

  {/* Botón Ver tu pedido */}
  <button
    onClick={() => {
      const pedidoID = localStorage.getItem('pedidoID');
      navigate(`/carrito${pedidoID ? `?id=${pedidoID}` : ""}`);
    }}
    className="
      flex-1 max-w-[140px] px-4 py-2.5
      rounded-full font-bold text-white text-base
      bg-orange-500 hover:bg-orange-600
      shadow-lg active:scale-95 transition-transform
    "
  >
    Ver tu pedido
  </button>
</div>

  );
};

export default BotonFlotante;
