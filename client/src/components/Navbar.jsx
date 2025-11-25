import React, { useState, useEffect } from 'react'
import { AppBar, Toolbar, Button, Box, Avatar, IconButton, useMediaQuery, useTheme } from '@mui/material'
import { useNavigate, useLocation } from 'react-router-dom'
import { Home, PersonAdd, ReportProblem, Map, Login } from '@mui/icons-material'
import { motion } from 'framer-motion'
import { getUserFullName } from '../services/authService'
import { getUploadUrl } from '../utils/urls'

const Navbar = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userName, setUserName] = useState('')

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('authToken')
    if (token) {
      setIsLoggedIn(true)
      
      // Verificar si el usuario tiene first_name, si no, actualizar desde el servidor
      const checkAndUpdateUser = async () => {
        try {
          const userStr = localStorage.getItem('user');
          if (userStr) {
            const user = JSON.parse(userStr);
            
            // Si el usuario no tiene first_name, obtener datos actualizados del servidor
            if (!user.first_name && !user.firstName) {
              console.log('⚠️ Usuario sin first_name, actualizando desde servidor...');
              const response = await fetch('/api/auth/me', {
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              });
              
              if (response.ok) {
                const data = await response.json();
                if (data.user) {
                  // Actualizar localStorage con datos completos
                  localStorage.setItem('user', JSON.stringify(data.user));
                  const fullName = `${data.user.first_name || ''} ${data.user.last_name || ''}`.trim();
                  localStorage.setItem('userFullName', fullName || 'Usuario');
                  setUserName(fullName || 'Usuario');
                  console.log('✅ Usuario actualizado con éxito');
                  return;
                }
              }
            }
            
            // Si ya tiene first_name, usar el nombre existente
            const fullName = getUserFullName();
            setUserName(fullName);
          }
        } catch (error) {
          console.error('Error al verificar usuario:', error);
          const fullName = getUserFullName();
          setUserName(fullName);
        }
      };
      
      checkAndUpdateUser();
    } else {
      setIsLoggedIn(false)
      setUserName('')
    }
  }, [location.pathname])

  const navItems = [
    { path: '/', label: 'Inicio', icon: <Home />, public: true },
    { 
      path: '/register', 
      label: isLoggedIn ? 'Registrar Mascota' : 'Registrar', 
      icon: <PersonAdd />, 
      public: true 
    },
    { 
      path: '/report-stray', 
      label: 'Reportar Callejero', 
      icon: <ReportProblem />, 
      public: false,
      requiresAuth: true 
    },
    { path: '/map', label: 'Mapa', icon: <Map />, public: true },
  ]

  return (
    <AppBar 
      position="fixed" 
      elevation={0}
      sx={{ 
        background: 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        color: '#1a1a1a',
        borderBottom: '1px solid rgba(229, 231, 235, 0.6)',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        transition: 'all 0.3s ease',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1100,
        '&:hover': {
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)',
          background: 'rgba(255, 255, 255, 0.8)',
        }
      }}
    >
      <Toolbar sx={{ gap: { xs: 1, md: 2 }, py: 1, px: { xs: 2, md: 3 } }}>
        {/* Logo */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          style={{ display: 'flex', alignItems: 'center' }}
        >
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                opacity: 0.8,
              }
            }}
            onClick={() => navigate('/')}
          >
            <img 
              src="/images/logos/Logo Escudo MPP 2023-Horizontal_UU.png" 
              alt="Logo MPP" 
              style={{ 
                height: isMobile ? 45 : 60, 
                objectFit: 'contain',
                transition: 'height 0.3s ease'
              }}
            />
          </Box>
        </motion.div>
        
        {/* Navegación principal (solo desktop) */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1.5, ml: 'auto', alignItems: 'center' }}>
          {navItems
            .filter(item => item.public || (item.requiresAuth && isLoggedIn))
            .map((item, index) => (
              <motion.div
                key={item.path}
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Button
                  startIcon={item.icon}
                  onClick={() => navigate(item.path)}
                  sx={{
                    px: 2,
                    py: 1,
                    borderRadius: 1,
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    color: location.pathname === item.path ? '#2563eb' : '#4b5563',
                    backgroundColor: 'transparent',
                    position: 'relative',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: 0,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: location.pathname === item.path ? '100%' : '0%',
                      height: '3px',
                      backgroundColor: '#2563eb',
                      borderRadius: '2px',
                      transition: 'width 0.3s ease',
                    },
                    '&:hover': {
                      backgroundColor: '#f3f4f6',
                      color: '#2563eb',
                      '&::after': {
                        width: '100%',
                      }
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  {item.label}
                </Button>
              </motion.div>
            ))}
          
          {/* Botón de usuario o login (siempre visible) */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: navItems.length * 0.1 }}
            style={{ marginLeft: isMobile ? 'auto' : 0 }}
          >
            {!isLoggedIn ? (
              <Button
                startIcon={!isMobile && <Login />}
                onClick={() => navigate('/login')}
                sx={{
                  px: isMobile ? 2 : 3,
                  py: 1,
                  minWidth: isMobile ? 'auto' : 'unset',
                  borderRadius: 2,
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  background: '#2563eb',
                  color: '#ffffff',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                  '&:hover': {
                    background: '#1d4ed8',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.15)',
                    transform: 'translateY(-1px)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                {isMobile ? <Login /> : 'Iniciar Sesión'}
              </Button>
            ) : (
              <>
                <IconButton
                  onClick={() => navigate('/dashboard')}
                  sx={{
                    backgroundColor: '#f3f4f6',
                    border: '1px solid #e5e7eb',
                    '&:hover': {
                      backgroundColor: '#e5e7eb',
                      transform: 'scale(1.05)',
                    },
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Avatar 
                    src={(() => {
                      try {
                        const userStr = localStorage.getItem('user');
                        if (userStr) {
                          const user = JSON.parse(userStr);
                          if (user.photo_path) {
                            return getUploadUrl(user.photo_path);
                          }
                        }
                      } catch (e) {
                        console.error('Error loading user photo:', e);
                      }
                      return undefined;
                    })()}
                    sx={{ 
                      width: 36, 
                      height: 36, 
                      bgcolor: '#2563eb',
                      fontWeight: 600,
                      fontSize: '1rem',
                    }}
                  >
                    {(() => {
                      try {
                        const userStr = localStorage.getItem('user');
                        if (userStr) {
                          const user = JSON.parse(userStr);
                          // Intentar obtener first_name (snake_case) o firstName (camelCase)
                          const firstName = user.first_name || user.firstName;
                          if (firstName && firstName.length > 0) {
                            return firstName.charAt(0).toUpperCase();
                          }
                        }
                      } catch (e) {
                        console.error('Error loading user initial:', e);
                      }
                      return 'U';
                    })()}
                  </Avatar>
                </IconButton>
              </>
            )}
          </motion.div>
        </Box>
      </Toolbar>
    </AppBar>
  )
}

export default Navbar
