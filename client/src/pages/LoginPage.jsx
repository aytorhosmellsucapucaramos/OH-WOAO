/**
 * LoginPage - REFACTORIZADO
 * Página de login simplificada usando hooks y componentes
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Typography, Card, CardContent, Button,
  Box, Divider
} from '@mui/material';
import { PersonAdd } from '@mui/icons-material';
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
      const userRole = result.data.user.role;
      navigate(userRole === 'admin' ? '/admin/dashboard' : '/dashboard');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center',
          mb: 4,
          gap: 2
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box 
              component="img" 
              src="/images/logos/Logo Escudo MPP.png" 
              alt="Escudo MPP" 
              sx={{ 
                height: 80, 
                width: 'auto',
                filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))'
              }} 
            />
            <Box 
              component="img" 
              src="/images/logos/Logo Escudo MPP letra.png" 
              alt="Municipalidad de Puno" 
              sx={{ height: 80, width: 'auto' }} 
            />
          </Box>

          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 700, 
              color: '#1e293b',
              textAlign: 'center'
            }}
          >
            Iniciar Sesión
          </Typography>
          <Typography variant="body1" color="text.secondary" textAlign="center">
            Accede a tu cuenta del Sistema de Registro de Mascotas
          </Typography>
        </Box>

        {/* Login Card */}
        <Card 
          elevation={0} 
          sx={{ 
            boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
            border: '1px solid #e5e7eb',
            borderRadius: 3
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <LoginForm 
              onSubmit={handleLogin}
              loading={loading}
              error={error}
            />

            <Divider sx={{ my: 3 }}>O</Divider>

            <Box textAlign="center">
              <Typography variant="body2" sx={{ mb: 2 }}>
                ¿No tienes una cuenta?
              </Typography>
              <Button
                variant="outlined"
                startIcon={<PersonAdd />}
                onClick={() => navigate('/register')}
                fullWidth
                sx={{ 
                  textTransform: 'none',
                  borderColor: '#2563eb',
                  color: '#2563eb',
                  '&:hover': {
                    borderColor: '#1d4ed8',
                    backgroundColor: 'rgba(37, 99, 235, 0.05)',
                  }
                }}
              >
                Registrar Nueva Mascota
              </Button>
            </Box>

            <Box 
              sx={{ 
                mt: 3, 
                p: 2, 
                backgroundColor: '#f8fafc', 
                borderRadius: 2, 
                border: '1px solid #e5e7eb' 
              }}
            >
              <Typography variant="body2" color="text.secondary" textAlign="center">
                <strong>Nota:</strong> Para registrarte, primero debes registrar una mascota. 
                Tu cuenta se creará automáticamente con los datos del propietario.
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </motion.div>
    </Container>
  );
};

export default LoginPage;
