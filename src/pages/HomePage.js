import React from "react";
import Categorias from "../components/Categorias";
import CarritoLink from "../components/CarritoLink";
import { FaWhatsapp } from "react-icons/fa";

const HomePage = () => {
  const manejarSeleccionCategoria = (grcat) => {
    const clienteID = localStorage.getItem("clienteID") || "";
    const url =
      `/productos?buscar=${encodeURIComponent(grcat)}` +
      (clienteID ? `&clienteID=${encodeURIComponent(clienteID)}` : "");
    window.open(url, "_blank");
  };

  return (
    <div className="min-h-screen flex flex-col">

      {/* ===== HEADER ELEGANTE ===== */}
      <header className="py-10 px-4 text-center">
        <h1 className="text-4xl font-extrabold text-white drop-shadow-lg tracking-wide">
          TIENDA SALTA BAZAR
        </h1>

        <p className="mt-4 text-white text-xl font-semibold max-w-3xl mx-auto leading-snug drop-shadow">
          <strong className="text-yellow-300">HOLA! Gracias por visitar la web</strong>{" "}
          Somos de Salta Capital y hacemos envíos a domicilio. Trabajamos 100% Online. Consultanos por chat de WhatsApp. (Zona centro, norte, sur, San Lorenzo, San Lorenzo Chico...)
        </p>

        <div className="mt-6 flex justify-center">
          <CarritoLink />
        </div>
      </header>

      {/* ===== CONTENIDO CENTRAL (Diseño desktop) ===== */}
      <main className="flex-grow flex justify-center px-4">
        <div className="w-full max-w-4xl bg-white/60 backdrop-blur-md shadow-xl rounded-2xl p-6 mt-4">
          <Categorias onSeleccionarCategoria={manejarSeleccionCategoria} />
        </div>
      </main>

      {/* ===== FOOTER ===== */}
      <footer className="bg-blue-900 text-white text-center py-10 mt-10">
        <p className="text-sm opacity-90">Todos los derechos reservados © 2026</p>
        <p className="text-sm opacity-90">Desarrollado por: Tienda Salta Bazar</p>
        <p className="text-sm opacity-90">Dirección: Caseros 1041 (Administración), Salta Capital</p>

        <p className="mt-4 flex justify-center items-center gap-2 text-lg">
          <FaWhatsapp className="text-green-400 text-xl" />
          <a
            href="https://wa.me/5493875537070"
            target="_blank"
            rel="noopener noreferrer"
            className="underline font-bold"
          >
            3875537070
          </a>
        </p>

        <a
          href="https://wa.me/5493875537070"
          target="_blank"
          rel="noopener noreferrer"
          className="
            inline-block mt-4 px-6 py-3
            bg-green-500 text-white
            rounded-full font-bold text-lg
            shadow-lg hover:bg-green-600 transition
          "
        >
          📲 Contactar por WhatsApp
        </a>
      </footer>
    </div>
  );
};

export default HomePage;
