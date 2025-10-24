/**
 * Auth Service
 * Maneja todas las operaciones de autenticación
 */

import api from './api';

/**
 * Login de usuario
 */
export const login = async (email, password) => {
  const { data } = await api.post('/auth/login', { email, password });
  
  // Guardar token y usuario en localStorage
  if (data.token) {
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('token', data.token); // mantener ambos para compatibilidad
    localStorage.setItem('user', JSON.stringify(data.user));
    
    // Guardar rol del usuario
    if (data.user && data.user.role) {
      localStorage.setItem('userRole', data.user.role);
    }
  }
  
  return data;
};

/**
 * Logout de usuario
 */
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  localStorage.removeItem('userRole');
};

/**
 * Obtener usuario actual
 */
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

/**
 * Verificar si el usuario está autenticado
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem('authToken') || !!localStorage.getItem('token');
};

/**
 * Obtener perfil del usuario
 */
export const getProfile = async () => {
  const { data } = await api.get('/auth/me');
  return data;
};

/**
 * Actualizar perfil del usuario
 */
export const updateProfile = async (profileData) => {
  const { data } = await api.put('/auth/profile', profileData);
  
  // Actualizar usuario en localStorage
  if (data.user) {
    localStorage.setItem('user', JSON.stringify(data.user));
  }
  
  return data;
};

/**
 * Obtener mascotas del usuario
 */
export const getMyPets = async () => {
  const { data } = await api.get('/auth/my-pets');
  return data;
};
