import React, { useEffect, useState } from 'react';
import { obtenerDeviceId } from './device';
import config from './config';

function ProtectorDeAcceso({ children }) {
  const [autorizado, setAutorizado] = useState(null);
  const [deviceIdNoAutorizado, setDeviceIdNoAutorizado] = useState(null);

  useEffect(() => {
    const verificarAcceso = async () => {
      const deviceId = obtenerDeviceId();

      try {
        const response = await fetch(`${config.API_URL}/api/verificar-dispositivo`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ device_id: deviceId })
        });

        const result = await response.json();

        if (result.autorizado === true) {
          setAutorizado(true);
          localStorage.setItem('usuario_admin', JSON.stringify({ autorizado: true }));
        } else {
          setAutorizado(false);
          setDeviceIdNoAutorizado(deviceId);
          localStorage.setItem('usuario_admin', JSON.stringify({ autorizado: false }));
        }
      } catch (error) {
        console.error('❌ Error al verificar acceso:', error);
        setAutorizado(false);
        setDeviceIdNoAutorizado(deviceId);
        localStorage.setItem('usuario_admin', JSON.stringify({ autorizado: false }));
      }
    };

    verificarAcceso();
  }, []);

  // ✅ Habilita reglas de impresión solo para admin (agrega/quita clase en <body>)
  useEffect(() => {
    if (autorizado === true) {
      document.body.classList.add('admin-print');
    } else {
      document.body.classList.remove('admin-print');
    }
    return () => document.body.classList.remove('admin-print');
  }, [autorizado]);

  if (config.modoDesarrollo && autorizado === false) {
    const linkWhatsApp = `https://wa.me/5493875537070?text=${encodeURIComponent(
      `Hola, quisiera hacer una consulta,\nCódigo: ${deviceIdNoAutorizado}`
    )}`;

    return (
      <div style={{ padding: '2rem', textAlign: 'center', background: '#fff8f8', height: '100vh' }}>
        <h2>🚧 Modo mantenimiento</h2>
        <p>En breve estará la web disponible nuevamente.</p>
        <p style={{ margin: '1.2rem 0' }}>
          Si querés realizar una consulta, hacela a nuestro WhatsApp por favor:
        </p>
        <a
          href={linkWhatsApp}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-block',
            backgroundColor: '#25d366',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '30px',
            fontSize: '1.1rem',
            textDecoration: 'none',
            fontWeight: 'bold',
            marginTop: '10px'
          }}
        >
          Contactar por WhatsApp
        </a>
        <p style={{ marginTop: '2rem', fontSize: '0.8rem', color: '#999' }}>
          Error: <code style={{ background: '#eee', padding: '4px 8px', borderRadius: '6px' }}>{deviceIdNoAutorizado}</code>
        </p>
      </div>
    );
  }

  if (autorizado === null && !deviceIdNoAutorizado) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Cargando...</div>;
  }

  return <>{children}</>;
}

export default ProtectorDeAcceso;
