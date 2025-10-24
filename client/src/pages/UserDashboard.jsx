import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Typography, Box, Card, CardContent, Grid, Button,
  Avatar, Divider, Paper, Alert, CircularProgress, IconButton,
  CardActions, Dialog, DialogTitle, DialogContent, DialogActions, Chip,
  Pagination, CardMedia, Tooltip, Fab, TextField, Tab, Tabs,
  List, ListItem, ListItemIcon, ListItemText, Badge, Stack,
  InputAdornment, FormControl, InputLabel, Select, MenuItem,
  Autocomplete, Radio, RadioGroup, FormControlLabel, FormLabel
} from '@mui/material';
import {
  Pets, Add, QrCode, Print, CheckCircle, Pending, Edit, Delete,
  LocationOn, Email, Phone, Home, Person, CalendarToday, Vaccines,
  Logout, Visibility, PhotoCamera, Save, Cancel, AccountCircle,
  HealthAndSafety, Cake, Palette, Description, History, Close,
  Badge as BadgeIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

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
    imageUrl = `http://localhost:5000/api/uploads/${user.photo_path}`;
  }

  // Usar directamente el Avatar de Material-UI que maneja mejor las imágenes
  
  return (
    <Avatar
      src={imageUrl || undefined}
      sx={{ 
        width: size, 
        height: size, 
        bgcolor: imageUrl ? 'transparent' : 'primary.main',
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
        border: '2px solid rgba(255, 255, 255, 0.2)'
      }}
    >
      {!imageUrl && <Person sx={{ fontSize: iconSize, color: 'white' }} />}
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
  const [profileData, setProfileData] = useState({});
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState(null);
  
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
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get('http://localhost:5000/api/auth/me', {
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
      const token = localStorage.getItem('authToken');
      const response = await axios.get('http://localhost:5000/api/auth/my-pets', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setPets(response.data.pets);
      }
    } catch (err) {
      console.error('Error fetching pets:', err);
      setError('Error al cargar las mascotas');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userId');
    navigate('/');
  };

  const handleViewCard = (pet) => {
    window.open(`/pet/${pet.cui}`, '_blank');
  };

  const handleEditPet = (pet) => {
    setEditingPet({
      ...pet,
      hasVaccinationCard: pet.has_vaccination_card ? 'si' : 'no',
      hasRabiesVaccine: pet.has_rabies_vaccine ? 'si' : 'no'
    });
    setOpenEditPetDialog(true);
  };

  const handleUpdatePet = async () => {
    try {
      const token = localStorage.getItem('authToken');
      
      const response = await axios.put(
        `http://localhost:5000/api/auth/pet/${editingPet.id}`,
        editingPet,
        {
          headers: { 
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        fetchUserPets();
        setOpenEditPetDialog(false);
        setEditingPet({});
      }
    } catch (err) {
      console.error('Error updating pet:', err);
      setError('Error al actualizar la mascota');
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const formData = new FormData();
      
      // Agregar datos del perfil
      Object.keys(profileData).forEach(key => {
        if (profileData[key]) {
          formData.append(key, profileData[key]);
        }
      });
      
      // Agregar foto si se seleccionó una
      if (profilePhoto) {
        formData.append('profilePhoto', profilePhoto);
      }

      const response = await axios.put(
        'http://localhost:5000/api/auth/profile',
        formData,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.success) {
        console.log('Usuario actualizado:', response.data.user);
        // Actualizar tanto el estado del usuario como los datos del perfil
        setUser(response.data.user);
        setProfileData({
          ...profileData,
          first_name: response.data.user.first_name,
          last_name: response.data.user.last_name
        });
        setOpenProfileDialog(false);
        setProfilePhoto(null);
        setProfilePhotoPreview(null);
        // Recargar datos del usuario para asegurar sincronización
        fetchUserData();
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Error al actualizar el perfil');
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

  // Pagination logic
  const indexOfLastPet = currentPage * petsPerPage;
  const indexOfFirstPet = indexOfLastPet - petsPerPage;
  const currentPets = pets.slice(indexOfFirstPet, indexOfLastPet);
  const totalPages = Math.ceil(pets.length / petsPerPage);

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

    <Container maxWidth="xl" sx={{ py: 4, position: 'relative', zIndex: 1 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <Paper sx={{ 
          p: 3, 
          mb: 3, 
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          borderRadius: 3,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
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
              mb: 3,
              backgroundColor: 'rgba(255,255,255,0.9)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(226, 232, 240, 0.8)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              borderRadius: 2
            }}
          >
            <Typography variant="body1" sx={{ color: '#1e293b' }}>
              📍 Recuerda recoger los carnets físicos de tus mascotas en la <strong>Gerencia Ambiental</strong>
            </Typography>
          </Alert>
        )}

        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
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
                  <Pets sx={{ fontSize: 40, color: '#3b82f6', mr: 2 }} />
                  <Box>
                    <Typography sx={{ color: '#64748b', fontWeight: 500 }} gutterBottom>
                      Mascotas Registradas
                    </Typography>
                    <Typography variant="h4" sx={{ color: '#1e293b', fontWeight: 700 }}>
                      {pets.length}
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
                  <Vaccines sx={{ fontSize: 40, color: '#4CAF50', mr: 2 }} />
                  <Box>
                    <Typography sx={{ color: '#64748b', fontWeight: 500 }} gutterBottom>
                      Con Vacunas
                    </Typography>
                    <Typography variant="h4" sx={{ color: '#1e293b', fontWeight: 700 }}>
                      {pets.filter(p => p.has_vaccination_card).length}
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
                      {pets.filter(p => p.card_printed).length}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Action Buttons */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 700,
                color: '#1e293b',
                background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                display: 'flex',
                alignItems: 'center',
                gap: 2
              }}
            >
              <Pets sx={{ fontSize: 35, color: '#3b82f6' }} />
              Mis Mascotas
            </Typography>
          </Box>
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
        </Box>

        {/* Pets Grid */}
        <Grid container spacing={3}>
          {currentPets.map((pet) => (
            <Grid item xs={12} sm={6} md={4} key={pet.id}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Card sx={{ 
                  height: '100%',
                  minHeight: '380px',
                  display: 'flex', 
                  flexDirection: 'column',
                  background: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: 2,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 8px 20px rgba(37, 99, 235, 0.15)',
                    borderColor: '#3b82f6',
                  }
                }}>
                  {/* Imagen con tamaño fijo */}
                  <Box sx={{ 
                    height: '200px', 
                    overflow: 'hidden',
                    position: 'relative',
                    backgroundColor: '#f5f5f5'
                  }}>
                    {pet.photo_frontal_path ? (
                      <CardMedia
                        component="img"
                        height="200"
                        image={`http://localhost:5000/api/uploads/${pet.photo_frontal_path}`}
                        alt={pet.pet_name}
                        sx={{ 
                          objectFit: 'cover',
                          width: '100%',
                          height: '100%'
                        }}
                      />
                    ) : pet.photo_path ? (
                      <CardMedia
                        component="img"
                        height="200"
                        image={`http://localhost:5000/api/uploads/${pet.photo_path}`}
                        alt={pet.pet_name}
                        sx={{ 
                          objectFit: 'cover',
                          width: '100%',
                          height: '100%'
                        }}
                      />
                    ) : (
                      <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                        backgroundColor: '#e0e0e0'
                      }}>
                        <Pets sx={{ fontSize: 60, color: '#9e9e9e' }} />
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
                      onClick={() => handleViewCard(pet)}
                    >
                      Ver Carnet
                    </Button>
                    <Button
                      size="small"
                      startIcon={<Edit />}
                      onClick={() => handleEditPet(pet)}
                    >
                      Editar
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
        {pets.length === 0 && (
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

        {/* Edit Pet Dialog */}
        <Dialog open={openEditPetDialog} onClose={() => setOpenEditPetDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6">Editar Mascota</Typography>
              <IconButton onClick={() => setOpenEditPetDialog(false)}>
                <Close />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Nombre del Can"
                  value={editingPet.pet_name || ''}
                  onChange={(e) => setEditingPet({...editingPet, pet_name: e.target.value})}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Sexo del Can"
                  value={editingPet.pet_last_name || ''}
                  onChange={(e) => setEditingPet({...editingPet, pet_last_name: e.target.value})}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Autocomplete
                  options={defaultBreeds}
                  value={editingPet.breed || ''}
                  onChange={(event, newValue) => {
                    setEditingPet({...editingPet, breed: newValue || ''});
                  }}
                  renderInput={(params) => (
                    <TextField {...params} label="Raza" fullWidth />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="Edad (años)"
                  type="number"
                  value={editingPet.age || ''}
                  onChange={(e) => setEditingPet({...editingPet, age: e.target.value})}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <Autocomplete
                  options={defaultColors}
                  value={editingPet.color || ''}
                  onChange={(event, newValue) => {
                    setEditingPet({...editingPet, color: newValue || ''});
                  }}
                  renderInput={(params) => (
                    <TextField {...params} label="Color" fullWidth />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Características Adicionales"
                  multiline
                  rows={2}
                  value={editingPet.additional_features || ''}
                  onChange={(e) => setEditingPet({...editingPet, additional_features: e.target.value})}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl component="fieldset">
                  <FormLabel component="legend">¿Tiene Carnet de Vacunación?</FormLabel>
                  <RadioGroup
                    row
                    value={editingPet.hasVaccinationCard || 'no'}
                    onChange={(e) => setEditingPet({...editingPet, hasVaccinationCard: e.target.value})}
                  >
                    <FormControlLabel value="si" control={<Radio />} label="Sí" />
                    <FormControlLabel value="no" control={<Radio />} label="No" />
                  </RadioGroup>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl component="fieldset">
                  <FormLabel component="legend">¿Tiene Vacuna Antirrábica?</FormLabel>
                  <RadioGroup
                    row
                    value={editingPet.hasRabiesVaccine || 'no'}
                    onChange={(e) => setEditingPet({...editingPet, hasRabiesVaccine: e.target.value})}
                  >
                    <FormControlLabel value="si" control={<Radio />} label="Sí" />
                    <FormControlLabel value="no" control={<Radio />} label="No" />
                  </RadioGroup>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Antecedentes Médicos"
                  multiline
                  rows={2}
                  value={editingPet.medical_history || ''}
                  onChange={(e) => setEditingPet({...editingPet, medical_history: e.target.value})}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenEditPetDialog(false)}>Cancelar</Button>
            <Button onClick={handleUpdatePet} variant="contained">
              Guardar Cambios
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
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Box sx={{ mx: 'auto', cursor: 'pointer' }}>
                  <ProfileAvatar 
                    user={user} 
                    profilePhotoPreview={profilePhotoPreview}
                    size={100}
                    iconSize={50}
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
                  variant="outlined"
                  component="span"
                  startIcon={<PhotoCamera />}
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
      </motion.div>
    </Container>
    </Box>
  );
};

export default UserDashboard;
