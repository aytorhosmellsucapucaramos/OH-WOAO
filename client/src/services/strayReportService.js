/**
 * Stray Report Service
 * Maneja todas las operaciones de reportes de perros callejeros
 */

import api from './api';

/**
 * Obtener todos los reportes con paginación y filtros
 */
export const getStrayReports = async (params = {}) => {
  const { data } = await api.get('/stray-reports', { params });
  return data;
};

/**
 * Crear nuevo reporte
 */
export const createStrayReport = async (reportData) => {
  // Si hay archivo, usar FormData
  const formData = new FormData();
  
  Object.keys(reportData).forEach(key => {
    if (reportData[key] !== null && reportData[key] !== undefined) {
      if (key === 'colors' && Array.isArray(reportData[key])) {
        formData.append(key, JSON.stringify(reportData[key]));
      } else {
        formData.append(key, reportData[key]);
      }
    }
  });
  
  const { data } = await api.post('/stray-reports', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  
  return data;
};

/**
 * Obtener reportes del usuario autenticado
 */
export const getMyReports = async (params = {}) => {
  const { data } = await api.get('/stray-reports/my-reports', { params });
  return data;
};

/**
 * Obtener estadísticas de reportes
 */
export const getReportStats = async () => {
  const { data } = await api.get('/stray-reports/stats');
  return data;
};

/**
 * Filtrar reportes por ubicación (cercanos)
 */
export const getNearbyReports = async (latitude, longitude, radiusKm = 5) => {
  const { data } = await api.get('/stray-reports', {
    params: { latitude, longitude, radius: radiusKm }
  });
  return data;
};
