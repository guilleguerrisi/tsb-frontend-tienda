import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ProductosPage from './pages/ProductosPage';
import Carrito from './components/Carrito';

import { CarritoProvider } from './contexts/CarritoContext';
import ProtectorDeAcceso from './ProtectorDeAcceso'; // ✅ Importado
import './App.css';

function App() {
  return (
    <CarritoProvider>
      <ProtectorDeAcceso> {/* ✅ Protección activada */}
        <Router>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/productos" element={<ProductosPage />} />
            <Route path="/carrito" element={<Carrito />} />
      
          </Routes>
        </Router>
      </ProtectorDeAcceso>
      
    </CarritoProvider>
  );
}

export default App;
