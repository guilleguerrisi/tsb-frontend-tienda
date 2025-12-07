// src/components/Categorias.js
import React, { useEffect, useState, useRef, useCallback } from 'react';
import config from '../config';

const Categorias = ({ onSeleccionarCategoria }) => {
  const [rubros, setRubros] = useState([]);
  const [rubroSeleccionado, setRubroSeleccionado] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const inputRef = useRef(null);

  const imagenesRubros = {
    "BAZAR GASTRONÓMICO":
      "https://lh3.googleusercontent.com/pw/AP1GczMdqFM0vrEMCfMaVwacHVUbQ1lFLpaNo8paLXNMw_8gRiKxPDgBcadOPq7sluuqWfkZVmbBtpLhYcVvnLr_XaZa8MBaxqPo647XNcWF--7tgi7EtoHIZYSrcrqFW1PetCXVWXu0LAQyiqL464tPaTvv=w950-h950-s-no-gm?authuser=1",

    "ARTÍSTICA Y DECORACIÓN":
      "https://lh3.googleusercontent.com/pw/AP1GczNYXO49IWHr7dM6Z_Yfm73d6nBbl7ral20-yoRiEPMf7YGaiS1q4IOXlI656YEE8_yP9sn7KLH3LzAIbktx4DXzXdprCjY-f7Vv920l-2HlbN2aizxYfsEquldf0dKvV2g0Ckwqh9p8pDlpOBUBGTq8=w950-h950-s-no-gm?authuser=1",

    "INSTRUMENTOS MUSICALES Y SONIDO":
      "https://lh3.googleusercontent.com/pw/AP1GczPRpvNofEMu3iei_K7SN-br-DQpe7EVHqT5UAHq7VyA0mLa557JFEwSxhNM-a6fvuQBNNeS47_JG65j6mB8ky_Ni3iBFIQshpR6nsh2GMzkofH0rQAcbY5Cjo1IVtI_X3XYTS29Z9uA_xvQRIPis6H9=w950-h950-s-no-gm?authuser=1",
  };

  const cargarRubros = useCallback(async () => {
    try {
      const res = await fetch(`${config.API_URL}/api/rubros`);
      const data = await res.json();
      setRubros(data || []);
    } catch (e) {
      setRubros([]);
    }
  }, []);

  const cargarTodas = useCallback(async () => {
    try {
      const res = await fetch(`${config.API_URL}/api/categorias`);
      const data = await res.json();
      setCategorias(data || []);
    } catch (e) {
      setCategorias([]);
    }
  }, []);

  const buscarCategorias = useCallback(async (texto) => {
    try {
      const res = await fetch(
        `${config.API_URL}/api/buscar-categorias?palabra=${encodeURIComponent(texto)}`
      );
      const data = await res.json();
      setCategorias(data || []);
    } catch {
      setCategorias([]);
    }
  }, []);

  useEffect(() => {
    cargarRubros();
    cargarTodas();
  }, [cargarRubros, cargarTodas]);

  useEffect(() => {
    if (!busqueda.trim()) {
      cargarTodas();
    } else {
      setRubroSeleccionado(null);
      buscarCategorias(busqueda);
    }
  }, [busqueda, cargarTodas, buscarCategorias]);

  const handleSubmitBusqueda = (e) => {
    e.preventDefault();
    if (!busqueda.trim()) return;

    const clienteID = localStorage.getItem("clienteID") || "";
    const url =
      `/productos?buscar=${encodeURIComponent(busqueda)}` +
      (clienteID ? `&clienteID=${clienteID}` : "");

    window.open(url, "_blank");
  };

  return (
    <div className="flex flex-col items-center gap-4 bg-white/40 backdrop-blur-md p-6 rounded-xl max-w-lg mx-auto shadow-md">

      {/* 🔍 BUSCADOR */}
      <form
        onSubmit={handleSubmitBusqueda}
        className="flex gap-3 w-full"
      >
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            placeholder="🔎 Buscar producto o marca…"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full px-4 py-3 rounded-full border border-gray-300 shadow-sm text-gray-800 focus:ring-2 focus:ring-blue-400 outline-none pr-10"
          />

          {busqueda && (
            <button
              type="button"
              onClick={() => {
                setBusqueda("");
                setTimeout(() => inputRef.current?.focus(), 0);
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl"
            >
              ✕
            </button>
          )}
        </div>

        <button
          type="submit"
          className="px-5 py-3 rounded-full bg-blue-600 text-white font-semibold shadow hover:bg-blue-700"
        >
          Buscar
        </button>
      </form>
      {/* =============================================
          🔍 RESULTADOS DE BÚSQUEDA
      ============================================= */}
      {busqueda.trim() !== "" ? (
        categorias.length === 0 ? (
          <div className="mt-4 text-center text-gray-800 p-4">
            <p className="text-lg mb-3">❌ No hemos encontrado el producto.</p>

            <a
              href={`https://wa.me/5493875537070?text=${encodeURIComponent(
                `Hola, no encontré "${busqueda}" en la página, ¿podrían ayudarme?`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-green-500 text-white px-6 py-3 rounded-full font-semibold shadow hover:bg-green-600"
            >
              📲 Consultar por WhatsApp
            </a>
          </div>
        ) : (
          categorias.map((cat, index) => {
            const clienteID = localStorage.getItem("clienteID") || "";
            const url =
              `/productos?buscar=${encodeURIComponent(cat.grcat)}` +
              (clienteID ? `&clienteID=${clienteID}` : "") +
              `&nombre=${encodeURIComponent(cat.grandescategorias)}`;

            return (
              <a
                key={cat?.id || index}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center gap-4 bg-white border-2 border-blue-400 text-blue-600 p-4 rounded-2xl shadow hover:bg-blue-600 hover:text-white transition font-semibold"
              >
                {cat.imagen_url && (
                  <img
                    src={cat.imagen_url}
                    alt={cat.grandescategorias}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                )}

                <span className="text-lg">
                  {cat.grandescategorias}
                </span>
              </a>
            );
          })
        )
      ) : (
        <>
          {/* =============================================
              🧩 LISTA DE RUBROS PRINCIPALES
          ============================================= */}
          {!rubroSeleccionado &&
            rubros.map((rubro, index) => (
              <button
                key={index}
                onClick={() => setRubroSeleccionado(rubro)}
                className="w-full flex items-center gap-4 bg-white border-2 border-blue-400 text-blue-600 p-4 rounded-2xl shadow hover:bg-blue-600 hover:text-white transition font-semibold"
              >
                {imagenesRubros[rubro] && (
                  <img
                    src={imagenesRubros[rubro]}
                    alt={rubro}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                )}

                {rubro.toUpperCase()}
              </button>
            ))}

          {/* =============================================
              📁 SUBCATEGORÍAS DEL RUBRO SELECCIONADO
          ============================================= */}
          {rubroSeleccionado && (
            <>
              {/* 🔙 BOTÓN VOLVER */}
              <button
                onClick={() => setRubroSeleccionado(null)}
                className="w-full bg-gray-700 text-white p-3 rounded-2xl shadow font-semibold hover:bg-gray-800"
              >
                ← VOLVER
              </button>

              {categorias
                .filter((cat) => (cat.rubros || "").trim() === rubroSeleccionado)
                .map((cat, index) => {
                  const clienteID = localStorage.getItem("clienteID") || "";
                  const url =
                    `/productos?buscar=${encodeURIComponent(cat.grcat)}` +
                    (clienteID ? `&clienteID=${clienteID}` : "") +
                    `&nombre=${encodeURIComponent(cat.grandescategorias)}`;

                  return (
                    <a
                      key={cat?.id || index}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center gap-4 bg-white border-2 border-blue-400 text-blue-600 p-4 rounded-2xl shadow hover:bg-blue-600 hover:text-white transition font-semibold"
                    >
                      {cat.imagen_url && (
                        <img
                          src={cat.imagen_url}
                          alt={cat.grandescategorias}
                          className="w-20 h-20 rounded-lg object-cover"
                        />
                      )}

                      <span className="text-lg">
                        {cat.grandescategorias}
                      </span>
                    </a>
                  );
                })}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Categorias;



