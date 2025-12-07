import React, { useState } from "react";
import { useCarrito } from "../contexts/CarritoContext";

const ModalContacto = ({ carrito, onCerrar }) => {
  const [modo, setModo] = useState("whatsapp");
  const [nombre, setNombre] = useState("");
  const [contacto, setContacto] = useState("");
  const [comentario, setComentario] = useState("");
  const { pedidoID } = useCarrito();

  const handleEnviar = async () => {
    if (modo === "contacto" && !contacto.trim()) {
      alert("Por favor ingresá un medio de contacto (teléfono o correo).");
      return;
    }

    if (!pedidoID) {
      alert("No se pudo identificar el pedido. Intentalo de nuevo más tarde.");
      return;
    }

    if (modo === "contacto") {
      try {
        await fetch(
          `https://tsb-backend-tienda-production.up.railway.app/api/pedidos/${pedidoID}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              nombre_cliente: nombre.trim() || null,
              contacto_cliente: contacto.trim() || null,
              mensaje_cliente: comentario.trim() || null,
            }),
          }
        );
      } catch (err) {
        console.error("❌ Error al actualizar datos de contacto:", err);
        alert("No se pudo guardar tu mensaje, pero el pedido sigue registrado.");
      }

      alert("Gracias por tu mensaje. Te contactaremos a la brevedad.");
      onCerrar();
      return;
    }

    // MODO WHATSAPP
    const link = `https://www.bazaronlinesalta.com.ar/carrito?id=${pedidoID}`;
    const mensaje = `Hola, quisiera solicitar un presupuesto: ${link}`;
    const telefono = "5493875537070";
    const url = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, "_blank");

    onCerrar();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[9999]">
      <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-md w-[90%] relative">

        {/* BOTÓN CERRAR */}
        <button
          onClick={onCerrar}
          className="absolute top-3 right-4 text-gray-500 text-3xl hover:text-gray-700"
        >
          ×
        </button>

        <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">
          ¿Cómo querés enviar tu nota de pedido?
        </h2>

        {/* OPCIONES */}
        <div className="flex flex-col gap-2 mb-4 text-gray-700">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="modo"
              value="whatsapp"
              checked={modo === "whatsapp"}
              onChange={() => setModo("whatsapp")}
              className="w-4 h-4"
            />
            Enviar por WhatsApp
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="modo"
              value="contacto"
              checked={modo === "contacto"}
              onChange={() => setModo("contacto")}
              className="w-4 h-4"
            />
            Quisiera que me contacten
          </label>
        </div>

        {/* FORM CONTACTO */}
        {modo === "contacto" && (
          <div className="flex flex-col gap-3 mb-4">
            <input
              type="text"
              placeholder="Nombre (opcional)"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full p-2 border rounded-lg text-gray-800"
            />

            <input
              type="text"
              placeholder="Teléfono o correo (obligatorio)"
              value={contacto}
              onChange={(e) => setContacto(e.target.value)}
              className="w-full p-2 border rounded-lg text-gray-800"
            />

            <textarea
              placeholder="Mensaje adicional (opcional)"
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              className="w-full p-2 border rounded-lg text-gray-800 min-h-[90px] resize-y"
            />
          </div>
        )}

        {/* BOTÓN PRINCIPAL */}
        <button
          onClick={handleEnviar}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md active:scale-95 transition"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
};

export default ModalContacto;


