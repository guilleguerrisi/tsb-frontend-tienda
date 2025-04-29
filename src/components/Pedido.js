import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCarrito } from '../contexts/CarritoContext';
import API_URL from '../config';

function Pedido() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setCarrito } = useCarrito();

  useEffect(() => {
    const cargarPedido = async () => {
      try {
        const res = await fetch(`${API_URL}/api/pedidos/${id}`);
        const data = await res.json();

        if (res.ok && data.array_pedido) {
          const carritoCargado = JSON.parse(data.array_pedido);
          setCarrito(carritoCargado);
          navigate('/carrito');
        } else {
          alert('No se pudo cargar el presupuesto.');
          navigate('/');
        }
      } catch (error) {
        console.error('Error al cargar pedido:', error);
        alert('Error al conectar con el servidor.');
        navigate('/');
      }
    };

    cargarPedido();
  }, [id, navigate, setCarrito]);

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h2>Cargando presupuesto...</h2>
    </div>
  );
}

export default Pedido;
