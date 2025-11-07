/**
 * OwnerInfoForm Component
 * Formulario de información del propietario
 */

import React, { useState } from 'react';
import { Grid, TextField, Typography, Box, InputAdornment, IconButton } from '@mui/material';
import { Person, Visibility, VisibilityOff, Badge, Phone, Email, Lock, Home } from '@mui/icons-material';

const OwnerInfoForm = ({ formData, onUpdate, errors }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Box>
      <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <Person /> Información del Propietario
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Nombre"
            value={formData.firstName}
            onChange={(e) => onUpdate('firstName', e.target.value)}
            error={!!errors.firstName}
            helperText={errors.firstName}
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Person sx={{ color: formData.firstName ? '#428cef' : '#9e9e9e' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                '&.Mui-focused fieldset': {
                  borderColor: formData.firstName ? '#428cef' : '#1976d2',
                },
                '& fieldset': {
                  borderColor: formData.firstName ? '#428cef' : 'rgba(0, 0, 0, 0.23)',
                },
              },
              '& .MuiInputLabel-root': {
                color: formData.firstName ? '#428cef' : 'rgba(0, 0, 0, 0.6)',
                '&.Mui-focused': {
                  color: formData.firstName ? '#428cef' : '#1976d2',
                },
              },
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Apellido"
            value={formData.lastName}
            onChange={(e) => onUpdate('lastName', e.target.value)}
            error={!!errors.lastName}
            helperText={errors.lastName}
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Person sx={{ color: formData.lastName ? '#428cef' : '#9e9e9e' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                '&.Mui-focused fieldset': {
                  borderColor: formData.lastName ? '#428cef' : '#1976d2',
                },
                '& fieldset': {
                  borderColor: formData.lastName ? '#428cef' : 'rgba(0, 0, 0, 0.23)',
                },
              },
              '& .MuiInputLabel-root': {
                color: formData.lastName ? '#428cef' : 'rgba(0, 0, 0, 0.6)',
                '&.Mui-focused': {
                  color: formData.lastName ? '#428cef' : '#1976d2',
                },
              },
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="DNI"
            value={formData.dni}
            onChange={(e) => onUpdate('dni', e.target.value)}
            error={!!errors.dni}
            helperText={errors.dni}
            inputProps={{ maxLength: 8 }}
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Badge sx={{ color: formData.dni ? '#428cef' : '#9e9e9e' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                '&.Mui-focused fieldset': {
                  borderColor: formData.dni ? '#428cef' : '#1976d2',
                },
                '& fieldset': {
                  borderColor: formData.dni ? '#428cef' : 'rgba(0, 0, 0, 0.23)',
                },
              },
              '& .MuiInputLabel-root': {
                color: formData.dni ? '#428cef' : 'rgba(0, 0, 0, 0.6)',
                '&.Mui-focused': {
                  color: formData.dni ? '#428cef' : '#1976d2',
                },
              },
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Teléfono"
            value={formData.phone}
            onChange={(e) => onUpdate('phone', e.target.value)}
            error={!!errors.phone}
            helperText={errors.phone}
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Phone sx={{ color: formData.phone ? '#428cef' : '#9e9e9e' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                '&.Mui-focused fieldset': {
                  borderColor: formData.phone ? '#428cef' : '#1976d2',
                },
                '& fieldset': {
                  borderColor: formData.phone ? '#428cef' : 'rgba(0, 0, 0, 0.23)',
                },
              },
              '& .MuiInputLabel-root': {
                color: formData.phone ? '#428cef' : 'rgba(0, 0, 0, 0.6)',
                '&.Mui-focused': {
                  color: formData.phone ? '#428cef' : '#1976d2',
                },
              },
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => onUpdate('email', e.target.value)}
            error={!!errors.email}
            helperText={errors.email}
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Email sx={{ color: formData.email ? '#428cef' : '#9e9e9e' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                '&.Mui-focused fieldset': {
                  borderColor: formData.email ? '#428cef' : '#1976d2',
                },
                '& fieldset': {
                  borderColor: formData.email ? '#428cef' : 'rgba(0, 0, 0, 0.23)',
                },
              },
              '& .MuiInputLabel-root': {
                color: formData.email ? '#428cef' : 'rgba(0, 0, 0, 0.6)',
                '&.Mui-focused': {
                  color: formData.email ? '#428cef' : '#1976d2',
                },
              },
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Dirección"
            value={formData.address}
            onChange={(e) => onUpdate('address', e.target.value)}
            error={!!errors.address}
            helperText={errors.address}
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Home sx={{ color: formData.address ? '#428cef' : '#9e9e9e' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                '&.Mui-focused fieldset': {
                  borderColor: formData.address ? '#428cef' : '#1976d2',
                },
                '& fieldset': {
                  borderColor: formData.address ? '#428cef' : 'rgba(0, 0, 0, 0.23)',
                },
              },
              '& .MuiInputLabel-root': {
                color: formData.address ? '#428cef' : 'rgba(0, 0, 0, 0.6)',
                '&.Mui-focused': {
                  color: formData.address ? '#428cef' : '#1976d2',
                },
              },
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Contraseña"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={(e) => onUpdate('password', e.target.value)}
            error={!!errors.password}
            helperText={errors.password || 'Mínimo 6 caracteres'}
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock sx={{ color: formData.password ? '#428cef' : '#9e9e9e' }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton 
                    onClick={() => setShowPassword(!showPassword)} 
                    edge="end"
                    aria-label="toggle password visibility"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                '&.Mui-focused fieldset': {
                  borderColor: formData.password ? '#428cef' : '#1976d2',
                },
                '& fieldset': {
                  borderColor: formData.password ? '#428cef' : 'rgba(0, 0, 0, 0.23)',
                },
              },
              '& .MuiInputLabel-root': {
                color: formData.password ? '#428cef' : 'rgba(0, 0, 0, 0.6)',
                '&.Mui-focused': {
                  color: formData.password ? '#428cef' : '#1976d2',
                },
              },
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Confirmar Contraseña"
            type={showPassword ? 'text' : 'password'}
            value={formData.confirmPassword || ''}
            onChange={(e) => onUpdate('confirmPassword', e.target.value)}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword}
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock sx={{ color: formData.confirmPassword ? '#428cef' : '#9e9e9e' }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton 
                    onClick={() => setShowPassword(!showPassword)} 
                    edge="end"
                    aria-label="toggle password visibility"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                '&.Mui-focused fieldset': {
                  borderColor: formData.confirmPassword ? '#428cef' : '#1976d2',
                },
                '& fieldset': {
                  borderColor: formData.confirmPassword ? '#428cef' : 'rgba(0, 0, 0, 0.23)',
                },
              },
              '& .MuiInputLabel-root': {
                color: formData.confirmPassword ? '#428cef' : 'rgba(0, 0, 0, 0.6)',
                '&.Mui-focused': {
                  color: formData.confirmPassword ? '#428cef' : '#1976d2',
                },
              },
            }}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default OwnerInfoForm;
