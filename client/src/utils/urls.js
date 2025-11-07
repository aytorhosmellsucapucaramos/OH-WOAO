/**
 * 🚀 Utilidades para URLs dinámicas
 * 
 * DETECCIÓN AUTOMÁTICA DE IP:
 * - WiFi normal: 192.168.1.11:3000 → Backend: 192.168.1.11:5000
 * - Hotspot celular: 192.168.43.100:3000 → Backend: 192.168.43.100:5000
 * - Localhost: localhost:3000 → Backend: localhost:5000
 * 
 * ✅ NO necesitas cambiar nada manualmente al cambiar de red
 */

// URL base del servidor (con puerto 5000)
export const getServerUrl = () => {
  // 1. Si hay variable de entorno VITE_API_URL, úsala
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // 2. Detección automática basada en desde dónde accedes
  const hostname = window.location.hostname; // La IP desde donde accedes
  const protocol = window.location.protocol; // http: o https:
  
  // 3. Construir URL del backend automáticamente
  return `${protocol}//${hostname}:5000`;
};

// URL para archivos subidos (imágenes, documentos, etc.)
export const getUploadUrl = (filename) => {
  if (!filename) return '';
  
  const serverUrl = getServerUrl();
  return `${serverUrl}/api/uploads/${filename}`;
};

// URL de API
export const getApiUrl = (endpoint) => {
  const serverUrl = getServerUrl();
  return `${serverUrl}/api${endpoint}`;
};

export default {
  getServerUrl,
  getUploadUrl,
  getApiUrl
};
