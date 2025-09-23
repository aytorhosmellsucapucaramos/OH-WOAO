import React, { useState, useEffect } from 'react'
import {
  Container, Typography, Box, Grid, Card, CardContent, TextField,
  Button, FormControl, InputLabel, Select, MenuItem, Chip, Avatar,
  Alert, CircularProgress, Stepper, Step, StepLabel, Paper,
  FormControlLabel, RadioGroup, Radio, Slider, Fab
} from '@mui/material'
import {
  PhotoCamera, LocationOn, Pets, ColorLens, Psychology,
  Save, MyLocation, PersonAdd, Search
} from '@mui/icons-material'
import { motion } from 'framer-motion'
import axios from 'axios'

const ReportStrayPage = () => {
  const [activeStep, setActiveStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [isUserRegistered, setIsUserRegistered] = useState(false)
  const [userCUI, setUserCUI] = useState('')
  const [checkingUser, setCheckingUser] = useState(true)
  const [location, setLocation] = useState({ lat: null, lng: null, address: '' })
  const [photo, setPhoto] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [cuiInput, setCuiInput] = useState('')
  const [verifyingCUI, setVerifyingCUI] = useState(false)
  const [cuiError, setCuiError] = useState('')
  
  const [formData, setFormData] = useState({
    // Información básica
    reporterName: '',
    reporterPhone: '',
    reporterEmail: '',
    
    // Ubicación
    latitude: '',
    longitude: '',
    address: '',
    zone: '',
    
    // Información del perro
    breed: '',
    size: 'medium',
    colors: [],
    temperament: 'friendly',
    condition: 'stray',
    gender: '',
    estimatedAge: '',
    healthStatus: 'good',
    
    // Detalles adicionales
    description: '',
    urgency: 'normal',
    hasCollar: false,
    isInjured: false,
    needsRescue: false
  })

  const steps = ['Información Personal', 'Ubicación', 'Datos del Perro', 'Foto y Detalles']

  const breeds = [
    'Mestizo', 'Labrador', 'Golden Retriever', 'Pastor Alemán', 'Bulldog',
    'Chihuahua', 'Poodle', 'Rottweiler', 'Beagle', 'Husky Siberiano',
    'Boxer', 'Cocker Spaniel', 'Dálmata', 'Pitbull', 'Schnauzer',
    'Border Collie', 'Shih Tzu', 'Yorkshire Terrier', 'Otro'
  ]

  const colors = [
    { value: 'negro', label: 'Negro', color: '#000000' },
    { value: 'blanco', label: 'Blanco', color: '#FFFFFF' },
    { value: 'marron', label: 'Marrón', color: '#8B4513' },
    { value: 'dorado', label: 'Dorado', color: '#FFD700' },
    { value: 'gris', label: 'Gris', color: '#808080' },
    { value: 'manchado', label: 'Manchado', color: 'linear-gradient(45deg, #000 25%, #FFF 25%)' },
    { value: 'tricolor', label: 'Tricolor', color: 'linear-gradient(120deg, #000 33%, #8B4513 33%, #FFF 66%)' }
  ]

  const temperaments = [
    { value: 'friendly', label: 'Amigable', color: '#4CAF50' },
    { value: 'shy', label: 'Tímido', color: '#FF9800' },
    { value: 'aggressive', label: 'Agresivo', color: '#F44336' },
    { value: 'scared', label: 'Asustado', color: '#9C27B0' },
    { value: 'playful', label: 'Juguetón', color: '#2196F3' },
    { value: 'calm', label: 'Tranquilo', color: '#009688' }
  ]

  const urgencyLevels = [
    { value: 'low', label: 'Baja', color: '#4CAF50' },
    { value: 'normal', label: 'Normal', color: '#FF9800' },
    { value: 'high', label: 'Alta', color: '#F44336' },
    { value: 'emergency', label: 'Emergencia', color: '#9C27B0' }
  ]

  // Obtener ubicación actual
  const getCurrentLocation = () => {
    setLoading(true)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude
          const lng = position.coords.longitude
          
          setLocation({ lat, lng, address: 'Obteniendo dirección...' })
          setFormData(prev => ({
            ...prev,
            latitude: lat.toString(),
            longitude: lng.toString()
          }))

          // Obtener dirección usando geocoding reverso
          try {
            const response = await fetch(
              `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=YOUR_API_KEY`
            )
            const data = await response.json()
            if (data.results && data.results[0]) {
              const address = data.results[0].formatted
              setLocation(prev => ({ ...prev, address }))
              setFormData(prev => ({ ...prev, address }))
            }
          } catch (error) {
            console.error('Error obteniendo dirección:', error)
            setLocation(prev => ({ ...prev, address: 'Dirección no disponible' }))
          }
          
          setLoading(false)
        },
        (error) => {
          console.error('Error obteniendo ubicación:', error)
          setLoading(false)
          alert('No se pudo obtener la ubicación. Por favor, ingresa las coordenadas manualmente.')
        }
      )
    }
  }

  const handlePhotoChange = (event) => {
    const file = event.target.files[0]
    if (file) {
      setPhoto(file)
      const reader = new FileReader()
      reader.onload = (e) => setPhotoPreview(e.target.result)
      reader.readAsDataURL(file)
    }
  }

  useEffect(() => {
    checkUserRegistration()
  }, [])

  const checkUserRegistration = async () => {
    setCheckingUser(true)
    try {
      // Verificar si el usuario tiene un CUI registrado
      const storedCUI = localStorage.getItem('userCUI')
      if (storedCUI) {
        // Verificar que el CUI existe en la base de datos
        const response = await axios.get(`http://localhost:5000/api/pet/${storedCUI}`)
        if (response.data.success) {
          setIsUserRegistered(true)
          setUserCUI(storedCUI)
        }
      }
    } catch (error) {
      console.log('Usuario no registrado o CUI inválido')
      setIsUserRegistered(false)
    }
    setCheckingUser(false)
  }

  const verifyCUIManually = async () => {
    if (!cuiInput.trim()) {
      setCuiError('Por favor ingresa un CUI válido')
      return
    }

    setVerifyingCUI(true)
    setCuiError('')
    
    try {
      const response = await axios.get(`http://localhost:5000/api/pet/${cuiInput.trim()}`)
      if (response.data.success) {
        // CUI válido, almacenar y dar acceso
        localStorage.setItem('userCUI', cuiInput.trim())
        setUserCUI(cuiInput.trim())
        setIsUserRegistered(true)
        setCuiInput('')
      } else {
        setCuiError('CUI no encontrado en el sistema')
      }
    } catch (error) {
      setCuiError('CUI no válido o no existe en el sistema')
    }
    
    setVerifyingCUI(false)
  }

  const handleSubmit = async () => {
    setLoading(true)
    
    const reportData = new FormData()
    
    // Add CUI to the report data
    reportData.append('reporterCui', userCUI)
    
    Object.keys(formData).forEach(key => {
      if (key === 'colors') {
        reportData.append(key, JSON.stringify(formData[key]))
      } else {
        reportData.append(key, formData[key])
      }
    })
    
    if (photo) {
      reportData.append('photo', photo)
    }

    try {
      const response = await axios.post('http://localhost:5000/api/stray-reports', reportData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      
      alert('¡Reporte enviado exitosamente! Gracias por ayudar a los perros callejeros.')
      // Reset form
      setFormData({})
      setActiveStep(0)
      setPhoto(null)
      setPhotoPreview(null)
    } catch (error) {
      console.error('Error enviando reporte:', error)
      alert('Error al enviar el reporte. Por favor, intenta nuevamente.')
    }
    
    setLoading(false)
  }

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom color="white">
                Información del Reportante
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nombre Completo"
                value={formData.reporterName}
                onChange={(e) => setFormData(prev => ({ ...prev, reporterName: e.target.value }))}
                sx={{ 
                  '& .MuiOutlinedInput-root': { 
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' }
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Teléfono"
                value={formData.reporterPhone}
                onChange={(e) => setFormData(prev => ({ ...prev, reporterPhone: e.target.value }))}
                sx={{ 
                  '& .MuiOutlinedInput-root': { 
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' }
                  }
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.reporterEmail}
                onChange={(e) => setFormData(prev => ({ ...prev, reporterEmail: e.target.value }))}
                sx={{ 
                  '& .MuiOutlinedInput-root': { 
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' }
                  }
                }}
              />
            </Grid>
          </Grid>
        )

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <Typography variant="h6" color="white">
                  Ubicación del Avistamiento
                </Typography>
                <Fab
                  size="small"
                  color="primary"
                  onClick={getCurrentLocation}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={20} /> : <MyLocation />}
                </Fab>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Latitud"
                value={formData.latitude}
                onChange={(e) => setFormData(prev => ({ ...prev, latitude: e.target.value }))}
                sx={{ 
                  '& .MuiOutlinedInput-root': { 
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' }
                  }
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Longitud"
                value={formData.longitude}
                onChange={(e) => setFormData(prev => ({ ...prev, longitude: e.target.value }))}
                sx={{ 
                  '& .MuiOutlinedInput-root': { 
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' }
                  }
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Dirección/Referencia"
                multiline
                rows={3}
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                sx={{ 
                  '& .MuiOutlinedInput-root': { 
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' }
                  }
                }}
              />
            </Grid>

            {location.lat && (
              <Grid item xs={12}>
                <Alert severity="success" sx={{ backgroundColor: 'rgba(255,255,255,0.9)' }}>
                  <strong>Ubicación detectada:</strong><br />
                  Lat: {location.lat}, Lng: {location.lng}<br />
                  {location.address}
                </Alert>
              </Grid>
            )}
          </Grid>
        )

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom color="white">
                Características del Perro
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Raza</InputLabel>
                <Select
                  value={formData.breed}
                  onChange={(e) => setFormData(prev => ({ ...prev, breed: e.target.value }))}
                  sx={{ backgroundColor: 'rgba(255,255,255,0.9)' }}
                >
                  {breeds.map(breed => (
                    <MenuItem key={breed} value={breed}>{breed}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography gutterBottom color="white">Tamaño</Typography>
              <RadioGroup
                row
                value={formData.size}
                onChange={(e) => setFormData(prev => ({ ...prev, size: e.target.value }))}
              >
                <FormControlLabel value="small" control={<Radio sx={{ color: 'white' }} />} 
                  label={<Typography color="white">Pequeño</Typography>} />
                <FormControlLabel value="medium" control={<Radio sx={{ color: 'white' }} />} 
                  label={<Typography color="white">Mediano</Typography>} />
                <FormControlLabel value="large" control={<Radio sx={{ color: 'white' }} />} 
                  label={<Typography color="white">Grande</Typography>} />
              </RadioGroup>
            </Grid>

            <Grid item xs={12}>
              <Typography gutterBottom color="white">Color del Pelaje (máximo 2 colores)</Typography>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {colors.map(color => {
                  const isSelected = formData.colors.includes(color.value)
                  return (
                    <Chip
                      key={color.value}
                      label={color.label}
                      onClick={() => {
                        setFormData(prev => {
                          const currentColors = prev.colors || []
                          if (isSelected) {
                            // Remover color si ya está seleccionado
                            return {
                              ...prev,
                              colors: currentColors.filter(c => c !== color.value)
                            }
                          } else if (currentColors.length < 2) {
                            // Agregar color si no se han seleccionado 2
                            return {
                              ...prev,
                              colors: [...currentColors, color.value]
                            }
                          }
                          return prev
                        })
                      }}
                      sx={{
                        backgroundColor: color.color,
                        color: color.value === 'blanco' ? 'black' : 'white',
                        border: isSelected ? '3px solid #2196F3' : '1px solid rgba(255,255,255,0.3)',
                        opacity: formData.colors.length >= 2 && !isSelected ? 0.5 : 1,
                        transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                        transition: 'all 0.2s ease'
                      }}
                      avatar={<Avatar sx={{ backgroundColor: color.color }}> </Avatar>}
                    />
                  )
                })}
              </Box>
              {formData.colors.length > 0 && (
                <Box mt={1}>
                  <Typography variant="body2" color="rgba(255,255,255,0.7)">
                    Colores seleccionados: {formData.colors.join(', ')}
                  </Typography>
                </Box>
              )}
            </Grid>

            <Grid item xs={12}>
              <Typography gutterBottom color="white">Temperamento</Typography>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {temperaments.map(temp => (
                  <Chip
                    key={temp.value}
                    label={temp.label}
                    onClick={() => setFormData(prev => ({ ...prev, temperament: temp.value }))}
                    sx={{
                      backgroundColor: temp.color,
                      color: 'white',
                      border: formData.temperament === temp.value ? '3px solid white' : 'none'
                    }}
                    icon={<Psychology />}
                  />
                ))}
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography gutterBottom color="white">Condición</Typography>
              <RadioGroup
                value={formData.condition}
                onChange={(e) => setFormData(prev => ({ ...prev, condition: e.target.value }))}
              >
                <FormControlLabel value="stray" control={<Radio sx={{ color: 'white' }} />} 
                  label={<Typography color="white">Callejero</Typography>} />
                <FormControlLabel value="lost" control={<Radio sx={{ color: 'white' }} />} 
                  label={<Typography color="white">Perdido</Typography>} />
                <FormControlLabel value="abandoned" control={<Radio sx={{ color: 'white' }} />} 
                  label={<Typography color="white">Abandonado</Typography>} />
              </RadioGroup>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography gutterBottom color="white">Género</Typography>
              <RadioGroup
                row
                value={formData.gender}
                onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
              >
                <FormControlLabel value="male" control={<Radio sx={{ color: 'white' }} />} 
                  label={<Typography color="white">Macho</Typography>} />
                <FormControlLabel value="female" control={<Radio sx={{ color: 'white' }} />} 
                  label={<Typography color="white">Hembra</Typography>} />
                <FormControlLabel value="unknown" control={<Radio sx={{ color: 'white' }} />} 
                  label={<Typography color="white">No sé</Typography>} />
              </RadioGroup>
            </Grid>
          </Grid>
        )

      case 3:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom color="white">
                Foto y Detalles Adicionales
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: 'rgba(255,255,255,0.9)' }}>
                {/* Botón para tomar foto con cámara */}
                <input
                  accept="image/*"
                  capture="environment"
                  style={{ display: 'none' }}
                  id="camera-capture"
                  type="file"
                  onChange={handlePhotoChange}
                />
                <label htmlFor="camera-capture">
                  <Button
                    variant="contained"
                    component="span"
                    startIcon={<PhotoCamera />}
                    fullWidth
                    sx={{ 
                      mb: 1,
                      backgroundColor: '#4CAF50',
                      '&:hover': { backgroundColor: '#45a049' }
                    }}
                  >
                    📸 Tomar Foto
                  </Button>
                </label>
                
                {/* Botón para subir desde galería */}
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
                    fullWidth
                    sx={{ 
                      mb: 2,
                      borderColor: '#2196F3',
                      color: '#2196F3',
                      '&:hover': { 
                        borderColor: '#1976D2',
                        backgroundColor: 'rgba(33, 150, 243, 0.1)'
                      }
                    }}
                  >
                    📁 Subir desde Galería
                  </Button>
                </label>
                
                {photoPreview && (
                  <Box mt={2}>
                    <img
                      src={photoPreview}
                      alt="Preview"
                      style={{
                        width: '100%',
                        maxHeight: '200px',
                        objectFit: 'cover',
                        borderRadius: '8px',
                        border: '2px solid #4CAF50'
                      }}
                    />
                    <Typography variant="body2" sx={{ mt: 1, color: '#4CAF50', fontWeight: 'bold' }}>
                      ✅ Foto capturada correctamente
                    </Typography>
                  </Box>
                )}
                
                {!photoPreview && (
                  <Box mt={2} sx={{ 
                    border: '2px dashed #ccc',
                    borderRadius: '8px',
                    p: 3,
                    backgroundColor: '#f5f5f5'
                  }}>
                    <PhotoCamera sx={{ fontSize: 48, color: '#ccc', mb: 1 }} />
                    <Typography variant="body2" color="textSecondary">
                      Toma una foto o sube una imagen del perro
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography gutterBottom color="white">Nivel de Urgencia</Typography>
              <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                {urgencyLevels.map(level => (
                  <Chip
                    key={level.value}
                    label={level.label}
                    onClick={() => setFormData(prev => ({ ...prev, urgency: level.value }))}
                    sx={{
                      backgroundColor: level.color,
                      color: 'white',
                      border: formData.urgency === level.value ? '3px solid white' : 'none'
                    }}
                  />
                ))}
              </Box>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descripción adicional"
                multiline
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe cualquier detalle adicional sobre el perro, su comportamiento, estado de salud, etc."
                sx={{ 
                  '& .MuiOutlinedInput-root': { 
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' }
                  }
                }}
              />
            </Grid>
          </Grid>
        )

      default:
        return null
    }
  }

  // Si está verificando el usuario, mostrar loading
  if (checkingUser) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <Card sx={{ 
            backgroundColor: 'rgba(255,255,255,0.1)', 
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.2)',
            p: 4,
            textAlign: 'center'
          }}>
            <CircularProgress size={60} sx={{ color: 'white', mb: 2 }} />
            <Typography variant="h6" sx={{ color: 'white' }}>
              Verificando registro de usuario...
            </Typography>
          </Card>
        </Box>
      </Container>
    )
  }

  // Si el usuario no está registrado, mostrar mensaje de restricción
  if (!isUserRegistered) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Box textAlign="center" mb={4}>
            <Typography variant="h3" sx={{ color: 'white', fontWeight: 'bold', mb: 2 }}>
              🚫 Acceso Restringido
            </Typography>
            <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.8)' }}>
              Solo usuarios con carnet registrado pueden reportar perros callejeros
            </Typography>
          </Box>

          <Card sx={{ 
            backgroundColor: 'rgba(255,255,255,0.1)', 
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.2)',
            maxWidth: 600,
            mx: 'auto'
          }}>
            <CardContent sx={{ p: 4, textAlign: 'center' }}>
              <Box mb={3}>
                <Pets sx={{ fontSize: 80, color: 'rgba(255,255,255,0.7)', mb: 2 }} />
                <Typography variant="h5" sx={{ color: 'white', mb: 2 }}>
                  ¿Por qué necesitas estar registrado?
                </Typography>
                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)', mb: 3 }}>
                  Para garantizar la veracidad de los reportes y poder contactarte en caso de emergencias,
                  solo usuarios que han registrado previamente una mascota pueden reportar perros callejeros.
                </Typography>
              </Box>
              
              <Alert severity="info" sx={{ backgroundColor: 'rgba(33, 150, 243, 0.1)', mb: 3 }}>
                <Typography sx={{ color: 'white' }}>
                  <strong>¿Qué necesitas hacer?</strong><br />
                  1. Registra una mascota en el sistema<br />
                  2. Obtén tu carnet digital<br />
                  3. Regresa aquí para reportar perros callejeros
                </Typography>
              </Alert>

              {/* Formulario para ingresar CUI manualmente */}
              <Box sx={{ mb: 3, p: 3, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
                <Typography variant="h6" sx={{ color: 'white', mb: 2, textAlign: 'center' }}>
                  ¿Ya tienes un CUI registrado?
                </Typography>
                <Box display="flex" gap={2} alignItems="flex-start">
                  <TextField
                    fullWidth
                    label="Ingresa tu CUI"
                    value={cuiInput}
                    onChange={(e) => {
                      setCuiInput(e.target.value)
                      setCuiError('')
                    }}
                    placeholder="Ej: 43451826-7"
                    error={!!cuiError}
                    helperText={cuiError}
                    sx={{ 
                      '& .MuiOutlinedInput-root': { 
                        backgroundColor: 'rgba(255,255,255,0.9)',
                        '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' }
                      }
                    }}
                  />
                  <Button
                    variant="contained"
                    onClick={verifyCUIManually}
                    disabled={verifyingCUI || !cuiInput.trim()}
                    sx={{ 
                      backgroundColor: '#2196F3',
                      '&:hover': { backgroundColor: '#1976D2' },
                      minWidth: 120,
                      height: 56
                    }}
                  >
                    {verifyingCUI ? <CircularProgress size={20} /> : 'Verificar'}
                  </Button>
                </Box>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mt: 1, textAlign: 'center' }}>
                  Ingresa el CUI que obtuviste al registrar tu mascota
                </Typography>
              </Box>
              
              <Box display="flex" gap={2} justifyContent="center" flexWrap="wrap">
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<PersonAdd />}
                  onClick={() => window.location.href = '/register'}
                  sx={{ 
                    backgroundColor: '#4CAF50',
                    '&:hover': { backgroundColor: '#45a049' },
                    minWidth: 200
                  }}
                >
                  Registrar Mascota
                </Button>
                
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<Search />}
                  onClick={() => window.location.href = '/search'}
                  sx={{ 
                    borderColor: 'white',
                    color: 'white',
                    '&:hover': { 
                      borderColor: 'white',
                      backgroundColor: 'rgba(255,255,255,0.1)'
                    },
                    minWidth: 200
                  }}
                >
                  Buscar mi CUI
                </Button>
              </Box>
              
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', mt: 3 }}>
                Si no recuerdas tu CUI, puedes buscarlo en la sección "Buscar" usando tu DNI
              </Typography>
            </CardContent>
          </Card>
        </motion.div>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <Box textAlign="center" mb={4}>
          <Typography variant="h3" sx={{ color: 'white', fontWeight: 'bold', mb: 2 }}>
            🐕 Reportar Perro Callejero
          </Typography>
          <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.8)', mb: 1 }}>
            Ayuda a los perros callejeros reportando su ubicación y estado
          </Typography>
          <Alert severity="success" sx={{ backgroundColor: 'rgba(76, 175, 80, 0.1)', maxWidth: 600, mx: 'auto' }}>
            <Typography sx={{ color: 'white' }}>
              ✅ <strong>Usuario verificado:</strong> CUI {userCUI}
            </Typography>
          </Alert>
        </Box>

        <Card sx={{ 
          backgroundColor: 'rgba(255,255,255,0.15)', 
          backdropFilter: 'blur(25px)',
          border: '1px solid rgba(255,255,255,0.3)',
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          mb: 4
        }}>
          <CardContent>
            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel sx={{ '& .MuiStepLabel-label': { color: 'white' } }}>
                    {label}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>

            {renderStepContent(activeStep)}

            <Box display="flex" justifyContent="space-between" mt={4}>
              <Button
                disabled={activeStep === 0}
                onClick={() => setActiveStep(prev => prev - 1)}
                sx={{ color: 'white', borderColor: 'white' }}
                variant="outlined"
              >
                Anterior
              </Button>
              
              {activeStep === steps.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                  sx={{ 
                    backgroundColor: '#4CAF50',
                    '&:hover': { backgroundColor: '#45a049' }
                  }}
                >
                  {loading ? 'Enviando...' : 'Enviar Reporte'}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={() => setActiveStep(prev => prev + 1)}
                  sx={{ 
                    backgroundColor: '#2196F3',
                    '&:hover': { backgroundColor: '#1976D2' }
                  }}
                >
                  Siguiente
                </Button>
              )}
            </Box>
          </CardContent>
        </Card>
      </motion.div>
    </Container>
  )
}

export default ReportStrayPage
