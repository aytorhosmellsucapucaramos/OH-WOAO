import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Typography, Card, CardContent, TextField, Button,
  Box, Alert, CircularProgress, InputAdornment, IconButton,
  Link, Divider
} from '@mui/material';
import { Email, Lock, Visibility, VisibilityOff, Login, PersonAdd } from '@mui/icons-material';
import { motion } from 'framer-motion';
import axios from 'axios';

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(''); // Clear error on input change
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', formData);
      
      if (response.data.success) {
        // Store auth data
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('userEmail', response.data.user.email);
        localStorage.setItem('userId', response.data.user.id);
        localStorage.setItem('userFullName', response.data.user.fullName);
        localStorage.setItem('userDNI', response.data.user.dni);
        localStorage.setItem('userRole', response.data.user.role || 'user');
        
        // Store CUI if user has pets registered
        if (response.data.user.cui) {
          localStorage.setItem('userCUI', response.data.user.cui);
        }
        
        // Redirección automática según rol
        if (response.data.user.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.error || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header mejorado */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center',
          mb: 4,
          gap: 2
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box component="img" 
              src="/images/logos/Logo Escudo MPP.png" 
              alt="Escudo MPP" 
              sx={{ 
                height: 80, 
                width: 'auto',
                filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))'
              }} 
            />
            <Box component="img" 
              src="/images/logos/Logo Escudo MPP letra.png" 
              alt="Municipalidad de Puno" 
              sx={{ 
                height: 80, 
                width: 'auto',
                filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))'
              }} 
            />
          </Box>
          <Typography 
            variant="h3" 
            textAlign="center" 
            sx={{ 
              color: '#1e293b', 
              fontWeight: 700,
              letterSpacing: '-0.5px',
              mb: 1
            }}
          >
            Iniciar Sesión
          </Typography>
          <Typography 
            variant="subtitle1" 
            textAlign="center" 
            sx={{ 
              color: '#64748b', 
              fontWeight: 400,
            }}
          >
            Sistema de Registro Municipal de Mascotas
          </Typography>
        </Box>

        <Card 
          sx={{ 
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            overflow: 'hidden'
          }}
        >
          <CardContent sx={{ p: 4 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <Box sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email sx={{ color: 'action.active' }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  label="Contraseña"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock sx={{ color: 'action.active' }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                startIcon={!loading && <Login />}
                sx={{
                  background: '#2563eb',
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 600,
                  mb: 2,
                  textTransform: 'none',
                  boxShadow: 'none',
                  '&:hover': {
                    background: '#1d4ed8',
                    boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)',
                  },
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Iniciar Sesión'}
              </Button>
            </form>

            <Divider sx={{ my: 3 }}>O</Divider>

            <Box textAlign="center">
              <Typography variant="body2" sx={{ mb: 2 }}>
                ¿No tienes una cuenta?
              </Typography>
              <Button
                variant="outlined"
                startIcon={<PersonAdd />}
                onClick={() => navigate('/register')}
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

            <Box sx={{ mt: 3, p: 2, backgroundColor: '#f8fafc', borderRadius: 2, border: '1px solid #e5e7eb' }}>
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
