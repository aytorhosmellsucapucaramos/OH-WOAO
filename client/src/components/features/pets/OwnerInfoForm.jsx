/**
 * OwnerInfoForm Component
 * Formulario de información del propietario
 */

import React, { useState } from 'react';
import { Grid, TextField, Typography, Box, InputAdornment, IconButton } from '@mui/material';
import { Person, Visibility, VisibilityOff } from '@mui/icons-material';

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
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => onUpdate('email', e.target.value)}
            error={!!errors.email}
            helperText={errors.email}
            required
          />
        </Grid>

        <Grid item xs={12}>
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
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Dirección"
            value={formData.address}
            onChange={(e) => onUpdate('address', e.target.value)}
            error={!!errors.address}
            helperText={errors.address}
            required
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default OwnerInfoForm;
