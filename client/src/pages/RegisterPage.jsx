/**
 * RegisterPage - REFACTORIZADO
 * Página de registro de mascotas simplificada con steps
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Typography, Box, Paper, Button, Alert,
  Stepper, Step, StepLabel, StepIcon
} from '@mui/material';
import { ArrowBack, ArrowForward, Send } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useRegistrationForm } from '../hooks/useRegistrationForm';
import OwnerInfoForm from '../components/features/pets/OwnerInfoForm';
import PetInfoForm from '../components/features/pets/PetInfoForm';
import DocumentsUpload from '../components/features/pets/DocumentsUpload';

const STEPS_ALL = ['Datos del Propietario', 'Datos de la Mascota', 'Documentos'];
const STEPS_AUTHENTICATED = ['Datos de la Mascota', 'Documentos'];

// Icono personalizado de patita para el stepper
const PawStepIcon = (props) => {
  const { active, completed, icon } = props;
  
  return (
    <Box
      sx={{
        position: 'relative',
        width: { xs: 50, sm: 60, md: 70 }, // Responsive: 50px móvil, 60px tablet, 70px desktop
        height: { xs: 50, sm: 60, md: 70 },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: completed || active ? '#428cef' : '#ffffff',
        borderRadius: '50%',
        border: '3px solid' , // Borde más delgado en móvil
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

const RegisterPage = () => {
  const navigate = useNavigate();
  const {
    formData,
    errors,
    loading,
    success,
    currentStep,
    isUserAuthenticated,
    updateField,
    nextStep,
    prevStep,
    handleSubmit
  } = useRegistrationForm();

  // Determinar qué pasos mostrar según el estado de autenticación
  const STEPS = isUserAuthenticated ? STEPS_AUTHENTICATED : STEPS_ALL;
  const displayStep = isUserAuthenticated ? currentStep - 1 : currentStep;

  const onNext = () => {
    nextStep();
    // Scroll suave al inicio de la página
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onPrev = () => {
    prevStep();
    // Scroll suave al inicio de la página
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onSubmit = async () => {
    await handleSubmit();
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <OwnerInfoForm
            formData={formData}
            onUpdate={updateField}
            errors={errors}
          />
        );
      case 1:
        return (
          <PetInfoForm
            formData={formData}
            onUpdate={updateField}
            errors={errors}
          />
        );
      case 2:
        return (
          <DocumentsUpload
            formData={formData}
            onUpdate={updateField}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4, pt: { xs: 12, md: 14 } }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >

        {/* Success Alert */}
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            ¡Registro exitoso! Iniciando sesión automáticamente...
          </Alert>
        )}

        {/* Error Alert */}
        {errors.submit && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {errors.submit}
          </Alert>
        )}

        {/* Stepper con patitas */}
        <Stepper 
          activeStep={displayStep} 
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
              <StepLabel StepIconComponent={PawStepIcon}>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Form Content */}
        <Paper elevation={3} sx={{ p: 4, borderRadius: 3, mb: 3 }}>
          {renderStepContent()}
        </Paper>

        {/* Alert para usuario autenticado */}
        {isUserAuthenticated && currentStep === 1 && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Tus datos de propietario se han cargado automáticamente desde tu cuenta
          </Alert>
        )}

        {/* Navigation Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            onClick={() => currentStep === 0 ? navigate('/') : onPrev()}
            startIcon={<ArrowBack />}
            disabled={loading || (isUserAuthenticated && currentStep === 1)}
            sx={{
              visibility: isUserAuthenticated && currentStep === 1 ? 'hidden' : 'visible'
            }}
          >
            {currentStep === 0 ? 'Cancelar' : 'Anterior'}
          </Button>

          {currentStep < 2 ? (
            <Button
              variant="contained"
              onClick={onNext}
              endIcon={<ArrowForward />}
              disabled={loading}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)'
                }
              }}
            >
              Siguiente
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={onSubmit}
              endIcon={<Send />}
              disabled={loading}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)'
                }
              }}
            >
              {loading ? 'Registrando...' : 'Registrar Mascota'}
            </Button>
          )}
        </Box>
      </motion.div>
    </Container>
  );
};

export default RegisterPage;
