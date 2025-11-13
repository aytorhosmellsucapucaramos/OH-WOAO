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
  'a': { label: 'Asignado', color: '#ff9800', icon: <Pending /> },
  'p': { label: 'En Progreso', color: '#2196f3', icon: <HourglassEmpty /> },
  'd': { label: 'Completado', color: '#4caf50', icon: <CheckCircle /> },
  'r': { label: 'En Revisión', color: '#9c27b0', icon: <Info /> }
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
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'completed'

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
      
      console.log('🔍 [SeguimientoDashboard] Iniciando fetchAssignedCases...');
      
      const response = await axios.get(`${getServerUrl()}/api/seguimiento/assigned-cases`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('📊 [SeguimientoDashboard] Respuesta del backend:', response);
      console.log('📊 [SeguimientoDashboard] Datos de respuesta:', response.data);
      console.log('📊 [SeguimientoDashboard] Casos obtenidos:', response.data.cases?.length || 0);
      console.log('📊 [SeguimientoDashboard] Estadísticas obtenidas:', response.data.stats);

      if (response.data.success) {
        console.log('🔄 [SEGUIMIENTO] Datos recibidos del servidor:', response.data.cases?.length || 0, 'casos');
        
        setCases(response.data.cases || []);
        setStats(response.data.stats || {});
        setLastUpdate(new Date());
        
        console.log('✅ [SeguimientoDashboard] Datos cargados exitosamente');
        if (response.data.cases) {
          console.log('📊 [SeguimientoDashboard] Casos por estado:', response.data.cases.reduce((acc, c) => {
            acc[c.status] = (acc[c.status] || 0) + 1;
            return acc;
          }, {}));
          
          // DEBUG: Mostrar detalles de cada caso
          response.data.cases.forEach(c => {
            console.log(`📋 [SEGUIMIENTO] Caso ${c.id}: status='${c.status}', assigned_to='${c.assigned_to}', notes='${c.status_notes?.substring(0, 30)}...'`);
          });
        }
      } else {
        console.log('❌ [SeguimientoDashboard] Respuesta no exitosa:', response.data);
      }
    } catch (error) {
      console.error('❌ [SeguimientoDashboard] Error fetching assigned cases:', error);
      
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
    console.log(`🚀 [SEGUIMIENTO-FRONTEND] Iniciando actualización de estado...`);
    console.log(`🚀 [SEGUIMIENTO-FRONTEND] Caso ID: ${selectedCase?.id}`);
    console.log(`🚀 [SEGUIMIENTO-FRONTEND] Estado actual: ${selectedCase?.status}`);
    console.log(`🚀 [SEGUIMIENTO-FRONTEND] Nuevo estado: ${newStatus}`);
    console.log(`🚀 [SEGUIMIENTO-FRONTEND] Notas: ${notes?.substring(0, 50)}...`);
    
    // Validar que si se cambia a "d" o "r", sea obligatorio agregar notas
    if ((newStatus === 'd' || newStatus === 'r') && !notes.trim()) {
      const statusName = newStatus === 'd' ? 'Completado' : 'En Revisión';
      toast.error(`Es obligatorio agregar notas cuando se marca como "${statusName}"`);
      return;
    }

    if (!selectedCase || !newStatus) {
      console.log(`❌ [SEGUIMIENTO-FRONTEND] Falta selectedCase o newStatus`);
      return;
    }

    setUpdatingStatus(true);
    try {
      const token = localStorage.getItem('authToken');
      const url = `${getServerUrl()}/api/seguimiento/cases/${selectedCase.id}/status`;
      const payload = { status: newStatus, notes };
      
      console.log(`🔗 [SEGUIMIENTO-FRONTEND] URL: ${url}`);
      console.log(`📤 [SEGUIMIENTO-FRONTEND] Payload:`, payload);
      
      const response = await axios.put(url, payload, { 
        headers: { Authorization: `Bearer ${token}` } 
      });

      console.log(`📥 [SEGUIMIENTO-FRONTEND] Respuesta del servidor:`, response.data);
      
      if (response.data.success) {
        console.log(`✅ [SEGUIMIENTO-FRONTEND] Actualización exitosa`);
        toast.success(response.data.message || 'Estado actualizado correctamente');
        setShowCaseDialog(false);
        setSelectedCase(null);
        setNotes('');
        
        // Si se completó el caso, cambiar automáticamente a pestaña de completados
        if (newStatus === 'd') {
          console.log(`🔄 [SEGUIMIENTO-FRONTEND] Cambiando a pestaña completados en 1 segundo...`);
          setTimeout(() => {
            console.log(`🔄 [SEGUIMIENTO-FRONTEND] Cambiando pestaña a completados ahora`);
            setActiveTab('completed');
          }, 1000);
        }
        
        console.log(`🔄 [SEGUIMIENTO-FRONTEND] Refrescando datos...`);
        // Refresh data
        fetchAssignedCases();
      } else {
        console.log(`❌ [SEGUIMIENTO-FRONTEND] Respuesta no exitosa:`, response.data);
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
            <Grid item xs={12} sm={6} md={2.4}>
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

            <Grid item xs={12} sm={6} md={2.4}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: '#2196f3' }}>
                      <HourglassEmpty />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" fontWeight="600">
                        {stats.p || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        En Progreso
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={2.4}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: '#9c27b0' }}>
                      <Info />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" fontWeight="600">
                        {stats.d || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Completados
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={2.4}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: '#4caf50' }}>
                      <CheckCircle />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" fontWeight="600">
                        {stats.total || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Casos
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={2.4}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: '#9e9e9e' }}>
                      <CloseIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" fontWeight="600">
                        {stats.a || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Asignados
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

            {/* Pestañas */}
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Button
                  variant={activeTab === 'active' ? 'contained' : 'outlined'}
                  onClick={() => {
                    console.log('🔘 [PESTAÑA] Cambiando a Casos Activos');
                    setActiveTab('active');
                  }}
                  startIcon={<HourglassEmpty />}
                  size="small"
                >
                  Casos Activos ({cases.filter(c => c.status !== 'd').length})
                </Button>
                <Button
                  variant={activeTab === 'completed' ? 'contained' : 'outlined'}
                  onClick={() => {
                    console.log('🔘 [PESTAÑA] Cambiando a Completados');
                    setActiveTab('completed');
                  }}
                  startIcon={<CheckCircle />}
                  size="small"
                  color="success"
                >
                  Completados ({cases.filter(c => c.status === 'd').length})
                </Button>
              </Box>
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
                {cases
                  .filter(caseItem => {
                    const shouldShow = activeTab === 'active' 
                      ? caseItem.status !== 'd' 
                      : caseItem.status === 'd';
                    
                    console.log(`🔍 [FILTRO] Caso ${caseItem.id}: status='${caseItem.status}', pestaña='${activeTab}', mostrar=${shouldShow}`);
                    return shouldShow;
                  })
                  .map((caseItem, index) => (
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
                          opacity: caseItem.status === 'd' ? 0.85 : 1,
                          bgcolor: caseItem.status === 'd' ? '#f8f9fa' : 'white',
                          border: caseItem.status === 'd' ? '2px solid #4caf50' : '1px solid #e0e0e0',
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
            
            {/* Mensaje cuando no hay casos en la pestaña activa */}
            {!loading && cases.length > 0 && cases.filter(caseItem => {
              if (activeTab === 'active') {
                return caseItem.status !== 'd';
              } else {
                return caseItem.status === 'd';
              }
            }).length === 0 && (
              <Box sx={{ 
                py: 6, 
                textAlign: 'center',
                bgcolor: '#f9f9f9',
                borderRadius: 2
              }}>
                {activeTab === 'active' ? (
                  <>
                    <HourglassEmpty sx={{ fontSize: 60, color: '#ccc', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                      No tienes casos activos
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Los casos en progreso aparecerán aquí
                    </Typography>
                  </>
                ) : (
                  <>
                    <CheckCircle sx={{ fontSize: 60, color: '#4caf50', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                      No tienes casos completados
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Los casos que completes aparecerán aquí
                    </Typography>
                  </>
                )}
              </Box>
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
                <Typography variant="h6" fontWeight="600" gutterBottom sx={{ mt: 3 }}>
                  🔄 Actualizar Estado del Caso
                </Typography>
                
                {/* Estado Actual */}
                <Box sx={{ mb: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Estado Actual:
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {STATUS_CONFIG[selectedCase.status]?.icon}
                    <Typography variant="body1" fontWeight="600">
                      {STATUS_CONFIG[selectedCase.status]?.label || selectedCase.status}
                    </Typography>
                  </Box>
                </Box>

                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel>Nuevo Estado</InputLabel>
                  <Select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    label="Nuevo Estado"
                  >
                    <MenuItem value="p">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <HourglassEmpty sx={{ color: '#2196f3' }} />
                        En Progreso
                      </Box>
                    </MenuItem>
                    <MenuItem value="d">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckCircle sx={{ color: '#4caf50' }} />
                        Completado
                      </Box>
                    </MenuItem>
                    <MenuItem value="r">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Info sx={{ color: '#9c27b0' }} />
                        En Revisión (Requiere supervisión)
                      </Box>
                    </MenuItem>
                  </Select>
                </FormControl>

                {/* Notas */}
                <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                  📝 Notas del Seguimiento
                </Typography>
                
                {/* Indicador de obligatoriedad */}
                {(newStatus === 'd' || newStatus === 'r') && (
                  <Box sx={{ mb: 1, p: 1, bgcolor: '#fff3e0', borderRadius: 1, border: '1px solid #ffb74d' }}>
                    <Typography variant="body2" color="warning.main">
                      ⚠️ Las notas son obligatorias para este estado
                    </Typography>
                  </Box>
                )}

                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label={`Notas ${(newStatus === 'd' || newStatus === 'r') ? '(obligatorio)' : '(opcional)'}`}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={
                    newStatus === 'd' ? 
                    "📋 Describe cómo se resolvió el caso:\n• Acciones tomadas\n• Resultados obtenidos\n• Estado del animal\n• Observaciones finales" :
                    newStatus === 'r' ?
                    "🔍 Describe por qué requiere revisión:\n• Problemas encontrados\n• Dudas o complicaciones\n• Recursos adicionales necesarios" :
                    "💬 Agrega notas sobre el progreso:\n• Acciones realizadas\n• Próximos pasos\n• Observaciones generales"
                  }
                  required={newStatus === 'd' || newStatus === 'r'}
                  error={(newStatus === 'd' || newStatus === 'r') && !notes.trim()}
                  helperText={
                    (newStatus === 'd' || newStatus === 'r') && !notes.trim() ?
                    "Las notas son obligatorias para estados 'Completado' y 'En Revisión'" : 
                    "Documenta el progreso del caso para mantener un registro completo"
                  }
                  sx={{ mb: 2 }}
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setShowCaseDialog(false)}>
                  Cancelar
                </Button>
                <Button 
                  variant="contained" 
                  onClick={handleUpdateStatus}
                  disabled={updatingStatus || newStatus === selectedCase.status || ((newStatus === 'd' || newStatus === 'r') && !notes.trim())}
                  sx={{ 
                    bgcolor: newStatus === 'd' ? '#4caf50' : newStatus === 'r' ? '#9c27b0' : '#2196f3',
                    '&:hover': {
                      bgcolor: newStatus === 'd' ? '#45a049' : newStatus === 'r' ? '#8e24aa' : '#1976d2'
                    }
                  }}
                >
                  {updatingStatus ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      🔄 Actualizando...
                    </Box>
                  ) : (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {newStatus === 'd' ? '✅' : newStatus === 'r' ? '🔍' : '⏳'}
                      Actualizar Estado
                    </Box>
                  )}
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
