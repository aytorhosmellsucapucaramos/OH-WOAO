import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Fab, Tooltip, Zoom } from '@mui/material';
import { Warning, Add } from '@mui/icons-material';

/**
 * ReportFAB - Botón flotante para reportar perros callejeros
 * Solo visible en ciertas páginas, en móvil Y si el usuario está logueado
 */
const ReportFAB = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Verificar si el usuario está logueado
  useEffect(() => {
    const checkAuth = () => {
      const user = localStorage.getItem('user');
      const token = localStorage.getItem('authToken');
      setIsLoggedIn(!!(user && token));
    };

    checkAuth();

    // Escuchar cambios en localStorage (login/logout)
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, [location.pathname]);

  // Páginas donde NO mostrar el FAB
  const hiddenPages = [
    '/report-stray',
    '/login',
    '/register',
    '/admin',
    '/admin-dashboard',
    '/seguimiento-dashboard'
  ];

  // Verificar si estamos en una página donde ocultar el FAB
  const shouldHide = hiddenPages.some(page => location.pathname.startsWith(page));

  // No mostrar si no está logueado o si está en una página oculta
  if (!isLoggedIn || shouldHide) return null;

  return (
    <Zoom in={!shouldHide} timeout={300}>
      <Tooltip 
        title="Reportar Perro Callejero" 
        placement="left"
        arrow
      >
        <Fab
          color="primary"
          aria-label="reportar callejero"
          onClick={() => navigate('/report-stray')}
          sx={{
            position: 'fixed',
            bottom: { xs: 85, md: 24 }, // Más arriba en móvil (para no tapar bottom nav)
            right: { xs: 16, md: 24 },
            zIndex: 999,
            background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)',
            boxShadow: '0 4px 20px rgba(255, 107, 53, 0.4)',
            width: { xs: 56, md: 64 },
            height: { xs: 56, md: 64 },
            '&:hover': {
              background: 'linear-gradient(135deg, #f7931e 0%, #ff6b35 100%)',
              boxShadow: '0 6px 25px rgba(255, 107, 53, 0.5)',
              transform: 'scale(1.05)',
            },
            transition: 'all 0.3s ease',
          }}
        >
          <Warning sx={{ fontSize: { xs: '1.75rem', md: '2rem' } }} />
        </Fab>
      </Tooltip>
    </Zoom>
  );
};

export default ReportFAB;
