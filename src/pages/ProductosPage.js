// src/pages/ProductosPage.jsx
import React, { useEffect, useState } from "react";
import ProductList from "../components/ProductList";
import CarritoLink from "../components/CarritoLink";
import BotonFlotante from "../components/BotonFlotante";
import { useLocation, useNavigate } from "react-router-dom";
import { FaWhatsapp } from "react-icons/fa";

const ProductosPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [grcat, setGrcat] = useState("");
  const [buscar, setBuscar] = useState("");
  const [copiado, setCopiado] = useState(false);

  const clienteID = new URLSearchParams(location.search).get("clienteID");

  useEffect(() => {
    if (clienteID) localStorage.setItem("clienteID", clienteID);
  }, [clienteID]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const valorGrcat = params.get("grcat") || "";
    const q = params.get("buscar") || "";
    const nombre = params.get("nombre");

    if (!valorGrcat && !q) {
      navigate("/");
      return;
    }

    setGrcat(valorGrcat);
    setBuscar(q);

    if (nombre) {
      document.title = `Bazar - ${decodeURIComponent(nombre)}`;
    } else if (q) {
      document.title = `Bazar - Resultados para "${q}"`;
    } else {
      document.title = "Bazar - Productos";
    }
  }, [location, navigate]);
  const linkCategoria = (() => {
    const valor = (buscar || grcat || "").trim();
    if (!valor) return "";
    const base = window.location.origin;
    return `${base}/productos?buscar=${encodeURIComponent(valor)}`;
  })();

  const copiarAlPortapapeles = async () => {
    if (!linkCategoria) return;

    try {
      await navigator.clipboard.writeText(linkCategoria);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch (e) {
      console.error("Error al copiar:", e);
    }
  };

  if (!grcat && !buscar) {
    return (
      <div className="p-6 text-gray-700 text-lg">Cargando productos...</div>
    );
  }

  return (
    <div className="App">
      {/* HEADER */}
      <header className="w-full text-center py-5 bg-white/20 backdrop-blur border-b border-white/30 shadow-sm">

        {/* TÍTULO */}
        <h1 className="text-3xl font-extrabold text-white tracking-wide drop-shadow mb-4">
          TIENDA SALTA BAZAR
        </h1>

        {/* BOTONES CENTRADOS EN LA MISMA FILA */}
        <div className="flex justify-center items-center gap-4 mb-2">

          <button
            className="px-5 py-2 bg-blue-500 text-white font-semibold rounded-full shadow hover:bg-blue-600 transition text-sm"
            onClick={() => navigate("/")}
          >
            ← Categorías
          </button>

          <div>
            <CarritoLink />
          </div>

        </div>

      </header>




      {/* INSTRUCTIVO */}
      <div className="max-w-2xl mx-auto mt-4 bg-white/40 border border-white/50 backdrop-blur-xl rounded-xl shadow p-4">
        <h3 className="text-center text-gray-800 font-semibold text-base mb-2">
          🛒 <strong>Hasta 20% de DESCUENTO</strong> según volumen de compra y distancia.
        </h3>

        <ol className="space-y-2 text-gray-900">
          <li>
            <strong>Elegí tus productos</strong>
            <p>Buscá por categoría o palabra y agregá al carrito lo que necesites.</p>
          </li>
          <li>
            <strong>Revisá tu pedido</strong>
            <p>Entrá a “Ver tu pedido” para confirmar cantidades y ver el total.</p>
          </li>
          <li>
            <strong>Enviá tu solicitud</strong>
            <p>
              Te enviaremos el presupuesto por WhatsApp. Luego confirmás o no el pedido.
            </p>
          </li>
        </ol>
        {linkCategoria && (
          <div className="text-center mt-4">
            <button
              onClick={copiarAlPortapapeles}
              className="px-5 py-2 bg-blue-500 text-white rounded-full shadow hover:bg-blue-600 transition font-semibold"
            >
              🔗 Copiar link de categoría
            </button>

            {copiado && (
              <p className="text-green-600 mt-2 font-semibold">
                ✓ Link copiado al portapapeles
              </p>
            )}
          </div>
        )}
      </div>

      {/* LISTA DE PRODUCTOS */}
      <ProductList grcat={grcat} buscar={buscar} />

      {/* BOTONES FLOTANTES */}
      <BotonFlotante />
      {/* FOOTER */}
      <footer className="text-center text-white py-10 mt-10">
        <a
          href="https://wa.me/5493875537070"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mb-4 px-6 py-3 bg-green-500 rounded-full font-semibold shadow hover:bg-green-600 transition"
        >
          📲 Contactar por WhatsApp
        </a>

        <p className="flex justify-center items-center gap-2 text-white">
          <FaWhatsapp className="text-green-400 text-xl" />
          <a
            href="https://wa.me/5493875537070"
            className="underline font-bold"
          >
            3875537070
          </a>
        </p>

        <p className="mt-4 opacity-90">Todos los derechos reservados © 2025</p>
        <p className="opacity-80 text-sm">Desarrollado por Tienda Salta Bazar</p>
      </footer>
    </div>
  );
};

export default ProductosPage;

