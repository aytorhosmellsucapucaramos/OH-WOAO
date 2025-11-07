/**
 * useStrayReportForm Hook
 * Maneja el estado y lógica del formulario de reportes
 */

import { useState, useCallback, useEffect } from 'react';
import { createStrayReport } from '../services/strayReportService';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, isAuthenticated } from '../services/authService';

export const useStrayReportForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    reporterName: '',
    latitude: -15.8402, // Puno por defecto
    longitude: -70.0219,
    address: '',
    zone: '',
    breed: '',
    size: '',
    colors: [],
    temperament: '',
    condition: '',
    gender: '', // Nuevo campo
    urgency: '',
    description: '',
    photo: null
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Cargar datos del usuario automáticamente (ahora es obligatorio estar autenticado)
  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      const fullName = `${user.firstName || user.first_name || ''} ${user.lastName || user.last_name || ''}`.trim();
      if (fullName) {
        setFormData(prev => ({
          ...prev,
          reporterName: fullName
        }));
        console.log('✅ Usuario autenticado para reporte:', fullName);
      } else {
        console.warn('⚠️ Usuario sin nombre completo');
      }
    } else {
      console.error('❌ No hay usuario autenticado para reportar');
      // Opcional: redirigir al login si no está autenticado
    }
  }, []);

  // Actualizar campo
  const updateField = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpiar error del campo cuando el usuario corrija
    if (errors[field] && value) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  }, [errors]);
  
  // Función para establecer errores (usada desde el componente)
  const setFieldError = useCallback((field, error) => {
    setErrors(prev => ({ ...prev, [field]: error }));
  }, []);

  // Actualizar ubicación
  const updateLocation = useCallback((lat, lng, address = '') => {
    setFormData(prev => ({
      ...prev,
      latitude: lat,
      longitude: lng,
      address: address || prev.address
    }));
  }, []);

  // Validar formulario
  const validate = useCallback(() => {
    const newErrors = {};

    // Validar que el nombre del reportero se haya obtenido del usuario autenticado
    if (!formData.reporterName || !formData.reporterName.trim()) {
      newErrors.reporterName = 'Error: No se pudo obtener tu nombre de usuario. Intenta cerrar e iniciar sesión nuevamente.';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'La dirección es requerida';
    }

    if (!formData.breed.trim()) {
      newErrors.breed = 'La raza es requerida';
    }

    if (formData.colors.length === 0) {
      newErrors.colors = 'Selecciona al menos un color';
    }

    // ❗ NUEVO: Validar que la foto sea obligatoria
    if (!formData.photo) {
      newErrors.photo = '¡La foto es obligatoria! Ayuda a identificar al perro tomando una foto.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Submit
  const handleSubmit = useCallback(async () => {
    if (!validate()) {
      return { success: false, error: 'Por favor completa todos los campos requeridos' };
    }

    setLoading(true);
    
    try {
      console.log('Enviando reporte con datos:', {
        ...formData,
        photo: formData.photo ? `File: ${formData.photo.name}` : 'Sin foto'
      });
      
      const result = await createStrayReport(formData);
      console.log('Reporte creado exitosamente:', result);
      
      setSuccess(true);
      
      // Redirigir inmediatamente al mapa
      navigate('/map', { 
        state: { 
          message: '✅ Reporte creado exitosamente',
          reportId: result.reportId 
        } 
      });
      
      return { success: true, data: result };
    } catch (error) {
      console.error('Error al crear reporte:', error);
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message ||
                          'Error al crear el reporte. Verifica todos los campos.';
      setErrors({ submit: errorMessage });
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [formData, validate, navigate]);

  // Reset
  const reset = useCallback(() => {
    setFormData({
      reporterName: '',
      latitude: -15.8402,
      longitude: -70.0219,
      address: '',
      zone: '',
      breed: '',
      size: 'medium',
      colors: [],
      temperament: 'neutral',
      condition: 'stray',
      urgency: 'normal',
      description: '',
      photo: null
    });
    setErrors({});
    setSuccess(false);
  }, []);

  return {
    formData,
    errors,
    loading,
    success,
    updateField,
    updateLocation,
    handleSubmit,
    reset,
    setFormData,
    setFieldError
  };
};
