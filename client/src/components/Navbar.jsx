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
    { path: '/register', label: 'Registrar', icon: <PersonAdd />, public: true },
    { path: '/search', label: 'Buscar', icon: <Search />, public: true },
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
      position="sticky" 
      sx={{ 
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
          zIndex: -1
        }
      }}
    >
      <Toolbar>
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Pets sx={{ mr: 1, fontSize: 28 }} />
            <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
              WebPerritos
            </Typography>
          </Box>
        </motion.div>
        
        <Box sx={{ display: 'flex', gap: 1, ml: 'auto' }}>
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
                  color="inherit"
                  startIcon={item.icon}
                  onClick={() => navigate(item.path)}
                  sx={{
                    mx: 0.5,
                    borderRadius: 2,
                    backgroundColor: location.pathname === item.path ? 'rgba(255,255,255,0.2)' : 'transparent',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.3s ease',
                    ...(item.requiresAuth && {
                      border: '1px solid rgba(255,255,255,0.3)',
                      background: 'linear-gradient(45deg, rgba(255,107,107,0.2) 30%, rgba(255,182,193,0.2) 90%)',
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
                color="inherit"
                startIcon={<Login />}
                onClick={() => navigate('/login')}
                sx={{
                  mx: 0.5,
                  borderRadius: 2,
                  border: '1px solid rgba(255,255,255,0.5)',
                  backgroundColor: 'rgba(33,150,243,0.2)',
                  '&:hover': {
                    backgroundColor: 'rgba(33,150,243,0.3)',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Iniciar Sesión
              </Button>
            ) : (
              <>
                <IconButton
                  color="inherit"
                  onClick={handleMenuClick}
                  sx={{
                    mx: 0.5,
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.2)',
                    },
                  }}
                >
                  <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                    {userName.charAt(0).toUpperCase()}
                  </Avatar>
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                  PaperProps={{
                    sx: {
                      mt: 1,
                      minWidth: 200,
                      backgroundColor: 'rgba(255,255,255,0.95)',
                      backdropFilter: 'blur(10px)',
                    }
                  }}
                >
                  <Box sx={{ px: 2, py: 1 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Sesión iniciada como:
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {userName}
                    </Typography>
                  </Box>
                  <Divider />
                  <MenuItem onClick={() => handleNavigate('/user/dashboard')}>
                    <Dashboard sx={{ mr: 2, fontSize: 20 }} />
                    Mi Panel
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>
                    <Logout sx={{ mr: 2, fontSize: 20 }} />
                    Cerrar Sesión
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
