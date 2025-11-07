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
    
    // Guardar rol del usuario (role_code viene del backend)
    if (data.user && data.user.role_code) {
      localStorage.setItem('userRole', data.user.role_code);
    }
    
    // Guardar nombre completo para compatibilidad con Navbar y otros componentes
    if (data.user) {
      const fullName = `${data.user.first_name || ''} ${data.user.last_name || ''}`.trim();
      localStorage.setItem('userFullName', fullName || 'Usuario');
    }
    
    // Log de debug para verificar el login
    console.log('✅ Login exitoso:', {
      email: data.user.email,
      role_code: data.user.role_code,
      role_id: data.user.role_id,
      role_name: data.user.role_name
    });
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
  localStorage.removeItem('userFullName');
};

/**
 * Obtener usuario actual
 */
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

/**
 * Obtener nombre completo del usuario
 */
export const getUserFullName = () => {
  const fullName = localStorage.getItem('userFullName');
  if (fullName) return fullName;
  
  // Fallback: obtener del objeto user
  const user = getCurrentUser();
  if (user) {
    return `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Usuario';
  }
  
  return 'Usuario';
};

/**
 * Verificar si el usuario está autenticado
 * Verifica no solo que exista el token, sino que también exista información del usuario
 */
export const isAuthenticated = () => {
  const hasToken = !!localStorage.getItem('authToken') || !!localStorage.getItem('token');
  const hasUser = !!localStorage.getItem('user');
  
  // Si hay token pero no hay usuario, limpiar el token inválido
  if (hasToken && !hasUser) {
    localStorage.removeItem('authToken');
    localStorage.removeItem('token');
    return false;
  }
  
  return hasToken && hasUser;
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
    
    // Actualizar nombre completo también
    const fullName = `${data.user.first_name || ''} ${data.user.last_name || ''}`.trim();
    localStorage.setItem('userFullName', fullName || 'Usuario');
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
