/**
 * useRegistrationForm Hook
 * Maneja el estado y lógica del formulario de registro de mascotas
 */

import { useState, useCallback, useEffect } from 'react';
import { registerPet } from '../services/petService';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, isAuthenticated } from '../services/authService';

const INITIAL_STATE = {
  // Datos del propietario
  firstName: '',
  lastName: '',
  dni: '',
  phone: '',
  email: '',
  password: '',
  address: '',
  
  // Datos de la mascota
  petName: '',
  breed: '',
  size: 'medium',
  color: '',
  birthDate: '',
  sex: 'male',
  age: '',
  
  // Salud
  hasVaccinationCard: 'yes',
  hasRabiesVaccine: 'yes',
  
  // Archivos
  photo: null,
  dniPhoto: null,
  vaccinationCard: null
};

export const useRegistrationForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(INITIAL_STATE);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);

  // Cargar datos del usuario si está autenticado
  useEffect(() => {
    const loadUserData = () => {
      if (isAuthenticated()) {
        const user = getCurrentUser();
        if (user) {
          setIsUserAuthenticated(true);
          setFormData(prev => ({
            ...prev,
            firstName: user.firstName || user.first_name || '',
            lastName: user.lastName || user.last_name || '',
            dni: user.dni || '',
            phone: user.phone || '',
            email: user.email || '',
            address: user.address || '',
            password: '' // No autocompletar contraseña por seguridad
          }));
          // Si el usuario ya está autenticado, ir directamente al paso de mascota
          setCurrentStep(1);
        }
      }
    };
    loadUserData();
  }, []);

  // Actualizar campo
  const updateField = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpiar error del campo
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  }, [errors]);

  // Validar paso actual
  const validateStep = useCallback((step) => {
    const newErrors = {};

    switch (step) {
      case 0: // Datos del propietario - solo validar si no está autenticado
        if (!isUserAuthenticated) {
          if (!formData.firstName.trim()) newErrors.firstName = 'Nombre requerido';
          if (!formData.lastName.trim()) newErrors.lastName = 'Apellido requerido';
          if (!formData.dni.trim()) newErrors.dni = 'DNI requerido';
          else if (formData.dni.length !== 8) newErrors.dni = 'DNI debe tener 8 dígitos';
          if (!formData.phone.trim()) newErrors.phone = 'Teléfono requerido';
          if (!formData.email.trim()) newErrors.email = 'Email requerido';
          else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email inválido';
          if (!formData.password.trim()) newErrors.password = 'Contraseña requerida';
          else if (formData.password.length < 6) newErrors.password = 'Mínimo 6 caracteres';
          if (!formData.address.trim()) newErrors.address = 'Dirección requerida';
        }
        break;

      case 1: // Datos de la mascota
        if (!formData.petName.trim()) newErrors.petName = 'Nombre de mascota requerido';
        if (!formData.breed.trim()) newErrors.breed = 'Raza requerida';
        if (!formData.color.trim()) newErrors.color = 'Color requerido';
        if (!formData.birthDate) newErrors.birthDate = 'Fecha de nacimiento requerida';
        break;

      case 2: // Documentos
        // Opcional: validar archivos si es necesario
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Siguiente paso
  const nextStep = useCallback(() => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 2));
      return true;
    }
    return false;
  }, [currentStep, validateStep]);

  // Paso anterior
  const prevStep = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  }, []);

  // Submit
  const handleSubmit = useCallback(async () => {
    if (!validateStep(currentStep)) {
      return { success: false, error: 'Por favor completa todos los campos requeridos' };
    }

    setLoading(true);
    
    try {
      const result = await registerPet(formData);
      setSuccess(true);
      
      // Esperar 2 segundos y redirigir
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
      
      return { success: true, data: result };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Error al registrar la mascota';
      setErrors({ submit: errorMessage });
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [formData, currentStep, validateStep, navigate]);

  // Reset
  const reset = useCallback(() => {
    setFormData(INITIAL_STATE);
    setErrors({});
    setSuccess(false);
    setCurrentStep(0);
  }, []);

  return {
    formData,
    errors,
    loading,
    success,
    currentStep,
    updateField,
    nextStep,
    prevStep,
    handleSubmit,
    reset,
    setFormData
  };
};
