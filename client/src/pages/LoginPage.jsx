/**
 * LoginPage - REFACTORIZADO
 * Página de login simplificada usando hooks y componentes
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Typography, Card, CardContent, Button,
  Box, Divider, Paper
} from '@mui/material';
import { PersonAdd, Login as LoginIcon, LockOutlined } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import LoginForm from '../components/features/auth/LoginForm';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, loading, error } = useAuth();

  const handleLogin = async (email, password) => {
    const result = await login(email, password);
    
    if (result.success) {
      // Redirección según rol
      const userRoleCode = result.data.user.role_code || result.data.user.role;
      
      // Redirigir según el rol
      if (userRoleCode === 'super_admin' || userRoleCode === 'admin') {
        navigate('/admin/dashboard');
      } else if (userRoleCode === 'seguimiento') {
        navigate('/seguimiento/dashboard');
      } else {
        navigate('/dashboard'); // Usuario normal
      }
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        pt: { xs: 10, sm: 11, md: 12 }, // Padding top para el navbar
        pb: { xs: 10, sm: 6, md: 8 }, // Padding bottom para BottomNav en móvil
        px: { xs: 2, sm: 3 },
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
      }}
    >
      <Container maxWidth="sm">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header Mejorado */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center',
            mb: 4
          }}>
            {/* Icono circular animado 
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.6, type: "spring" }}
            >
              <Paper
                elevation={0}
                sx={{
                  width: { xs: 70, md: 80 },
                  height: { xs: 70, md: 80 },
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 10px 30px rgba(37, 99, 235, 0.4)',
                  mb: 3
                }}
              >
                <LockOutlined sx={{ fontSize: { xs: 36, md: 42 }, color: 'white' }} />
              </Paper>
            </motion.div>*/}

            {/* Logos */}
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                gap: { xs: 2, sm: 3 },
                flexWrap: 'wrap',
                mb: 3
              }}
            >
              <Box 
                component="img" 
                src="/images/logos/GMASS.png" 
                alt="Escudo MPP" 
                sx={{ 
                  height: { xs: 60, sm: 70, md: 80 }, 
                  width: 'auto',
                  filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.15))',
                  transition: 'transform 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.05)'
                  }
                }} 
              />
              <Box 
                component="img" 
                src="/images/logos/gestionambiental.png" 
                alt="Municipalidad de Puno" 
                sx={{ 
                  height: { xs: 60, sm: 70, md: 80 }, 
                  width: 'auto',
                  maxWidth: { xs: '180px', sm: '220px' },
                  objectFit: 'contain'
                }} 
              />
            </Box>

            {/* Título */}
            <Box sx={{ textAlign: 'center' }}>
              <Typography 
                variant="h3" 
                sx={{ 
                  fontWeight: 800, 
                  color: '#1e293b',
                  mb: 1.5,
                  fontSize: { xs: '2rem', sm: '2.5rem', md: '2.75rem' },
                  background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  letterSpacing: '-0.5px'
                }}
              >
                Bienvenido de Vuelta
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: '#64748b',
                  fontWeight: 500,
                  fontSize: { xs: '0.95rem', sm: '1.05rem' },
                  maxWidth: '450px',
                  mx: 'auto',
                  lineHeight: 1.6
                }}
              >
                Inicia sesión para acceder al Sistema de Registro de Mascotas
              </Typography>
            </Box>
          </Box>

          {/* Login Card */}
          <Card 
            elevation={0} 
            sx={{ 
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 10px 40px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)',
              border: '1px solid rgba(226, 232, 240, 0.5)',
              borderRadius: 4,
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 15px 50px rgba(0,0,0,0.1), 0 4px 12px rgba(0,0,0,0.06)',
                transform: 'translateY(-2px)'
              }
            }}
          >
            <CardContent sx={{ p: { xs: 3, sm: 4, md: 5 } }}>
            <LoginForm 
              onSubmit={handleLogin}
              loading={loading}
              error={error}
            />

            <Divider sx={{ my: 4, '& .MuiDivider-wrapper': { fontSize: '0.875rem', color: '#94a3b8' } }}>
              O
            </Divider>

            <Box textAlign="center">
              <Typography 
                variant="body1" 
                sx={{ 
                  mb: 2.5,
                  color: '#475569',
                  fontWeight: 500
                }}
              >
                ¿No tienes una cuenta?
              </Typography>
              <Button
                variant="outlined"
                startIcon={<PersonAdd />}
                onClick={() => navigate('/register')}
                fullWidth
                size="large"
                sx={{ 
                  py: 1.5,
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 600,
                  borderWidth: 2,
                  borderColor: '#3b82f6',
                  color: '#2563eb',
                  borderRadius: 2,
                  '&:hover': {
                    borderWidth: 2,
                    borderColor: '#2563eb',
                    backgroundColor: 'rgba(37, 99, 235, 0.08)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Registrar Nueva Mascota
              </Button>
            </Box>

            <Box 
              sx={{ 
                mt: 3, 
                p: 2.5, 
                background: 'linear-gradient(135deg, rgba(239, 246, 255, 0.8) 0%, rgba(219, 234, 254, 0.6) 100%)',
                borderRadius: 2, 
                border: '1px solid rgba(147, 197, 253, 0.3)',
                boxShadow: '0 2px 8px rgba(59, 130, 246, 0.05)'
              }}
            >
              <Typography 
                variant="body2" 
                sx={{ 
                  color: '#1e40af',
                  textAlign: 'center',
                  fontWeight: 500,
                  lineHeight: 1.6
                }}
              >
                <strong>💡 Nota:</strong> Para registrarte, primero debes registrar una mascota. 
                Tu cuenta se creará automáticamente con los datos del propietario.
              </Typography>
            </Box>
          </CardContent>
          </Card>
        </motion.div>
      </Container>
    </Box>
  );
};

export default LoginPage;
