/**
 * ReportDetailModal Component
 * Modal con detalles completos de un reporte
 */

import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Typography, Box, Chip, Grid, Button, IconButton, Avatar, Paper
} from '@mui/material';
import {
  Close, Phone, Email, LocationOn, Pets, CalendarToday,
  Warning, Info, Person, AccessTime
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const ReportDetailModal = ({ report, open, onClose }) => {
  if (!report) return null;

  // Normalize the report data to handle different field names
  const normalizedReport = {
    ...report,
    photoUrl: report.photo_path 
      ? `http://localhost:5000/api/uploads/${report.photo_path}` 
      : report.photo || report.photoUrl,
    createdAt: report.created_at || report.createdAt,
    reporterName: report.reporterName || report.reporter_name || 'No especificado',
    reporterPhone: report.reporterPhone || report.reporter_phone,
    reporterEmail: report.reporterEmail || report.reporter_email,
    // Normalizar colores: puede venir como string "marrón, negro" o array ["marrón", "negro"]
    colors: Array.isArray(report.colors) 
      ? report.colors 
      : (typeof report.colors === 'string' 
          ? report.colors.split(',').map(c => c.trim()) 
          : []),
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

  const temperamentColors = {
    friendly: '#4CAF50',
    shy: '#FF9800',
    aggressive: '#F44336',
    scared: '#9C27B0',
    playful: '#2196F3',
    calm: '#009688',
    neutral: '#9E9E9E',
  };

  const conditionLabels = {
    stray: 'Callejero',
    lost: 'Perdido',
    abandoned: 'Abandonado',
    injured: 'Herido',
  };

  const sizeLabels = {
    small: 'Pequeño',
    medium: 'Mediano',
    large: 'Grande',
  };

  const capitalizeText = (text) => {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'emergency': return 'error';
      case 'high': return 'warning';
      case 'normal': return 'info';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getUrgencyLabel = (urgency) => {
    switch (urgency) {
      case 'emergency': return '🔴 Emergencia';
      case 'high': return '🟠 Alta';
      case 'normal': return '🟡 Normal';
      case 'low': return '🟢 Baja';
      default: return urgency;
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <Dialog 
          open={open} 
          onClose={onClose}
          maxWidth="md"
          fullWidth
          scroll="paper"
          PaperProps={{
            sx: { 
              borderRadius: 3,
              maxHeight: '90vh',
              background: 'linear-gradient(to bottom, #f8f9fa, #ffffff)',
            }
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {/* Header con título */}
            <DialogTitle
              sx={{
                background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
                color: 'white',
                py: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar
                  src={normalizedReport.photoUrl}
                  sx={{ width: 50, height: 50 }}
                >
                  <Pets />
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight="bold">
                    {normalizedReport.breed}
                  </Typography>
                  <Box display="flex" gap={1} mt={0.5}>
                    <Chip
                      label={getUrgencyLabel(normalizedReport.urgency)}
                      color={getUrgencyColor(normalizedReport.urgency)}
                      size="small"
                      sx={{ fontWeight: 'bold', height: 24 }}
                    />
                    <Chip
                      label={`Reporte #${normalizedReport.id}`}
                      size="small"
                      sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', height: 24 }}
                    />
                  </Box>
                </Box>
              </Box>
              <IconButton
                onClick={onClose}
                sx={{
                  color: 'white',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
                }}
              >
                <Close />
              </IconButton>
            </DialogTitle>
            
            <DialogContent sx={{ p: 3, overflowY: 'auto' }}>
              <Grid container spacing={2.5}>
                {/* Imagen destacada */}
                <Grid item xs={12}>
                  <Box
                    sx={{
                      position: 'relative',
                      borderRadius: 3,
                      overflow: 'hidden',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                      height: 300,
                    }}
                  >
                    <img
                      src={normalizedReport.photoUrl || 'https://via.placeholder.com/600x300?text=Sin+Foto'}
                      alt="Perro reportado"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/600x300?text=Imagen+No+Disponible';
                      }}
                    />
                  </Box>
                </Grid>

                {/* Información del Perro */}
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2.5, borderRadius: 2, boxShadow: 2, height: '100%' }}>
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{ fontWeight: 'bold', color: '#1976d2', mb: 2 }}
                    >
                      🐕 Información del Perro
                    </Typography>

                    <Box display="flex" flexDirection="column" gap={1.5}>
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2" color="textSecondary" fontWeight="bold">
                          Raza:
                        </Typography>
                        <Typography variant="body1" fontWeight="600">
                          {capitalizeText(normalizedReport.breed)}
                        </Typography>
                      </Box>

                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2" color="textSecondary" fontWeight="bold">
                          Tamaño:
                        </Typography>
                        <Chip
                          label={sizeLabels[normalizedReport.size]}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </Box>

                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2" color="textSecondary" fontWeight="bold">
                          Colores:
                        </Typography>
                        <Box display="flex" gap={0.5} flexWrap="wrap" justifyContent="flex-end">
                          {normalizedReport.colors && normalizedReport.colors.length > 0 ? (
                            normalizedReport.colors.map((color, i) => (
                              <Chip
                                key={i}
                                label={capitalizeText(color)}
                                size="small"
                                sx={{ backgroundColor: '#f1f5f9', color: '#475569' }}
                              />
                            ))
                          ) : (
                            <Typography variant="body1" fontWeight="600">
                              No especificado
                            </Typography>
                          )}
                        </Box>
                      </Box>

                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2" color="textSecondary" fontWeight="bold">
                          Temperamento:
                        </Typography>
                        <Chip
                          label={temperamentLabels[normalizedReport.temperament] || capitalizeText(normalizedReport.temperament)}
                          size="small"
                          sx={{
                            backgroundColor: temperamentColors[normalizedReport.temperament] || '#9E9E9E',
                            color: 'white',
                            fontWeight: 'bold',
                          }}
                        />
                      </Box>

                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2" color="textSecondary" fontWeight="bold">
                          Condición:
                        </Typography>
                        <Typography variant="body1" fontWeight="600">
                          {conditionLabels[normalizedReport.condition] || capitalizeText(normalizedReport.condition)}
                        </Typography>
                      </Box>

                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2" color="textSecondary" fontWeight="bold">
                          Fecha:
                        </Typography>
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <AccessTime fontSize="small" color="action" />
                          <Typography variant="body2">
                            {new Date(normalizedReport.createdAt).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>

                {/* Ubicación */}
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2.5, borderRadius: 2, boxShadow: 2, height: '100%' }}>
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{ fontWeight: 'bold', color: '#1976d2', mb: 2 }}
                    >
                      📍 Ubicación
                    </Typography>
                    <Typography
                      variant="body1"
                      gutterBottom
                      sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}
                    >
                      <LocationOn color="error" />
                      <span>{normalizedReport.address}</span>
                    </Typography>
                    <Typography
                      variant="caption"
                      color="textSecondary"
                      sx={{ display: 'block', mt: 1, ml: 4 }}
                    >
                      Coordenadas: {normalizedReport.latitude}, {normalizedReport.longitude}
                    </Typography>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<LocationOn />}
                      href={`https://maps.google.com/?q=${normalizedReport.latitude},${normalizedReport.longitude}`}
                      target="_blank"
                      sx={{ mt: 2 }}
                    >
                      Abrir en Google Maps
                    </Button>
                  </Paper>
                </Grid>

                {/* Descripción */}
                {normalizedReport.description && (
                  <Grid item xs={12}>
                    <Paper sx={{ p: 2.5, borderRadius: 2, boxShadow: 2, backgroundColor: '#f8f9fa' }}>
                      <Typography
                        variant="h6"
                        gutterBottom
                        sx={{ fontWeight: 'bold', color: '#1976d2', mb: 2 }}
                      >
                        📝 Descripción
                      </Typography>
                      <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                        {normalizedReport.description}
                      </Typography>
                    </Paper>
                  </Grid>
                )}

                {/* Información del Reportante */}
                <Grid item xs={12}>
                  <Paper sx={{ p: 2.5, borderRadius: 2, boxShadow: 2 }}>
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{ fontWeight: 'bold', color: '#1976d2', mb: 2 }}
                    >
                      👤 Información del Reportante
                    </Typography>
                    <Box display="flex" flexDirection="column" gap={1.5}>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar sx={{ bgcolor: 'primary.main', width: 45, height: 45 }}>
                          {normalizedReport.reporterName.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="body1" fontWeight="bold">
                            {normalizedReport.reporterName}
                          </Typography>
                        </Box>
                      </Box>
                      {normalizedReport.reporterPhone && (
                        <Typography
                          variant="body1"
                          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                        >
                          <Phone color="primary" fontSize="small" />
                          {normalizedReport.reporterPhone}
                        </Typography>
                      )}
                      {normalizedReport.reporterEmail && (
                        <Typography
                          variant="body1"
                          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                        >
                          <Email color="primary" fontSize="small" />
                          {normalizedReport.reporterEmail}
                        </Typography>
                      )}
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </DialogContent>
            
            <DialogActions sx={{ background: 'linear-gradient(to bottom, #ffffff, #f8f9fa)', p: 2.5, gap: 2 }}>
              <Button
                onClick={onClose}
                variant="outlined"
                size="large"
                sx={{ flex: 0.4 }}
              >
                Cerrar
              </Button>
              {normalizedReport.reporterPhone && (
                <Button
                  href={`tel:${normalizedReport.reporterPhone}`}
                  startIcon={<Phone />}
                  variant="contained"
                  color="primary"
                  size="large"
                  sx={{ flex: 0.6 }}
                >
                  Llamar al Reportante
                </Button>
              )}
            </DialogActions>
          </motion.div>
        </Dialog>
      )}
    </AnimatePresence>
  );
};

export default ReportDetailModal;
