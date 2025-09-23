import React, { useState, useEffect } from 'react'
import {
  Container, Typography, Card, CardContent, TextField, Button, Grid,
  Box, Avatar, Alert, CircularProgress, MenuItem, Divider,
  InputAdornment, IconButton, Chip
} from '@mui/material'
import { PhotoCamera, Pets, Person, Email, Lock, Visibility, VisibilityOff, CheckCircle } from '@mui/icons-material'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const RegisterPage = () => {
  const navigate = useNavigate()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userData, setUserData] = useState(null)
  const [formData, setFormData] = useState({
    // Pet data
    petName: '',
    petLastName: '',
    species: '',
    breed: '',
    adoptionDate: '',
    photo: null,
    // Adopter data
    adopterName: '',
    adopterLastName: '',
    dni: '',
    email: '',
    password: '',
    phone: '',
    department: '',
    province: '',
    district: '',
    address: ''
  })
  
  const [photoPreview, setPhotoPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const species = ['Perro', 'Gato', 'Otro']
  const departments = ['Lima', 'Arequipa', 'Cusco', 'La Libertad', 'Piura', 'Puno', 'Junín', 'Cajamarca', 'Lambayeque', 'Ancash']

  // Check if user is logged in and load their data
  useEffect(() => {
    const checkLoginStatus = async () => {
      const token = localStorage.getItem('authToken')
      if (token) {
        try {
          const response = await axios.get('/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
          })
          
          if (response.data.success) {
            setIsLoggedIn(true)
            setUserData(response.data.user)
            
            // Pre-fill form with user data
            setFormData(prev => ({
              ...prev,
              adopterName: response.data.user.full_name?.split(' ')[0] || '',
              adopterLastName: response.data.user.full_name?.split(' ').slice(1).join(' ') || '',
              dni: response.data.user.dni || '',
              email: response.data.user.email || '',
              phone: response.data.user.phone || '',
              department: response.data.user.department || '',
              province: response.data.user.province || '',
              district: response.data.user.district || '',
              address: response.data.user.address || ''
            }))
          }
        } catch (error) {
          console.error('Error fetching user data:', error)
        }
      }
    }
    
    checkLoginStatus()
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handlePhotoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFormData(prev => ({ ...prev, photo: file }))
      const reader = new FileReader()
      reader.onload = (e) => setPhotoPreview(e.target.result)
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const formDataToSend = new FormData()
      
      // Pet data - always from form
      formDataToSend.append('petName', formData.petName)
      formDataToSend.append('petLastName', formData.petLastName)
      formDataToSend.append('species', formData.species)
      formDataToSend.append('breed', formData.breed)
      formDataToSend.append('adoptionDate', formData.adoptionDate)
      if (formData.photo) {
        formDataToSend.append('photo', formData.photo)
      }
      
      // Owner data - from userData if logged in, otherwise from form
      if (isLoggedIn && userData) {
        // Use logged in user data
        formDataToSend.append('adopterName', userData.full_name?.split(' ')[0] || '')
        formDataToSend.append('adopterLastName', userData.full_name?.split(' ').slice(1).join(' ') || '')
        formDataToSend.append('dni', userData.dni || '')
        formDataToSend.append('email', userData.email || '')
        formDataToSend.append('phone', userData.phone || '')
        formDataToSend.append('department', userData.department || '')
        formDataToSend.append('province', userData.province || '')
        formDataToSend.append('district', userData.district || '')
        formDataToSend.append('address', userData.address || '')
        // No password needed for logged in users
      } else {
        // Use form data for new users
        formDataToSend.append('adopterName', formData.adopterName)
        formDataToSend.append('adopterLastName', formData.adopterLastName)
        formDataToSend.append('dni', formData.dni)
        formDataToSend.append('email', formData.email)
        formDataToSend.append('password', formData.password)
        formDataToSend.append('phone', formData.phone)
        formDataToSend.append('department', formData.department)
        formDataToSend.append('province', formData.province)
        formDataToSend.append('district', formData.district)
        formDataToSend.append('address', formData.address)
      }

      const headers = {
        'Content-Type': 'multipart/form-data'
      }
      
      // Add auth token if logged in
      if (isLoggedIn) {
        const token = localStorage.getItem('authToken')
        if (token) {
          headers['Authorization'] = `Bearer ${token}`
        }
      }

      const response = await axios.post('/api/register', formDataToSend, { headers })

      setSuccess(true)
      
      // Store CUI and auth token in localStorage
      localStorage.setItem('userCUI', response.data.cui)
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token)
        localStorage.setItem('userEmail', formData.email)
      }
      
      // Reset form
      setFormData({
        petName: '', petLastName: '', species: '', breed: '', adoptionDate: '', photo: null,
        adopterName: '', adopterLastName: '', dni: '', email: '', password: '', phone: '', department: '', province: '', district: '', address: ''
      })
      setPhotoPreview(null)
      
      // Redirect to pet card or dashboard after 2 seconds
      setTimeout(() => {
        if (isLoggedIn) {
          navigate('/user/dashboard')
        } else {
          window.open(`/pet/${response.data.cui}`, '_blank')
        }
      }, 2000)
      
    } catch (err) {
      console.error('Error completo:', err)
      console.error('Error response:', err.response)
      console.error('Error message:', err.message)
      console.error('Error status:', err.response?.status)
      console.error('Error data:', err.response?.data)
      
      let errorMessage = 'Error al registrar la mascota'
      
      if (err.response) {
        // Error de respuesta del servidor
        errorMessage = err.response.data?.error || `Error del servidor: ${err.response.status}`
      } else if (err.request) {
        // Error de red/conexión
        errorMessage = 'Error de conexión. Verifica que el servidor esté ejecutándose.'
      } else {
        // Error de configuración
        errorMessage = err.message || 'Error desconocido'
      }
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Typography 
          variant="h4" 
          textAlign="center" 
          sx={{ 
            color: 'white', 
            mb: 4, 
            fontWeight: 600,
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
          }}
        >
          Registro de Mascota
        </Typography>

        <Card 
          sx={{ 
            background: 'rgba(255,255,255,0.98)',
            backdropFilter: 'blur(15px)',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
          }}
        >
          <CardContent sx={{ p: 4 }}>
            {success && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Alert severity="success" sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                    ¡Mascota registrada exitosamente! 🎉
                  </Typography>
                  {isLoggedIn ? (
                    <>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        • Nueva mascota agregada a tu panel
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        • Redirigiendo al panel de usuario...
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        • Recoge el carnet físico en la Gerencia Ambiental
                      </Typography>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => navigate('/user/dashboard')}
                        sx={{ 
                          backgroundColor: '#4CAF50',
                          '&:hover': { backgroundColor: '#45a049' },
                          mt: 1
                        }}
                      >
                        Ir al Panel de Usuario
                      </Button>
                    </>
                  ) : (
                    <>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        • Se abrirá el carnet digital en una nueva ventana
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        • ✅ <strong>Acceso desbloqueado:</strong> Ahora puedes reportar perros callejeros
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        • Tu cuenta ha sido creada exitosamente
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        • Recoge tu carnet físico en la Gerencia Ambiental
                      </Typography>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => window.open('/report-stray', '_blank')}
                        sx={{ 
                          backgroundColor: '#FF9800',
                          '&:hover': { backgroundColor: '#F57C00' },
                          mt: 1
                        }}
                      >
                        🐕 Reportar Perro Callejero
                      </Button>
                    </>
                  )}
                </Alert>
              </motion.div>
            )}

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              {/* Pet Information */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Pets sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Información de la Mascota
                  </Typography>
                </Box>
              </motion.div>

              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Nombre de la Mascota"
                    name="petName"
                    value={formData.petName}
                    onChange={handleInputChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Apellido de la Mascota"
                    name="petLastName"
                    value={formData.petLastName}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    select
                    label="Especie"
                    name="species"
                    value={formData.species}
                    onChange={handleInputChange}
                    required
                  >
                    {species.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Raza"
                    name="breed"
                    value={formData.breed}
                    onChange={handleInputChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Fecha de Adopción"
                    name="adoptionDate"
                    value={formData.adoptionDate}
                    onChange={handleInputChange}
                    InputLabelProps={{ shrink: true }}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ textAlign: 'center' }}>
                    <input
                      accept="image/*"
                      style={{ display: 'none' }}
                      id="photo-upload"
                      type="file"
                      onChange={handlePhotoChange}
                    />
                    <label htmlFor="photo-upload">
                      <Button
                        variant="outlined"
                        component="span"
                        startIcon={<PhotoCamera />}
                        sx={{ mb: 2 }}
                      >
                        Subir Foto de la Mascota
                      </Button>
                    </label>
                    {photoPreview && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                      >
                        <Avatar
                          src={photoPreview}
                          sx={{ width: 120, height: 120, mx: 'auto', mt: 2 }}
                        />
                      </motion.div>
                    )}
                  </Box>
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              {/* Propietario Information */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Person sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Información del Propietario
                  </Typography>
                  {isLoggedIn && (
                    <Chip
                      label="Datos pre-cargados"
                      color="success"
                      size="small"
                      icon={<CheckCircle />}
                      sx={{ ml: 2 }}
                    />
                  )}
                </Box>
              </motion.div>

              {isLoggedIn && userData ? (
                // Show read-only user info when logged in
                <Card sx={{ mb: 4, backgroundColor: 'rgba(76, 175, 80, 0.05)' }}>
                  <CardContent>
                    <Typography variant="body2" color="success.main" sx={{ mb: 2 }}>
                      ✓ Usando tus datos registrados
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" color="text.secondary">Nombre completo</Typography>
                        <Typography variant="body1" fontWeight="500">{userData.full_name}</Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" color="text.secondary">DNI</Typography>
                        <Typography variant="body1" fontWeight="500">{userData.dni}</Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" color="text.secondary">Email</Typography>
                        <Typography variant="body1" fontWeight="500">{userData.email}</Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" color="text.secondary">Celular</Typography>
                        <Typography variant="body1" fontWeight="500">{userData.phone}</Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary">Dirección</Typography>
                        <Typography variant="body1" fontWeight="500">
                          {userData.address}, {userData.district}, {userData.province}, {userData.department}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              ) : (
                // Show form fields when not logged in
                <Grid container spacing={3} sx={{ mb: 4 }}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Nombre del Propietario"
                      name="adopterName"
                      value={formData.adopterName}
                      onChange={handleInputChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Apellido del Propietario"
                      name="adopterLastName"
                      value={formData.adopterLastName}
                      onChange={handleInputChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="DNI"
                      name="dni"
                      value={formData.dni}
                      onChange={handleInputChange}
                      required
                      inputProps={{ maxLength: 8, pattern: '[0-9]*' }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Celular"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email sx={{ color: 'action.active' }} />
                        </InputAdornment>
                      ),
                    }}
                    helperText="Este email será usado para iniciar sesión"
                  />
                  </Grid>
                  {!isLoggedIn && (
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Contraseña"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Lock sx={{ color: 'action.active' }} />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => setShowPassword(!showPassword)}
                                edge="end"
                              >
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                        helperText="Mínimo 6 caracteres"
                      />
                    </Grid>
                  )}
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      select
                      label="Departamento"
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      required
                    >
                      {departments.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Provincia"
                      name="province"
                      value={formData.province}
                      onChange={handleInputChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                    label="Distrito"
                    name="district"
                    value={formData.district}
                    onChange={handleInputChange}
                    required
                  />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                    label="Dirección"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    multiline
                    rows={2}
                    required
                  />
                  </Grid>
                </Grid>
              )}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <Box textAlign="center">
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={loading}
                    sx={{
                      background: 'linear-gradient(45deg, #2196f3 30%, #64b5f6 90%)',
                      px: 4,
                      py: 1.5,
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      '&:hover': {
                        background: 'linear-gradient(45deg, #1976d2 30%, #2196f3 90%)',
                        transform: 'translateY(-2px)',
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Registrar Mascota'}
                  </Button>
                </Box>
              </motion.div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </Container>
  )
}

export default RegisterPage
