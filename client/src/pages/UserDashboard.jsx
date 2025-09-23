import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Typography, Box, Card, CardContent, Grid, Button,
  Avatar, Divider, Paper, Alert, CircularProgress, IconButton,
  CardActions, Dialog, DialogTitle, DialogContent, DialogActions, Chip
} from '@mui/material';
import {
  Pets, Add, QrCode, Print, CheckCircle, Pending,
  LocationOn, Email, Phone, Home, Person, CalendarToday,
  Logout, Edit, Visibility
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import axios from 'axios';

const UserDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPet, setSelectedPet] = useState(null);
  const [openCardDialog, setOpenCardDialog] = useState(false);
  const [showAlert, setShowAlert] = useState(true);

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

      const response = await axios.get('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setUser(response.data.user);
      }
    } catch (err) {
      console.error('Error fetching user:', err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.clear();
        navigate('/login');
      }
    }
  };

  const fetchUserPets = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get('/api/auth/my-pets', {
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
    localStorage.clear();
    navigate('/');
  };

  const handleViewCard = (pet) => {
    setSelectedPet(pet);
    setOpenCardDialog(true);
  };

  const handleRegisterNewPet = () => {
    navigate('/register');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Alert Message */}
        {showAlert && (
          <Alert 
            severity="info" 
            sx={{ mb: 3 }}
            onClose={() => setShowAlert(false)}
          >
            <Typography variant="body1" fontWeight="bold">
              ¡Bienvenido a tu panel de usuario!
            </Typography>
            <Typography variant="body2">
              Recuerda recoger tu carnet físico en la Gerencia Ambiental con tu DNI.
            </Typography>
          </Alert>
        )}

        {/* User Header */}
        <Paper 
          sx={{ 
            p: 3, 
            mb: 4, 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white'
          }}
        >
          <Grid container alignItems="center" spacing={2}>
            <Grid item xs={12} md={8}>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ width: 60, height: 60, bgcolor: 'white', color: '#667eea' }}>
                  <Person fontSize="large" />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {user?.full_name}
                  </Typography>
                  <Box display="flex" gap={3} mt={1}>
                    <Chip 
                      icon={<Email />} 
                      label={user?.email} 
                      size="small" 
                      sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                    />
                    <Chip 
                      icon={<Phone />} 
                      label={user?.phone} 
                      size="small"
                      sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                    />
                  </Box>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={4} textAlign="right">
              <Button
                variant="contained"
                color="error"
                startIcon={<Logout />}
                onClick={handleLogout}
                sx={{ mr: 2 }}
              >
                Cerrar Sesión
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Action Buttons */}
        <Box sx={{ mb: 4 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Button
                fullWidth
                variant="contained"
                size="large"
                startIcon={<Add />}
                onClick={handleRegisterNewPet}
                sx={{
                  py: 2,
                  background: 'linear-gradient(45deg, #2196f3 30%, #64b5f6 90%)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #1976d2 30%, #2196f3 90%)',
                  }
                }}
              >
                Registrar Nueva Mascota
              </Button>
            </Grid>
            <Grid item xs={12} md={6}>
              <Button
                fullWidth
                variant="contained"
                size="large"
                startIcon={<LocationOn />}
                onClick={() => navigate('/report-stray')}
                sx={{
                  py: 2,
                  background: 'linear-gradient(45deg, #FF6B6B 30%, #FFB6C1 90%)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #FF5252 30%, #FF6B6B 90%)',
                  }
                }}
              >
                Reportar Perro Callejero
              </Button>
            </Grid>
          </Grid>
        </Box>

        {/* Pets Section */}
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: 'white' }}>
          Mis Mascotas Registradas
        </Typography>

        {pets.length === 0 ? (
          <Card sx={{ p: 4, textAlign: 'center', bgcolor: 'rgba(255,255,255,0.95)' }}>
            <Pets sx={{ fontSize: 80, color: '#ccc', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No tienes mascotas registradas aún
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleRegisterNewPet}
              sx={{ mt: 3 }}
            >
              Registrar Primera Mascota
            </Button>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {pets.map((pet) => (
              <Grid item xs={12} md={6} lg={4} key={pet.cui}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card sx={{ 
                    height: '100%',
                    background: 'rgba(255,255,255,0.98)',
                    '&:hover': {
                      boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                      transform: 'translateY(-4px)',
                    },
                    transition: 'all 0.3s ease'
                  }}>
                    {pet.photo_path && (
                      <CardContent>
                        <img 
                          src={`/api/uploads/${pet.photo_path}`}
                          alt={pet.pet_name}
                          style={{ maxWidth: '100%', height: '200px', objectFit: 'cover' }}
                        />
                      </CardContent>
                    )}
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="h6" fontWeight="bold">
                          {pet.pet_name} {pet.pet_last_name}
                        </Typography>
                        <Chip 
                          label={`CUI: ${pet.cui}`}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </Box>
                      
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Especie:</strong> {pet.species}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Raza:</strong> {pet.breed}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Fecha de Registro:</strong> {new Date(pet.adoption_date).toLocaleDateString()}
                        </Typography>
                      </Box>

                      {pet.card_printed ? (
                        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CheckCircle sx={{ color: 'green', fontSize: 20 }} />
                          <Typography variant="body2" sx={{ color: 'green' }}>
                            Carnet impreso - Recoger en Gerencia Ambiental
                          </Typography>
                        </Box>
                      ) : (
                        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Pending sx={{ color: 'orange', fontSize: 20 }} />
                          <Typography variant="body2" sx={{ color: 'orange' }}>
                            Carnet pendiente de impresión
                          </Typography>
                        </Box>
                      )}
                    </CardContent>
                    <CardActions sx={{ p: 2, pt: 0 }}>
                      <Button
                        size="small"
                        startIcon={<Visibility />}
                        onClick={() => navigate(`/pet/${pet.cui}`)}
                      >
                        Ver Carnet
                      </Button>
                      {pet.card_printed && (
                        <Chip
                          label="✅ Carnet Impreso"
                          color="success"
                          size="small"
                          sx={{ ml: 1 }}
                        />
                      )}
                    </CardActions>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Pet Card Dialog */}
        <Dialog 
          open={openCardDialog} 
          onClose={() => setOpenCardDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            Carnet Digital - {selectedPet?.pet_name}
          </DialogTitle>
          <DialogContent>
            {selectedPet && (
              <Box sx={{ p: 2 }}>
                <Alert severity="info" sx={{ mb: 2 }}>
                  Este es tu carnet digital. El carnet físico debe ser recogido en la Gerencia Ambiental.
                </Alert>
                <Box textAlign="center">
                  <img 
                    src={`/api/uploads/${selectedPet.qr_code_path}`}
                    alt="QR Code"
                    style={{ maxWidth: '200px' }}
                  />
                  <Typography variant="h6" sx={{ mt: 2 }}>
                    CUI: {selectedPet.cui}
                  </Typography>
                  <Typography>
                    {selectedPet.pet_name} {selectedPet.pet_last_name}
                  </Typography>
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => window.open(`/pet/${selectedPet?.cui}`, '_blank')}
              startIcon={<Visibility />}
            >
              Ver Carnet Completo
            </Button>
            <Button onClick={() => setOpenCardDialog(false)}>
              Cerrar
            </Button>
          </DialogActions>
        </Dialog>
      </motion.div>
    </Container>
  );
};

export default UserDashboard;
