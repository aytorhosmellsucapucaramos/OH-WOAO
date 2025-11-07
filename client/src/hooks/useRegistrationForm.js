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
  confirmPassword: '',
  address: '',
  
  // Datos de la mascota
  petName: '',
  breed: '',
  size: '', // Vacío por defecto
  color: '',
  birthDate: '',
  sex: '',
  age: '',
  
  // Perfil de Comportamiento (Paso 2b)
  temperament: '', // Temperamento del can
  additionalFeatures: '', // Características adicionales y antecedentes
  
  // Salud
  hasVaccinationCard: 'no', // No por defecto
  hasRabiesVaccine: 'no', // No por defecto
  
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
      const authenticated = isAuthenticated();
      
      if (authenticated) {
        const user = getCurrentUser();
        
        // Verificar que el usuario tenga datos completos (no solo token)
        if (user && user.first_name && user.last_name && user.dni && user.email) {
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
          // Si el usuario ya está autenticado con datos completos, ir directamente al paso de mascota
          setCurrentStep(1);
        } else {
          // Si el token existe pero no hay datos completos, limpiar todo y empezar desde cero
          localStorage.removeItem('authToken');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('userRole');
          localStorage.removeItem('userFullName');
          setIsUserAuthenticated(false);
          setCurrentStep(0);
        }
      } else {
        setIsUserAuthenticated(false);
        setCurrentStep(0);
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
          if (!formData.confirmPassword.trim()) newErrors.confirmPassword = 'Confirmar contraseña es requerido';
          else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Las contraseñas no coinciden';
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
    // Si el usuario está autenticado, no puede ir al paso 0 (datos del propietario)
    const minStep = isUserAuthenticated ? 1 : 0;
    setCurrentStep(prev => Math.max(prev - 1, minStep));
  }, [isUserAuthenticated]);

  // Submit
  const handleSubmit = useCallback(async () => {
    if (!validateStep(currentStep)) {
      return { success: false, error: 'Por favor completa todos los campos requeridos' };
    }

    setLoading(true);
    
    try {
      const result = await registerPet(formData);
      setSuccess(true);
      
      // Si el registro devuelve un token, guardar automáticamente la sesión
      if (result.token) {
        localStorage.setItem('token', result.token);
        localStorage.setItem('authToken', result.token); // También guardar con el nombre alternativo
        if (result.user) {
          localStorage.setItem('user', JSON.stringify(result.user));
        }
      }
      
      // Redirigir al dashboard después de guardar el token
      setTimeout(() => {
        // Forzar recarga para asegurar que el ProtectedRoute reconozca el token
        window.location.href = '/dashboard';
      }, 1500);
      
      return { success: true, data: result };
    } catch (error) {
      console.error('Error al registrar:', error);
      
      // Si hay errores de validación específicos por campo
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        const fieldErrors = {};
        error.response.data.errors.forEach(err => {
          fieldErrors[err.field] = err.message;
        });
        setErrors(fieldErrors);
        return { success: false, error: 'Por favor corrige los errores en el formulario' };
      }
      
      // Error genérico
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Error al registrar la mascota';
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
    isUserAuthenticated,
    updateField,
    nextStep,
    prevStep,
    handleSubmit,
    reset,
    setFormData
  };
};
