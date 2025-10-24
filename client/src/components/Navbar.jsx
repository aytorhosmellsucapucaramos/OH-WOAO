import React, { useState, useEffect } from 'react'
import { AppBar, Toolbar, Typography, Button, Box, Menu, MenuItem, Avatar, Divider, IconButton } from '@mui/material'
import { useNavigate, useLocation } from 'react-router-dom'
import { Pets, Home, PersonAdd, Search, ReportProblem, Map, Login, Logout, Dashboard, AccountCircle } from '@mui/icons-material'
import { motion } from 'framer-motion'

const Navbar = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [anchorEl, setAnchorEl] = useState(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userName, setUserName] = useState('')

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('authToken')
    const fullName = localStorage.getItem('userFullName')
    if (token) {
      setIsLoggedIn(true)
      setUserName(fullName || 'Usuario')
    }
  }, [location.pathname])

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = () => {
    localStorage.clear()
    setIsLoggedIn(false)
    setUserName('')
    handleMenuClose()
    navigate('/')
  }

  const handleNavigate = (path) => {
    navigate(path)
    handleMenuClose()
  }

  const navItems = [
    { path: '/', label: 'Inicio', icon: <Home />, public: true },
    { 
      path: '/register', 
      label: isLoggedIn ? 'Registrar Mascota' : 'Registrar', 
      icon: <PersonAdd />, 
      public: true 
    },
    { path: '/search', label: 'Buscar', icon: <Search />, public: true },
    { 
      path: '/report-stray', 
      label: 'Reporte Perritos', 
      icon: <ReportProblem />, 
      public: false,
      requiresAuth: true 
    },
    { path: '/map', label: 'Mapa', icon: <Map />, public: true },
  ]

  return (
    <AppBar 
      position="sticky" 
      elevation={0}
      sx={{ 
        background: '#ffffff',
        borderBottom: '1px solid #e5e7eb',
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
      }}
    >
      <Toolbar sx={{ gap: 2, py: 1 }}>
        {/* Logo y Título */}
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
              padding: '4px 8px',
              transition: 'all 0.3s ease',
              '&:hover': {
                opacity: 0.8,
              }
            }}
            onClick={() => navigate('/')}
          >
            <Box>
              <div className="flex-shrink-0">
                  <img
                    src="/images/logos/Logo Escudo MPP 2023-Horizontal_UU.png"
                    alt="Escudo Municipalidad Provincial de Puno"
                    className="w-26 h-10 object-contain"
                  />
                </div>
            </Box>
          </Box>
        </motion.div>
        
        {/* Navegación principal */}
        <Box sx={{ display: 'flex', gap: 1.5, ml: 'auto', alignItems: 'center' }}>
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
                    borderRadius: 0,
                    fontWeight: 500,
                    fontSize: '0.875rem',
                    color: location.pathname === item.path ? '#2563eb' : '#4b5563',
                    backgroundColor: 'transparent',
                    textTransform: 'none',
                    minWidth: 'auto',
                    position: 'relative',
                    borderBottom: '2px solid transparent',
                    borderBottomColor: location.pathname === item.path ? '#2563eb' : 'transparent',
                    '&:hover': {
                      backgroundColor: 'transparent',
                      color: '#2563eb',
                      borderBottomColor: '#2563eb',
                    },
                    transition: 'all 0.2s ease',
                    ...(item.requiresAuth && {
                      color: location.pathname === item.path ? '#ec4899' : '#4b5563',
                      borderBottomColor: location.pathname === item.path ? '#ec4899' : 'transparent',
                      '&:hover': {
                        backgroundColor: 'transparent',
                        color: '#ec4899',
                        borderBottomColor: '#ec4899',
                      }
                    })
                  }}
                >
                  {item.label}
                </Button>
              </motion.div>
            ))}
          
          {/* Login/User Menu Button */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: navItems.length * 0.1 }}
          >
            {!isLoggedIn ? (
              <Button
                startIcon={<Login />}
                onClick={() => navigate('/login')}
                sx={{
                  px: 3,
                  py: 1,
                  borderRadius: 2,
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  color: '#ffffff',
                  background: '#2563eb',
                  textTransform: 'none',
                  boxShadow: 'none',
                  '&:hover': {
                    background: '#1d4ed8',
                    boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                Iniciar Sesión
              </Button>
            ) : (
              <>
                <IconButton
                  onClick={handleMenuClick}
                  sx={{
                    p: 0.5,
                    '&:hover': {
                      backgroundColor: '#f3f4f6',
                    },
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Avatar 
                    sx={{ 
                      width: 36, 
                      height: 36, 
                      bgcolor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      fontWeight: 700,
                      fontSize: '1.1rem',
                    }}
                  >
                    {userName.charAt(0).toUpperCase()}
                  </Avatar>
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                  PaperProps={{
                    sx: {
                      mt: 1.5,
                      minWidth: 220,
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(249,250,251,0.98) 100%)',
                      backdropFilter: 'blur(20px)',
                      borderRadius: 3,
                      boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                      border: '1px solid rgba(59, 130, 246, 0.2)',
                    }
                  }}
                >
                  <Box sx={{ px: 2.5, py: 1.5, background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', color: 'white', borderRadius: '12px 12px 0 0' }}>
                    <Typography variant="caption" sx={{ opacity: 0.9, fontWeight: 600 }}>
                      Sesión iniciada como:
                    </Typography>
                    <Typography variant="body2" fontWeight="bold" sx={{ fontSize: '1rem' }}>
                      {userName}
                    </Typography>
                  </Box>
                  <Divider />
                  <MenuItem 
                    onClick={() => handleNavigate('/user/dashboard')}
                    sx={{
                      py: 1.5,
                      px: 2.5,
                      borderRadius: 1,
                      mx: 1,
                      my: 0.5,
                      '&:hover': {
                        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.1) 100%)',
                      }
                    }}
                  >
                    <Dashboard sx={{ mr: 2, fontSize: 22, color: '#3b82f6' }} />
                    <Typography fontWeight={600}>Mi Panel</Typography>
                  </MenuItem>
                  <MenuItem 
                    onClick={handleLogout}
                    sx={{
                      py: 1.5,
                      px: 2.5,
                      borderRadius: 1,
                      mx: 1,
                      my: 0.5,
                      '&:hover': {
                        background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%)',
                      }
                    }}
                  >
                    <Logout sx={{ mr: 2, fontSize: 22, color: '#ef4444' }} />
                    <Typography fontWeight={600}>Cerrar Sesión</Typography>
                  </MenuItem>
                </Menu>
              </>
            )}
          </motion.div>
        </Box>
      </Toolbar>
    </AppBar>
  )
}

export default Navbar
