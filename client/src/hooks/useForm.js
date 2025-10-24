/**
 * useForm Hook
 * Hook genérico para manejar formularios
 */

import { useState, useCallback } from 'react';

export const useForm = (initialValues = {}, validationRules = {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Manejar cambio de input
  const handleChange = useCallback((e) => {
    const { name, value, type, checked, files } = e.target;
    
    setValues(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'file' ? files[0] : value
    }));

    // Limpiar error del campo al escribir
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  }, [errors]);

  // Manejar blur de input
  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Validar campo
    if (validationRules[name]) {
      const error = validationRules[name](values[name], values);
      if (error) {
        setErrors(prev => ({ ...prev, [name]: error }));
      }
    }
  }, [values, validationRules]);

  // Validar todo el formulario
  const validate = useCallback(() => {
    const newErrors = {};
    
    Object.keys(validationRules).forEach(fieldName => {
      const error = validationRules[fieldName](values[fieldName], values);
      if (error) {
        newErrors[fieldName] = error;
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [values, validationRules]);

  // Resetear formulario
  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  // Setear valores manualmente
  const setFieldValue = useCallback((name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
  }, []);

  // Setear error manualmente
  const setFieldError = useCallback((name, error) => {
    setErrors(prev => ({ ...prev, [name]: error }));
  }, []);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    setIsSubmitting,
    handleChange,
    handleBlur,
    validate,
    reset,
    setFieldValue,
    setFieldError,
    setValues
  };
};
