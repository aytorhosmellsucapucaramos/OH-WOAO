/**
 * ReportDetailModal Component - Rediseñado
 * Modal siguiendo el estilo de la web
 */

import React from 'react';
import {
  Dialog, DialogContent, DialogActions,
  Typography, Box, Chip, Grid, Button, IconButton, Divider
} from '@mui/material';
import {
  Close, Phone, LocationOn, Pets, Info, Person, Warning
} from '@mui/icons-material';

const ReportDetailModal = ({ report, open, onClose }) => {
  if (!report) return null;

  // Debug: Log del reporte recibido
  console.log('🔍 Report data:', report);
  console.log('📸 photo_path:', report.photo_path);
  
  // Construir URL de la imagen (usando ruta relativa para evitar AdBlocker)
  let photoUrl = null;
  if (report.photo_path) {
    // Remover cualquier prefijo duplicado
    const cleanPath = report.photo_path.replace(/^\/api\/uploads\//, '');
    // Usar /api/uploads en lugar de localhost para evitar bloqueo
    photoUrl = `/api/uploads/${cleanPath}`;
    console.log('🖼️ Photo URL construida:', photoUrl);
    console.log('💡 Usando ruta relativa para evitar AdBlocker');
  }
  
  // Normalizar datos
  const normalizedReport = {
    ...report,
    photoUrl: photoUrl,
    reporterName: report.reporterName || report.reporter_name || 'No especificado',
    reporterPhone: report.reporterPhone || report.reporter_phone,
    colors: Array.isArray(report.colors) 
      ? report.colors 
      : (typeof report.colors === 'string' 
          ? report.colors.split(',').map(c => c.trim()) 
          : []),
  };

  const capitalizeText = (text) => {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  };

  const sizeLabels = {
    small: 'Pequeño',
    medium: 'Mediano',
    large: 'Grande',
  };

  const temperamentLabels = {
    friendly: 'Amigable',
    shy: 'Tímido',
    aggressive: 'Agresivo',
    scared: 'Asustado',
    playful: 'Juguetón',
    calm: 'Tranquilo',
    neutral: 'Neutral',
  };

  const conditionLabels = {
    stray: 'Callejero',
    lost: 'Perdido',
    abandoned: 'Abandonado',
    injured: 'Herido',
  };

  const urgencyColors = {
    emergency: '#ef4444',
    high: '#f97316',
    normal: '#3b82f6',
    low: '#10b981',
  };

  const urgencyLabels = {
    emergency: '🔴 Emergencia',
    high: '🟠 Alta',
    normal: '🔵 Normal',
    low: '🟢 Baja',
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          backgroundImage: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(249, 250, 251, 0.98) 100%)',
        }
      }}
    >
      {/* Header */}
      <Box sx={{ 
        p: 3, 
        background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Box display="flex" alignItems="center" gap={2}>
          <Pets sx={{ fontSize: 32 }} />
          <Box>
            <Typography variant="h5" fontWeight="700">
              {capitalizeText(report.breed)}
            </Typography>
            <Chip
              label={urgencyLabels[report.urgency]}
              size="small"
              sx={{ 
                mt: 0.5,
                bgcolor: 'rgba(255,255,255,0.2)',
                color: 'white',
                fontWeight: 600
              }}
            />
          </Box>
        </Box>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <Close />
        </IconButton>
      </Box>

      <Divider />

      <DialogContent sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* Imagen */}
          {normalizedReport.photoUrl && (
            <Grid item xs={12}>
              <Box
                sx={{
                  width: '100%',
                  height: 200,
                  borderRadius: 2,
                  overflow: 'hidden',
                  bgcolor: '#f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <img
                  src={normalizedReport.photoUrl}
                  alt="Perro reportado"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                  onLoad={() => {
                    console.log('✅ Imagen cargada correctamente:', normalizedReport.photoUrl);
                  }}
                  onError={(e) => {
                    console.error('❌ Error al cargar imagen:', normalizedReport.photoUrl);
                    console.error('Error details:', e);
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#94a3b8;font-weight:600;">📷 Imagen no disponible</div>';
                  }}
                />
              </Box>
            </Grid>
          )}

          {/* Información del Perro */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 1 }}>
              <Pets sx={{ color: '#3b82f6' }} /> Información del Perro
            </Typography>
            <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2 }}>
              <Box display="flex" justifyContent="space-between" mb={1.5}>
                <Typography variant="body2" color="text.secondary" fontWeight="600">Tamaño:</Typography>
                <Typography variant="body2" fontWeight="700">{sizeLabels[report.size]}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" mb={1.5}>
                <Typography variant="body2" color="text.secondary" fontWeight="600">Condición:</Typography>
                <Typography variant="body2" fontWeight="700">{conditionLabels[report.condition]}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" mb={1.5}>
                <Typography variant="body2" color="text.secondary" fontWeight="600">Temperamento:</Typography>
                <Typography variant="body2" fontWeight="700">{temperamentLabels[report.temperament]}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary" fontWeight="600">Colores:</Typography>
                <Box display="flex" gap={0.5} flexWrap="wrap">
                  {normalizedReport.colors.map((color, i) => (
                    <Chip key={i} label={capitalizeText(color)} size="small" />
                  ))}
                </Box>
              </Box>
            </Box>
          </Grid>

          {/* Ubicación */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocationOn sx={{ color: '#ef4444' }} /> Ubicación
            </Typography>
            <Box sx={{ p: 2, bgcolor: '#fef2f2', borderRadius: 2 }}>
              <Typography variant="body2" fontWeight="600" mb={2}>
                {report.address}
              </Typography>
              <Button
                fullWidth
                variant="contained"
                startIcon={<LocationOn />}
                href={`https://maps.google.com/?q=${report.latitude},${report.longitude}`}
                target="_blank"
                sx={{ 
                  bgcolor: '#ef4444',
                  '&:hover': { bgcolor: '#dc2626' }
                }}
              >
                Ver en Google Maps
              </Button>
            </Box>
          </Grid>

          {/* Descripción */}
          {report.description && (
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 1 }}>
                <Info sx={{ color: '#f59e0b' }} /> Descripción
              </Typography>
              <Box sx={{ p: 2, bgcolor: '#fefce8', borderRadius: 2 }}>
                <Typography variant="body2">{report.description}</Typography>
              </Box>
            </Grid>
          )}

          {/* Reportante */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 1 }}>
              <Person sx={{ color: '#7c3aed' }} /> Reportante
            </Typography>
            <Box sx={{ p: 2, bgcolor: '#faf5ff', borderRadius: 2 }}>
              <Typography variant="body2" fontWeight="700" mb={1}>
                {normalizedReport.reporterName}
              </Typography>
              {normalizedReport.reporterPhone && (
                <Box display="flex" alignItems="center" gap={1}>
                  <Phone fontSize="small" color="action" />
                  <Typography variant="body2">{normalizedReport.reporterPhone}</Typography>
                </Box>
              )}
            </Box>
          </Grid>
        </Grid>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 2.5, gap: 2 }}>
        <Button 
          onClick={onClose}
          sx={{ px: 3 }}
        >
          Cerrar
        </Button>
        {normalizedReport.reporterPhone && (
          <Button
            href={`tel:${normalizedReport.reporterPhone}`}
            variant="contained"
            startIcon={<Phone />}
            sx={{ 
              px: 3,
              background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
            }}
          >
            Llamar
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ReportDetailModal;
