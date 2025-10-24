/**
 * useAuth Hook
 * Maneja el estado y lógica de autenticación
 */

import { useState, useEffect, useCallback } from 'react';
import { login as loginService, logout as logoutService, getCurrentUser, isAuthenticated } from '../services/authService';
import { useNavigate } from 'react-router-dom';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Verificar autenticación al montar
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  };

  // Login
  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await loginService(email, password);
      setUser(data.user);
      return { success: true, data };
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Error al iniciar sesión';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Logout
  const logout = useCallback(() => {
    logoutService();
    setUser(null);
    navigate('/login');
  }, [navigate]);

  // Verificar si está autenticado
  const authenticated = isAuthenticated();

  return {
    user,
    loading,
    error,
    authenticated,
    login,
    logout,
    checkAuth
  };
};
