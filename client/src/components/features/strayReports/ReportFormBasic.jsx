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
import { Pets, Description, PhotoCamera, CameraAlt, Close, ColorLens, Straighten, MoodOutlined, HealthAndSafety, PriorityHigh, Wc } from '@mui/icons-material';
import { getAllCatalogs } from '../../../services/catalogService';

// Todos los catálogos se cargan dinámicamente desde la BD

const ReportFormBasic = ({ formData, onUpdate, errors }) => {
  const [breeds, setBreeds] = useState([]);
  const [colors, setColors] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [temperaments, setTemperaments] = useState([]);
  const [conditions, setConditions] = useState([]);
  const [urgencies, setUrgencies] = useState([]);
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
        setTemperaments(catalogs.temperaments || []);
        setConditions(catalogs.conditions || []);
        setUrgencies(catalogs.urgencies || []);
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
      <Typography 
        variant="h5" 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1.5, 
          mb: 4,
          color: '#1e293b',
          fontWeight: 600
        }}
      >
        <Pets sx={{ color: '#3b82f6', fontSize: 28 }} /> 
        Información del Perro
      </Typography>

      <Grid container spacing={3}>
        {/* Raza y Tamaño en una fila */}
        <Grid item xs={12} sm={6}>
          <Autocomplete
            options={breeds}
            getOptionLabel={(option) => option.name || option}
            value={breeds.find(b => b.name === formData.breed) || null}
            onChange={(e, newValue) => onUpdate('breed', newValue?.name || '')}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Raza"
                error={!!errors.breed}
                helperText={errors.breed || "Selecciona de la lista"}
                required
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <Pets sx={{ color: '#3b82f6', mr: 1, ml: 1 }} />
                  )
                }}
              />
            )}
          />
        </Grid>

        {/* Tamaño - Mejor ubicación */}
        <Grid item xs={12} sm={6}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Straighten sx={{ color: '#3b82f6', fontSize: 20 }} />
            <Typography sx={{ fontWeight: 600, color: '#1e293b' }}>
              Tamaño *
            </Typography>
          </Box>
          <RadioGroup
            row
            value={formData.size}
            onChange={(e) => onUpdate('size', e.target.value)}
            sx={{ mt: 0.5 }}
          >
            <FormControlLabel value="small" control={<Radio />} label="Pequeño" />
            <FormControlLabel value="medium" control={<Radio />} label="Mediano" />
            <FormControlLabel value="large" control={<Radio />} label="Grande" />
          </RadioGroup>
          {errors.size && (
            <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
              {errors.size}
            </Typography>
          )}
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
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <>
                      <ColorLens sx={{ color: '#3b82f6', mr: 1, ml: 1 }} />
                      {params.InputProps.startAdornment}
                    </>
                  )
                }}
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

        {/* Temperamento, Condición y Urgencia en una fila */}
        <Grid item xs={12} md={4}>
          <TextField
            select
            fullWidth
            label="Temperamento"
            value={formData.temperament}
            onChange={(e) => onUpdate('temperament', e.target.value)}
            InputProps={{
              startAdornment: (
                <MoodOutlined sx={{ color: '#3b82f6', mr: 1 }} />
              )
            }}
          >
            <MenuItem value="">
              <em>Seleccionar...</em>
            </MenuItem>
            {temperaments.map(temp => (
              <MenuItem key={temp.id} value={temp.code}>
                {temp.name}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            select
            fullWidth
            label="Condición"
            value={formData.condition}
            onChange={(e) => onUpdate('condition', e.target.value)}
            InputProps={{
              startAdornment: (
                <HealthAndSafety sx={{ color: '#3b82f6', mr: 1 }} />
              )
            }}
          >
            <MenuItem value="">
              <em>Seleccionar...</em>
            </MenuItem>
            {conditions.map(cond => (
              <MenuItem key={cond.id} value={cond.code}>
                {cond.name}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            select
            fullWidth
            label="Nivel de Urgencia"
            value={formData.urgency}
            onChange={(e) => onUpdate('urgency', e.target.value)}
            InputProps={{
              startAdornment: (
                <PriorityHigh sx={{ color: '#3b82f6', mr: 1 }} />
              )
            }}
          >
            <MenuItem value="">
              <em>Seleccionar...</em>
            </MenuItem>
            {urgencies.map(urg => (
              <MenuItem key={urg.id} value={urg.code}>
                {urg.name}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Género - En la misma fila */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Wc sx={{ color: '#3b82f6', fontSize: 20 }} />
            <Typography sx={{ fontWeight: 600, color: '#1e293b' }}>
              Género
            </Typography>
          </Box>
          <RadioGroup
            row
            value={formData.gender}
            onChange={(e) => onUpdate('gender', e.target.value)}
            sx={{ justifyContent: 'flex-start' }}
          >
            <FormControlLabel value="male" control={<Radio />} label="Macho" />
            <FormControlLabel value="female" control={<Radio />} label="Hembra" />
            <FormControlLabel value="unknown" control={<Radio />} label="No sé" />
          </RadioGroup>
        </Grid>

        {/* Foto del perro y Descripción - Lado a Lado */}
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 1 }}>
            <PhotoCamera sx={{ color: '#3b82f6' }} /> Foto del Perro <Typography component="span" sx={{ color: '#ef4444', ml: 0.5 }}>*</Typography>
          </Typography>
          <Paper elevation={2} sx={{ p: 3, textAlign: 'center', backgroundColor: errors.photo ? '#fff5f5' : '#f5f5f5', border: errors.photo ? '2px solid #ef4444' : 'none' }}>
            {!photoPreview ? (
              <>
                <Button
                  variant="contained"
                  startIcon={<CameraAlt />}
                  onClick={openCamera}
                  fullWidth
                  sx={{ 
                    mb: 2, 
                    background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
                    color: 'white',
                    fontWeight: 600,
                    '&:hover': { 
                      background: 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)',
                      transform: 'translateY(-2px)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Abrir Cámara
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
                  sx={{ 
                    borderColor: '#3b82f6', 
                    color: '#3b82f6',
                    fontWeight: 600,
                    '&:hover': {
                      borderColor: '#1e40af',
                      backgroundColor: 'rgba(59, 130, 246, 0.05)'
                    }
                  }}
                >
                  Subir desde Galería
                </Button>
                <Typography variant="caption" display="block" sx={{ mt: 2, color: errors.photo ? '#ef4444' : 'text.secondary', fontWeight: errors.photo ? 600 : 400 }}>
                  {errors.photo || '⚠️ La foto es obligatoria para ayudar a identificar al perro'}
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
                    height: 300,
                    objectFit: 'cover',
                    borderRadius: 2,
                    mb: 2,
                    border: '2px solid #4CAF50'
                  }}
                />
                <Typography variant="body2" sx={{ mb: 2, fontWeight: 600, color: '#10b981' }}>
                  Foto capturada correctamente
                </Typography>
                <Button
                  variant="text"
                  color="error"
                  onClick={() => {
                    onUpdate('photo', null);
                    setPhotoPreview(null);
                  }}
                >
                  Eliminar foto
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Descripción - Al lado de la foto */}
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 1 }}>
            <Description sx={{ color: '#3b82f6' }} /> Descripción
          </Typography>
          <TextField
            fullWidth
            label="Descripción del Perro"
            multiline
            rows={15}
            value={formData.description}
            onChange={(e) => onUpdate('description', e.target.value)}
            placeholder="Describe características únicas, comportamiento, estado de salud, ubicación exacta donde lo viste, etc."
            required
            error={!!errors.description}
            helperText={errors.description || "Esta información es importante para ayudar al perro"}
            sx={{
              '& .MuiOutlinedInput-root': {
                alignItems: 'flex-start'
              }
            }}
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
              sx={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
                color: 'white',
                fontWeight: 600
              }}
            >
              Capturar Foto
            </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReportFormBasic;
