/**
 * MapPage - REFACTORIZADO
 * Mapa de reportes de perros callejeros simplificado
 */

import React, { useEffect } from 'react';
import { Container, Typography, Box, Alert } from '@mui/material';
import { motion } from 'framer-motion';
import { useStrayReports } from '../hooks/useStrayReports';
import { useMapData } from '../hooks/useMapData';
import ReportFilters from '../components/features/strayReports/ReportFilters';
import ReportDetailModal from '../components/features/strayReports/ReportDetailModal';

const MapPage = () => {
  const { reports, loading, error } = useStrayReports();
  const {
    filteredReports,
    selectedReport,
    selectReport,
    closeModal,
    filters,
    updateFilter,
    resetFilters,
    totalReports,
    visibleReports
  } = useMapData(reports);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: 700, 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 1
            }}
          >
            🗺️ Mapa de Reportes
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Visualiza y filtra reportes de perros callejeros en Puno
          </Typography>
        </Box>

        {/* Filtros */}
        <ReportFilters
          filters={filters}
          onFilterChange={updateFilter}
          onResetFilters={resetFilters}
          totalReports={totalReports}
          visibleReports={visibleReports}
        />

        {/* Loading/Error States */}
        {loading && (
          <Alert severity="info" sx={{ mb: 3 }}>
            Cargando reportes...
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Mapa Placeholder */}
        <Box
          sx={{
            height: 600,
            backgroundColor: '#f5f5f5',
            borderRadius: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px dashed #ccc',
            mb: 3
          }}
        >
          <Box sx={{ textAlign: 'center', p: 4 }}>
            <Typography variant="h5" gutterBottom>
              🗺️ Mapa Interactivo
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Aquí se mostraría el mapa con {visibleReports} reportes
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
              Integrar con Google Maps o Leaflet
            </Typography>
          </Box>
        </Box>

        {/* Lista de reportes (temporal) */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
          {filteredReports.slice(0, 6).map(report => (
            <Box
              key={report.id}
              onClick={() => selectReport(report)}
              sx={{
                p: 2,
                border: '1px solid #e0e0e0',
                borderRadius: 2,
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  borderColor: '#667eea',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.2)',
                  transform: 'translateY(-2px)'
                }
              }}
            >
              <Typography variant="h6" gutterBottom>
                Reporte #{report.id}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                📍 {report.address}
              </Typography>
              <Typography variant="body2">
                🐕 {report.breed} - {report.size}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Modal de detalle */}
        <ReportDetailModal
          report={selectedReport}
          open={!!selectedReport}
          onClose={closeModal}
        />
      </motion.div>
    </Container>
  );
};

export default MapPage;
