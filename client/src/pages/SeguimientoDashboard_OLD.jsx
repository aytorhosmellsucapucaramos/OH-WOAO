import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Avatar,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CardMedia,
  Divider,
  IconButton,
  Tooltip,
  Badge
} from '@mui/material';
import {
  Assignment,
  AccountCircle,
  Lock,
  LocationOn,
  Work,
  Logout,
  Refresh,
  CheckCircle,
  Pending,
  HourglassEmpty,
  Close as CloseIcon,
  Pets,
  Warning,
  Map as MapIcon,
  Phone,
  Email,
  Info
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { getServerUrl, getUploadUrl } from '../utils/urls';
import ChangePassword from '../components/profile/ChangePassword';

const SeguimientoDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showChangePassword, setShowChangePassword] = useState(false);

  useEffect(() => {
    loadUserInfo();
  }, []);

  const loadUserInfo = () => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5', py: 4 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" fontWeight="600" gutterBottom>
              Panel de Seguimiento
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Gestiona tus casos asignados
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="error"
            startIcon={<Logout />}
            onClick={() => {
              localStorage.clear();
              navigate('/login');
            }}
          >
            Cerrar Sesión
          </Button>
        </Box>

        {/* User Info Card */}
        {user && (
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: '#428cef', width: 60, height: 60 }}>
                  <AccountCircle sx={{ fontSize: 40 }} />
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" fontWeight="600">
                    {user.first_name} {user.last_name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user.email}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                    <Chip 
                      icon={<Work />}
                      label={`Código: ${user.employee_code || 'N/A'}`} 
                      size="small" 
                      color="primary"
                      variant="outlined"
                    />
                    {user.assigned_zone && (
                      <Chip 
                        icon={<LocationOn />}
                        label={user.assigned_zone} 
                        size="small" 
                        color="success"
                        variant="outlined"
                      />
                    )}
                  </Box>
                </Box>
                <Button
                  variant="outlined"
                  startIcon={<Lock />}
                  onClick={() => setShowChangePassword(!showChangePassword)}
                >
                  {showChangePassword ? 'Ocultar' : 'Cambiar Contraseña'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Change Password Component */}
        {showChangePassword && (
          <Box sx={{ mb: 4 }}>
            <ChangePassword />
          </Box>
        )}

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: '#ff9800' }}>
                    <Assignment />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" fontWeight="600">
                      0
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Casos Asignados
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: '#2196f3' }}>
                    <Assignment />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" fontWeight="600">
                      0
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      En Progreso
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: '#4caf50' }}>
                    <Assignment />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" fontWeight="600">
                      0
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Completados
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Casos Asignados Section */}
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight="600" gutterBottom>
              Mis Casos Asignados
            </Typography>
            <Box sx={{ 
              py: 8, 
              textAlign: 'center',
              bgcolor: '#f9f9f9',
              borderRadius: 2
            }}>
              <Assignment sx={{ fontSize: 80, color: '#ccc', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No tienes casos asignados
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Los casos asignados por el administrador aparecerán aquí
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* Info Box */}
        <Box sx={{ mt: 4, p: 3, bgcolor: '#e3f2fd', borderRadius: 2 }}>
          <Typography variant="body1" fontWeight="600" gutterBottom>
            ℹ️ Información para Personal de Seguimiento
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • Aquí aparecerán los reportes de perros callejeros asignados a ti<br />
            • Podrás actualizar el estado de cada caso<br />
            • Subir evidencia fotográfica del trabajo realizado<br />
            • Cerrar casos una vez resueltos<br />
            • Ver tu historial de casos atendidos
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default SeguimientoDashboard;
