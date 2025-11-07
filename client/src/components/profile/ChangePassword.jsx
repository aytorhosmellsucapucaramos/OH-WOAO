import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress
} from '@mui/material';
import {
  Lock,
  Visibility,
  VisibilityOff,
  CheckCircle
} from '@mui/icons-material';
import axios from 'axios';

const ChangePassword = () => {
  const [formData, setFormData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    setMessage({ type: '', text: '' }); // Limpiar mensaje al escribir
  };

  const toggleShowPassword = (field) => {
    setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const validateForm = () => {
    if (!formData.current_password || !formData.new_password || !formData.confirm_password) {
      setMessage({ type: 'error', text: 'Todos los campos son requeridos' });
      return false;
    }

    if (formData.new_password.length < 6) {
      setMessage({ type: 'error', text: 'La nueva contraseña debe tener al menos 6 caracteres' });
      return false;
    }

    if (formData.new_password !== formData.confirm_password) {
      setMessage({ type: 'error', text: 'Las contraseñas no coinciden' });
      return false;
    }

    if (formData.current_password === formData.new_password) {
      setMessage({ type: 'error', text: 'La nueva contraseña debe ser diferente a la actual' });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      
      const response = await axios.put(
        'http://localhost:5000/api/profile/change-password',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      setMessage({ type: 'success', text: response.data.message || 'Contraseña cambiada exitosamente' });
      
      // Limpiar formulario
      setFormData({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });

    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Error al cambiar la contraseña';
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Lock sx={{ fontSize: 40, color: '#428cef', mr: 2 }} />
          <div>
            <Typography variant="h5" fontWeight="600">
              Cambiar Contraseña
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Actualiza tu contraseña de acceso
            </Typography>
          </div>
        </Box>

        {message.text && (
          <Alert 
            severity={message.type} 
            sx={{ mb: 3 }}
            icon={message.type === 'success' ? <CheckCircle /> : undefined}
          >
            {message.text}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            type={showPassword.current ? 'text' : 'password'}
            label="Contraseña Actual"
            value={formData.current_password}
            onChange={handleChange('current_password')}
            required
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock sx={{ color: '#666' }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => toggleShowPassword('current')}
                    edge="end"
                  >
                    {showPassword.current ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />

          <TextField
            fullWidth
            type={showPassword.new ? 'text' : 'password'}
            label="Nueva Contraseña"
            value={formData.new_password}
            onChange={handleChange('new_password')}
            required
            helperText="Mínimo 6 caracteres"
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock sx={{ color: '#428cef' }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => toggleShowPassword('new')}
                    edge="end"
                  >
                    {showPassword.new ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />

          <TextField
            fullWidth
            type={showPassword.confirm ? 'text' : 'password'}
            label="Confirmar Nueva Contraseña"
            value={formData.confirm_password}
            onChange={handleChange('confirm_password')}
            required
            sx={{ mb: 3 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock sx={{ color: '#428cef' }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => toggleShowPassword('confirm')}
                    edge="end"
                  >
                    {showPassword.confirm ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading}
            sx={{
              backgroundColor: '#428cef',
              '&:hover': { backgroundColor: '#3a7ad1' },
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 600
            }}
          >
            {loading ? (
              <CircularProgress size={24} sx={{ color: 'white' }} />
            ) : (
              'Cambiar Contraseña'
            )}
          </Button>
        </form>

        <Box sx={{ mt: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary">
            <strong>💡 Consejos:</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            • Usa al menos 6 caracteres<br />
            • Combina letras y números<br />
            • No uses tu nombre o datos personales
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ChangePassword;
