// src/device.js
export function obtenerDeviceId() {
    let deviceId = localStorage.getItem('device_id');
  
    if (!deviceId) {
      deviceId = crypto.randomUUID();
      localStorage.setItem('device_id', deviceId);
    }
  
    return deviceId;
  }
  