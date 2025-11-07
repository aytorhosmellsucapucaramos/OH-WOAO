/**
 * DocumentsUpload Component
 * Carga de documentos y fotos
 */

import React, { useState } from 'react';
import { Grid, Typography, Box, Button, Paper, IconButton, Chip } from '@mui/material';
import { CloudUpload, Image, Description, Close, CheckCircle } from '@mui/icons-material';

const DocumentsUpload = ({ formData, onUpdate }) => {
  const [previews, setPreviews] = useState({
    photoFront: null,
    photoSide: null,
    dniPhoto: null,
    vaccinationCard: null,
    rabiesVaccineCard: null
  });

  const handleFileChange = (field, file) => {
    if (file) {
      // Crear preview para imágenes
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviews(prev => ({ ...prev, [field]: reader.result }));
        };
        reader.readAsDataURL(file);
      } else {
        // Para PDFs o archivos no imagen
        setPreviews(prev => ({ ...prev, [field]: 'pdf' }));
      }
    }
    onUpdate(field, file);
  };

  const handleRemoveFile = (field) => {
    onUpdate(field, null);
    setPreviews(prev => ({ ...prev, [field]: null }));
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <CloudUpload /> Documentos y Fotos
      </Typography>

      <Grid container spacing={3}>
        {/* Foto frontal de la mascota */}
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              border: formData.photoFront ? '2px solid #4caf50' : '2px dashed #ccc', 
              borderRadius: 2,
              textAlign: 'center',
              cursor: 'pointer',
              position: 'relative',
              '&:hover': { borderColor: formData.photoFront ? '#4caf50' : '#667eea' }
            }}
          >
            {formData.photoFront && (
              <IconButton
                size="small"
                onClick={() => handleRemoveFile('photoFront')}
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  bgcolor: 'rgba(244, 67, 54, 0.9)',
                  color: 'white',
                  '&:hover': { bgcolor: 'rgba(211, 47, 47, 1)' }
                }}
              >
                <Close fontSize="small" />
              </IconButton>
            )}
            {previews.photoFront ? (
              <Box sx={{ mb: 2 }}>
                <img 
                  src={previews.photoFront} 
                  alt="Preview frontal" 
                  style={{ 
                    maxWidth: '100%', 
                    maxHeight: 200, 
                    borderRadius: 8,
                    objectFit: 'cover'
                  }} 
                />
                <Chip 
                  icon={<CheckCircle />} 
                  label="Cargado" 
                  color="success" 
                  size="small" 
                  sx={{ mt: 1 }} 
                />
              </Box>
            ) : (
              <Image sx={{ fontSize: 48, color: '#667eea', mb: 2 }} />
            )}
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
              Foto Frontal de la Mascota
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {formData.photoFront ? formData.photoFront.name : 'Sube una foto frontal clara de tu mascota'}
            </Typography>
            <Button
              variant={formData.photoFront ? "outlined" : "contained"}
              component="label"
              startIcon={<CloudUpload />}
            >
              {formData.photoFront ? 'Cambiar Foto' : 'Seleccionar Foto Frontal'}
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={(e) => handleFileChange('photoFront', e.target.files[0])}
              />
            </Button>
          </Paper>
        </Grid>

        {/* Foto lateral de la mascota */}
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              border: formData.photoSide ? '2px solid #4caf50' : '2px dashed #ccc', 
              borderRadius: 2,
              textAlign: 'center',
              cursor: 'pointer',
              position: 'relative',
              '&:hover': { borderColor: formData.photoSide ? '#4caf50' : '#667eea' }
            }}
          >
            {formData.photoSide && (
              <IconButton
                size="small"
                onClick={() => handleRemoveFile('photoSide')}
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  bgcolor: 'rgba(244, 67, 54, 0.9)',
                  color: 'white',
                  '&:hover': { bgcolor: 'rgba(211, 47, 47, 1)' }
                }}
              >
                <Close fontSize="small" />
              </IconButton>
            )}
            {previews.photoSide ? (
              <Box sx={{ mb: 2 }}>
                <img 
                  src={previews.photoSide} 
                  alt="Preview lateral" 
                  style={{ 
                    maxWidth: '100%', 
                    maxHeight: 200, 
                    borderRadius: 8,
                    objectFit: 'cover'
                  }} 
                />
                <Chip 
                  icon={<CheckCircle />} 
                  label="Cargado" 
                  color="success" 
                  size="small" 
                  sx={{ mt: 1 }} 
                />
              </Box>
            ) : (
              <Image sx={{ fontSize: 48, color: '#667eea', mb: 2 }} />
            )}
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
              Foto Lateral de la Mascota
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {formData.photoSide ? formData.photoSide.name : 'Sube una foto lateral clara de tu mascota'}
            </Typography>
            <Button
              variant={formData.photoSide ? "outlined" : "contained"}
              component="label"
              startIcon={<CloudUpload />}
            >
              {formData.photoSide ? 'Cambiar Foto' : 'Seleccionar Foto Lateral'}
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={(e) => handleFileChange('photoSide', e.target.files[0])}
              />
            </Button>
          </Paper>
        </Grid>

        {/* Foto del DNI */}
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              border: formData.dniPhoto ? '2px solid #4caf50' : '2px dashed #ccc', 
              borderRadius: 2,
              textAlign: 'center',
              cursor: 'pointer',
              position: 'relative',
              '&:hover': { borderColor: formData.dniPhoto ? '#4caf50' : '#667eea' }
            }}
          >
            {formData.dniPhoto && (
              <IconButton
                size="small"
                onClick={() => handleRemoveFile('dniPhoto')}
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  bgcolor: 'rgba(244, 67, 54, 0.9)',
                  color: 'white',
                  '&:hover': { bgcolor: 'rgba(211, 47, 47, 1)' }
                }}
              >
                <Close fontSize="small" />
              </IconButton>
            )}
            {previews.dniPhoto ? (
              <Box sx={{ mb: 2 }}>
                <img 
                  src={previews.dniPhoto} 
                  alt="Preview DNI" 
                  style={{ 
                    maxWidth: '100%', 
                    maxHeight: 200, 
                    borderRadius: 8,
                    objectFit: 'cover'
                  }} 
                />
                <Chip 
                  icon={<CheckCircle />} 
                  label="Cargado" 
                  color="success" 
                  size="small" 
                  sx={{ mt: 1 }} 
                />
              </Box>
            ) : (
              <Description sx={{ fontSize: 48, color: '#667eea', mb: 2 }} />
            )}
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
              Foto del DNI
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {formData.dniPhoto ? formData.dniPhoto.name : 'Sube una foto de tu DNI'}
            </Typography>
            <Button
              variant={formData.dniPhoto ? "outlined" : "contained"}
              component="label"
              startIcon={<CloudUpload />}
            >
              {formData.dniPhoto ? 'Cambiar DNI' : 'Seleccionar DNI'}
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={(e) => handleFileChange('dniPhoto', e.target.files[0])}
              />
            </Button>
          </Paper>
        </Grid>

        {/* Cartilla de vacunación (opcional) */}
        {formData.hasVaccinationCard === 'yes' && (
          <Grid item xs={12} md={6}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3, 
                border: formData.vaccinationCard ? '2px solid #4caf50' : '2px dashed #ccc', 
                borderRadius: 2,
                textAlign: 'center',
                cursor: 'pointer',
                position: 'relative',
                '&:hover': { borderColor: formData.vaccinationCard ? '#4caf50' : '#667eea' }
              }}
            >
              {formData.vaccinationCard && (
                <IconButton
                  size="small"
                  onClick={() => handleRemoveFile('vaccinationCard')}
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    bgcolor: 'rgba(244, 67, 54, 0.9)',
                    color: 'white',
                    '&:hover': { bgcolor: 'rgba(211, 47, 47, 1)' }
                  }}
                >
                  <Close fontSize="small" />
                </IconButton>
              )}
              {previews.vaccinationCard ? (
                <Box sx={{ mb: 2 }}>
                  {previews.vaccinationCard === 'pdf' ? (
                    <Box>
                      <Description sx={{ fontSize: 48, color: '#4caf50', mb: 1 }} />
                      <Chip 
                        icon={<CheckCircle />} 
                        label="PDF Cargado" 
                        color="success" 
                        size="small" 
                      />
                    </Box>
                  ) : (
                    <Box>
                      <img 
                        src={previews.vaccinationCard} 
                        alt="Preview carnet" 
                        style={{ 
                          maxWidth: '100%', 
                          maxHeight: 200, 
                          borderRadius: 8,
                          objectFit: 'cover'
                        }} 
                      />
                      <Chip 
                        icon={<CheckCircle />} 
                        label="Cargado" 
                        color="success" 
                        size="small" 
                        sx={{ mt: 1 }} 
                      />
                    </Box>
                  )}
                </Box>
              ) : (
                <Description sx={{ fontSize: 48, color: '#667eea', mb: 2 }} />
              )}
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                Carnet de Vacunación
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {formData.vaccinationCard ? formData.vaccinationCard.name : 'Sube el carnet de vacunación'}
              </Typography>
              <Button
                variant={formData.vaccinationCard ? "outlined" : "outlined"}
                component="label"
                startIcon={<CloudUpload />}
                color={formData.vaccinationCard ? "success" : "primary"}
              >
                {formData.vaccinationCard ? 'Cambiar Carnet' : 'Seleccionar Carnet'}
                <input
                  type="file"
                  hidden
                  accept="image/*,application/pdf"
                  onChange={(e) => handleFileChange('vaccinationCard', e.target.files[0])}
                />
              </Button>
            </Paper>
          </Grid>
        )}

        {/* Carnet de vacuna antirrábica (opcional) */}
        {formData.hasRabiesVaccine === 'yes' && (
          <Grid item xs={12} md={6}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3, 
                border: formData.rabiesVaccineCard ? '2px solid #4caf50' : '2px dashed #ccc', 
                borderRadius: 2,
                textAlign: 'center',
                cursor: 'pointer',
                position: 'relative',
                '&:hover': { borderColor: formData.rabiesVaccineCard ? '#4caf50' : '#667eea' }
              }}
            >
              {formData.rabiesVaccineCard && (
                <IconButton
                  size="small"
                  onClick={() => handleRemoveFile('rabiesVaccineCard')}
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    bgcolor: 'rgba(244, 67, 54, 0.9)',
                    color: 'white',
                    '&:hover': { bgcolor: 'rgba(211, 47, 47, 1)' }
                  }}
                >
                  <Close fontSize="small" />
                </IconButton>
              )}
              {previews.rabiesVaccineCard ? (
                <Box sx={{ mb: 2 }}>
                  {previews.rabiesVaccineCard === 'pdf' ? (
                    <Box>
                      <Description sx={{ fontSize: 48, color: '#4caf50', mb: 1 }} />
                      <Chip 
                        icon={<CheckCircle />} 
                        label="PDF Cargado" 
                        color="success" 
                        size="small" 
                      />
                    </Box>
                  ) : (
                    <Box>
                      <img 
                        src={previews.rabiesVaccineCard} 
                        alt="Preview carnet antirrábica" 
                        style={{ 
                          maxWidth: '100%', 
                          maxHeight: 200, 
                          borderRadius: 8,
                          objectFit: 'cover'
                        }} 
                      />
                      <Chip 
                        icon={<CheckCircle />} 
                        label="Cargado" 
                        color="success" 
                        size="small" 
                        sx={{ mt: 1 }} 
                      />
                    </Box>
                  )}
                </Box>
              ) : (
                <Description sx={{ fontSize: 48, color: '#667eea', mb: 2 }} />
              )}
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                Carnet de Vacuna Antirrábica
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {formData.rabiesVaccineCard ? formData.rabiesVaccineCard.name : 'Sube el carnet de vacuna antirrábica'}
              </Typography>
              <Button
                variant={formData.rabiesVaccineCard ? "outlined" : "outlined"}
                component="label"
                startIcon={<CloudUpload />}
                color={formData.rabiesVaccineCard ? "success" : "primary"}
              >
                {formData.rabiesVaccineCard ? 'Cambiar Carnet' : 'Seleccionar Carnet'}
                <input
                  type="file"
                  hidden
                  accept="image/*,application/pdf"
                  onChange={(e) => handleFileChange('rabiesVaccineCard', e.target.files[0])}
                />
              </Button>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default DocumentsUpload;
