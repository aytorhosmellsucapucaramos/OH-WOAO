/**
 * ReportDetailModal Component
 * Modal con detalles completos de un reporte
 */

import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Typography, Box, Chip, Grid, Button, IconButton, Avatar
} from '@mui/material';
import {
  Close, Phone, Email, LocationOn, Pets, CalendarToday,
  Warning, Info, Person
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const ReportDetailModal = ({ report, open, onClose }) => {
  if (!report) return null;

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
          PaperProps={{
            sx: { borderRadius: 3, overflow: 'hidden' }
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            {/* Header con imagen */}
            <Box
              sx={{
                position: 'relative',
                height: 200,
                background: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.5)), url(${report.photoUrl || '/images/default-dog.jpg'})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              <IconButton
                onClick={onClose}
                sx={{
                  position: 'absolute',
                  top: 10,
                  right: 10,
                  backgroundColor: 'rgba(255,255,255,0.9)',
                  '&:hover': { backgroundColor: 'white' }
                }}
              >
                <Close />
              </IconButton>

              <Box sx={{ position: 'absolute', bottom: 15, left: 20 }}>
                <Chip
                  label={getUrgencyLabel(report.urgency)}
                  color={getUrgencyColor(report.urgency)}
                  sx={{ mb: 1, fontWeight: 'bold' }}
                />
                <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold' }}>
                  Reporte #{report.id}
                </Typography>
              </Box>
            </Box>

            <DialogContent sx={{ p: 3 }}>
              <Grid container spacing={3}>
                {/* Información del Perro */}
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Pets /> Información del Perro
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={6} sm={4}>
                      <Typography variant="caption" color="text.secondary">Raza</Typography>
                      <Typography variant="body1" fontWeight="medium">{report.breed}</Typography>
                    </Grid>
                    <Grid item xs={6} sm={4}>
                      <Typography variant="caption" color="text.secondary">Tamaño</Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {report.size === 'small' ? 'Pequeño' : report.size === 'medium' ? 'Mediano' : 'Grande'}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} sm={4}>
                      <Typography variant="caption" color="text.secondary">Colores</Typography>
                      <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                        {report.colors?.map((color, i) => (
                          <Chip key={i} label={color} size="small" />
                        ))}
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={4}>
                      <Typography variant="caption" color="text.secondary">Temperamento</Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {report.temperament === 'friendly' ? '😊 Amigable' : 
                         report.temperament === 'aggressive' ? '😠 Agresivo' :
                         report.temperament === 'scared' ? '😰 Asustado' : 'Neutral'}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} sm={4}>
                      <Typography variant="caption" color="text.secondary">Condición</Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {report.condition === 'stray' ? 'Callejero' :
                         report.condition === 'injured' ? 'Herido' : 'Perdido'}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} sm={4}>
                      <Typography variant="caption" color="text.secondary">Fecha</Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {new Date(report.createdAt).toLocaleDateString()}
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>

                {/* Ubicación */}
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <LocationOn /> Ubicación
                  </Typography>
                  <Typography variant="body1">{report.address}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Lat: {report.latitude}, Lng: {report.longitude}
                  </Typography>
                </Grid>

                {/* Descripción */}
                {report.description && (
                  <Grid item xs={12}>
                    <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Info /> Descripción
                    </Typography>
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                      {report.description}
                    </Typography>
                  </Grid>
                )}

                {/* Información del Reportero */}
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Person /> Reportado por
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      {report.reporterName.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="body1" fontWeight="medium">
                        {report.reporterName}
                      </Typography>
                      {report.reporterPhone && (
                        <Typography variant="caption" color="text.secondary">
                          📞 {report.reporterPhone}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </DialogContent>
            
            <DialogActions sx={{ backgroundColor: '#f5f5f5', p: 2 }}>
              {report.reporterPhone && (
                <Button
                  href={`tel:${report.reporterPhone}`}
                  startIcon={<Phone />}
                  variant="contained"
                  color="primary"
                >
                  Llamar
                </Button>
              )}
              {report.reporterEmail && (
                <Button
                  href={`mailto:${report.reporterEmail}`}
                  startIcon={<Email />}
                  variant="outlined"
                >
                  Email
                </Button>
              )}
              <Button
                href={`https://maps.google.com/?q=${report.latitude},${report.longitude}`}
                target="_blank"
                startIcon={<LocationOn />}
                variant="outlined"
              >
                Ver en Mapa
              </Button>
            </DialogActions>
          </motion.div>
        </Dialog>
      )}
    </AnimatePresence>
  );
};

export default ReportDetailModal;
