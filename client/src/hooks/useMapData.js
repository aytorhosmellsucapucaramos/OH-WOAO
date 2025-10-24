/**
 * useMapData Hook
 * Maneja el estado y lógica del mapa de reportes
 */

import { useState, useEffect, useMemo, useCallback } from 'react';

export const useMapData = (initialReports = []) => {
  const [reports, setReports] = useState(initialReports);
  const [selectedReport, setSelectedReport] = useState(null);
  const [hoveredReport, setHoveredReport] = useState(null);
  const [filters, setFilters] = useState({
    urgency: 'all',
    condition: 'all',
    size: 'all',
    temperament: 'all',
    showOnlyRecent: false
  });
  const [mapCenter, setMapCenter] = useState({ 
    lat: -15.8402, 
    lng: -70.0219 
  }); // Puno, Perú

  // Filtrar reportes según criterios
  const filteredReports = useMemo(() => {
    return reports.filter(report => {
      // Filtro por urgencia
      if (filters.urgency !== 'all' && report.urgency !== filters.urgency) {
        return false;
      }
      
      // Filtro por condición
      if (filters.condition !== 'all' && report.condition !== filters.condition) {
        return false;
      }
      
      // Filtro por tamaño
      if (filters.size !== 'all' && report.size !== filters.size) {
        return false;
      }
      
      // Filtro por temperamento
      if (filters.temperament !== 'all' && report.temperament !== filters.temperament) {
        return false;
      }
      
      // Filtro por reportes recientes (últimos 7 días)
      if (filters.showOnlyRecent) {
        const reportDate = new Date(report.createdAt);
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        return reportDate >= sevenDaysAgo;
      }
      
      return true;
    });
  }, [reports, filters]);

  // Actualizar filtro
  const updateFilter = useCallback((filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  }, []);

  // Reset filtros
  const resetFilters = useCallback(() => {
    setFilters({
      urgency: 'all',
      condition: 'all',
      size: 'all',
      temperament: 'all',
      showOnlyRecent: false
    });
  }, []);

  // Seleccionar reporte
  const selectReport = useCallback((report) => {
    setSelectedReport(report);
    if (report) {
      setMapCenter({ lat: report.latitude, lng: report.longitude });
    }
  }, []);

  // Cerrar modal
  const closeModal = useCallback(() => {
    setSelectedReport(null);
  }, []);

  return {
    reports,
    setReports,
    filteredReports,
    selectedReport,
    selectReport,
    closeModal,
    hoveredReport,
    setHoveredReport,
    filters,
    updateFilter,
    resetFilters,
    mapCenter,
    setMapCenter,
    totalReports: reports.length,
    visibleReports: filteredReports.length
  };
};
