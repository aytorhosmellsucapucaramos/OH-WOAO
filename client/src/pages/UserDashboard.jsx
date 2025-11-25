import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Typography, Box, Card, CardContent, Grid, Button,
  Avatar, Divider, Paper, Alert, CircularProgress, IconButton,
  CardActions, Dialog, DialogTitle, DialogContent, DialogActions, Chip,
  Pagination, CardMedia, Tooltip, Fab, TextField, Tab, Tabs,
  List, ListItem, ListItemIcon, ListItemText, Badge, Stack,
  InputAdornment, FormControl, InputLabel, Select, MenuItem,
  Autocomplete, Radio, RadioGroup, FormControlLabel, FormLabel,
  Snackbar
} from '@mui/material';
import {
  Pets, Add, QrCode, Print, CheckCircle, Pending, Edit, Delete,
  LocationOn, Email, Phone, Home, Person, CalendarToday, Vaccines,
  Logout, Visibility, PhotoCamera, Save, Cancel, AccountCircle,
  HealthAndSafety, Cake, Palette, Description, History, Close,
  Badge as BadgeIcon, CloudUpload, MedicalServices, Report,
  AccessTime, Search, FilterList
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { logout } from '../services/authService';
import { getServerUrl, getUploadUrl } from '../utils/urls';
import { getAllCatalogs } from '../services/catalogService';

// Componente personalizado para manejar imágenes de perfil
const ProfileAvatar = ({ user, profilePhotoPreview, size = 80, iconSize = 40, isEditMode = false }) => {
  // En modo edición Y con preview, usar preview
  // De lo contrario, siempre usar la imagen del servidor si existe
  let imageUrl = '';
  
  if (isEditMode && profilePhotoPreview) {
    // Solo en el modal de edición con preview nuevo
    imageUrl = profilePhotoPreview;
  } else if (user?.photo_path) {
    // En todos los demás casos, usar la imagen del servidor
    imageUrl = getUploadUrl(user.photo_path);
  }

  // Obtener la primera letra del nombre para el fallback
  const getInitial = () => {
    if (user?.first_name) {
      return user.first_name.charAt(0).toUpperCase();
    }
    return 'U';
  };
  
  return (
    <Avatar
      src={imageUrl || undefined}
      sx={{ 
        width: size, 
        height: size, 
        bgcolor: imageUrl ? 'transparent' : '#2563eb',
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
        border: '2px solid rgba(255, 255, 255, 0.2)',
        fontSize: `${size / 2.5}px`,
        fontWeight: 600
      }}
    >
      {!imageUrl && getInitial()}
    </Avatar>
  );
};

const UserDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPet, setSelectedPet] = useState(null);
  const [openCardDialog, setOpenCardDialog] = useState(false);
  const [openEditPetDialog, setOpenEditPetDialog] = useState(false);
  const [openProfileDialog, setOpenProfileDialog] = useState(false);
  const [showAlert, setShowAlert] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [tabValue, setTabValue] = useState(0);
  const [editingPet, setEditingPet] = useState({});
  const [petDetailsOpen, setPetDetailsOpen] = useState(false);
  const [selectedPetDetails, setSelectedPetDetails] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [profileData, setProfileData] = useState({});
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState(null);
  const [medicalHistories, setMedicalHistories] = useState([]);
  const [breeds, setBreeds] = useState([]);
  const [colors, setColors] = useState([]);
  
  // Estados para reportes
  const [myReports, setMyReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportFilter, setReportFilter] = useState('all');
  const [reportSearch, setReportSearch] = useState('');
  
  const petsPerPage = 6; // 3 columns x 2 rows

  // Formatear edad de meses a texto legible
  const formatAge = (months) => {
    if (!months) return 'N/A';
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    
    if (years === 0) {
      return `${months} ${months === 1 ? 'mes' : 'meses'}`;
    } else if (remainingMonths === 0) {
      return `${years} ${years === 1 ? 'año' : 'años'}`;
    } else {
      return `${years} ${years === 1 ? 'año' : 'años'} y ${remainingMonths} ${remainingMonths === 1 ? 'mes' : 'meses'}`;
    }
  };

  // Formatear sexo
  const formatSex = (sexValue) => {
    if (sexValue === 'male') return 'Macho ♂️';
    if (sexValue === 'female') return 'Hembra ♀️';
    return 'N/A';
  };

  const defaultBreeds = [
    'Mestizo', 'Labrador Retriever', 'Pastor Alemán', 'Golden Retriever',
    'Bulldog Francés', 'Bulldog Inglés', 'Beagle', 'Poodle', 'Rottweiler',
    'Yorkshire Terrier', 'Dachshund', 'Boxer', 'Husky Siberiano', 'Gran Danés',
    'Pug', 'Boston Terrier', 'Shih Tzu', 'Pomerania', 'Cocker Spaniel',
    'Border Collie', 'Chihuahua', 'Maltés', 'Schnauzer', 'Pitbull',
    'Akita', 'San Bernardo', 'Dálmata', 'Bichón Frisé', 'Chow Chow',
    'Pequinés', 'Otro'
  ];

  const defaultColors = [
    'Negro', 'Blanco', 'Marrón', 'Dorado', 'Gris', 'Crema', 'Café',
    'Chocolate', 'Canela', 'Beige', 'Atigrado', 'Manchado',
    'Negro y Blanco', 'Negro y Marrón', 'Blanco y Marrón', 'Tricolor',
    'Merle', 'Rojizo', 'Plata', 'Azul', 'Arena', 'Otro'
  ];

  useEffect(() => {
    fetchUserData();
    fetchUserPets();
    fetchMyReports();
    loadCatalogs();
  }, []);

  // Bloquear scroll del body cuando cualquier modal esté abierto
  useEffect(() => {
    if (openEditPetDialog || petDetailsOpen || openProfileDialog || openCardDialog) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    // Cleanup al desmontar
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [openEditPetDialog, petDetailsOpen, openProfileDialog, openCardDialog]);

  const loadCatalogs = async () => {
    try {
      const catalogs = await getAllCatalogs();
      setMedicalHistories(catalogs.medicalHistories || []);
      setBreeds(catalogs.breeds || []);
      setColors(catalogs.colors || []);
    } catch (error) {
      console.error('Error loading catalogs:', error);
    }
  };

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get(`${getServerUrl()}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setUser(response.data.user);
        setProfileData(response.data.user);
      }
    } catch (err) {
      console.error('Error fetching user:', err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem('authToken');
        navigate('/login');
      }
    }
  };

  const fetchUserPets = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      const response = await axios.get(`${getServerUrl()}/api/auth/my-pets`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        // Asegurar que pets siempre sea un array
        setPets(Array.isArray(response.data.pets) ? response.data.pets : []);
      } else {
        setPets([]);
      }
    } catch (err) {
      console.error('Error fetching pets:', err);
      setError('Error al cargar las mascotas');
      setPets([]); // Asegurar array vacío en caso de error
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener reportes del usuario
  const fetchMyReports = async () => {
    setReportsLoading(true);
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      const response = await axios.get(`${getServerUrl()}/api/auth/my-reports`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setMyReports(Array.isArray(response.data.reports) ? response.data.reports : []);
      } else {
        setMyReports([]);
      }
    } catch (err) {
      console.error('Error fetching my reports:', err);
      setMyReports([]);
    } finally {
      setReportsLoading(false);
    }
  };

  const handleLogout = () => {
    // Usar la función logout del authService para limpiar TODO el localStorage
    logout();
    navigate('/');
  };

  const handleViewCard = (pet) => {
    window.open(`/pet/${pet.cui}`, '_blank');
  };

  const handleEditPet = async (pet) => {
    console.log('🐕 Pet data received:', pet);
    console.log('📋 Available medical histories:', medicalHistories);
    
    // Obtener el código del antecedente médico si existe medical_history_id
    let medicalHistoryCode = 'none';
    if (pet.medical_history_id) {
      const history = medicalHistories.find(h => h.id === pet.medical_history_id);
      console.log('🏥 Found medical history:', history);
      if (history) {
        medicalHistoryCode = history.code;
      }
    }
    
    // Extraer el color (puede venir como color o color_name)
    const petColor = pet.color || pet.color_name || '';
    // Extraer la raza (puede venir como breed o breed_name)
    const petBreed = pet.breed || pet.breed_name || '';
    
    console.log('🎨 Color extracted:', petColor);
    console.log('🐾 Breed extracted:', petBreed);
    
    const editData = {
      ...pet,
      breed: petBreed,
      color: petColor,
      medicalHistory: medicalHistoryCode,
      medicalHistoryDetails: pet.medical_history_details || '',
      hasVaccinationCard: pet.has_vaccination_card ? 'si' : 'no',
      hasRabiesVaccine: pet.has_rabies_vaccine ? 'si' : 'no'
    };
    
    console.log('✏️ Edit data prepared:', editData);
    setEditingPet(editData);
    setOpenEditPetDialog(true);
  };

  const handleUpdatePet = async () => {
    try {
      const token = localStorage.getItem('authToken');
      
      // Crear FormData para enviar archivos
      const formData = new FormData();
      
      // Solo enviar campos de vacunación
      formData.append('hasVaccinationCard', editingPet.hasVaccinationCard || 'no');
      formData.append('hasRabiesVaccine', editingPet.hasRabiesVaccine || 'no');
      
      // Agregar archivos de carnets si fueron seleccionados
      if (editingPet.vaccinationCardFile) {
        formData.append('vaccinationCard', editingPet.vaccinationCardFile);
      }
      if (editingPet.rabiesVaccineCardFile) {
        formData.append('rabiesVaccineCard', editingPet.rabiesVaccineCardFile);
      }
      
      const response = await axios.put(
        `${getServerUrl()}/api/auth/pet/${editingPet.id}`,
        formData,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.success) {
        fetchUserPets();
        setOpenEditPetDialog(false);
        setEditingPet({});
        setSnackbarMessage('✅ Carnets actualizados exitosamente');
        setSnackbarOpen(true);
      }
    } catch (err) {
      setError('Error al actualizar carnets de vacunación');
      console.error('Update pet error:', err);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      
      if (!token) {
        setError('No hay sesión activa');
        return;
      }

      const formData = new FormData();
      
      // Agregar solo los campos que se pueden editar
      if (profileData.first_name) formData.append('first_name', profileData.first_name);
      if (profileData.last_name) formData.append('last_name', profileData.last_name);
      if (profileData.phone) formData.append('phone', profileData.phone);
      if (profileData.email) formData.append('email', profileData.email);
      if (profileData.address) formData.append('address', profileData.address);
      
      // Agregar foto si se seleccionó una nueva
      if (profilePhoto) {
        formData.append('profilePhoto', profilePhoto);
      }

      const response = await axios.put(
        `${getServerUrl()}/api/auth/profile`,
        formData,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.success) {
        console.log('✅ Perfil actualizado:', response.data.user);
        
        // Actualizar el estado del usuario con los datos devueltos por el servidor
        setUser(response.data.user);
        setProfileData(response.data.user);
        
        // Limpiar estado de foto temporal
        setProfilePhoto(null);
        setProfilePhotoPreview(null);
        
        // Cerrar el diálogo
        setOpenProfileDialog(false);
        
        // Mostrar mensaje de éxito
        setError('');
        
        // Recargar datos para sincronizar completamente
        await fetchUserData();
      }
    } catch (err) {
      console.error('❌ Error actualizando perfil:', err);
      const errorMsg = err.response?.data?.error || 'Error al actualizar el perfil';
      setError(errorMsg);
    }
  };

  const handleProfilePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePhoto(file);
      const reader = new FileReader();
      reader.onload = (e) => setProfilePhotoPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  // Pagination logic - verificar que pets esté definido
  const safePets = pets || [];
  const indexOfLastPet = currentPage * petsPerPage;
  const indexOfFirstPet = indexOfLastPet - petsPerPage;
  const currentPets = safePets.slice(indexOfFirstPet, indexOfLastPet);
  const totalPages = Math.ceil(safePets.length / petsPerPage);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      position: 'relative',
      minHeight: '100vh',
      overflow: 'hidden'
    }}>
      {/* Marca de agua - Logo Puno Renace */}
      <Box
        sx={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%) rotate(-15deg)',
          opacity: 0.03,
          zIndex: 0,
          pointerEvents: 'none',
          width: '600px',
          height: '600px',
        }}
      >
        <motion.img
          src="/images/logos/Logo Puno Renace_UU.png"
          alt="Marca de agua"
          style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'grayscale(100%) opacity(0.3)' }}
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.015, 0.025, 0.015],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </Box>

      {/* Patrón de fondo animado con patitas, huesos y muellitas */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 0,
          pointerEvents: 'none',
          opacity: 0.03,
        }}
      >
        {/* Patitas animadas */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={`paw-${i}`}
            initial={{
              x: Math.random() * window.innerWidth,
              y: -50,
              rotate: Math.random() * 360,
              scale: 0.5 + Math.random() * 0.5,
            }}
            animate={{
              y: window.innerHeight + 50,
              rotate: Math.random() * 360 + 360,
            }}
            transition={{
              duration: 15 + Math.random() * 10,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "linear",
            }}
            style={{
              position: 'absolute',
              fontSize: '40px',
              opacity: 0.04,
              filter: 'grayscale(30%)',
            }}
          >
            🐾
          </motion.div>
        ))}
        {/* Huesos animados */}
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={`bone-${i}`}
            initial={{
              x: Math.random() * window.innerWidth,
              y: window.innerHeight + 50,
              rotate: 0,
              scale: 0.4 + Math.random() * 0.4,
            }}
            animate={{
              y: -50,
              rotate: 360,
              x: Math.random() * window.innerWidth,
            }}
            transition={{
              duration: 20 + Math.random() * 10,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "linear",
            }}
            style={{
              position: 'absolute',
              fontSize: '35px',
              opacity: 0.03,
              filter: 'grayscale(30%)',
            }}
          >
            🦴
          </motion.div>
        ))}
      </Box>

    <Container maxWidth="xl" sx={{ 
      pt: { xs: 10, sm: 12, md: 14 }, 
      pb: 6, 
      position: 'relative', 
      zIndex: 1 
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <Paper elevation={0} sx={{ 
          p: { xs: 2, sm: 3, md: 4 }, 
          mb: 4, 
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(249, 250, 251, 0.95) 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(226, 232, 240, 0.5)',
          borderRadius: 4,
          boxShadow: '0 10px 40px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.04)',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 15px 50px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.06)',
            transform: 'translateY(-2px)'
          }
        }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item>
              <ProfileAvatar 
                user={user} 
                profilePhotoPreview={null}  // No pasar preview al header
                size={80}
                iconSize={40}
                isEditMode={false}
              />
            </Grid>
            <Grid item xs>
              <Typography 
                variant="h4" 
                sx={{ 
                  color: '#1e293b',
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }} 
                gutterBottom
              >
                Bienvenido, {user?.first_name}!
              </Typography>
              <Typography variant="body1" sx={{ color: '#64748b', fontWeight: 500 }}>
                {user?.email} • {user?.phone}
              </Typography>
            </Grid>
            <Grid item>
              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  startIcon={<Edit />}
                  onClick={() => setOpenProfileDialog(true)}
                  sx={{ 
                    background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
                    color: 'white',
                    px: 3,
                    fontWeight: 600,
                    boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 20px rgba(59, 130, 246, 0.4)',
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Editar Perfil
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Logout />}
                  onClick={handleLogout}
                  sx={{ 
                    borderColor: '#3b82f6',
                    color: '#3b82f6',
                    px: 3,
                    fontWeight: 600,
                    '&:hover': {
                      borderColor: '#1e40af',
                      backgroundColor: 'rgba(59, 130, 246, 0.05)'
                    }
                  }}
                >
                  Cerrar Sesión
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Paper>

        {/* Alert for card pickup */}
        {showAlert && (
          <Alert 
            severity="info" 
            onClose={() => setShowAlert(false)}
            sx={{ 
              mb: 4,
              backgroundColor: 'rgba(239, 246, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(147, 197, 253, 0.4)',
              boxShadow: '0 4px 20px rgba(59, 130, 246, 0.1)',
              borderRadius: 3,
              '& .MuiAlert-icon': {
                color: '#3b82f6'
              }
            }}
          >
            <Typography variant="body1" sx={{ color: '#1e40af', fontWeight: 500 }}>
              📍 Recuerda recoger los carnets físicos de tus mascotas en la <strong>Gerencia Ambiental</strong>
            </Typography>
          </Alert>
        )}

        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Card elevation={0} sx={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(249, 250, 251, 0.95) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(226, 232, 240, 0.5)',
              borderRadius: 3,
              boxShadow: '0 4px 15px rgba(0,0,0,0.05), 0 1px 4px rgba(0,0,0,0.03)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 12px 35px rgba(59, 130, 246, 0.12), 0 4px 12px rgba(0,0,0,0.06)',
                borderColor: 'rgba(59, 130, 246, 0.3)',
              }
            }}>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <Pets sx={{ fontSize: 40, color: '#3b82f6', mr: 2 }} />
                  <Box>
                    <Typography sx={{ color: '#64748b', fontWeight: 500 }} gutterBottom>
                      Mascotas Registradas
                    </Typography>
                    <Typography variant="h4" sx={{ color: '#1e293b', fontWeight: 700 }}>
                      {safePets.length}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(226, 232, 240, 0.8)',
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-3px)',
                boxShadow: '0 8px 30px rgba(245, 158, 11, 0.15)',
              }
            }}>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <Report sx={{ fontSize: 40, color: '#f59e0b', mr: 2 }} />
                  <Box>
                    <Typography sx={{ color: '#64748b', fontWeight: 500 }} gutterBottom>
                      Reportes Realizados
                    </Typography>
                    <Typography variant="h4" sx={{ color: '#1e293b', fontWeight: 700 }}>
                      {myReports.length}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(226, 232, 240, 0.8)',
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-3px)',
                boxShadow: '0 8px 30px rgba(37, 99, 235, 0.15)',
              }
            }}>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <CheckCircle sx={{ fontSize: 40, color: '#2196F3', mr: 2 }} />
                  <Box>
                    <Typography sx={{ color: '#64748b', fontWeight: 500 }} gutterBottom>
                      Carnets Impresos
                    </Typography>
                    <Typography variant="h4" sx={{ color: '#1e293b', fontWeight: 700 }}>
                      {safePets.filter(p => p.card_printed).length}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tabs Section */}
        <Box sx={{ mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={(e, newValue) => setTabValue(newValue)}
            sx={{
              borderBottom: '2px solid #e2e8f0',
              '& .MuiTabs-indicator': {
                background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
                height: 3,
                borderRadius: '3px 3px 0 0'
              }
            }}
          >
            <Tab
              icon={<Pets />}
              label={`Mis Mascotas (${safePets.length})`}
              sx={{
                fontWeight: 600,
                fontSize: '1rem',
                textTransform: 'none',
                color: tabValue === 0 ? '#1e40af' : '#64748b',
                '&.Mui-selected': {
                  color: '#1e40af',
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(30, 64, 175, 0.05) 100%)'
                }
              }}
            />
            <Tab
              icon={<Report />}
              label={`Mis Reportes (${myReports.length})`}
              sx={{
                fontWeight: 600,
                fontSize: '1rem',
                textTransform: 'none',
                color: tabValue === 1 ? '#1e40af' : '#64748b',
                '&.Mui-selected': {
                  color: '#1e40af',
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(30, 64, 175, 0.05) 100%)'
                }
              }}
            />
          </Tabs>
          
          {/* Action Button */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            {tabValue === 0 ? (
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => navigate('/register')}
                sx={{ 
                  background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                  color: 'white',
                  px: 4,
                  py: 1.5,
                  fontWeight: 600,
                  boxShadow: '0 4px 15px rgba(22, 163, 74, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #15803d 0%, #166534 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 20px rgba(22, 163, 74, 0.4)',
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Registrar Nueva Mascota
              </Button>
            ) : (
              <Button
                variant="contained"
                startIcon={<Report />}
                onClick={() => navigate('/report-stray')}
                sx={{ 
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  color: 'white',
                  px: 4,
                  py: 1.5,
                  fontWeight: 600,
                  boxShadow: '0 4px 15px rgba(245, 158, 11, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 20px rgba(245, 158, 11, 0.4)',
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Reportar Perro Callejero
              </Button>
            )}
          </Box>
        </Box>

        {/* Tab Content */}
        {tabValue === 0 ? (
          // Mascotas Tab
          <Box>
            <Grid container spacing={3}>
          {currentPets.map((pet) => (
            <Grid item xs={12} sm={6} md={4} key={pet.id}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Card 
                  elevation={0} 
                  onClick={() => {
                    setSelectedPetDetails(pet);
                    setPetDetailsOpen(true);
                  }}
                  sx={{ 
                    height: '100%',
                    minHeight: '400px',
                    display: 'flex', 
                    flexDirection: 'column',
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(249, 250, 251, 0.98) 100%)',
                    border: '1px solid rgba(226, 232, 240, 0.6)',
                    borderRadius: 3,
                    boxShadow: '0 4px 15px rgba(0,0,0,0.05), 0 1px 4px rgba(0,0,0,0.03)',
                    overflow: 'hidden',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 20px 40px rgba(59, 130, 246, 0.15), 0 4px 12px rgba(0,0,0,0.08)',
                      borderColor: 'rgba(59, 130, 246, 0.4)',
                    }
                  }}>
                  {/* Imagen con tamaño fijo */}
                  <Box sx={{ 
                    height: '200px', 
                    overflow: 'hidden',
                    position: 'relative',
                    backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  }}>
                    {(pet.photo_frontal_path || pet.photo_path) ? (
                      <CardMedia
                        component="img"
                        height="200"
                        image={getUploadUrl(pet.photo_frontal_path || pet.photo_path)}
                        alt={pet.pet_name}
                        sx={{ 
                          objectFit: 'cover',
                          width: '100%',
                          height: '100%'
                        }}
                        onError={(e) => {
                          // Si la imagen no carga, mostrar el placeholder
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = `
                            <div style="display: flex; align-items: center; justify-content: center; height: 100%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                              <svg style="width: 60px; height: 60px; color: white;" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
                              </svg>
                            </div>
                          `;
                        }}
                      />
                    ) : (
                      <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                      }}>
                        <Pets sx={{ fontSize: 60, color: 'white' }} />
                      </Box>
                    )}
                    {/* Badge en la esquina */}
                    <Chip
                      label={pet.card_printed ? "Impreso" : "Pendiente"}
                      color={pet.card_printed ? "success" : "warning"}
                      size="small"
                      sx={{ 
                        position: 'absolute', 
                        top: 10, 
                        right: 10,
                        fontWeight: 600
                      }}
                    />
                  </Box>
                  
                  {/* Contenido compacto */}
                  <CardContent sx={{ pb: 1 }}>
                    <Typography variant="h6" component="div" sx={{ color: '#1e293b', fontWeight: 700, mb: 1 }} gutterBottom>
                      {pet.pet_name}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                      <Typography variant="caption" sx={{ color: '#64748b', minWidth: '35px' }}>CUI:</Typography>
                      <Typography variant="body2" sx={{ color: '#3b82f6', fontWeight: 600 }}>{pet.cui}</Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      <Box sx={{ flex: '1 1 45%', minWidth: 0 }}>
                        <Typography variant="caption" sx={{ color: '#64748b' }} display="block">Sexo</Typography>
                        <Typography variant="body2" sx={{ color: '#1e293b', fontWeight: 600 }} noWrap>{formatSex(pet.sex)}</Typography>
                      </Box>
                      <Box sx={{ flex: '1 1 45%', minWidth: 0 }}>
                        <Typography variant="caption" sx={{ color: '#64748b' }} display="block">Raza</Typography>
                        <Typography variant="body2" sx={{ color: '#1e293b', fontWeight: 600 }} noWrap>{pet.breed_name || pet.breed || 'N/A'}</Typography>
                      </Box>
                      <Box sx={{ flex: '1 1 45%', minWidth: 0 }}>
                        <Typography variant="caption" sx={{ color: '#64748b' }} display="block">Edad</Typography>
                        <Typography variant="body2" sx={{ color: '#1e293b', fontWeight: 600 }}>{formatAge(pet.age)}</Typography>
                      </Box>
                      <Box sx={{ flex: '1 1 45%', minWidth: 0 }}>
                        <Typography variant="caption" sx={{ color: '#64748b' }} display="block">Color</Typography>
                        <Typography variant="body2" sx={{ color: '#1e293b', fontWeight: 600 }} noWrap>{pet.color_name || pet.color || 'N/A'}</Typography>
                      </Box>
                      <Box sx={{ flex: '1 1 45%', minWidth: 0 }}>
                        <Typography variant="caption" sx={{ color: '#64748b' }} display="block">Vacunas</Typography>
                        <Typography variant="body2" sx={{ color: '#1e293b', fontWeight: 600 }}>
                          {pet.has_vaccination_card ? '✅ Sí' : '❌ No'}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                  
                  {/* Botones de acción */}
                  <CardActions sx={{ 
                    borderTop: '1px solid rgba(0,0,0,0.1)', 
                    pt: 1,
                    mt: 'auto',
                    justifyContent: 'space-between'
                  }}>
                    <Button
                      size="small"
                      startIcon={<QrCode />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewCard(pet);
                      }}
                    >
                      Ver Carnet
                    </Button>
                    <Button
                      size="small"
                      startIcon={<Vaccines />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditPet(pet);
                      }}
                    >
                      Subir Carnets
                    </Button>
                    {pet.card_printed && (
                      <Chip
                        icon={<CheckCircle />}
                        label="Listo"
                        color="success"
                        size="small"
                        sx={{ ml: 'auto' }}
                      />
                    )}
                  </CardActions>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        {/* Pagination */}
        {totalPages > 1 && (
          <Box display="flex" justifyContent="center" sx={{ mt: 4 }}>
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
              size="large"
            />
          </Box>
        )}

            {/* No pets message */}
            {safePets.length === 0 && (
              <Paper sx={{ p: 4, textAlign: 'center', mt: 4 }}>
                <Pets sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h5" gutterBottom>
                  No tienes mascotas registradas
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  Registra tu primera mascota y obtén su carnet digital
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => navigate('/register')}
                  size="large"
                >
                  Registrar Primera Mascota
                </Button>
              </Paper>
            )}
          </Box>
        ) : (
          // Reportes Tab
          <Box>
            {/* Filtros y búsqueda */}
            <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField
                size="small"
                placeholder="Buscar por ubicación..."
                value={reportSearch}
                onChange={(e) => setReportSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: '#64748b' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ minWidth: 250 }}
              />
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Estado</InputLabel>
                <Select
                  value={reportFilter}
                  onChange={(e) => setReportFilter(e.target.value)}
                  label="Estado"
                >
                  <MenuItem value="all">Todos</MenuItem>
                  <MenuItem value="n">Nuevo</MenuItem>
                  <MenuItem value="a">Asignado</MenuItem>
                  <MenuItem value="p">En Progreso</MenuItem>
                  <MenuItem value="d">Completado</MenuItem>
                  <MenuItem value="r">En Revisión</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Lista de reportes */}
            {reportsLoading ? (
              <Box display="flex" justifyContent="center" py={4}>
                <CircularProgress />
              </Box>
            ) : myReports.length === 0 ? (
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <Report sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h5" gutterBottom>
                  No tienes reportes de perros callejeros
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  Ayuda a tu comunidad reportando perros que necesiten atención
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Report />}
                  onClick={() => navigate('/report-stray')}
                  size="large"
                >
                  Hacer Primer Reporte
                </Button>
              </Paper>
            ) : (
              <Grid container spacing={3}>
                {myReports
                  .filter(report => 
                    reportFilter === 'all' || report.status === reportFilter
                  )
                  .filter(report =>
                    reportSearch === '' || 
                    report.address?.toLowerCase().includes(reportSearch.toLowerCase())
                  )
                  .map((report) => {
                    const statusConfig = {
                      'n': { label: 'Nuevo', color: '#ef4444', bg: '#fef2f2' },
                      'a': { label: 'Asignado', color: '#3b82f6', bg: '#eff6ff' },
                      'p': { label: 'En Progreso', color: '#8b5cf6', bg: '#f5f3ff' },
                      'd': { label: 'Completado', color: '#10b981', bg: '#f0fdf4' },
                      'r': { label: 'En Revisión', color: '#f59e0b', bg: '#fffbeb' }
                    };
                    
                    const currentStatus = statusConfig[report.status] || statusConfig.n;
                    
                    return (
                      <Grid item xs={12} md={6} key={report.id}>
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <Card
                            elevation={0}
                            sx={{
                              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(249, 250, 251, 0.98) 100%)',
                              border: '1px solid rgba(226, 232, 240, 0.6)',
                              borderRadius: 3,
                              boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                                borderColor: currentStatus.color,
                              }
                            }}
                          >
                            <CardContent>
                              <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                                <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b' }}>
                                  Reporte #{report.id}
                                </Typography>
                                <Chip
                                  label={currentStatus.label}
                                  sx={{
                                    backgroundColor: currentStatus.bg,
                                    color: currentStatus.color,
                                    fontWeight: 600,
                                    fontSize: '0.75rem'
                                  }}
                                />
                              </Box>
                              
                              <Box display="flex" alignItems="center" mb={1}>
                                <LocationOn sx={{ fontSize: 16, color: '#64748b', mr: 1 }} />
                                <Typography variant="body2" color="text.secondary">
                                  {report.address || 'Sin ubicación'}
                                </Typography>
                              </Box>
                              
                              <Box display="flex" alignItems="center" mb={2}>
                                <AccessTime sx={{ fontSize: 16, color: '#64748b', mr: 1 }} />
                                <Typography variant="body2" color="text.secondary">
                                  {new Date(report.created_at).toLocaleDateString('es-ES', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </Typography>
                              </Box>
                              
                              {report.assigned_to && (
                                <Box display="flex" alignItems="center" mb={2}>
                                  <Person sx={{ fontSize: 16, color: '#64748b', mr: 1 }} />
                                  <Typography variant="body2" color="text.secondary">
                                    Asignado a personal de seguimiento
                                  </Typography>
                                </Box>
                              )}
                              
                              {report.breed && (
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                  <strong>Raza:</strong> {report.breed}
                                </Typography>
                              )}
                              
                              {report.description && (
                                <Typography 
                                  variant="body2" 
                                  color="text.secondary"
                                  sx={{ 
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden'
                                  }}
                                >
                                  {report.description}
                                </Typography>
                              )}
                            </CardContent>
                          </Card>
                        </motion.div>
                      </Grid>
                    );
                  })}
              </Grid>
            )}
          </Box>
        )}

        {/* Edit Pet Dialog */}
        <Dialog 
          open={openEditPetDialog} 
          onClose={() => setOpenEditPetDialog(false)} 
          maxWidth="md" 
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              backgroundImage: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(249, 250, 251, 0.98) 100%)'
            }
          }}
        >
          <DialogTitle sx={{ pb: 1 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box display="flex" alignItems="center" gap={1}>
                <Vaccines sx={{ color: '#3b82f6', fontSize: 28 }} />
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e293b' }}>
                  Subir Carnets de Vacunación
                </Typography>
              </Box>
              <IconButton onClick={() => setOpenEditPetDialog(false)}>
                <Close />
              </IconButton>
            </Box>
          </DialogTitle>
          <Divider />
          <DialogContent sx={{ pt: 3 }}>
            <Grid container spacing={3}>
              {/* Información de la Mascota (Solo lectura) */}
              <Grid item xs={12}>
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2" fontWeight="600">
                    {editingPet.pet_name} - CUI: {editingPet.cui}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Solo puedes actualizar los carnets de vacunación de tu mascota
                  </Typography>
                </Alert>
              </Grid>
              {/* Sección: Información de Salud */}
              <Grid item xs={12}>
                <Box display="flex" alignItems="center" gap={1} mb={1} mt={2}>
                  <HealthAndSafety sx={{ color: '#3b82f6' }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b' }}>
                    Información de Salud
                  </Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
              </Grid>

              {/* Carnet de Vacunación - Mitad izquierda */}
              <Grid item xs={12} sm={6}>
                <Paper elevation={2} sx={{ p: 2.5, borderRadius: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0', height: '100%' }}>
                  <Box display="flex" flexDirection="column" gap={1.5}>
                    <Box display="flex" alignItems="center" gap={1.5}>
                      <Box 
                        sx={{ 
                          width: 36, 
                          height: 36, 
                          borderRadius: '50%', 
                          bgcolor: '#dbeafe', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        <Vaccines sx={{ color: '#3b82f6', fontSize: 20 }} />
                      </Box>
                      <Box flex={1}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1e293b', lineHeight: 1.2 }}>
                          Carnet de Vacunación
                        </Typography>
                      </Box>
                    </Box>
                    
                    <FormControl component="fieldset" fullWidth>
                      <RadioGroup
                        row
                        value={editingPet.hasVaccinationCard || 'no'}
                        onChange={(e) => setEditingPet({...editingPet, hasVaccinationCard: e.target.value})}
                        sx={{ justifyContent: 'center' }}
                      >
                        <FormControlLabel 
                          value="si" 
                          control={<Radio size="small" />} 
                          label="Sí" 
                          sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.875rem', fontWeight: 600 } }}
                        />
                        <FormControlLabel 
                          value="no" 
                          control={<Radio size="small" />} 
                          label="No"
                          sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.875rem', fontWeight: 600 } }}
                        />
                      </RadioGroup>
                    </FormControl>
                  </Box>
                  
                  {/* Campo de subida si tiene carnet */}
                  {editingPet.hasVaccinationCard === 'si' && (
                    <Box sx={{ mt: 2, pt: 2, borderTop: '1px dashed #cbd5e1' }}>
                      <Button
                        variant="outlined"
                        component="label"
                        startIcon={<CloudUpload />}
                        fullWidth
                        size="small"
                        sx={{ 
                          borderColor: '#3b82f6',
                          color: '#3b82f6',
                          fontSize: '0.75rem',
                          '&:hover': {
                            borderColor: '#1e40af',
                            bgcolor: '#eff6ff'
                          }
                        }}
                      >
                        {editingPet.vaccinationCardFile ? 'Cambiar' : 'Subir Carnet'}
                        <input
                          type="file"
                          hidden
                          accept="image/*,application/pdf"
                          onChange={(e) => setEditingPet({...editingPet, vaccinationCardFile: e.target.files[0]})}
                        />
                      </Button>
                      {editingPet.vaccinationCardFile && (
                        <Box display="flex" alignItems="center" gap={0.5} mt={1} p={1} bgcolor="#ecfdf5" borderRadius={1}>
                          <CheckCircle sx={{ color: '#059669', fontSize: 16 }} />
                          <Typography variant="caption" sx={{ color: '#059669', fontWeight: 600 }}>
                            {editingPet.vaccinationCardFile.name}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  )}
                </Paper>
              </Grid>

              {/* Vacuna Antirrábica - Mitad derecha */}
              <Grid item xs={12} sm={6}>
                <Paper elevation={2} sx={{ p: 2.5, borderRadius: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0', height: '100%' }}>
                  <Box display="flex" flexDirection="column" gap={1.5}>
                    <Box display="flex" alignItems="center" gap={1.5}>
                      <Box 
                        sx={{ 
                          width: 36, 
                          height: 36, 
                          borderRadius: '50%', 
                          bgcolor: '#fef3c7', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        <MedicalServices sx={{ color: '#f59e0b', fontSize: 20 }} />
                      </Box>
                      <Box flex={1}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1e293b', lineHeight: 1.2 }}>
                          Vacuna Antirrábica
                        </Typography>
                      </Box>
                    </Box>
                    
                    <FormControl component="fieldset" fullWidth>
                      <RadioGroup
                        row
                        value={editingPet.hasRabiesVaccine || 'no'}
                        onChange={(e) => setEditingPet({...editingPet, hasRabiesVaccine: e.target.value})}
                        sx={{ justifyContent: 'center' }}
                      >
                        <FormControlLabel 
                          value="si" 
                          control={<Radio size="small" />} 
                          label="Sí"
                          sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.875rem', fontWeight: 600 } }}
                        />
                        <FormControlLabel 
                          value="no" 
                          control={<Radio size="small" />} 
                          label="No"
                          sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.875rem', fontWeight: 600 } }}
                        />
                      </RadioGroup>
                    </FormControl>
                  </Box>
                  
                  {/* Campo de subida si tiene vacuna */}
                  {editingPet.hasRabiesVaccine === 'si' && (
                    <Box sx={{ mt: 2, pt: 2, borderTop: '1px dashed #cbd5e1' }}>
                      <Button
                        variant="outlined"
                        component="label"
                        startIcon={<CloudUpload />}
                        fullWidth
                        size="small"
                        sx={{ 
                          borderColor: '#f59e0b',
                          color: '#f59e0b',
                          fontSize: '0.75rem',
                          '&:hover': {
                            borderColor: '#d97706',
                            bgcolor: '#fffbeb'
                          }
                        }}
                      >
                        {editingPet.rabiesVaccineCardFile ? 'Cambiar' : 'Subir Carnet'}
                        <input
                          type="file"
                          hidden
                          accept="image/*,application/pdf"
                          onChange={(e) => setEditingPet({...editingPet, rabiesVaccineCardFile: e.target.files[0]})}
                        />
                      </Button>
                      {editingPet.rabiesVaccineCardFile && (
                        <Box display="flex" alignItems="center" gap={0.5} mt={1} p={1} bgcolor="#ecfdf5" borderRadius={1}>
                          <CheckCircle sx={{ color: '#059669', fontSize: 16 }} />
                          <Typography variant="caption" sx={{ color: '#059669', fontWeight: 600 }}>
                            {editingPet.rabiesVaccineCardFile.name}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  )}
                </Paper>
              </Grid>
            </Grid>
          </DialogContent>
          <Divider />
          <DialogActions sx={{ p: 2.5 }}>
            <Button 
              onClick={() => setOpenEditPetDialog(false)}
              sx={{ px: 3 }}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleUpdatePet} 
              variant="contained"
              startIcon={<Save />}
              sx={{ 
                px: 3,
                background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
                boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)',
                  boxShadow: '0 6px 20px rgba(59, 130, 246, 0.4)',
                }
              }}
            >
              Guardar Carnets
            </Button>
          </DialogActions>
        </Dialog>

        {/* Pet Details Modal */}
        <Dialog 
          open={petDetailsOpen} 
          onClose={() => setPetDetailsOpen(false)} 
          maxWidth="lg" 
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              backgroundImage: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(249, 250, 251, 0.98) 100%)',
              maxHeight: '90vh',
              width: '95vw',
              maxWidth: '900px'
            }
          }}
        >
          <DialogTitle>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box display="flex" alignItems="center" gap={2}>
                <Pets sx={{ color: '#3b82f6', fontSize: 32 }} />
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e293b' }}>
                    {selectedPetDetails?.pet_name}
                  </Typography>
                  <Typography variant="subtitle2" sx={{ color: '#64748b' }}>
                    CUI: {selectedPetDetails?.cui}
                  </Typography>
                </Box>
              </Box>
              <IconButton onClick={() => setPetDetailsOpen(false)}>
                <Close />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent dividers>
            {selectedPetDetails && (
              <Grid container spacing={3}>
                {/* Imagen de la mascota */}
                <Grid item xs={12} md={6}>
                  <Paper elevation={2} sx={{ p: 2, borderRadius: 3, textAlign: 'center' }}>
                    {(selectedPetDetails.photo_frontal_path || selectedPetDetails.photo_path) ? (
                      <Box
                        component="img"
                        src={getUploadUrl(selectedPetDetails.photo_frontal_path || selectedPetDetails.photo_path)}
                        alt={selectedPetDetails.pet_name}
                        sx={{
                          width: '100%',
                          maxHeight: 400,
                          objectFit: 'cover',
                          borderRadius: 2
                        }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = `
                            <div style="display: flex; align-items: center; justify-content: center; height: 200px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px;">
                              <svg style="width: 60px; height: 60px; color: white;" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M4.5 12.75l7.5-7.5 7.5 7.5M6 10.5l6-6 6 6v9.75a.75.75 0 01-.75.75H6.75a.75.75 0 01-.75-.75V10.5z"/>
                              </svg>
                            </div>
                          `;
                        }}
                      />
                    ) : (
                      <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: 200,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        borderRadius: 2
                      }}>
                        <Pets sx={{ fontSize: 60, color: 'white' }} />
                      </Box>
                    )}
                  </Paper>
                </Grid>
                
                {/* Información detallada */}
                <Grid item xs={12} md={6}>
                  <Stack spacing={2}>
                    <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
                      <Typography variant="h6" gutterBottom sx={{ color: '#1e293b', fontWeight: 600 }}>
                        Información General
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant="caption" sx={{ color: '#64748b' }}>Sexo</Typography>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>{formatSex(selectedPetDetails.sex)}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" sx={{ color: '#64748b' }}>Edad</Typography>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>{formatAge(selectedPetDetails.age)}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" sx={{ color: '#64748b' }}>Raza</Typography>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>{selectedPetDetails.breed_name || selectedPetDetails.breed || 'N/A'}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" sx={{ color: '#64748b' }}>Color</Typography>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>{selectedPetDetails.color_name || selectedPetDetails.color || 'N/A'}</Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="caption" sx={{ color: '#64748b' }}>Antecedentes Médicos</Typography>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {(() => {
                              if (selectedPetDetails.medical_history_id) {
                                const history = medicalHistories.find(h => h.id === selectedPetDetails.medical_history_id);
                                if (history) {
                                  if (history.code === 'other' && selectedPetDetails.medical_history_details) {
                                    return `${history.name}: ${selectedPetDetails.medical_history_details}`;
                                  }
                                  return history.name;
                                }
                              }
                              return 'Ninguno';
                            })()}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Paper>
                    
                    <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
                      <Typography variant="h6" gutterBottom sx={{ color: '#1e293b', fontWeight: 600 }}>
                        Estado de Salud
                      </Typography>
                      <Stack spacing={1}>
                        <Box display="flex" justifyContent="space-between">
                          <Typography>Carnet de Vacunación:</Typography>
                          <Chip 
                            label={selectedPetDetails.has_vaccination_card ? 'Sí tiene' : 'No tiene'} 
                            color={selectedPetDetails.has_vaccination_card ? 'success' : 'default'}
                            size="small"
                          />
                        </Box>
                        <Box display="flex" justifyContent="space-between">
                          <Typography>Vacuna Antirrábica:</Typography>
                          <Chip 
                            label={selectedPetDetails.has_rabies_vaccine ? 'Sí tiene' : 'No tiene'} 
                            color={selectedPetDetails.has_rabies_vaccine ? 'success' : 'default'}
                            size="small"
                          />
                        </Box>
                        <Box display="flex" justifyContent="space-between">
                          <Typography>Estado del Carnet:</Typography>
                          <Chip 
                            label={selectedPetDetails.card_printed ? 'Impreso' : 'Pendiente'} 
                            color={selectedPetDetails.card_printed ? 'success' : 'warning'}
                            size="small"
                          />
                        </Box>
                      </Stack>
                    </Paper>
                    
                    {selectedPetDetails.additional_features && (
                      <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
                        <Typography variant="h6" gutterBottom sx={{ color: '#1e293b', fontWeight: 600 }}>
                          Características Adicionales
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#4b5563' }}>
                          {selectedPetDetails.additional_features}
                        </Typography>
                      </Paper>
                    )}
                  </Stack>
                </Grid>
                
                {/* Fecha de registro */}
                <Grid item xs={12}>
                  <Paper elevation={1} sx={{ p: 2, borderRadius: 2, textAlign: 'center', bgcolor: '#f8fafc' }}>
                    <Typography variant="caption" sx={{ color: '#64748b' }}>
                      Registrado el: {new Date(selectedPetDetails.created_at).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPetDetailsOpen(false)}>Cerrar</Button>
            <Button 
              variant="contained" 
              startIcon={<QrCode />}
              onClick={() => {
                setPetDetailsOpen(false);
                handleViewCard(selectedPetDetails);
              }}
              sx={{ 
                background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
                color: 'white'
              }}
            >
              Ver Carnet
            </Button>
            <Button 
              variant="outlined" 
              startIcon={<Vaccines />}
              onClick={() => {
                setPetDetailsOpen(false);
                handleEditPet(selectedPetDetails);
              }}
            >
              Subir Carnets
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Profile Dialog with Animation */}
        <AnimatePresence>
          {openProfileDialog && (
            <Dialog 
              open={openProfileDialog} 
              onClose={() => setOpenProfileDialog(false)} 
              maxWidth="sm" 
              fullWidth
            >
          <DialogTitle>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6">Editar Perfil</Typography>
              <IconButton onClick={() => setOpenProfileDialog(false)}>
                <Close />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
            <Box sx={{ textAlign: 'center', mb: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  <ProfileAvatar 
                    user={user} 
                    profilePhotoPreview={profilePhotoPreview}
                    size={120}
                    iconSize={60}
                    isEditMode={true}
                  />
                </Box>
              </motion.div>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="profile-photo-upload"
                type="file"
                onChange={handleProfilePhotoChange}
              />
              <label htmlFor="profile-photo-upload">
                <Button
                  variant="contained"
                  component="span"
                  startIcon={<PhotoCamera />}
                  sx={{
                    background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
                    color: 'white',
                    px: 3,
                    py: 1,
                    fontWeight: 600,
                    boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 20px rgba(59, 130, 246, 0.4)',
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Cambiar Foto
                </Button>
              </label>
            </Box>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Nombre"
                  value={profileData.first_name || ''}
                  onChange={(e) => setProfileData({...profileData, first_name: e.target.value})}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Apellido"
                  value={profileData.last_name || ''}
                  onChange={(e) => setProfileData({...profileData, last_name: e.target.value})}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={profileData.email || ''}
                  onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Teléfono"
                  value={profileData.phone || ''}
                  onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Dirección"
                  multiline
                  rows={2}
                  value={profileData.address || ''}
                  onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                />
              </Grid>
            </Grid>
            </motion.div>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenProfileDialog(false)}>Cancelar</Button>
            <Button onClick={handleUpdateProfile} variant="contained">
              Guardar Cambios
            </Button>
          </DialogActions>
        </Dialog>
          )}
        </AnimatePresence>

        {/* Snackbar para notificaciones */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={3000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          message={snackbarMessage}
          sx={{
            '& .MuiSnackbarContent-root': {
              backgroundColor: '#10b981',
              color: 'white',
              fontSize: '1rem',
              fontWeight: 600,
              boxShadow: '0 8px 20px rgba(16, 185, 129, 0.4)'
            }
          }}
        />
      </motion.div>
    </Container>
    </Box>
  );
};

export default UserDashboard;
