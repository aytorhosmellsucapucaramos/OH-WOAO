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
      const response = await axios.post('/api/auth/login', formData);
      
      if (response.data.success) {
        // Store auth data
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('userEmail', response.data.user.email);
        localStorage.setItem('userId', response.data.user.id);
        localStorage.setItem('userFullName', response.data.user.fullName);
        localStorage.setItem('userDNI', response.data.user.dni);
        
        // Redirect to user panel
        navigate('/user/dashboard');
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
        <Typography 
          variant="h4" 
          textAlign="center" 
          sx={{ 
            color: 'white', 
            mb: 4, 
            fontWeight: 600,
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
          }}
        >
          Iniciar Sesión
        </Typography>

        <Card 
          sx={{ 
            background: 'rgba(255,255,255,0.98)',
            backdropFilter: 'blur(15px)',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
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
                  background: 'linear-gradient(45deg, #2196f3 30%, #64b5f6 90%)',
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  mb: 2,
                  '&:hover': {
                    background: 'linear-gradient(45deg, #1976d2 30%, #2196f3 90%)',
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
                sx={{ textTransform: 'none' }}
              >
                Registrar Nueva Mascota
              </Button>
            </Box>

            <Box sx={{ mt: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 2 }}>
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
