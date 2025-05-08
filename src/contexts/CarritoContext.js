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

  const calcularPrecio = (producto) => {
    if (isNaN(producto.costosiniva)) return 0;
    return Math.round(
      (producto.costosiniva * (1 + producto.iva / 100) * (1 + producto.margen / 100)) / 100
    ) * 100;
  };

  const agregarAlCarrito = (producto) => {
    const yaEnCarrito = carrito.some(item => item.codigo_int === producto.codigo_int);
    if (yaEnCarrito) {
      setCarrito(carrito.filter(item => item.codigo_int !== producto.codigo_int));
    } else {
      const productoConPrecio = {
        ...producto,
        price: calcularPrecio(producto),
        cantidad: 1,
      };
      
      setCarrito([...carrito, productoConPrecio]);
    }
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
            cantidad: item.cantidad || 1       // ✅ cantidad segura
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
  

  return (
    <CarritoContext.Provider
      value={{
        carrito,
        setCarrito,
        agregarAlCarrito,
        eliminarDelCarrito,
        finalizarCompra,
      }}
    >
      {children}
    </CarritoContext.Provider>
  );
};
