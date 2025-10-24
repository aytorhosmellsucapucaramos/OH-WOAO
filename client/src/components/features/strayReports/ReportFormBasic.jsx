/**
 * ReportFormBasic Component
 * Formulario básico de información del reporte
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Box, TextField, FormControl, InputLabel, Select, MenuItem,
  Typography, Grid, Chip, OutlinedInput, Autocomplete, CircularProgress,
  Button, Paper, IconButton, Dialog, DialogContent, DialogActions, RadioGroup,
  FormControlLabel, Radio
} from '@mui/material';
import { Pets, Description, PhotoCamera, CameraAlt, Close } from '@mui/icons-material';
import { getAllCatalogs } from '../../../services/catalogService';

// Los catálogos de raza y colores se cargan dinámicamente desde la BD
// Tamaños desde BD también
const TEMPERAMENTS = [
  { value: 'friendly', label: '😊 Amigable' },
  { value: 'neutral', label: '😐 Neutral' },
  { value: 'aggressive', label: '😠 Agresivo' },
  { value: 'scared', label: '😰 Asustado' }
];
const CONDITIONS = [
  { value: 'stray', label: 'Callejero' },
  { value: 'injured', label: 'Herido' },
  { value: 'lost', label: 'Perdido' }
];
const URGENCIES = [
  { value: 'low', label: '🟢 Baja' },
  { value: 'normal', label: '🟡 Normal' },
  { value: 'high', label: '🟠 Alta' },
  { value: 'emergency', label: '🔴 Emergencia' }
];

const ReportFormBasic = ({ formData, onUpdate, errors }) => {
  const [breeds, setBreeds] = useState([]);
  const [colors, setColors] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [stream, setStream] = useState(null);
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);

  // Cargar catálogos desde BD
  useEffect(() => {
    const loadCatalogs = async () => {
      try {
        const catalogs = await getAllCatalogs();
        setBreeds(catalogs.breeds || []);
        setColors(catalogs.colors || []);
        setSizes(catalogs.sizes || []);
      } catch (error) {
        console.error('Error loading catalogs:', error);
      } finally {
        setLoading(false);
      }
    };
    loadCatalogs();
  }, []);

  // Cleanup camera stream
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  // Manejar cambio de foto desde galería
  const handlePhotoChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      onUpdate('photo', file);
      const reader = new FileReader();
      reader.onload = (e) => setPhotoPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  // Abrir cámara
  const openCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      setStream(mediaStream);
      setCameraOpen(true);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('No se pudo acceder a la cámara. Verifica los permisos.');
    }
  };

  // Cerrar cámara
  const closeCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setCameraOpen(false);
  };

  // Capturar foto
  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0) {
      alert('La cámara aún no está lista. Espera un momento.');
      return;
    }
    
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convertir canvas a blob y crear File
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `stray-dog-${Date.now()}.jpg`, { 
          type: 'image/jpeg',
          lastModified: Date.now()
        });
        
        console.log('Foto capturada:', file.name, file.size, 'bytes');
        
        // Actualizar formData con el archivo
        onUpdate('photo', file);
        
        // Mostrar preview
        const previewUrl = canvas.toDataURL('image/jpeg', 0.8);
        setPhotoPreview(previewUrl);
        
        closeCamera();
      } else {
        alert('Error al capturar la foto. Intenta nuevamente.');
      }
    }, 'image/jpeg', 0.85);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <Pets /> Información del Perro
      </Typography>

      <Grid container spacing={3}>
        {/* Raza - Autocomplete desde BD */}
        <Grid item xs={12} sm={6}>
          <Autocomplete
            options={breeds}
            getOptionLabel={(option) => option.name || option}
            value={breeds.find(b => b.name === formData.breed) || null}
            onChange={(e, newValue) => onUpdate('breed', newValue?.name || '')}
            freeSolo
            renderInput={(params) => (
              <TextField
                {...params}
                label="Raza"
                error={!!errors.breed}
                helperText={errors.breed}
                required
              />
            )}
          />
        </Grid>

        {/* Tamaño - Desde BD */}
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Tamaño</InputLabel>
            <Select
              value={formData.size}
              onChange={(e) => onUpdate('size', e.target.value)}
              label="Tamaño"
            >
              {sizes.map(size => (
                <MenuItem key={size.id} value={size.code}>
                  {size.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Colores - Autocomplete múltiple desde BD */}
        <Grid item xs={12}>
          <Autocomplete
            multiple
            options={colors}
            getOptionLabel={(option) => option.name || option}
            value={colors.filter(c => formData.colors.includes(c.name))}
            onChange={(e, newValue) => {
              const selectedColors = newValue.map(v => v.name);
              onUpdate('colors', selectedColors);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Colores"
                error={!!errors.colors}
                helperText={errors.colors || "Puedes seleccionar múltiples colores"}
              />
            )}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  key={option.id}
                  label={option.name}
                  size="small"
                  {...getTagProps({ index })}
                />
              ))
            }
          />
        </Grid>

        {/* Temperamento */}
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Temperamento</InputLabel>
            <Select
              value={formData.temperament}
              onChange={(e) => onUpdate('temperament', e.target.value)}
              label="Temperamento"
            >
              {TEMPERAMENTS.map(temp => (
                <MenuItem key={temp.value} value={temp.value}>
                  {temp.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Condición */}
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Condición</InputLabel>
            <Select
              value={formData.condition}
              onChange={(e) => onUpdate('condition', e.target.value)}
              label="Condición"
            >
              {CONDITIONS.map(cond => (
                <MenuItem key={cond.value} value={cond.value}>
                  {cond.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Urgencia */}
        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel>Nivel de Urgencia</InputLabel>
            <Select
              value={formData.urgency}
              onChange={(e) => onUpdate('urgency', e.target.value)}
              label="Nivel de Urgencia"
            >
              {URGENCIES.map(urg => (
                <MenuItem key={urg.value} value={urg.value}>
                  {urg.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Género */}
        <Grid item xs={12}>
          <Typography gutterBottom sx={{ fontWeight: 500 }}>
            Género
          </Typography>
          <RadioGroup
            row
            value={formData.gender}
            onChange={(e) => onUpdate('gender', e.target.value)}
          >
            <FormControlLabel value="male" control={<Radio />} label="Macho ♂️" />
            <FormControlLabel value="female" control={<Radio />} label="Hembra ♀️" />
            <FormControlLabel value="unknown" control={<Radio />} label="No sé ❓" />
          </RadioGroup>
        </Grid>

        {/* Foto del perro */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 500 }}>
            📸 Foto del Perro
          </Typography>
          <Paper elevation={2} sx={{ p: 3, textAlign: 'center', backgroundColor: '#f5f5f5' }}>
            {!photoPreview ? (
              <>
                <Button
                  variant="contained"
                  startIcon={<CameraAlt />}
                  onClick={openCamera}
                  fullWidth
                  sx={{ mb: 2, backgroundColor: '#4CAF50', '&:hover': { backgroundColor: '#45a049' } }}
                >
                  📸 Abrir Cámara
                </Button>
                <input
                  ref={fileInputRef}
                  accept="image/*"
                  style={{ display: 'none' }}
                  type="file"
                  onChange={handlePhotoChange}
                />
                <Button
                  variant="outlined"
                  startIcon={<PhotoCamera />}
                  onClick={() => fileInputRef.current?.click()}
                  fullWidth
                  sx={{ borderColor: '#2196F3', color: '#2196F3' }}
                >
                  📁 Subir desde Galería
                </Button>
                <Typography variant="caption" display="block" sx={{ mt: 2, color: 'text.secondary' }}>
                  La foto ayuda a identificar mejor al perro
                </Typography>
              </>
            ) : (
              <Box>
                <Box
                  component="img"
                  src={photoPreview}
                  alt="Preview"
                  sx={{
                    width: '100%',
                    maxHeight: 300,
                    objectFit: 'cover',
                    borderRadius: 2,
                    mb: 2,
                    border: '2px solid #4CAF50'
                  }}
                />
                <Typography variant="body2" color="success.main" sx={{ mb: 2, fontWeight: 600 }}>
                  ✅ Foto capturada correctamente
                </Typography>
                <Button
                  variant="text"
                  color="error"
                  onClick={() => {
                    onUpdate('photo', null);
                    setPhotoPreview(null);
                  }}
                >
                  🗑️ Eliminar foto
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Descripción */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Descripción Adicional"
            multiline
            rows={4}
            value={formData.description}
            onChange={(e) => onUpdate('description', e.target.value)}
            placeholder="Describe características únicas, comportamiento, ubicación exacta, etc."
          />
        </Grid>
      </Grid>

      {/* Dialog de Cámara */}
      <Dialog 
        open={cameraOpen} 
        onClose={closeCamera}
        maxWidth="md"
        fullWidth
      >
        <DialogContent>
          <Box sx={{ position: 'relative', backgroundColor: '#000' }}>
            <video 
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{ 
                width: '100%', 
                borderRadius: '8px',
                display: 'block',
                minHeight: '300px'
              }}
              onLoadedMetadata={() => {
                console.log('Video listo:', videoRef.current?.videoWidth, 'x', videoRef.current?.videoHeight);
              }}
            />
            <IconButton
              onClick={closeCamera}
              sx={{
                position: 'absolute',
                top: 10,
                right: 10,
                bgcolor: 'rgba(0,0,0,0.5)',
                color: 'white',
                '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
              }}
            >
              <Close />
            </IconButton>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeCamera} color="inherit">
            Cancelar
          </Button>
          <Button 
            variant="contained" 
            startIcon={<PhotoCamera />}
            onClick={capturePhoto}
            color="primary"
          >
            📸 Capturar Foto
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReportFormBasic;
