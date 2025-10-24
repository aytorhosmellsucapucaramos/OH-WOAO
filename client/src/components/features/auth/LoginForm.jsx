/**
 * LoginForm Component
 * Formulario de login reutilizable
 */

import React, { useState } from 'react';
import {
  TextField, Button, Box, Alert, CircularProgress,
  InputAdornment, IconButton
} from '@mui/material';
import { Email, Lock, Visibility, VisibilityOff, Login } from '@mui/icons-material';

const LoginForm = ({ onSubmit, loading, error }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData.email, formData.password);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <TextField
          fullWidth
          label="Email"
          name="email"
          type="email"
          autoComplete="username"
          value={formData.email}
          onChange={handleChange}
          required
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Email sx={{ color: 'action.active' }} />
              </InputAdornment>
            ),
          }}
        />

        <TextField
          fullWidth
          label="Contraseña"
          name="password"
          type={showPassword ? 'text' : 'password'}
          autoComplete="current-password"
          value={formData.password}
          onChange={handleChange}
          required
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Lock sx={{ color: 'action.active' }} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

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
      </Box>
    </Box>
  );
};

export default LoginForm;
