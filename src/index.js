import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { CarritoProvider } from './contexts/CarritoContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <CarritoProvider>
      <App />
    </CarritoProvider>
  </React.StrictMode>
);
