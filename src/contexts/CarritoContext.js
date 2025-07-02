import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';



const CarritoContext = createContext();


export const useCarrito = () => useContext(CarritoContext);

const API_URL =
  window.location.hostname === 'localhost'
    ? 'http://localhost:5000'
    : 'https://tsb-backend-tienda-production.up.railway.app';


export const CarritoProvider = ({ children }) => {
  const [carrito, setCarrito] = useState([]);
  const [clienteID, setClienteID] = useState(null);
  const [pedidoID, setPedidoID] = useState(null);
  const [carritoCargado, setCarritoCargado] = useState(false);
  const [carritoEditadoManualmente, setCarritoEditadoManualmente] = useState(() => {
    return localStorage.getItem('carritoEditadoManualmente') === 'true';
  });



  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const clienteIDParam = urlParams.get('clienteID');
    const idLocal = localStorage.getItem('clienteID');
    const idPedidoStorage = localStorage.getItem('pedidoID');

    let nuevoClienteID = clienteIDParam || idLocal;

    if (!nuevoClienteID) {
      nuevoClienteID = uuidv4();
    }

    localStorage.setItem('clienteID', nuevoClienteID);
    setClienteID(nuevoClienteID);

    if (idPedidoStorage) {
      fetch(`${API_URL}/api/pedidos/${idPedidoStorage}`)
        .then(res => res.json())
        .then(data => {
          if (data?.array_pedido) {
            setPedidoID(idPedidoStorage);
          } else {
            localStorage.removeItem('pedidoID');
          }
        })
        .catch(() => {
          localStorage.removeItem('pedidoID');
        });
    }
  }, []);

  const cantidadEnCarrito = carrito?.length || 0;

  useEffect(() => {
    if (!pedidoID) return;

    const carritoGuardadoManualmente = localStorage.getItem('carritoEditadoManualmente') === 'true';

    if (carritoGuardadoManualmente && cantidadEnCarrito > 0) return;

    const recuperarCarritoDesdeBD = async () => {
      try {
        const res = await fetch(`${API_URL}/api/pedidos/${pedidoID}`);
        if (res.ok) {
          const data = await res.json();
          if (data?.array_pedido) {
            const carritoRecuperado = JSON.parse(data.array_pedido || '[]');
            setCarrito(Array.isArray(carritoRecuperado) ? carritoRecuperado : []);
            setCarritoCargado(true);
          }
        }
      } catch (error) {
        console.error('❌ Error al recuperar carrito:', error);
      }
    };

    recuperarCarritoDesdeBD();
  }, [pedidoID, cantidadEnCarrito]);





  useEffect(() => {
    if (!pedidoID || !carritoCargado) return;

    const delaySync = setTimeout(() => {
      fetch(`${API_URL}/api/pedidos/${pedidoID}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          array_pedido: JSON.stringify(carrito),
        }),
      });
    }, 600); // espera 600ms antes de sincronizar

    return () => clearTimeout(delaySync); // cancela si se vuelve a disparar antes de tiempo
  }, [carrito, pedidoID, carritoCargado]);


  useEffect(() => {
    const sincronizarAlVolver = async () => {
      const estaEnCarrito = window.location.pathname.includes('/carrito');
      if (document.visibilityState === 'visible' && pedidoID && !estaEnCarrito) {
        try {
          const res = await fetch(`${API_URL}/api/pedidos/${pedidoID}`);
          if (!res.ok) return;

          const data = await res.json();
          const carritoBackend = JSON.parse(data.array_pedido || '[]');

          const carritoActualString = JSON.stringify(carrito);
          const carritoBackendString = JSON.stringify(carritoBackend);

          const hayDiferencias = carritoBackendString !== carritoActualString;

          if (hayDiferencias && !carritoEditadoManualmente) {
            setCarrito(Array.isArray(carritoBackend) ? carritoBackend : []);
          }
        } catch (error) {
          console.error('🔄 Error al actualizar carrito:', error);
        }
      }
    };

    document.addEventListener('visibilitychange', sincronizarAlVolver);
    return () => {
      document.removeEventListener('visibilitychange', sincronizarAlVolver);
    };
  }, [pedidoID, carrito, carritoEditadoManualmente]);







  const calcularPrecio = (producto) => {
    if (isNaN(producto.costosiniva)) return 0;
    return Math.round(
      (producto.costosiniva * (1 + producto.iva / 100) * (1 + producto.margen / 100)) / 100
    ) * 100;
  };

  const crearPedidoEnBackend = async () => {
    if (!clienteID) return null;

    try {
      const buscarRes = await fetch(`${API_URL}/api/pedidos/cliente/${clienteID}`);
      const buscarData = await buscarRes.json();

      if (buscarData?.id) {
        localStorage.setItem('pedidoID', buscarData.id);
        setPedidoID(buscarData.id);
        return buscarData.id;
      }

      const nuevoPedido = {
        cliente_tienda: clienteID,
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
        return crearData.data.id;
      }

      return null;
    } catch (error) {
      console.error('❌ Error al crear pedido:', error);
      return null;
    }
  };

  const agregarAlCarrito = async (producto, cantidad = 1) => {
    if (!clienteID) {
      console.warn('⏳ Esperando clienteID...');
      return;
    }

    let idPedido = pedidoID;
    if (!idPedido) {
      idPedido = await crearPedidoEnBackend();
      if (!idPedido) return;
    }

    try {
      let carritoActual = [];

      // Solo hacemos fetch si el carrito no fue editado manualmente
      if (!carritoEditadoManualmente) {
        const res = await fetch(`${API_URL}/api/pedidos/${idPedido}`);
        const data = await res.json();

        try {
          carritoActual = Array.isArray(data?.array_pedido)
            ? data.array_pedido
            : JSON.parse(data.array_pedido || '[]');
        } catch (e) {
          carritoActual = [];
        }
      } else {
        carritoActual = [...carrito];
      }

      const index = carritoActual.findIndex(p => p.codigo_int === producto.codigo_int);

      if (index !== -1) {
        carritoActual[index].cantidad += cantidad;
        if (carritoActual[index].cantidad <= 0) {
          carritoActual.splice(index, 1);
        }
      } else if (cantidad > 0) {
        carritoActual.push({
          ...producto,
          price: calcularPrecio(producto),
          cantidad,
        });
      }

      await fetch(`${API_URL}/api/pedidos/${idPedido}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ array_pedido: JSON.stringify(carritoActual) }),
      });

      setCarrito(carritoActual);
      setCarritoEditadoManualmente(true);
      localStorage.setItem('carritoEditadoManualmente', 'true');

    } catch (err) {
      console.error('❌ Error sincronizando carrito:', err);
    }
  };


  const cambiarCantidad = (codigo_int, nuevaCantidad) => {
    setCarrito((prev) => {
      const nuevo = nuevaCantidad <= 0
        ? prev.filter((item) => item.codigo_int !== codigo_int)
        : prev.map((item) =>
          item.codigo_int === codigo_int
            ? { ...item, cantidad: nuevaCantidad }
            : item
        );
      setCarritoEditadoManualmente(true);

      return nuevo;
    });
  };

  const eliminarDelCarrito = (producto) => {
    setCarrito((prev) => {
      const nuevo = prev.filter((item) => item.codigo_int !== producto.codigo_int);
      setCarritoEditadoManualmente(true);

      return nuevo;
    });
  };

  const reemplazarCarrito = (nuevoCarrito) => {
    setCarritoEditadoManualmente(false);
    localStorage.setItem('carritoEditadoManualmente', 'false');
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
        setCarritoEditadoManualmente(false);
        localStorage.setItem('carritoEditadoManualmente', 'false');
        localStorage.removeItem('carrito');
      } else {
        alert('Error al guardar el carrito.');
      }
    } catch (error) {
      console.error('❌ Error al finalizar compra:', error);
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
        carritoEditadoManualmente,
      }}
    >
      {children}
    </CarritoContext.Provider>
  );
};
