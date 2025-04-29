import React, { useEffect, useState } from 'react';
import { obtenerDeviceId } from './device';
import config from './config'; // 🟡 NUEVO: importamos modoDesarrollo

function ProtectorDeAcceso({ children }) {
  const [autorizado, setAutorizado] = useState(null);
  const [deviceIdNoAutorizado, setDeviceIdNoAutorizado] = useState(null);

  useEffect(() => {
    const verificarAcceso = async () => {
      const deviceId = obtenerDeviceId();

      try {
        const response = await fetch(`${config.API_URL}/api/verificar-dispositivo`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ device_id: deviceId })
        });

        const result = await response.json();

        console.log('✅ Resultado backend:', result);

        if (result.autorizado) {
          setAutorizado(true);
        } else {
          setAutorizado(false);
          setDeviceIdNoAutorizado(deviceId);
        }
      } catch (error) {
        console.error('❌ Error al verificar acceso:', error);
        setAutorizado(false);
        setDeviceIdNoAutorizado(deviceId);
      }
    };

    verificarAcceso();
  }, []);

  // 🔒 Bloqueo completo si modoDesarrollo está activo y NO autorizado
  if (config.modoDesarrollo && autorizado === false) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', background: '#fff8f8', height: '100vh' }}>
        <h2>🚧 Modo mantenimiento</h2>
        <p>Esta tienda está temporalmente cerrada al público.</p>
        <p><strong>Device ID:</strong></p>
        <code style={{ background: '#eee', padding: '8px', borderRadius: '6px', display: 'inline-block' }}>
          {deviceIdNoAutorizado}
        </code>
        <p style={{ marginTop: '1rem' }}>Contactá con el administrador para solicitar acceso.</p>
      </div>
    );
  }

  // Mientras verifica...
  if (autorizado === null && !deviceIdNoAutorizado) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Verificando acceso...</div>;
  }

  // Si modoDesarrollo está desactivado, o está autorizado
  return (
    <>
      {children}
    </>
  );
}

export default ProtectorDeAcceso;
