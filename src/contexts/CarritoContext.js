
import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

const CarritoContext = createContext();
export const useCarrito = () => useContext(CarritoContext);

export const CarritoProvider = ({ children }) => {
  const [carrito, setCarrito] = useState([]);
  const [clienteID, setClienteID] = useState(null);
  const [pedidoID, setPedidoID] = useState(null);
  const [carritoCargado, setCarritoCargado] = useState(false);

  const API_URL = 'http://localhost:5000'; // Cambiar si está en producción

  // ✅ 1. Crear clienteID y pedidoID si no existen
  useEffect(() => {
  const idLocal = localStorage.getItem('clienteID');
  const idPedidoStorage = localStorage.getItem('pedidoID');

  let nuevoClienteID = idLocal;
  if (!idLocal) {
    nuevoClienteID = uuidv4();
    localStorage.setItem('clienteID', nuevoClienteID);
  }
  setClienteID(nuevoClienteID);

  const verificarOPedidoExistente = async () => {
    let idPedidoValido = null;

    // Verificar si el pedidoID guardado en localStorage realmente existe
    if (idPedidoStorage) {
      try {
        const res = await fetch(`${API_URL}/api/pedidos/${idPedidoStorage}`);
        const data = await res.json();
        if (res.ok && data?.array_pedido) {
          idPedidoValido = idPedidoStorage;
        } else {
          localStorage.removeItem('pedidoID');
        }
      } catch (error) {
        console.error('Error verificando pedido existente:', error);
        localStorage.removeItem('pedidoID');
      }
    }

    // Si no existe o no era válido, crear uno nuevo
    if (!idPedidoValido) {
      try {
        const res = await fetch(`${API_URL}/api/pedidos/cliente/${nuevoClienteID}`);
        const data = await res.json();

        if (data?.id) {
          localStorage.setItem('pedidoID', data.id);
          setPedidoID(data.id);
          return;
        }

        // Si no hay pedido para este cliente, crear uno nuevo
        const nuevoPedido = {
          cliente_tienda: nuevoClienteID,
          array_pedido: JSON.stringify([]),
          fecha_pedido: new Date().toISOString(),
          contacto_cliente: '',
          mensaje_cliente: '',
        };

        const crearRes = await fetch(`${API_URL}/api/pedidos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(nuevoPedido),
        });

        const crearData = await crearRes.json();
        if (crearData?.data?.id) {
          localStorage.setItem('pedidoID', crearData.data.id);
          setPedidoID(crearData.data.id);
        }

      } catch (error) {
        console.error('Error al crear nuevo pedido:', error);
      }
    } else {
      setPedidoID(idPedidoValido);
    }
  };

  verificarOPedidoExistente();
}, []);



  // ✅ 2. Recuperar carrito desde Supabase al iniciar
  useEffect(() => {
    const recuperarCarritoDesdeBD = async () => {
      if (!pedidoID) return;

      try {
        const res = await fetch(`${API_URL}/api/pedidos/${pedidoID}`);
        if (res.ok) {
          const data = await res.json();
          if (data?.array_pedido) {
            const carritoRecuperado = JSON.parse(data.array_pedido);
            setCarrito(carritoRecuperado);
            setCarritoCargado(true);
          }
        }
      } catch (error) {
        console.error('❌ Error al recuperar carrito desde Supabase:', error);
      }
    };

    recuperarCarritoDesdeBD();
  }, [pedidoID]);

  // ✅ 3. Al modificar carrito, actualizar en la base de datos
  useEffect(() => {
    if (!pedidoID || !carritoCargado) return;

    fetch(`${API_URL}/api/pedidos/${pedidoID}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        array_pedido: JSON.stringify(carrito),
      }),
    });
  }, [carrito, pedidoID, carritoCargado]);

  const calcularPrecio = (producto) => {
    if (isNaN(producto.costosiniva)) return 0;
    return Math.round(
      (producto.costosiniva * (1 + producto.iva / 100) * (1 + producto.margen / 100)) / 100
    ) * 100;
  };

  const agregarAlCarrito = (producto, cantidad = 1) => {
    setCarrito((prev) => {
      const existente = prev.find((item) => item.codigo_int === producto.codigo_int);
      if (existente) {
        const nuevaCantidad = existente.cantidad + cantidad;
        if (nuevaCantidad <= 0) {
          return prev.filter((item) => item.codigo_int !== producto.codigo_int);
        }
        return prev.map((item) =>
          item.codigo_int === producto.codigo_int
            ? { ...item, cantidad: nuevaCantidad }
            : item
        );
      } else {
        return [
          ...prev,
          {
            ...producto,
            price: calcularPrecio(producto),
            cantidad,
          },
        ];
      }
    });
  };

  const cambiarCantidad = (codigo_int, nuevaCantidad) => {
    setCarrito((prev) =>
      nuevaCantidad <= 0
        ? prev.filter((item) => item.codigo_int !== codigo_int)
        : prev.map((item) =>
          item.codigo_int === codigo_int
            ? { ...item, cantidad: nuevaCantidad }
            : item
        )
    );
  };

  const eliminarDelCarrito = (index) => {
    setCarrito((prev) => prev.filter((_, i) => i !== index));
  };

  const reemplazarCarrito = (nuevoCarrito) => {
    setCarrito(nuevoCarrito);
  };

  const finalizarCompra = async () => {
    try {
      const response = await fetch(`${API_URL}/api/finalizar-compra`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          carrito: carrito.map((item) => ({
            id: Number(item.id),
            cantidad: item.cantidad || 1,
          })),
          clienteID,
        }),
      });

      if (response.ok) {
        alert('Compra guardada en la base de datos');
        setCarrito([]);
        localStorage.removeItem('carrito');
      } else {
        alert('Error al guardar el carrito.');
      }
    } catch (error) {
      console.error('Error al finalizar compra:', error);
      alert('No se pudo conectar con el servidor');
    }
  };

  return (
    <CarritoContext.Provider
      value={{
        carrito,
        clienteID,
        pedidoID,
        setCarrito,
        agregarAlCarrito,
        cambiarCantidad,
        reemplazarCarrito,
        eliminarDelCarrito,
        finalizarCompra,
      }}
    >
      {children}
    </CarritoContext.Provider>
  );
};
