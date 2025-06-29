import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

const CarritoContext = createContext();

export const useCarrito = () => useContext(CarritoContext);

export const CarritoProvider = ({ children }) => {
  const [carrito, setCarrito] = useState([]);
  const [clienteID, setClienteID] = useState(null);

  useEffect(() => {
    const idGuardado = localStorage.getItem('clienteID');
    if (idGuardado) {
      setClienteID(idGuardado);
    } else {
      const nuevoID = uuidv4();
      localStorage.setItem('clienteID', nuevoID);
      setClienteID(nuevoID);
    }

    const carritoGuardado = JSON.parse(localStorage.getItem('carrito')) || [];
    setCarrito(carritoGuardado);
  }, []);

  useEffect(() => {
    localStorage.setItem('carrito', JSON.stringify(carrito));
  }, [carrito]);

    // Sincronizar entre pestañas con storage event
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === 'carrito') {
        const carritoActualizado = JSON.parse(event.newValue || '[]');
        setCarrito(carritoActualizado);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);


  const calcularPrecio = (producto) => {
    if (isNaN(producto.costosiniva)) return 0;
    return Math.round(
      (producto.costosiniva * (1 + producto.iva / 100) * (1 + producto.margen / 100)) / 100
    ) * 100;
  };

  const agregarAlCarrito = (producto, cantidad = 1) => {
    setCarrito(prev => {
      const existente = prev.find(item => item.codigo_int === producto.codigo_int);

      if (existente) {
        const nuevaCantidad = existente.cantidad + cantidad;
        if (nuevaCantidad <= 0) {
          return prev.filter(item => item.codigo_int !== producto.codigo_int);
        }
        return prev.map(item =>
          item.codigo_int === producto.codigo_int
            ? { ...item, cantidad: nuevaCantidad }
            : item
        );
      } else {
        const productoConPrecio = {
          ...producto,
          price: calcularPrecio(producto),
          cantidad: cantidad,
        };
        return [...prev, productoConPrecio];
      }
    });
  };

  const cambiarCantidad = (codigo_int, nuevaCantidad) => {
    setCarrito(prev => {
      if (nuevaCantidad <= 0) {
        return prev.filter(item => item.codigo_int !== codigo_int);
      }
      return prev.map(item =>
        item.codigo_int === codigo_int ? { ...item, cantidad: nuevaCantidad } : item
      );
    });
  };



  const eliminarDelCarrito = (index) => {
    setCarrito(prev => prev.filter((_, i) => i !== index));
  };

  const finalizarCompra = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/finalizar-compra', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          carrito: carrito.map(item => ({
            id: Number(item.id),               // ✅ ID como número
            cantidad: item.cantidad || 1      // ✅ cantidad segura
          })),
          clienteID,
        }),
      }); // ⬅️ este paréntesis de cierre estaba faltando

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

  const reemplazarCarrito = (nuevoCarrito) => {
  setCarrito(nuevoCarrito);
};



  return (
    <CarritoContext.Provider
      value={{
        carrito,
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
