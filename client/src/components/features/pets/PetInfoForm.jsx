/**
 * PetInfoForm Component
 * Formulario de información de la mascota
 */

import React, { useState, useEffect } from 'react';
import {
  Grid, TextField, FormControl, InputLabel, Select, MenuItem,
  Typography, Box, RadioGroup, FormControlLabel, Radio, Dialog,
  DialogTitle, DialogContent, DialogActions, Button, Alert, CircularProgress,
  Autocomplete, InputAdornment
} from '@mui/material';
import { Pets, Straighten, Palette, Cake, Schedule } from '@mui/icons-material';
import { getAllCatalogs } from '../../../services/catalogService';

// Razas peligrosas que requieren pago de S/.52.20
// Según ordenanza municipal de la Municipalidad Provincial de Puno
const DANGEROUS_BREEDS = [
  'Pit Bull Terrier',
  'Pitbull',
  'American Pit Bull Terrier',
  'Dogo Argentino',
  'Fila Brasilero',
  'Fila Brasileiro',
  'Tosa Japonesa',
  'Tosa Inu',
  'Bul Mastiff',
  'Bull Mastiff',
  'Bullmastiff',
  'Doberman',
  'Dobermann',
  'Doberman Pinscher',
  'Rottweiler',
  'Rotweller'
];

// Función para verificar si una raza es peligrosa (case-insensitive y flexible)
const isDangerousBreed = (breedName) => {
  if (!breedName) return false;
  const normalized = breedName.toLowerCase().trim();
  return DANGEROUS_BREEDS.some(dangerous => 
    dangerous.toLowerCase().includes(normalized) || 
    normalized.includes(dangerous.toLowerCase())
  );
};

const PetInfoForm = ({ formData, onUpdate, errors }) => {
  const [breeds, setBreeds] = useState([]);
  const [colors, setColors] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [medicalHistories, setMedicalHistories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showOtherBreed, setShowOtherBreed] = useState(false);
  const [showOtherColor, setShowOtherColor] = useState(false);
  const [paymentData, setPaymentData] = useState({
    receiptNumber: '',
    issueDate: '',
    fullName: '',
    amountPaid: '52.20'
  });

  // Cargar catálogos desde la base de datos
  useEffect(() => {
    const loadCatalogs = async () => {
      try {
        const catalogs = await getAllCatalogs();
        setBreeds([...catalogs.breeds, { id: 'other', name: 'Otro' }]);
        setColors([...catalogs.colors, { id: 'other', name: 'Otro' }]);
        setSizes(catalogs.sizes);
        setMedicalHistories(catalogs.medicalHistories || []);
      } catch (error) {
        console.error('Error loading catalogs:', error);
      } finally {
        setLoading(false);
      }
    };
    loadCatalogs();
  }, []);

  // Calcular edad automáticamente
  useEffect(() => {
    if (formData.birthDate) {
      const birthDate = new Date(formData.birthDate);
      const today = new Date();
      const ageInMonths = Math.floor(
        (today.getFullYear() - birthDate.getFullYear()) * 12 +
        (today.getMonth() - birthDate.getMonth())
      );
      onUpdate('age', ageInMonths);
    }
  }, [formData.birthDate]);

  const handleBreedChange = (value) => {
    // Verificar si es raza peligrosa
    if (isDangerousBreed(value)) {
      setShowPaymentModal(true);
    }
    
    if (value === 'Otro') {
      setShowOtherBreed(true);
      onUpdate('breed', '');
    } else {
      setShowOtherBreed(false);
      onUpdate('breed', value);
    }
  };

  const handleColorChange = (value) => {
    if (value === 'Otro') {
      setShowOtherColor(true);
      onUpdate('color', '');
    } else {
      setShowOtherColor(false);
      onUpdate('color', value);
    }
  };

  const handlePaymentModalClose = () => {
    // Al cancelar, limpiar la raza seleccionada para que vuelva a elegir
    onUpdate('breed', '');
    setShowOtherBreed(false); // Resetear también el estado de "Otro"
    setShowPaymentModal(false);
    
    // Limpiar datos del pago
    setPaymentData({
      receiptNumber: '',
      issueDate: '',
      fullName: '',
      amountPaid: '52.20'
    });
  };

  const handlePaymentDataChange = (field, value) => {
    setPaymentData(prev => ({ ...prev, [field]: value }));
  };

  const handleSavePayment = () => {
    // Validar que todos los campos estén llenos
    if (!paymentData.receiptNumber || !paymentData.issueDate || 
        !paymentData.fullName || !paymentData.amountPaid) {
      alert('Por favor complete todos los campos del recibo de pago');
      return;
    }
    
    // Validar que el monto sea mayor a 0
    if (parseFloat(paymentData.amountPaid) <= 0) {
      alert('El monto pagado debe ser mayor a 0');
      return;
    }
    
    onUpdate('paymentData', paymentData);
    setShowPaymentModal(false);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <Pets /> Información de la Mascota
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Nombre de la Mascota"
            value={formData.petName}
            onChange={(e) => onUpdate('petName', e.target.value)}
            error={!!errors.petName}
            helperText={errors.petName}
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Pets sx={{ color: formData.petName ? '#428cef' : '#9e9e9e' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                '&.Mui-focused fieldset': {
                  borderColor: formData.petName ? '#428cef' : '#1976d2',
                },
                '& fieldset': {
                  borderColor: formData.petName ? '#428cef' : 'rgba(0, 0, 0, 0.23)',
                },
              },
              '& .MuiInputLabel-root': {
                color: formData.petName ? '#428cef' : 'rgba(0, 0, 0, 0.6)',
                '&.Mui-focused': {
                  color: formData.petName ? '#428cef' : '#1976d2',
                },
              },
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Autocomplete
            options={breeds}
            getOptionLabel={(option) => option.name || option}
            value={breeds.find(b => b.name === formData.breed) || null}
            onChange={(event, newValue) => {
              if (newValue) {
                handleBreedChange(newValue.name);
              } else {
                onUpdate('breed', '');
              }
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Raza"
                required
                error={!!errors.breed}
                helperText={errors.breed || "Debes seleccionar una raza de la lista"}
                placeholder="Buscar y seleccionar raza..."
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <InputAdornment position="start">
                      <Pets sx={{ color: formData.breed ? '#428cef' : '#9e9e9e' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': {
                      borderColor: formData.breed ? '#428cef' : '#1976d2',
                    },
                    '& fieldset': {
                      borderColor: formData.breed ? '#428cef' : 'rgba(0, 0, 0, 0.23)',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: formData.breed ? '#428cef' : 'rgba(0, 0, 0, 0.6)',
                    '&.Mui-focused': {
                      color: formData.breed ? '#428cef' : '#1976d2',
                    },
                  },
                }}
              />
            )}
          />
        </Grid>

        {showOtherBreed && (
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Especifique la raza"
              value={formData.breed}
              onChange={(e) => onUpdate('breed', e.target.value)}
              multiline
              rows={2}
              required
            />
          </Grid>
        )}

        <Grid item xs={12} sm={6}>
          <Autocomplete
            options={colors}
            getOptionLabel={(option) => option.name || option}
            value={colors.find(c => c.name === formData.color) || null}
            onChange={(event, newValue) => {
              if (newValue) {
                handleColorChange(newValue.name);
              } else {
                onUpdate('color', '');
              }
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Color del Can"
                required
                error={!!errors.color}
                helperText={errors.color || "Debes seleccionar un color de la lista"}
                placeholder="Buscar y seleccionar color..."
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <InputAdornment position="start">
                      <Palette sx={{ color: formData.color ? '#428cef' : '#9e9e9e' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': {
                      borderColor: formData.color ? '#428cef' : '#1976d2',
                    },
                    '& fieldset': {
                      borderColor: formData.color ? '#428cef' : 'rgba(0, 0, 0, 0.23)',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: formData.color ? '#428cef' : 'rgba(0, 0, 0, 0.6)',
                    '&.Mui-focused': {
                      color: formData.color ? '#428cef' : '#1976d2',
                    },
                  },
                }}
              />
            )}
          />
        </Grid>

        {showOtherColor && (
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Especifique el color"
              value={formData.color}
              onChange={(e) => onUpdate('color', e.target.value)}
              multiline
              rows={2}
              required
            />
          </Grid>
        )}

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Fecha de Nacimiento"
            type="date"
            value={formData.birthDate}
            onChange={(e) => onUpdate('birthDate', e.target.value)}
            error={!!errors.birthDate}
            helperText={errors.birthDate}
            InputLabelProps={{ shrink: true }}
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Cake sx={{ color: formData.birthDate ? '#428cef' : '#9e9e9e' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                '&.Mui-focused fieldset': {
                  borderColor: formData.birthDate ? '#428cef' : '#1976d2',
                },
                '& fieldset': {
                  borderColor: formData.birthDate ? '#428cef' : 'rgba(0, 0, 0, 0.23)',
                },
              },
              '& .MuiInputLabel-root': {
                color: formData.birthDate ? '#428cef' : 'rgba(0, 0, 0, 0.6)',
                '&.Mui-focused': {
                  color: formData.birthDate ? '#428cef' : '#1976d2',
                },
              },
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Edad (meses)"
            type="number"
            value={formData.age}
            onChange={(e) => onUpdate('age', e.target.value)}
            helperText="Calculado automáticamente desde la fecha de nacimiento"
            disabled
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Schedule sx={{ color: formData.age ? '#428cef' : '#9e9e9e' }} />
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        <Grid item xs={12}>
          <Typography variant="subtitle2" gutterBottom>
            Tamaño
          </Typography>
          <RadioGroup
            row
            value={formData.size}
            onChange={(e) => onUpdate('size', e.target.value)}
          >
            <FormControlLabel value="small" control={<Radio />} label="Pequeño" />
            <FormControlLabel value="medium" control={<Radio />} label="Mediano" />
            <FormControlLabel value="large" control={<Radio />} label="Grande" />
          </RadioGroup>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="subtitle2" gutterBottom>
            Sexo
          </Typography>
          <RadioGroup
            row
            value={formData.sex}
            onChange={(e) => onUpdate('sex', e.target.value)}
          >
            <FormControlLabel value="male" control={<Radio />} label="Macho" />
            <FormControlLabel value="female" control={<Radio />} label="Hembra" />
          </RadioGroup>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="subtitle2" gutterBottom>
            ¿Tiene cartilla de vacunación?
          </Typography>
          <RadioGroup
            row
            value={formData.hasVaccinationCard}
            onChange={(e) => onUpdate('hasVaccinationCard', e.target.value)}
          >
            <FormControlLabel value="yes" control={<Radio />} label="Sí" />
            <FormControlLabel value="no" control={<Radio />} label="No" />
          </RadioGroup>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="subtitle2" gutterBottom>
            ¿Tiene vacuna antirrábica?
          </Typography>
          <RadioGroup
            row
            value={formData.hasRabiesVaccine}
            onChange={(e) => onUpdate('hasRabiesVaccine', e.target.value)}
          >
            <FormControlLabel value="yes" control={<Radio />} label="Sí" />
            <FormControlLabel value="no" control={<Radio />} label="No" />
          </RadioGroup>
        </Grid>

        {/* ========== PASO 2B: PERFIL DE COMPORTAMIENTO ========== */}
        <Grid item xs={12}>
          <Box sx={{ mt: 3, mb: 2, pt: 3, borderTop: '2px solid #e0e0e0' }}>
            <Typography 
              variant="h6" 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                color: '#428cef',
                fontWeight: 600 
              }}
            >
              🐾 Perfil de Comportamiento
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Información opcional que ayuda a conocer mejor a tu mascota
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel>Temperamento</InputLabel>
            <Select
              value={formData.temperament}
              onChange={(e) => onUpdate('temperament', e.target.value)}
              label="Temperamento"
            >
              <MenuItem value="">
                <em>No especificado</em>
              </MenuItem>
              <MenuItem value="muy_sociable">🌟 Muy Sociable - Amigable con todos</MenuItem>
              <MenuItem value="sociable">😊 Sociable - Se lleva bien en general</MenuItem>
              <MenuItem value="reservado">🤔 Reservado/Tímido - Observador antes de interactuar</MenuItem>
              <MenuItem value="territorial">🏠 Territorial - Protector de su espacio</MenuItem>
              <MenuItem value="requiere_atencion">⚠️ Requiere Atención Especial - Manejo cuidadoso</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* Antecedentes Médicos */}
        <Grid item xs={12}>
          <FormControl fullWidth size="medium">
            <InputLabel id="medical-history-label">Antecedentes Médicos</InputLabel>
            <Select
              labelId="medical-history-label"
              label="Antecedentes Médicos"
              value={formData.medicalHistory || 'none'}
              onChange={(e) => onUpdate('medicalHistory', e.target.value)}
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: 300,
                    width: 'auto'
                  }
                }
              }}
              sx={{
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: formData.medicalHistory && formData.medicalHistory !== 'none' ? '#428cef' : 'rgba(0, 0, 0, 0.23)',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#428cef',
                },
              }}
            >
              {medicalHistories.map((history) => (
                <MenuItem key={history.id} value={history.code}>
                  {history.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Campo de texto para "Otros" antecedentes médicos */}
        {formData.medicalHistory === 'other' && (
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={2}
              label="Especifique los antecedentes médicos"
              placeholder="Ej: Tiene tendencia a infecciones de oído, le recetaron dieta especial..."
              value={formData.medicalHistoryDetails || ''}
              onChange={(e) => onUpdate('medicalHistoryDetails', e.target.value)}
              inputProps={{ maxLength: 300 }}
              helperText={`${formData.medicalHistoryDetails?.length || 0}/300 caracteres`}
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused fieldset': {
                    borderColor: '#428cef',
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#428cef',
                },
              }}
            />
          </Grid>
        )}

        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Características Adicionales y Comportamiento"
            placeholder="Ej: Le gusta jugar con niños, tiene cicatriz en pata derecha, le teme a los truenos, muy juguetón..."
            value={formData.additionalFeatures}
            onChange={(e) => onUpdate('additionalFeatures', e.target.value)}
            inputProps={{ maxLength: 500 }}
            helperText={`${formData.additionalFeatures?.length || 0}/500 caracteres`}
            sx={{
              '& .MuiOutlinedInput-root': {
                '&.Mui-focused fieldset': {
                  borderColor: '#428cef',
                },
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: '#428cef',
              },
            }}
          />
        </Grid>

        {formData.temperament === 'requiere_atencion' && (
          <Grid item xs={12}>
            <Alert severity="info" sx={{ mt: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                Gracias por indicar que tu mascota requiere atención especial
              </Typography>
              <Typography variant="body2">
                Por favor, describe en "Características Adicionales" los detalles del tipo de atención que necesita 
                (ej: se pone nervioso con extraños, necesita espacio cuando come, etc.)
              </Typography>
            </Alert>
          </Grid>
        )}
      </Grid>

      {/* Modal de pago para razas peligrosas */}
      <Dialog 
        open={showPaymentModal} 
        onClose={(event, reason) => {
          // Prevenir cerrar con ESC o click fuera
          if (reason !== 'backdropClick' && reason !== 'escapeKeyDown') {
            handlePaymentModalClose();
          }
        }} 
        maxWidth="md" 
        fullWidth
        disableEscapeKeyDown
      >
        <DialogTitle>
          Raza Potencialmente Peligrosa - Pago Requerido
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            <strong>⚠️ Raza Potencialmente Peligrosa</strong>
            <br />
            El can que desea registrar está considerado una raza peligrosa según la normativa municipal.
            <br />
            <strong>Deberá pagar/depositar a la Municipalidad Provincial de Puno el monto de S/.52.20</strong>
          </Alert>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 2, mb: 1 }}>
            Información de Pago
          </Typography>
          <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1, mb: 2 }}>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              <strong>Cuenta:</strong> 00701-038452
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              <strong>Teléfono:</strong> (051) 601000, Anexo: 2071
            </Typography>
            <Typography variant="body2">
              <strong>Correo:</strong> ogambiental@munipuno.gob.pe
            </Typography>
          </Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
            Datos del Recibo de Pago (Obligatorio)
          </Typography>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="N° RECIBO DE CAJA"
                value={paymentData.receiptNumber}
                onChange={(e) => handlePaymentDataChange('receiptNumber', e.target.value)}
                placeholder="Ingrese el número de recibo"
                required
                helperText="Número del comprobante emitido por caja municipal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="EMISIÓN"
                type="date"
                value={paymentData.issueDate}
                onChange={(e) => handlePaymentDataChange('issueDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
                required
                helperText="Fecha de emisión del recibo"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Monto Pagado (S/.)"
                type="number"
                value={paymentData.amountPaid}
                onChange={(e) => handlePaymentDataChange('amountPaid', e.target.value)}
                required
                helperText="Monto establecido: S/.52.20"
                inputProps={{ step: "0.01", min: "52.20" }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="NOMBRE / RAZÓN SOCIAL"
                value={paymentData.fullName}
                onChange={(e) => handlePaymentDataChange('fullName', e.target.value)}
                placeholder="Nombre completo del pagador según recibo"
                required
                helperText="Nombre o razón social registrado en el recibo de pago"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handlePaymentModalClose} color="error">
            Cancelar y Cambiar Raza
          </Button>
          <Button onClick={handleSavePayment} variant="contained" color="primary">
            Guardar y Continuar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PetInfoForm;
