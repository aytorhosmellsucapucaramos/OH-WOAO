import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BottomNavigation, BottomNavigationAction, Paper, Badge } from '@mui/material';
import {
  Home,
  Map,
  Search,
  Person,
  Warning
} from '@mui/icons-material';

/**
 * BottomNav - Barra de navegación inferior para móviles
 * Solo visible en pantallas pequeñas (< 900px)
 */
const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [value, setValue] = useState(0);
  const [user, setUser] = useState(null);

  // Cargar info del usuario y actualizar en cambios de localStorage
  useEffect(() => {
    const loadUser = () => {
      const userData = localStorage.getItem('user');
      const token = localStorage.getItem('authToken');
      console.log('🔄 BottomNav - Cargando usuario:', { hasUserData: !!userData, hasToken: !!token });
      
      if (userData && token) {
        try {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          console.log('✅ Usuario cargado:', parsedUser.name || parsedUser.email);
        } catch (error) {
          console.error('❌ Error parsing user data:', error);
          setUser(null);
        }
      } else {
        console.log('❌ No hay usuario logueado');
        setUser(null);
      }
    };

    loadUser();

    // Escuchar cambios en localStorage (login/logout)
    const handleStorageChange = () => {
      loadUser();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [location.pathname]);

  // Determinar valor activo basado en la ruta actual
  // SIEMPRE: Inicio(0), Mapa(1), Reportar(2), Buscar(3), Perfil(4)
  useEffect(() => {
    const path = location.pathname;
    
    if (path === '/' || path === '/home') {
      setValue(0); // Inicio
    } else if (path === '/map' || path.startsWith('/map')) {
      setValue(1); // Mapa
    } else if (path === '/report-stray' || path.startsWith('/report')) {
      setValue(2); // Reportar
    } else if (path === '/search' || path.startsWith('/search')) {
      setValue(3); // Buscar
    } else if (path === '/profile' || path === '/login' || path === '/register' || path === '/dashboard' || path === '/user/dashboard' || path.startsWith('/pet')) {
      setValue(4); // Perfil
    }
  }, [location.pathname, user]);

  const handleChange = (event, newValue) => {
    console.log('🔵 Bottom Nav Click:', { newValue, user: !!user });
    setValue(newValue);
    
    // SIEMPRE: Inicio(0), Mapa(1), Reportar(2), Buscar(3), Perfil(4)
    // El botón Reportar está deshabilitado si no hay usuario
    
    switch (newValue) {
      case 0:
        console.log('→ Inicio');
        navigate('/');
        break;
        
      case 1:
        console.log('→ Mapa');
        navigate('/map');
        break;
        
      case 2:
        // Reportar - Solo si está logueado (botón está disabled si no)
        if (user) {
          console.log('→ Reportar');
          navigate('/report-stray');
        } else {
          console.log('⚠️ Reportar deshabilitado (no logueado)');
        }
        break;
        
      case 3:
        console.log('→ Buscar');
        navigate('/search');
        break;
        
      case 4:
        if (user) {
          console.log('→ Dashboard');
          navigate('/dashboard');
        } else {
          console.log('→ Login (desde Perfil)');
          navigate('/login');
        }
        break;
        
      default:
        navigate('/');
    }
  };

  return (
    <Paper
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        display: { xs: 'block', md: 'none' }, // Solo visible en móvil
        borderTop: '1px solid #e0e0e0',
        boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.1)',
      }}
      elevation={3}
    >
      <BottomNavigation
        value={value}
        onChange={handleChange}
        showLabels
        sx={{
          height: 65,
          '& .MuiBottomNavigationAction-root': {
            minWidth: 'auto',
            padding: '6px 0',
            color: '#757575',
            '&.Mui-selected': {
              color: '#428cef',
            },
          },
          '& .MuiBottomNavigationAction-label': {
            fontSize: '0.7rem',
            fontWeight: 500,
            '&.Mui-selected': {
              fontSize: '0.75rem',
              fontWeight: 600,
            },
          },
          '& .MuiSvgIcon-root': {
            fontSize: '1.5rem',
          },
        }}
      >
        {/* Inicio - Siempre visible */}
        <BottomNavigationAction
          label="Inicio"
          icon={<Home />}
        />
        
        {/* Mapa - Siempre visible */}
        <BottomNavigationAction
          label="Mapa"
          icon={<Map />}
        />
        
        {/* Reportar - Visible pero deshabilitado si NO está logueado */}
        <BottomNavigationAction
          label="Reportar"
          icon={<Warning />}
          disabled={!user}
          sx={{
            '&.Mui-selected': {
              color: '#ff6b35 !important',
            },
            '&.Mui-disabled': {
              display: 'none', // Ocultamos visualmente pero mantenemos en el DOM
            },
          }}
        />
        
        {/* Buscar - Siempre visible (antes era Mascotas) */}
        <BottomNavigationAction
          label="Buscar"
          icon={<Search />}
        />
        
        {/* Perfil - Siempre visible */}
        <BottomNavigationAction
          label="Perfil"
          icon={<Person />}
        />
      </BottomNavigation>
    </Paper>
  );
};

export default BottomNav;
