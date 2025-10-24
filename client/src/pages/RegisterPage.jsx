/**
 * RegisterPage - REFACTORIZADO
 * Página de registro de mascotas simplificada con steps
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Typography, Box, Paper, Button, Alert,
  Stepper, Step, StepLabel
} from '@mui/material';
import { ArrowBack, ArrowForward, Send } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useRegistrationForm } from '../hooks/useRegistrationForm';
import OwnerInfoForm from '../components/features/pets/OwnerInfoForm';
import PetInfoForm from '../components/features/pets/PetInfoForm';
import DocumentsUpload from '../components/features/pets/DocumentsUpload';

const STEPS = ['Datos del Propietario', 'Datos de la Mascota', 'Documentos'];

const RegisterPage = () => {
  const navigate = useNavigate();
  const {
    formData,
    errors,
    loading,
    success,
    currentStep,
    updateField,
    nextStep,
    prevStep,
    handleSubmit
  } = useRegistrationForm();

  const onNext = () => {
    nextStep();
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
    <Container maxWidth="md" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: 700,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 1,
              textAlign: 'center'
            }}
          >
            🐕 Registro de Mascota
          </Typography>
          <Typography variant="body1" color="text.secondary" textAlign="center">
            Completa el formulario para registrar a tu mascota
          </Typography>
        </Box>

        {/* Success Alert */}
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            ¡Registro exitoso! Redirigiendo a tu dashboard...
          </Alert>
        )}

        {/* Error Alert */}
        {errors.submit && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {errors.submit}
          </Alert>
        )}

        {/* Stepper */}
        <Stepper activeStep={currentStep} sx={{ mb: 4 }}>
          {STEPS.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Form Content */}
        <Paper elevation={3} sx={{ p: 4, borderRadius: 3, mb: 3 }}>
          {renderStepContent()}
        </Paper>

        {/* Navigation Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            onClick={() => currentStep === 0 ? navigate('/') : prevStep()}
            startIcon={<ArrowBack />}
            disabled={loading}
          >
            {currentStep === 0 ? 'Cancelar' : 'Anterior'}
          </Button>

          {currentStep < STEPS.length - 1 ? (
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
