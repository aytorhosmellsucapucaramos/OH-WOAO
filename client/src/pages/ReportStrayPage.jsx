/**
 * ReportStrayPage - REFACTORIZADO
 * Página para reportar perros callejeros simplificada
 * REQUIERE AUTENTICACIÓN: Solo usuarios logueados pueden reportar
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Typography, Box, Paper, Button, Alert,
  Stepper, Step, StepLabel, Grid, StepIcon
} from '@mui/material';
import { Send, ArrowBack, NavigateNext, Pets, LocationOn, Person } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useStrayReportForm } from '../hooks/useStrayReportForm';
import ReportFormBasic from '../components/features/strayReports/ReportFormBasic';
import LocationPicker from '../components/features/strayReports/LocationPicker';
import { isAuthenticated } from '../services/authService';
import StepProgress from '../components/common/StepProgress';

const STEPS = [
  'Información del Perro',
  'Ubicación del Avistamiento'
];

// Icono personalizado de patita para el stepper (copiado de RegisterPage)
const PawStepIcon = (props) => {
  const { active, completed, icon } = props;

  return (
    <Box
      sx={{
        position: 'relative',
        width: { xs: 50, sm: 60, md: 70 },
        height: { xs: 50, sm: 60, md: 70 },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: completed || active ? '#428cef' : '#ffffff',
        borderRadius: '50%',
        border: '3px solid',
        borderColor: completed || active ? '#428cef' : '#e0e0e0',
        boxShadow: completed || active ? '0 2px 8px rgba(66, 140, 239, 0.3)' : '0 1px 3px rgba(0, 0, 0, 0.1)',
        transition: 'all 0.3s ease',
      }}
    >
      {/* Imagen de la patita */}
      <Box
        component="img"
        src="/images/cards/paw-darkblue.svg"
        alt="paw"
        sx={{
          width: '80%',
          height: '80%',
          position: 'absolute',
          filter: completed
            ? 'brightness(0) invert(1)' // Blanco cuando está completado
            : active
              ? 'brightness(0) invert(1)' // Blanco cuando está activo
              : 'grayscale(100%) brightness(1.8)',
          opacity: completed ? 1 : active ? 1 : 0.5,
          transition: 'all 0.3s ease',
        }}
      />
      {/* Número dentro de la patita */}
      <Typography
        sx={{
          position: 'relative',
          zIndex: 2,
          fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1.1rem' },
          fontWeight: 700,
          color: completed || active ? '#428cef' : '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mt: { xs: '12px', sm: '14px', md: '16px' },
          transition: 'all 0.3s ease',
          textShadow: !completed && !active ? '0 1px 2px rgba(0, 0, 0, 0.3)' : 'none',
        }}
      >
        {icon}
      </Typography>
    </Box>
  );
};

const ReportStrayPage = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);

  // Verificar autenticación al cargar la página
  useEffect(() => {
    if (!isAuthenticated()) {
      console.warn('⚠️ Usuario no autenticado intentando reportar');
      navigate('/login', {
        state: {
          from: '/report-stray',
          message: 'Debes iniciar sesión para reportar un perro callejero'
        }
      });
    }
  }, [navigate]);

  const {
    formData,
    errors,
    loading,
    success,
    updateField,
    updateLocation,
    handleSubmit,
    setFieldError
  } = useStrayReportForm();

  const handleNext = () => {
    // Validar campos del paso actual antes de avanzar
    if (activeStep === 0) {
      const newErrors = {};

      if (!formData.breed || !formData.breed.trim()) {
        newErrors.breed = 'La raza es requerida';
      }

      if (!formData.size) {
        newErrors.size = 'El tamaño es requerido';
      }

      if (!formData.colors || formData.colors.length === 0) {
        newErrors.colors = 'Selecciona al menos un color';
      }

      if (!formData.description || !formData.description.trim()) {
        newErrors.description = 'La descripción es requerida';
      }

      // ❗ VALIDACIÓN OBLIGATORIA: La foto es requerida
      if (!formData.photo) {
        newErrors.photo = '¡La foto es obligatoria! Por favor toma o sube una foto del perro.';
      }

      // Si hay errores, no avanzar
      if (Object.keys(newErrors).length > 0) {
        // Establecer errores
        Object.keys(newErrors).forEach(key => {
          setFieldError(key, newErrors[key]);
        });

        // Scroll hacia arriba para ver los errores
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }

    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const result = await handleSubmit();

    if (result.success) {
      // El hook ya maneja la navegación
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <ReportFormBasic
            formData={formData}
            onUpdate={updateField}
            errors={errors}
          />
        );
      case 1:
        return (
          <LocationPicker
            location={{ latitude: formData.latitude, longitude: formData.longitude }}
            address={formData.address}
            onLocationChange={(lat, lng) => updateLocation(lat, lng)}
            onAddressChange={(addr) => updateField('address', addr)}
            error={errors.address}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ pt: { xs: 10, sm: 12, md: 14 }, pb: 6 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <Box sx={{ mb: 6, textAlign: 'center' }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 2,
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }
            }}
          >
            Reportar Perro Callejero
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: '#64748b',
              fontWeight: 500,
              fontSize: '1.1rem',
              maxWidth: '600px',
              mx: 'auto'
            }}
          >
            Ayuda a un perro en situación de calle reportando su ubicación
          </Typography>

          {!formData.reporterName && (
            <Alert
              severity="warning"
              sx={{ mt: 3, maxWidth: '600px', mx: 'auto' }}
            >
              Por favor, inicia sesión para reportar un perro callejero
            </Alert>
          )}
        </Box>

        {/* Success Alert */}
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            ¡Reporte creado exitosamente! Redirigiendo al mapa...
          </Alert>
        )}

        {/* Error Alert */}
        {errors.submit && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {errors.submit}
          </Alert>
        )}

        {/* Stepper con patitas y números */}
        <Stepper
          activeStep={activeStep}
          sx={{
            mb: 4,
            mt: 2,
            '& .MuiStepLabel-root': {
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            },
            '& .MuiStepLabel-iconContainer': {
              paddingRight: 0,
            },
            '& .MuiStepLabel-labelContainer': {
              textAlign: 'center',
            },
            '& .MuiStepLabel-label': {
              fontWeight: 600,
              fontSize: { xs: '0.75rem', sm: '0.85rem', md: '0.9rem' },
              mt: { xs: 1, sm: 1.2, md: 1.5 },
              textAlign: 'center',
            },
            '& .MuiStepLabel-label.Mui-active': {
              color: '#428cef',
              fontWeight: 700,
            },
            '& .MuiStepLabel-label.Mui-completed': {
              color: '#428cef',
              fontWeight: 600,
            },
            '& .MuiStepConnector-root': {
              top: { xs: 25, sm: 30, md: 35 }, // Ajustar posición según tamaño de patita
              left: { xs: 'calc(-50% + 25px)', sm: 'calc(-50% + 30px)', md: 'calc(-50% + 35px)' },
              right: { xs: 'calc(50% + 25px)', sm: 'calc(50% + 30px)', md: 'calc(50% + 35px)' },
            },
            '& .MuiStepConnector-line': {
              borderColor: '#e0e0e0',
              borderTopWidth: { xs: 2, md: 3 }, // Línea más delgada en móvil
            },
            '& .MuiStepConnector-root.Mui-active .MuiStepConnector-line': {
              borderColor: '#428cef',
            },
            '& .MuiStepConnector-root.Mui-completed .MuiStepConnector-line': {
              borderColor: '#428cef',
            },
          }}
        >
          {STEPS.map((label) => (
            <Step key={label}>
              <StepLabel StepIconComponent={PawStepIcon}>
                {label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Formulario con pasos */}
        <form onSubmit={onSubmit}>
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: 3,
              minHeight: '500px',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(249, 250, 251, 0.98) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(226, 232, 240, 0.5)',
              boxShadow: '0 8px 25px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.04)'
            }}
          >
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderStepContent(activeStep)}
            </motion.div>
          </Paper>

          {/* Botones de navegación */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBack />}
              onClick={activeStep === 0 ? () => navigate('/map') : handleBack}
              disabled={loading}
              sx={{
                borderColor: '#cbd5e1',
                color: '#64748b',
                '&:hover': {
                  borderColor: '#94a3b8',
                  backgroundColor: 'rgba(100, 116, 139, 0.05)'
                }
              }}
            >
              {activeStep === 0 ? 'Cancelar' : 'Anterior'}
            </Button>

            {activeStep === STEPS.length - 1 ? (
              <Button
                type="submit"
                variant="contained"
                startIcon={<Send />}
                disabled={loading}
                sx={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  px: 4,
                  py: 1.5,
                  fontWeight: 600,
                  boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 20px rgba(16, 185, 129, 0.4)'
                  },
                  '&:disabled': {
                    background: '#94a3b8'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                {loading ? 'Enviando...' : 'Enviar Reporte'}
              </Button>
            ) : (
              <Button
                variant="contained"
                endIcon={<NavigateNext />}
                onClick={handleNext}
                sx={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
                  color: 'white',
                  px: 4,
                  py: 1.5,
                  fontWeight: 600,
                  boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 20px rgba(59, 130, 246, 0.4)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Siguiente
              </Button>
            )}
          </Box>
        </form>
      </motion.div>
    </Container>
  );
};

export default ReportStrayPage;
