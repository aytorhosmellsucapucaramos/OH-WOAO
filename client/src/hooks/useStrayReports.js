/**
 * useStrayReports Hook
 * Maneja el estado y lógica de reportes de perros callejeros
 */

import { useState, useEffect, useCallback } from 'react';
import { getStrayReports } from '../services/strayReportService';

export const useStrayReports = (initialFilters = {}) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(initialFilters);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  // Fetch reports
  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await getStrayReports({ ...filters, page: pagination.page, limit: pagination.limit });
      
      setReports(data.data || []);
      
      if (data.pagination) {
        setPagination(prev => ({
          ...prev,
          total: data.pagination.total,
          totalPages: data.pagination.totalPages
        }));
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cargar reportes');
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.limit]);

  // Efecto para cargar reportes cuando cambian filtros o página
  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // Cambiar página
  const changePage = useCallback((newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  }, []);

  // Actualizar filtros
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset a página 1
  }, []);

  // Refrescar reportes
  const refresh = useCallback(() => {
    fetchReports();
  }, [fetchReports]);

  return {
    reports,
    loading,
    error,
    filters,
    pagination,
    changePage,
    updateFilters,
    refresh
  };
};
