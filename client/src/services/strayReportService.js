/**
 * Stray Report Service
 * Maneja todas las operaciones de reportes de perros callejeros
 */

import api from './api';

/**
 * Obtener todos los reportes con paginación y filtros
 */
export const getStrayReports = async (params = {}) => {
  console.log('🔍 [strayReportService] getStrayReports llamado con params:', params);
  try {
    const { data } = await api.get('/stray-reports', { params });
    console.log('📊 [strayReportService] Respuesta de /stray-reports:', data);
    console.log('📊 [strayReportService] Cantidad de reportes:', data?.data?.length || 0);
    return data;
  } catch (error) {
    console.error('❌ [strayReportService] Error en getStrayReports:', error);
    throw error;
  }
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

/**
 * Asignar reporte a una persona de seguimiento
 */
export const assignReport = async (reportId, assignedToId) => {
  const { data } = await api.put(`/stray-reports/${reportId}/assign`, {
    assignedTo: assignedToId
  });
  return data;
};

/**
 * Desasignar reporte
 */
export const unassignReport = async (reportId) => {
  const { data } = await api.put(`/stray-reports/${reportId}/unassign`);
  return data;
};

/**
 * Obtener reportes asignados (solo para personal de seguimiento)
 */
export const getAssignedReports = async (params = {}) => {
  console.log('🔍 [strayReportService] getAssignedReports llamado con params:', params);
  try {
    const { data } = await api.get('/stray-reports/assigned', { params });
    console.log('📊 [strayReportService] Respuesta de /stray-reports/assigned:', data);
    console.log('📊 [strayReportService] Cantidad de reportes asignados:', data?.data?.length || 0);
    return data;
  } catch (error) {
    console.error('❌ [strayReportService] Error en getAssignedReports:', error);
    throw error;
  }
};

/**
 * Actualizar estado de reporte asignado (solo para personal de seguimiento)
 */
export const updateReportStatus = async (reportId, status, notes = '') => {
  const { data } = await api.put(`/stray-reports/${reportId}/status`, {
    status,
    notes
  });
  return data;
};
