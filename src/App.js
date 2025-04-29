import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ProductosPage from './pages/ProductosPage';
import Carrito from './components/Carrito';
import Pedido from './components/Pedido'; // 🔵 Agregado
import { CarritoProvider } from './contexts/CarritoContext';
import './App.css';

function App() {
  return (
    <CarritoProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/productos" element={<ProductosPage />} />
          <Route path="/carrito" element={<Carrito />} />
          <Route path="/pedido/:id" element={<Pedido />} /> {/* 🔵 Agregado */}
        </Routes>
      </Router>
    </CarritoProvider>
  );
}

export default App;
