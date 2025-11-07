import React from 'react';
import { Navigate } from 'react-router-dom';
import { Box, Typography, Button, Paper } from '@mui/material';
import { Lock, Login } from '@mui/icons-material';
import { motion } from 'framer-motion';

const ProtectedRoute = ({ children }) => {
  // Buscar token en ambas ubicaciones para compatibilidad
  const token = localStorage.getItem('token') || localStorage.getItem('authToken');
  
  if (!token) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="60vh"
        p={3}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Paper 
            sx={{ 
              p: 4, 
              textAlign: 'center', 
              maxWidth: 400,
              background: 'rgba(255,255,255,0.98)',
              backdropFilter: 'blur(15px)',
            }}
          >
            <Lock sx={{ fontSize: 60, color: 'warning.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom fontWeight="bold">
              Acceso Restringido
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Debes iniciar sesión para acceder a esta sección.
            </Typography>
            <Button
              variant="contained"
              startIcon={<Login />}
              href="/login"
              sx={{
                background: 'linear-gradient(45deg, #2196f3 30%, #64b5f6 90%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #1976d2 30%, #2196f3 90%)',
                }
              }}
            >
              Iniciar Sesión
            </Button>
          </Paper>
        </motion.div>
      </Box>
    );
  }
  
  return children;
};

export default ProtectedRoute;
