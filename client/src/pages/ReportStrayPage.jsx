/**
 * ReportStrayPage - REFACTORIZADO
 * Página para reportar perros callejeros simplificada
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Typography, Box, Paper, Button, Alert,
  Stepper, Step, StepLabel, Grid
} from '@mui/material';
import { Send, ArrowBack, NavigateNext, NavigateBefore } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useStrayReportForm } from '../hooks/useStrayReportForm';
import ReportFormBasic from '../components/features/strayReports/ReportFormBasic';
import LocationPicker from '../components/features/strayReports/LocationPicker';

const STEPS = [
  'Información del Perro',
  'Ubicación del Avistamiento'
];

const ReportStrayPage = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  
  const {
    formData,
    errors,
    loading,
    success,
    updateField,
    updateLocation,
    handleSubmit
  } = useStrayReportForm();

  const handleNext = () => {
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
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/map')}
            sx={{ mb: 2, color: '#667eea' }}
          >
            Volver al mapa
          </Button>
          
          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: 700,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 1
            }}
          >
            🐕 Reportar Perro Callejero
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
            Ayuda a un perro en situación de calle reportando su ubicación
          </Typography>
          {formData.reporterName && (
            <Alert severity="info" sx={{ mt: 2 }}>
              👤 Reportando como: <strong>{formData.reporterName}</strong>
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

        {/* Stepper */}
        <Paper elevation={0} sx={{ p: 3, mb: 3, backgroundColor: '#f8f9fa', borderRadius: 3 }}>
          <Stepper activeStep={activeStep}>
            {STEPS.map((label) => (
              <Step key={label}>
                <StepLabel
                  sx={{
                    '& .MuiStepLabel-label': {
                      color: '#64748b',
                      fontWeight: 500
                    },
                    '& .MuiStepLabel-label.Mui-active': {
                      color: '#667eea',
                      fontWeight: 600
                    },
                    '& .MuiStepLabel-label.Mui-completed': {
                      color: '#10b981',
                      fontWeight: 600
                    }
                  }}
                >
                  {label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Paper>

        {/* Formulario con pasos */}
        <form onSubmit={onSubmit}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 4, 
              borderRadius: 3,
              minHeight: '500px',
              background: '#ffffff'
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
                {loading ? 'Enviando...' : '📤 Enviar Reporte'}
              </Button>
            ) : (
              <Button
                variant="contained"
                endIcon={<NavigateNext />}
                onClick={handleNext}
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  px: 4,
                  py: 1.5,
                  fontWeight: 600,
                  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)'
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
