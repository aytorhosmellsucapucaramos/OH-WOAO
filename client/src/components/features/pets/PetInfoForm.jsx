/**
 * PetInfoForm Component
 * Formulario de información de la mascota
 */

import React, { useState, useEffect } from 'react';
import {
  Grid, TextField, FormControl, InputLabel, Select, MenuItem,
  Typography, Box, RadioGroup, FormControlLabel, Radio, Dialog,
  DialogTitle, DialogContent, DialogActions, Button, Alert, CircularProgress,
  Autocomplete
} from '@mui/material';
import { Pets } from '@mui/icons-material';
import { getAllCatalogs } from '../../../services/catalogService';

// Razas peligrosas que requieren pago
const DANGEROUS_BREEDS = [
  'Pit Bull Terrier',
  'Dogo Argentino',
  'Fila Brasilero',
  'Tosa Japonesa',
  'Bul Mastiff',
  'Doberman',
  'Rottweiler'
];

const PetInfoForm = ({ formData, onUpdate, errors }) => {
  const [breeds, setBreeds] = useState([]);
  const [colors, setColors] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showOtherBreed, setShowOtherBreed] = useState(false);
  const [showOtherColor, setShowOtherColor] = useState(false);
  const [paymentData, setPaymentData] = useState({
    receiptNumber: '',
    issueDate: '',
    fullName: '',
    amountPaid: ''
  });

  // Cargar catálogos desde la base de datos
  useEffect(() => {
    const loadCatalogs = async () => {
      try {
        const catalogs = await getAllCatalogs();
        setBreeds([...catalogs.breeds, { id: 'other', name: 'Otro' }]);
        setColors([...catalogs.colors, { id: 'other', name: 'Otro' }]);
        setSizes(catalogs.sizes);
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
    if (DANGEROUS_BREEDS.includes(value)) {
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
    setShowPaymentModal(false);
  };

  const handlePaymentDataChange = (field, value) => {
    setPaymentData(prev => ({ ...prev, [field]: value }));
  };

  const handleSavePayment = () => {
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
                helperText={errors.breed}
                placeholder="Buscar raza..."
              />
            )}
            freeSolo
            onInputChange={(event, newInputValue) => {
              if (event?.type === 'change') {
                onUpdate('breed', newInputValue);
              }
            }}
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
            options={sizes}
            getOptionLabel={(option) => option.name || option}
            value={sizes.find(s => s.code === formData.size) || null}
            onChange={(event, newValue) => {
              if (newValue) {
                onUpdate('size', newValue.code);
              } else {
                onUpdate('size', '');
              }
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Tamaño"
                placeholder="Seleccionar tamaño..."
              />
            )}
          />
        </Grid>

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
                helperText={errors.color}
                placeholder="Buscar color..."
              />
            )}
            freeSolo
            onInputChange={(event, newInputValue) => {
              if (event?.type === 'change') {
                onUpdate('color', newInputValue);
              }
            }}
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
          />
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
      </Grid>

      {/* Modal de pago para razas peligrosas */}
      <Dialog open={showPaymentModal} onClose={handlePaymentModalClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Esta raza requiere un pago adicional en la municipalidad
          </Alert>
          Datos del Pago en Caja
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Número de Recibo de Caja"
                value={paymentData.receiptNumber}
                onChange={(e) => handlePaymentDataChange('receiptNumber', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Fecha de Emisión"
                type="date"
                value={paymentData.issueDate}
                onChange={(e) => handlePaymentDataChange('issueDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nombre/Razón Social"
                value={paymentData.fullName}
                onChange={(e) => handlePaymentDataChange('fullName', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Monto Pagado (S/.)"
                type="number"
                value={paymentData.amountPaid}
                onChange={(e) => handlePaymentDataChange('amountPaid', e.target.value)}
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handlePaymentModalClose}>Cancelar</Button>
          <Button onClick={handleSavePayment} variant="contained" color="primary">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PetInfoForm;
