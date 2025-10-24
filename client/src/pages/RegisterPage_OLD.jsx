import React, { useState, useEffect } from 'react'
import {
  Container, Typography, Card, CardContent, TextField, Button, Grid,
  Box, Avatar, Alert, CircularProgress, Divider,
  InputAdornment, IconButton, Chip, RadioGroup, FormControlLabel, Radio,
  FormControl, FormLabel, Autocomplete, InputLabel, Select, MenuItem,
  Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material'
import { 
  PhotoCamera, Pets, Person, Email, Lock, Visibility, VisibilityOff, 
  CheckCircle, Upload, Vaccines, Badge, Warning, Receipt
} from '@mui/icons-material'
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
    sex: '',
    breed: '',
    birthDate: '',
    age: '',
    size: '',
    color: '',
    additionalFeatures: '',
    aggressionHistory: 'no',
    aggressionDetails: '',
    hasVaccinationCard: 'no',
    vaccinationCardFile: null,
    hasRabiesVaccine: 'no',
    rabiesVaccineFile: null,
    medicalHistory: '',
    customMedicalHistory: '',
    photo: null,
    photoLateral: null,
    photoFrontal: null,
    // Payment data for dangerous breeds
    receiptNumber: '',
    receiptIssueDate: '',
    receiptPayer: '',
    receiptAmount: '',
    // Adopter data
    firstName: '',
    lastName: '',
    dni: '',
    dniPhoto: null,
    email: '',
    password: '',
    phone: '',
    address: ''
  })
  
  const [photoPreview, setPhotoPreview] = useState(null)
  const [photoLateralPreview, setPhotoLateralPreview] = useState(null)
  const [photoFrontalPreview, setPhotoFrontalPreview] = useState(null)
  const [dniPhotoPreview, setDniPhotoPreview] = useState(null)
  const [vaccinationCardPreview, setVaccinationCardPreview] = useState(null)
  const [rabiesVaccinePreview, setRabiesVaccinePreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [showCustomMedicalHistory, setShowCustomMedicalHistory] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showDangerousBreedModal, setShowDangerousBreedModal] = useState(false)
  const [isDangerousBreed, setIsDangerousBreed] = useState(false)

  // Opciones predefinidas para autocomplete
  // Razas potencialmente peligrosas según normativa
  const dangerousBreeds = [
    'Pit Bull Terrier',
    'Dogo Argentino',
    'Fila Brasilero',
    'Tosa Japonesa',
    'Bull Mastiff',
    'Doberman',
    'Rottweiler'
  ]

  const defaultBreeds = [
    'Mestizo', 'Labrador Retriever', 'Pastor Alemán', 'Golden Retriever',
    'Bulldog Francés', 'Bulldog Inglés', 'Beagle', 'Poodle', 'Rottweiler',
    'Yorkshire Terrier', 'Dachshund', 'Boxer', 'Husky Siberiano', 'Gran Danés',
    'Pug', 'Boston Terrier', 'Shih Tzu', 'Pomerania', 'Cocker Spaniel',
    'Border Collie', 'Chihuahua', 'Maltés', 'Schnauzer', 'Pit Bull Terrier',
    'Akita', 'San Bernardo', 'Dálmata', 'Bichón Frisé', 'Chow Chow',
    'Pequinés', 'Dogo Argentino', 'Fila Brasilero', 'Tosa Japonesa',
    'Bull Mastiff', 'Doberman', 'Otro'
  ]

  const defaultColors = [
    'Negro', 'Blanco', 'Marrón', 'Dorado', 'Gris', 'Crema', 'Café',
    'Chocolate', 'Canela', 'Beige', 'Atigrado', 'Manchado',
    'Negro y Blanco', 'Blanco y Negro', 'Negro y Marrón', 'Blanco y Marrón', 
    'Marrón y Blanco', 'Tricolor', 'Merle', 'Rojizo', 'Plata', 'Azul', 'Arena', 'Otro'
  ]

  const sizeOptions = [
    { code: 'small', name: 'Pequeño' },
    { code: 'medium', name: 'Mediano' },
    { code: 'large', name: 'Grande' }
  ]

  const medicalHistoryOptions = [
    'Ninguno',
    'Parvovirus',
    'Moquillo',
    'Vómitos frecuentes',
    'Diarrea crónica',
    'Sangrados',
    'Problemas respiratorios',
    'Alergias alimentarias',
    'Dermatitis',
    'Problemas cardíacos',
    'Epilepsia',
    'Artritis',
    'Displasia de cadera',
    'Cataratas',
    'Problemas renales',
    'Diabetes',
    'Cirugías previas',
    'Fracturas',
    'Parásitos intestinales',
    'Garrapatas/pulgas',
    'Otro'
  ]

  // Check if user is logged in and load their data
  useEffect(() => {
    const checkLoginStatus = async () => {
      const token = localStorage.getItem('authToken')
      if (token) {
        try {
          const response = await axios.get('http://localhost:5000/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
          })
          
          if (response.data.success) {
            setIsLoggedIn(true)
            setUserData(response.data.user)
            
            // Pre-fill form with user data
            setFormData(prev => ({
              ...prev,
              firstName: response.data.user.first_name || '',
              lastName: response.data.user.last_name || '',
              dni: response.data.user.dni || '',
              email: response.data.user.email || '',
              phone: response.data.user.phone || '',
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
    
    // Si es fecha de nacimiento, calcular edad automáticamente
    if (name === 'birthDate' && value) {
      const birthDate = new Date(value)
      const today = new Date()
      
      // Calcular diferencia en meses
      let ageInMonths = (today.getFullYear() - birthDate.getFullYear()) * 12
      ageInMonths += today.getMonth() - birthDate.getMonth()
      
      // Ajustar si el día actual es menor al día de nacimiento
      if (today.getDate() < birthDate.getDate()) {
        ageInMonths--
      }
      
      // Asegurarse de que no sea negativo
      ageInMonths = Math.max(0, ageInMonths)
      
      setFormData(prev => ({
        ...prev,
        [name]: value,
        age: ageInMonths.toString()
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleFileChange = (fieldName, previewSetter) => (e) => {
    const file = e.target.files[0]
    if (file) {
      setFormData(prev => ({ ...prev, [fieldName]: file }))
      const reader = new FileReader()
      reader.onload = (e) => previewSetter(e.target.result)
      reader.readAsDataURL(file)
    }
  }

  const handleRadioChange = (fieldName) => (e) => {
    const value = e.target.value
    setFormData(prev => ({
      ...prev,
      [fieldName]: value,
      // Clear file if changing to 'no'
      ...(value === 'no' && fieldName === 'hasVaccinationCard' ? { vaccinationCardFile: null } : {}),
      ...(value === 'no' && fieldName === 'hasRabiesVaccine' ? { rabiesVaccineFile: null } : {}),
      // Clear aggression details if 'no'
      ...(value === 'no' && fieldName === 'aggressionHistory' ? { aggressionDetails: '' } : {})
    }))
    // Clear preview if changing to 'no'
    if (value === 'no') {
      if (fieldName === 'hasVaccinationCard') setVaccinationCardPreview(null)
      if (fieldName === 'hasRabiesVaccine') setRabiesVaccinePreview(null)
    }
  }

  // Función para manejar cambio de raza y detectar si es peligrosa
  const handleBreedChange = (event, newValue) => {
    setFormData(prev => ({
      ...prev,
      breed: newValue || ''
    }))
    
    // Verificar si es raza potencialmente peligrosa
    if (newValue && dangerousBreeds.includes(newValue)) {
      setIsDangerousBreed(true)
      setShowDangerousBreedModal(true)
    } else {
      setIsDangerousBreed(false)
      // Limpiar datos de pago si cambia a raza no peligrosa
      setFormData(prev => ({
        ...prev,
        receiptNumber: '',
        receiptIssueDate: '',
        receiptPayer: '',
        receiptAmount: ''
      }))
    }
  }

  const handleCloseDangerousBreedModal = () => {
    setShowDangerousBreedModal(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const formDataToSend = new FormData()
      
      // Pet data
      formDataToSend.append('petName', formData.petName)
      formDataToSend.append('sex', formData.sex)
      formDataToSend.append('breed', formData.breed)
      formDataToSend.append('birthDate', formData.birthDate)
      formDataToSend.append('age', formData.age)
      formDataToSend.append('size', formData.size)
      formDataToSend.append('color', formData.color)
      formDataToSend.append('additionalFeatures', formData.additionalFeatures)
      formDataToSend.append('aggressionHistory', formData.aggressionHistory)
      if (formData.aggressionHistory === 'yes') {
        formDataToSend.append('aggressionDetails', formData.aggressionDetails)
      }
      formDataToSend.append('hasVaccinationCard', formData.hasVaccinationCard)
      formDataToSend.append('hasRabiesVaccine', formData.hasRabiesVaccine)
      
      // Payment data for dangerous breeds
      if (isDangerousBreed) {
        formDataToSend.append('receiptNumber', formData.receiptNumber)
        formDataToSend.append('receiptIssueDate', formData.receiptIssueDate)
        formDataToSend.append('receiptPayer', formData.receiptPayer)
        formDataToSend.append('receiptAmount', formData.receiptAmount)
      }
      
      // Handle medical history - use custom if "Otro" is selected
      const finalMedicalHistory = formData.medicalHistory === 'Otro' 
        ? formData.customMedicalHistory 
        : formData.medicalHistory
      formDataToSend.append('medicalHistory', finalMedicalHistory)
      
      // File uploads
      if (formData.photo) {
        formDataToSend.append('photo', formData.photo)
      }
      if (formData.photoLateral) {
        formDataToSend.append('photoLateral', formData.photoLateral)
      }
      if (formData.photoFrontal) {
        formDataToSend.append('photoFrontal', formData.photoFrontal)
      }
      if (formData.vaccinationCardFile) {
        formDataToSend.append('vaccinationCard', formData.vaccinationCardFile)
      }
      if (formData.rabiesVaccineFile) {
        formDataToSend.append('rabiesVaccine', formData.rabiesVaccineFile)
      }
      
      // Owner data
      if (isLoggedIn && userData) {
        // Use logged in user data
        formDataToSend.append('firstName', userData.first_name || '')
        formDataToSend.append('lastName', userData.last_name || '')
        formDataToSend.append('dni', userData.dni || '')
        formDataToSend.append('email', userData.email || '')
        formDataToSend.append('phone', userData.phone || '')
        formDataToSend.append('address', userData.address || '')
      } else {
        // Use form data for new users
        formDataToSend.append('firstName', formData.firstName)
        formDataToSend.append('lastName', formData.lastName)
        formDataToSend.append('dni', formData.dni)
        formDataToSend.append('email', formData.email)
        formDataToSend.append('password', formData.password)
        formDataToSend.append('phone', formData.phone)
        formDataToSend.append('address', formData.address)
        
        if (formData.dniPhoto) {
          formDataToSend.append('dniPhoto', formData.dniPhoto)
        }
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

      const response = await axios.post('http://localhost:5000/api/register', formDataToSend, { headers })

      setSuccess(true)
      
      // Store CUI and auth token
      localStorage.setItem('userCUI', response.data.cui)
      
      // Si hay token (usuario nuevo o no logeado), hacer login automático
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token)
        localStorage.setItem('userEmail', response.data.user.email)
        localStorage.setItem('userId', response.data.user.id)
        localStorage.setItem('userFullName', `${formData.firstName} ${formData.lastName}`)
        localStorage.setItem('userDNI', response.data.user.dni)
      }
      
      // Reset form
      if (isLoggedIn) {
        // Solo resetear campos de mascota si está logeado
        setFormData(prev => ({
          ...prev,
          petName: '', sex: '', breed: '', age: '', size: '', color: '',
          additionalFeatures: '', hasVaccinationCard: 'no', vaccinationCardFile: null,
          hasRabiesVaccine: 'no', rabiesVaccineFile: null, medicalHistory: '', customMedicalHistory: '', 
          photo: null, photoLateral: null, photoFrontal: null
        }))
        setShowCustomMedicalHistory(false)
        setPhotoPreview(null)
        setPhotoLateralPreview(null)
        setPhotoFrontalPreview(null)
        setVaccinationCardPreview(null)
        setRabiesVaccinePreview(null)
      } else {
        // Resetear todo si es usuario nuevo
        setFormData({
          petName: '', sex: '', breed: '', age: '', size: '', color: '',
          additionalFeatures: '', hasVaccinationCard: 'no', vaccinationCardFile: null,
          hasRabiesVaccine: 'no', rabiesVaccineFile: null, medicalHistory: '', customMedicalHistory: '', 
          photo: null, photoLateral: null, photoFrontal: null,
          firstName: '', lastName: '', dni: '', dniPhoto: null, email: '', 
          password: '', phone: '', address: ''
        })
        setShowCustomMedicalHistory(false)
        setPhotoPreview(null)
        setPhotoLateralPreview(null)
        setPhotoFrontalPreview(null)
        setDniPhotoPreview(null)
        setVaccinationCardPreview(null)
        setRabiesVaccinePreview(null)
      }
      
      // Redirect after 2 seconds
      setTimeout(() => {
        // Siempre redirigir al dashboard después del registro exitoso
        navigate('/user/dashboard')
      }, 2000)
      
    } catch (err) {
      console.error('Error:', err)
      setError(err.response?.data?.error || 'Error al registrar la mascota')
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
        {/* Header con logos simétricos */}
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 3, mb: 4 }}>          <Typography 
            variant="h4" 
            textAlign="center" 
            sx={{ 
              color: '#1e293b', 
              fontWeight: 700,
              letterSpacing: '-0.5px',
              minWidth: '300px'
            }}
          >
            Registro de Mascota
          </Typography>
        </Box>

        <Card sx={{ 
          background: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: 3,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
        }}>
          <CardContent sx={{ p: 4 }}>
            {success && (
              <Alert severity="success" sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  ¡Mascota registrada exitosamente! 🎉
                </Typography>
                {!isLoggedIn ? (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      ✅ Tu cuenta ha sido creada exitosamente
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      ✅ Has sido logeado automáticamente
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      ✅ Ahora puedes reportar perros callejeros
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      📍 Recoge el carnet físico en la Gerencia Ambiental
                    </Typography>
                    <Typography variant="body2" color="primary" sx={{ fontWeight: 'bold' }}>
                      Redirigiendo al panel de usuario...
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      ✅ Nueva mascota agregada a tu panel
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      📍 Recoge el carnet físico en la Gerencia Ambiental
                    </Typography>
                    <Typography variant="body2" color="primary" sx={{ fontWeight: 'bold' }}>
                      Redirigiendo al panel de usuario...
                    </Typography>
                  </Box>
                )}
              </Alert>
            )}

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              {/* Pet Information */}
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Pets sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Información de la Mascota
                </Typography>
              </Box>

              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Nombre del Can"
                    name="petName"
                    value={formData.petName}
                    onChange={handleInputChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Sexo del Can</InputLabel>
                    <Select
                      name="sex"
                      value={formData.sex}
                      onChange={handleInputChange}
                      label="Sexo del Can"
                    >
                      <MenuItem value="male">Macho ♂️</MenuItem>
                      <MenuItem value="female">Hembra ♀️</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Autocomplete
                    freeSolo
                    options={defaultBreeds}
                    value={formData.breed}
                    onChange={handleBreedChange}
                    onInputChange={(event, newInputValue) => {
                      handleBreedChange(event, newInputValue)
                    }}
                    renderInput={(params) => (
                      <TextField 
                        {...params} 
                        label="Raza del Can" 
                        required 
                        helperText={isDangerousBreed ? "⚠️ Raza potencialmente peligrosa - Se requiere documentación adicional" : ""}
                        FormHelperTextProps={{ sx: { color: 'warning.main', fontWeight: 600 } }}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="Fecha de Nacimiento"
                    name="birthDate"
                    type="date"
                    value={formData.birthDate}
                    onChange={handleInputChange}
                    required
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="Edad (meses)"
                    name="age"
                    type="number"
                    value={formData.age}
                    onChange={handleInputChange}
                    required
                    disabled={!!formData.birthDate}
                    inputProps={{ min: 0, max: 360 }}
                    helperText={formData.birthDate ? "Calculado automáticamente" : ""}
                    sx={{
                      '& .MuiInputBase-input.Mui-disabled': {
                        WebkitTextFillColor: '#1e293b',
                        color: '#1e293b'
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <Autocomplete
                    options={sizeOptions}
                    getOptionLabel={(option) => option.name || option}
                    value={sizeOptions.find(s => s.code === formData.size) || null}
                    onChange={(event, newValue) => {
                      setFormData(prev => ({ ...prev, size: newValue?.code || '' }))
                    }}
                    renderInput={(params) => (
                      <TextField {...params} label="Tamaño del Can" required />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Autocomplete
                    freeSolo
                    options={defaultColors}
                    value={formData.color}
                    onChange={(event, newValue) => {
                      setFormData(prev => ({ ...prev, color: newValue || '' }))
                    }}
                    onInputChange={(event, newInputValue) => {
                      setFormData(prev => ({ ...prev, color: newInputValue || '' }))
                    }}
                    renderInput={(params) => (
                      <TextField {...params} label="Color del Can" required />
                    )}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Características Adicionales"
                    name="additionalFeatures"
                    value={formData.additionalFeatures}
                    onChange={handleInputChange}
                    multiline
                    rows={3}
                    placeholder="Describe características especiales, marcas distintivas, comportamiento, etc."
                  />
                </Grid>

                {/* Antecedentes de Agresividad */}
                <Grid item xs={12}>
                  <FormControl component="fieldset">
                    <FormLabel component="legend">
                      ¿El can tiene antecedentes de agresividad? <Warning sx={{ fontSize: 18, color: 'warning.main', mb: -0.5 }} />
                    </FormLabel>
                    <RadioGroup
                      row
                      name="aggressionHistory"
                      value={formData.aggressionHistory}
                      onChange={handleRadioChange('aggressionHistory')}
                    >
                      <FormControlLabel value="yes" control={<Radio />} label="Sí" />
                      <FormControlLabel value="no" control={<Radio />} label="No" />
                    </RadioGroup>
                  </FormControl>
                  
                  {formData.aggressionHistory === 'yes' && (
                    <Box sx={{ mt: 2 }}>
                      <TextField
                        fullWidth
                        label="Detalles de los antecedentes de agresividad"
                        name="aggressionDetails"
                        value={formData.aggressionDetails}
                        onChange={handleInputChange}
                        multiline
                        rows={3}
                        required
                        placeholder="Describe los incidentes de agresividad: fechas, circunstancias, personas o animales afectados, etc."
                      />
                    </Box>
                  )}
                </Grid>
                
                {/* Vaccination Card */}
                <Grid item xs={12} md={6}>
                  <FormControl component="fieldset">
                    <FormLabel component="legend">¿Cuenta con Carnet de Vacunación?</FormLabel>
                    <RadioGroup
                      row
                      name="hasVaccinationCard"
                      value={formData.hasVaccinationCard}
                      onChange={handleRadioChange('hasVaccinationCard')}
                    >
                      <FormControlLabel value="si" control={<Radio />} label="Sí" />
                      <FormControlLabel value="no" control={<Radio />} label="No" />
                    </RadioGroup>
                  </FormControl>
                  
                  {formData.hasVaccinationCard === 'si' && (
                    <Box sx={{ mt: 2 }}>
                      <input
                        accept="image/*,application/pdf"
                        style={{ display: 'none' }}
                        id="vaccination-card-upload"
                        type="file"
                        onChange={handleFileChange('vaccinationCardFile', setVaccinationCardPreview)}
                      />
                      <label htmlFor="vaccination-card-upload">
                        <Button
                          variant="outlined"
                          component="span"
                          startIcon={<Vaccines />}
                          sx={{ mb: 1 }}
                        >
                          Subir Carnet de Vacunación
                        </Button>
                      </label>
                      {vaccinationCardPreview && (
                        <Typography variant="caption" display="block" color="success.main">
                          ✓ Archivo cargado
                        </Typography>
                      )}
                    </Box>
                  )}
                </Grid>
                
                {/* Rabies Vaccine */}
                <Grid item xs={12} md={6}>
                  <FormControl component="fieldset">
                    <FormLabel component="legend">¿Tiene Vacuna Antirrábica?</FormLabel>
                    <RadioGroup
                      row
                      name="hasRabiesVaccine"
                      value={formData.hasRabiesVaccine}
                      onChange={handleRadioChange('hasRabiesVaccine')}
                    >
                      <FormControlLabel value="si" control={<Radio />} label="Sí" />
                      <FormControlLabel value="no" control={<Radio />} label="No" />
                    </RadioGroup>
                  </FormControl>
                  
                  {formData.hasRabiesVaccine === 'si' && (
                    <Box sx={{ mt: 2 }}>
                      <input
                        accept="image/*,application/pdf"
                        style={{ display: 'none' }}
                        id="rabies-vaccine-upload"
                        type="file"
                        onChange={handleFileChange('rabiesVaccineFile', setRabiesVaccinePreview)}
                      />
                      <label htmlFor="rabies-vaccine-upload">
                        <Button
                          variant="outlined"
                          component="span"
                          startIcon={<Vaccines />}
                          sx={{ mb: 1 }}
                        >
                          Subir Certificado Antirrábico
                        </Button>
                      </label>
                      {rabiesVaccinePreview && (
                        <Typography variant="caption" display="block" color="success.main">
                          ✓ Archivo cargado
                        </Typography>
                      )}
                    </Box>
                  )}
                </Grid>
                
                {/* Medical History */}
                <Grid item xs={12}>
                  <Autocomplete
                    options={medicalHistoryOptions}
                    value={formData.medicalHistory}
                    onChange={(event, newValue) => {
                      setFormData(prev => ({ ...prev, medicalHistory: newValue || '' }))
                      setShowCustomMedicalHistory(newValue === 'Otro')
                      if (newValue !== 'Otro') {
                        setFormData(prev => ({ ...prev, customMedicalHistory: '' }))
                      }
                    }}
                    renderInput={(params) => (
                      <TextField {...params} label="Antecedentes Médicos del Can" />
                    )}
                  />
                </Grid>
                
                {/* Custom Medical History Field */}
                {showCustomMedicalHistory && (
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Especificar Antecedentes"
                      name="customMedicalHistory"
                      value={formData.customMedicalHistory}
                      onChange={handleInputChange}
                      multiline
                      rows={3}
                      placeholder="Describe los antecedentes médicos específicos: parvovirus, vómitos, sangrados, etc."
                      required
                    />
                  </Grid>
                )}
                
                {/* Pet Photos */}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, textAlign: 'center' }}>
                    Fotografías del Can
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6} sx={{ textAlign: 'center' }}>
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="photo-lateral-upload"
                    type="file"
                    onChange={handleFileChange('photoLateral', setPhotoLateralPreview)}
                  />
                  <label htmlFor="photo-lateral-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<PhotoCamera />}
                      sx={{ mb: 2 }}
                      fullWidth
                    >
                      Foto Lateral del Can
                    </Button>
                  </label>
                  {photoLateralPreview && (
                    <Box>
                      <Avatar
                        src={photoLateralPreview}
                        sx={{ width: 120, height: 120, mx: 'auto', mt: 2 }}
                        variant="rounded"
                      />
                      <Typography variant="caption" color="success.main" sx={{ mt: 1, display: 'block' }}>
                        ✓ Foto lateral cargada
                      </Typography>
                    </Box>
                  )}
                </Grid>
                <Grid item xs={12} md={6} sx={{ textAlign: 'center' }}>
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="photo-frontal-upload"
                    type="file"
                    onChange={handleFileChange('photoFrontal', setPhotoFrontalPreview)}
                  />
                  <label htmlFor="photo-frontal-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<PhotoCamera />}
                      sx={{ mb: 2 }}
                      fullWidth
                    >
                      Foto Frontal del Can
                    </Button>
                  </label>
                  {photoFrontalPreview && (
                    <Box>
                      <Avatar
                        src={photoFrontalPreview}
                        sx={{ width: 120, height: 120, mx: 'auto', mt: 2 }}
                        variant="rounded"
                      />
                      <Typography variant="caption" color="success.main" sx={{ mt: 1, display: 'block' }}>
                        ✓ Foto frontal cargada
                      </Typography>
                    </Box>
                  )}
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              {/* Owner Information */}
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
                        <Typography variant="body1" fontWeight="500">
                          {userData.first_name} {userData.last_name}
                        </Typography>
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
                        <Typography variant="body1" fontWeight="500">{userData.address}</Typography>
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
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Apellido del Propietario"
                      name="lastName"
                      value={formData.lastName}
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
                    <Box>
                      <input
                        accept="image/*,application/pdf"
                        style={{ display: 'none' }}
                        id="dni-photo-upload"
                        type="file"
                        onChange={handleFileChange('dniPhoto', setDniPhotoPreview)}
                      />
                      <label htmlFor="dni-photo-upload">
                        <Button
                          variant="outlined"
                          component="span"
                          startIcon={<Badge />}
                          fullWidth
                        >
                          Adjuntar DNI
                        </Button>
                      </label>
                      {dniPhotoPreview && (
                        <Typography variant="caption" display="block" color="success.main" sx={{ mt: 1 }}>
                          ✓ DNI cargado
                        </Typography>
                      )}
                    </Box>
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

              <Box textAlign="center">
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{ 
                    px: 6, 
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 600
                  }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Registrar Mascota'}
                </Button>
              </Box>
            </form>
          </CardContent>
        </Card>
      </motion.div>

      {/* Modal para Razas Potencialmente Peligrosas */}
      <Dialog 
        open={showDangerousBreedModal} 
        onClose={handleCloseDangerousBreedModal}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
          }
        }}
      >
        <DialogTitle sx={{ 
          background: '#ffffff',
          borderBottom: '1px solid #e5e7eb',
          p: 3
        }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
            <Box sx={{
              backgroundColor: '#fef3c7',
              borderRadius: 2,
              p: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Warning sx={{ fontSize: 28, color: '#f59e0b' }} />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ color: '#1e293b', fontWeight: 700, mb: 0.5 }}>
                Raza Potencialmente Peligrosa
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b' }}>
                Se requiere documentación adicional según normativa municipal
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ p: 3 }}>
          <Box sx={{ 
            backgroundColor: '#fef3c7',
            border: '1px solid #fde68a',
            borderRadius: 2,
            p: 2.5,
            mb: 3
          }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#92400e', mb: 1.5 }}>
              Requisitos para el registro:
            </Typography>
            <Box component="ul" sx={{ m: 0, pl: 2.5, color: '#78350f' }}>
              <li><Typography variant="body2" sx={{ mb: 0.5 }}>Pago de tasa especial de registro</Typography></li>
              <li><Typography variant="body2" sx={{ mb: 0.5 }}>Recibo de caja como comprobante</Typography></li>
              <li><Typography variant="body2">Evaluación adicional de comportamiento</Typography></li>
            </Box>
          </Box>

          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1.5, 
            mb: 3,
            pb: 2,
            borderBottom: '1px solid #e5e7eb'
          }}>
            <Box sx={{
              backgroundColor: '#eff6ff',
              borderRadius: 1.5,
              p: 1,
              display: 'flex'
            }}>
              <Receipt sx={{ fontSize: 20, color: '#2563eb' }} />
            </Box>
            <Typography variant="h6" sx={{ color: '#1e293b', fontWeight: 600 }}>
              Datos del Recibo de Pago
            </Typography>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Número de Recibo de Caja"
                name="receiptNumber"
                value={formData.receiptNumber}
                onChange={handleInputChange}
                required
                placeholder="Ej: 001-0123456"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Fecha de Emisión"
                name="receiptIssueDate"
                type="date"
                value={formData.receiptIssueDate}
                onChange={handleInputChange}
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nombre o Razón Social del Pagador"
                name="receiptPayer"
                value={formData.receiptPayer}
                onChange={handleInputChange}
                required
                placeholder="Nombre completo del propietario"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Monto (S/.)"
                name="receiptAmount"
                type="number"
                value={formData.receiptAmount}
                onChange={handleInputChange}
                required
                inputProps={{ min: 0, step: 0.01 }}
                placeholder="Ej: 150.00"
              />
            </Grid>
          </Grid>

          <Box sx={{ 
            backgroundColor: '#eff6ff',
            border: '1px solid #dbeafe',
            borderRadius: 2,
            p: 2.5,
            mt: 3
          }}>
            <Typography variant="body2" sx={{ color: '#1e40af', lineHeight: 1.6 }}>
              <strong>Nota importante:</strong> Estos datos serán verificados durante el proceso de validación. 
              Asegúrate de que el recibo sea válido y emitido por la Municipalidad Provincial de Puno.
            </Typography>
          </Box>
        </DialogContent>

        <DialogActions sx={{ 
          p: 3, 
          borderTop: '1px solid #e5e7eb',
          backgroundColor: '#f8fafc'
        }}>
          <Button 
            onClick={handleCloseDangerousBreedModal}
            variant="contained"
            fullWidth
            sx={{ 
              background: '#2563eb',
              color: 'white',
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 600,
              textTransform: 'none',
              boxShadow: 'none',
              '&:hover': {
                background: '#1d4ed8',
                boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)',
              }
            }}
          >
            Entendido, continuar con el registro
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}

export default RegisterPage
