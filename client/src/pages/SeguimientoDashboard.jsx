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
  Badge,
  FormControl,
  InputLabel,
  Select,
  MenuItem
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
  Info,
  Edit
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { getServerUrl, getUploadUrl } from '../utils/urls';
import ChangePassword from '../components/profile/ChangePassword';

const STATUS_CONFIG = {
  'active': { label: 'Pendiente', color: '#ff9800', icon: <Pending /> },
  'in_progress': { label: 'En Progreso', color: '#2196f3', icon: <HourglassEmpty /> },
  'resolved': { label: 'Resuelto', color: '#4caf50', icon: <CheckCircle /> },
  'closed': { label: 'Cerrado', color: '#9e9e9e', icon: <CloseIcon /> }
};

const SeguimientoDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [cases, setCases] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);
  const [showCaseDialog, setShowCaseDialog] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [lastUpdate, setLastUpdate] = useState(null);
  const [, setUpdateTicker] = useState(0); // Para forzar re-render del tiempo

  // Verificar autenticación al cargar
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      // Si no hay token, redirigir al login
      navigate('/login', { replace: true });
      return;
    }
    
    loadUserInfo();
    fetchAssignedCases();
  }, [navigate]);

  // Auto-actualización cada 30 segundos
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    // Intervalo de actualización
    const intervalId = setInterval(() => {
      fetchAssignedCases();
    }, 30000); // 30 segundos

    // Cleanup al desmontar
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  // Actualizar el texto de "última actualización" cada segundo
  useEffect(() => {
    if (!lastUpdate) return;
    
    const intervalId = setInterval(() => {
      // Forzar re-render cada segundo para actualizar el texto relativo
      setUpdateTicker(prev => prev + 1);
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [lastUpdate]);

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

  const fetchAssignedCases = async (showToast = false) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        navigate('/login', { replace: true });
        return;
      }
      
      const response = await axios.get(`${getServerUrl()}/api/seguimiento/assigned-cases`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setCases(response.data.cases || []);
        setStats(response.data.stats || {});
        setLastUpdate(new Date());
        
        if (showToast) {
          toast.success('✅ Casos actualizados', { duration: 2000 });
        }
      }
    } catch (error) {
      console.error('Error fetching assigned cases:', error);
      
      // Si es error 401, redirigir al login
      if (error.response?.status === 401) {
        localStorage.clear();
        navigate('/login', { replace: true });
        toast.error('Sesión expirada. Por favor inicia sesión nuevamente.');
      } else {
        toast.error('Error al cargar los casos asignados');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleViewCase = (caseData) => {
    setSelectedCase(caseData);
    setNewStatus(caseData.status);
    setNotes('');
    setShowCaseDialog(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedCase || !newStatus) return;

    setUpdatingStatus(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.put(
        `${getServerUrl()}/api/seguimiento/cases/${selectedCase.id}/status`,
        { status: newStatus, notes },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success('Estado actualizado exitosamente');
        setShowCaseDialog(false);
        fetchAssignedCases(); // Recargar casos
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error(error.response?.data?.message || 'Error al actualizar el estado');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusColor = (status) => STATUS_CONFIG[status]?.color || '#9e9e9e';
  const getStatusLabel = (status) => STATUS_CONFIG[status]?.label || status;
  
  // Formatear tiempo de última actualización
  const getLastUpdateText = () => {
    if (!lastUpdate) return 'Nunca';
    
    const now = new Date();
    const diff = Math.floor((now - lastUpdate) / 1000); // diferencia en segundos
    
    if (diff < 10) return 'Justo ahora';
    if (diff < 60) return `Hace ${diff} segundos`;
    if (diff < 3600) return `Hace ${Math.floor(diff / 60)} minutos`;
    if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} horas`;
    return lastUpdate.toLocaleString('es-PE');
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5', py: 4 }}>
      <Toaster position="top-right" />
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" fontWeight="600" gutterBottom>
              Panel de Seguimiento
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Gestiona tus casos asignados de perros callejeros
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
              <Typography variant="caption" color="text.secondary">
                🔄 Última actualización: {getLastUpdateText()}
              </Typography>
              <Chip 
                label="Auto-actualización: 30s" 
                size="small" 
                color="success"
                variant="outlined"
                sx={{ height: 20, fontSize: '0.7rem' }}
              />
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={() => fetchAssignedCases(true)}
              disabled={loading}
            >
              Actualizar
            </Button>
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
        </Box>

        {/* User Info Card */}
        {user && (
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
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
                  <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
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
        {stats && (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: '#ff9800' }}>
                      <Assignment />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" fontWeight="600">
                        {stats.total_assigned || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Asignados
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: '#2196f3' }}>
                      <HourglassEmpty />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" fontWeight="600">
                        {stats.in_progress || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        En Progreso
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: '#4caf50' }}>
                      <CheckCircle />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" fontWeight="600">
                        {stats.resolved || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Resueltos
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: '#9e9e9e' }}>
                      <CloseIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" fontWeight="600">
                        {stats.closed || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Cerrados
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Casos Asignados Section */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" fontWeight="600">
                Mis Casos Asignados
              </Typography>
              {!loading && cases.length > 0 && (
                <Chip 
                  label={`${cases.length} caso${cases.length !== 1 ? 's' : ''}`} 
                  color="primary"
                  size="small"
                />
              )}
            </Box>

            {loading ? (
              <Box sx={{ py: 8, textAlign: 'center' }}>
                <CircularProgress />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  Cargando casos asignados...
                </Typography>
              </Box>
            ) : cases.length === 0 ? (
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
            ) : (
              <Grid container spacing={3}>
                {cases.map((caseItem, index) => (
                  <Grid item xs={12} md={6} key={caseItem.id}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card 
                        sx={{ 
                          height: '100%',
                          cursor: 'pointer',
                          transition: 'transform 0.2s, box-shadow 0.2s',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: 4
                          }
                        }}
                        onClick={() => handleViewCase(caseItem)}
                      >
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                            <Chip 
                              label={getStatusLabel(caseItem.status)}
                              size="small"
                              sx={{ 
                                bgcolor: getStatusColor(caseItem.status),
                                color: 'white',
                                fontWeight: 600
                              }}
                            />
                            <Chip 
                              label={`ID: ${caseItem.id}`}
                              size="small"
                              variant="outlined"
                            />
                          </Box>

                          {caseItem.photo_path && (
                            <Box sx={{ mb: 2, borderRadius: 2, overflow: 'hidden' }}>
                              <CardMedia
                                component="img"
                                height="180"
                                image={getUploadUrl(caseItem.photo_path)}
                                alt="Perro callejero"
                                sx={{ objectFit: 'cover' }}
                              />
                            </Box>
                          )}

                          <Typography variant="h6" fontWeight="600" gutterBottom>
                            {caseItem.breed_name || 'Raza desconocida'}
                          </Typography>

                          <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                            {caseItem.size_name && (
                              <Chip label={caseItem.size_name} size="small" />
                            )}
                            {caseItem.urgency_name && (
                              <Chip 
                                label={caseItem.urgency_name} 
                                size="small"
                                color={caseItem.urgency_priority > 2 ? 'error' : 'warning'}
                              />
                            )}
                          </Box>

                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {caseItem.description?.substring(0, 100)}
                            {caseItem.description?.length > 100 && '...'}
                          </Typography>

                          <Divider sx={{ my: 2 }} />

                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LocationOn fontSize="small" color="action" />
                            <Typography variant="caption" color="text.secondary">
                              {caseItem.address || 'Ubicación no especificada'}
                            </Typography>
                          </Box>

                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                            <AccountCircle fontSize="small" color="action" />
                            <Typography variant="caption" color="text.secondary">
                              Reportado por: {caseItem.reporter_first_name} {caseItem.reporter_last_name}
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
            )}
          </CardContent>
        </Card>

        {/* Case Detail Dialog */}
        <Dialog 
          open={showCaseDialog} 
          onClose={() => setShowCaseDialog(false)}
          maxWidth="md"
          fullWidth
        >
          {selectedCase && (
            <>
              <DialogTitle>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6" fontWeight="600">
                    Caso #{selectedCase.id}
                  </Typography>
                  <IconButton onClick={() => setShowCaseDialog(false)}>
                    <CloseIcon />
                  </IconButton>
                </Box>
              </DialogTitle>
              <DialogContent dividers>
                {/* Foto */}
                {selectedCase.photo_path && (
                  <Box sx={{ mb: 3, borderRadius: 2, overflow: 'hidden' }}>
                    <CardMedia
                      component="img"
                      image={getUploadUrl(selectedCase.photo_path)}
                      alt="Perro callejero"
                      sx={{ maxHeight: 400, objectFit: 'contain', bgcolor: '#000' }}
                    />
                  </Box>
                )}

                {/* Información del Perro */}
                <Typography variant="h6" fontWeight="600" gutterBottom>
                  Información del Perro
                </Typography>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Raza</Typography>
                    <Typography variant="body1">{selectedCase.breed_name || 'Desconocida'}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Tamaño</Typography>
                    <Typography variant="body1">{selectedCase.size_name || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Temperamento</Typography>
                    <Typography variant="body1">{selectedCase.temperament_name || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Condición</Typography>
                    <Typography variant="body1">{selectedCase.condition_name || 'N/A'}</Typography>
                  </Grid>
                </Grid>

                {/* Descripción */}
                <Typography variant="h6" fontWeight="600" gutterBottom>
                  Descripción
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {selectedCase.description || 'Sin descripción'}
                </Typography>

                {/* Ubicación */}
                <Typography variant="h6" fontWeight="600" gutterBottom>
                  Ubicación
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {selectedCase.address || 'Dirección no especificada'}
                </Typography>

                {/* Información del Reportero */}
                <Typography variant="h6" fontWeight="600" gutterBottom>
                  Información del Reportero
                </Typography>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2">
                    <strong>Nombre:</strong> {selectedCase.reporter_first_name} {selectedCase.reporter_last_name}
                  </Typography>
                  {selectedCase.reporter_phone && (
                    <Typography variant="body2">
                      <strong>Teléfono:</strong> {selectedCase.reporter_phone}
                    </Typography>
                  )}
                  {selectedCase.reporter_email && (
                    <Typography variant="body2">
                      <strong>Email:</strong> {selectedCase.reporter_email}
                    </Typography>
                  )}
                </Box>

                {/* Actualizar Estado */}
                <Typography variant="h6" fontWeight="600" gutterBottom>
                  Actualizar Estado
                </Typography>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Estado del Caso</InputLabel>
                  <Select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    label="Estado del Caso"
                  >
                    <MenuItem value="in_progress">En Progreso</MenuItem>
                    <MenuItem value="resolved">Resuelto</MenuItem>
                    <MenuItem value="closed">Cerrado</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Notas (opcional)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Agrega notas sobre el progreso del caso..."
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setShowCaseDialog(false)}>
                  Cancelar
                </Button>
                <Button 
                  variant="contained" 
                  onClick={handleUpdateStatus}
                  disabled={updatingStatus || newStatus === selectedCase.status}
                >
                  {updatingStatus ? 'Actualizando...' : 'Actualizar Estado'}
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>

        {/* Info Box */}
        <Box sx={{ mt: 4, p: 3, bgcolor: '#e3f2fd', borderRadius: 2 }}>
          <Typography variant="body1" fontWeight="600" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Info /> Información para Personal de Seguimiento
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • Haz clic en cualquier caso para ver los detalles completos<br />
            • Actualiza el estado del caso según el progreso<br />
            • Marca como "Resuelto" cuando el perro sea rescatado o atendido<br />
            • Marca como "Cerrado" una vez completado todo el seguimiento<br />
            • Contacta al reportero si necesitas más información
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default SeguimientoDashboard;
