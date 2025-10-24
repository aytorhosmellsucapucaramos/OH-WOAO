/**
 * DocumentsUpload Component
 * Carga de documentos y fotos
 */

import React from 'react';
import { Grid, Typography, Box, Button, Paper } from '@mui/material';
import { CloudUpload, Image, Description } from '@mui/icons-material';

const DocumentsUpload = ({ formData, onUpdate }) => {
  const handleFileChange = (field, file) => {
    onUpdate(field, file);
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
              border: '2px dashed #ccc', 
              borderRadius: 2,
              textAlign: 'center',
              cursor: 'pointer',
              '&:hover': { borderColor: '#667eea' }
            }}
          >
            <Image sx={{ fontSize: 48, color: '#667eea', mb: 2 }} />
            <Typography variant="subtitle1" gutterBottom>
              Foto Frontal de la Mascota
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {formData.photoFront ? formData.photoFront.name : 'Sube una foto frontal clara de tu mascota'}
            </Typography>
            <Button
              variant="contained"
              component="label"
              startIcon={<CloudUpload />}
            >
              Seleccionar Foto Frontal
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
              border: '2px dashed #ccc', 
              borderRadius: 2,
              textAlign: 'center',
              cursor: 'pointer',
              '&:hover': { borderColor: '#667eea' }
            }}
          >
            <Image sx={{ fontSize: 48, color: '#667eea', mb: 2 }} />
            <Typography variant="subtitle1" gutterBottom>
              Foto Lateral de la Mascota
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {formData.photoSide ? formData.photoSide.name : 'Sube una foto lateral clara de tu mascota'}
            </Typography>
            <Button
              variant="contained"
              component="label"
              startIcon={<CloudUpload />}
            >
              Seleccionar Foto Lateral
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
              border: '2px dashed #ccc', 
              borderRadius: 2,
              textAlign: 'center',
              cursor: 'pointer',
              '&:hover': { borderColor: '#667eea' }
            }}
          >
            <Description sx={{ fontSize: 48, color: '#667eea', mb: 2 }} />
            <Typography variant="subtitle1" gutterBottom>
              Foto del DNI
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {formData.dniPhoto ? formData.dniPhoto.name : 'Sube una foto de tu DNI'}
            </Typography>
            <Button
              variant="contained"
              component="label"
              startIcon={<CloudUpload />}
            >
              Seleccionar DNI
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
                border: '2px dashed #ccc', 
                borderRadius: 2,
                textAlign: 'center',
                cursor: 'pointer',
                '&:hover': { borderColor: '#667eea' }
              }}
            >
              <Description sx={{ fontSize: 48, color: '#667eea', mb: 2 }} />
              <Typography variant="subtitle1" gutterBottom>
                Carnet de Vacunación
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {formData.vaccinationCard ? formData.vaccinationCard.name : 'Sube el carnet de vacunación'}
              </Typography>
              <Button
                variant="outlined"
                component="label"
                startIcon={<CloudUpload />}
              >
                Seleccionar Carnet
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
                border: '2px dashed #ccc', 
                borderRadius: 2,
                textAlign: 'center',
                cursor: 'pointer',
                '&:hover': { borderColor: '#667eea' }
              }}
            >
              <Description sx={{ fontSize: 48, color: '#667eea', mb: 2 }} />
              <Typography variant="subtitle1" gutterBottom>
                Carnet de Vacuna Antirrábica
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {formData.rabiesVaccineCard ? formData.rabiesVaccineCard.name : 'Sube el carnet de vacuna antirrábica'}
              </Typography>
              <Button
                variant="outlined"
                component="label"
                startIcon={<CloudUpload />}
              >
                Seleccionar Carnet
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
