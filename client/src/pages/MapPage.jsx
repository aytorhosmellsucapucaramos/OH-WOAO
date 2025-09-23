import React, { useState, useEffect } from 'react'
import {
  Container, Typography, Box, Card, CardContent, Chip, Avatar,
  FormControl, InputLabel, Select, MenuItem, Switch, FormControlLabel,
  Paper, Grid, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  Fab, Alert
} from '@mui/material'
import {
  LocationOn, Pets, FilterList, Visibility, Phone, Email,
  Warning, AccessTime, Info, Close
} from '@mui/icons-material'
import { motion } from 'framer-motion'
import axios from 'axios'

const MapPage = () => {
  const [strayReports, setStrayReports] = useState([])
  const [filteredReports, setFilteredReports] = useState([])
  const [selectedReport, setSelectedReport] = useState(null)
  const [filters, setFilters] = useState({
    urgency: 'all',
    condition: 'all',
    size: 'all',
    temperament: 'all',
    showOnlyRecent: false
  })
  const [loading, setLoading] = useState(true)
  const [mapCenter, setMapCenter] = useState({ lat: -12.0464, lng: -77.0428 }) // Lima, Peru

  // Simulación de datos (en producción vendría de la API)
  const mockReports = [
    {
      id: 1,
      reporterName: 'María González',
      reporterPhone: '+51 987654321',
      reporterEmail: 'maria@email.com',
      latitude: -12.0464,
      longitude: -77.0428,
      address: 'Av. Javier Prado Este 123, San Isidro',
      breed: 'Mestizo',
      size: 'medium',
      colors: ['marron'],
      temperament: 'friendly',
      condition: 'stray',
      urgency: 'normal',
      description: 'Perro amigable que busca comida cerca del parque',
      photo: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=300',
      createdAt: new Date().toISOString(),
      status: 'active'
    },
    {
      id: 2,
      reporterName: 'Carlos Ruiz',
      reporterPhone: '+51 912345678',
      reporterEmail: 'carlos@email.com',
      latitude: -12.0564,
      longitude: -77.0328,
      address: 'Calle Los Olivos 456, Miraflores',
      breed: 'Labrador',
      size: 'large',
      colors: ['dorado'],
      temperament: 'shy',
      condition: 'lost',
      urgency: 'high',
      description: 'Perro grande con collar, parece estar perdido',
      photo: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=300',
      createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 día atrás
      status: 'active'
    },
    {
      id: 3,
      reporterName: 'Ana Torres',
      reporterPhone: '+51 998877665',
      reporterEmail: 'ana@email.com',
      latitude: -12.0364,
      longitude: -77.0528,
      address: 'Jr. Huancavelica 789, Cercado de Lima',
      breed: 'Chihuahua',
      size: 'small',
      colors: ['negro'],
      temperament: 'scared',
      condition: 'abandoned',
      urgency: 'emergency',
      description: 'Cachorro muy pequeño, necesita atención veterinaria urgente',
      photo: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=300',
      createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 días atrás
      status: 'active'
    }
  ]

  const temperamentColors = {
    friendly: '#4CAF50',
    shy: '#FF9800',
    aggressive: '#F44336',
    scared: '#9C27B0',
    playful: '#2196F3',
    calm: '#009688'
  }

  const urgencyColors = {
    low: '#4CAF50',
    normal: '#FF9800',
    high: '#F44336',
    emergency: '#9C27B0'
  }

  const conditionLabels = {
    stray: 'Callejero',
    lost: 'Perdido',
    abandoned: 'Abandonado'
  }

  const sizeLabels = {
    small: 'Pequeño',
    medium: 'Mediano',
    large: 'Grande'
  }

  useEffect(() => {
    loadStrayReports()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [strayReports, filters])

  const loadStrayReports = async () => {
    setLoading(true)
    try {
      // En producción, esto sería una llamada real a la API
      // const response = await axios.get('http://localhost:5000/api/stray-reports')
      // setStrayReports(response.data)
      
      // Por ahora usamos datos mock
      setTimeout(() => {
        setStrayReports(mockReports)
        setLoading(false)
      }, 1000)
    } catch (error) {
      console.error('Error cargando reportes:', error)
      setStrayReports(mockReports) // Fallback a datos mock
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...strayReports]

    if (filters.urgency !== 'all') {
      filtered = filtered.filter(report => report.urgency === filters.urgency)
    }

    if (filters.condition !== 'all') {
      filtered = filtered.filter(report => report.condition === filters.condition)
    }

    if (filters.size !== 'all') {
      filtered = filtered.filter(report => report.size === filters.size)
    }

    if (filters.temperament !== 'all') {
      filtered = filtered.filter(report => report.temperament === filters.temperament)
    }

    if (filters.showOnlyRecent) {
      const oneDayAgo = new Date(Date.now() - 86400000)
      filtered = filtered.filter(report => new Date(report.createdAt) > oneDayAgo)
    }

    setFilteredReports(filtered)
  }

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }))
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getDistanceFromUser = (lat, lng) => {
    // Simulación de cálculo de distancia
    // En producción usarías la ubicación real del usuario
    const userLat = -12.0464
    const userLng = -77.0428
    
    const R = 6371 // Radio de la Tierra en km
    const dLat = (lat - userLat) * Math.PI / 180
    const dLng = (lng - userLng) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(userLat * Math.PI / 180) * Math.cos(lat * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    const distance = R * c

    return distance.toFixed(1)
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <Box textAlign="center" mb={4}>
          <Typography variant="h3" sx={{ color: 'white', fontWeight: 'bold', mb: 2 }}>
            🗺️ Mapa de Perros Callejeros
          </Typography>
          <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.8)' }}>
            Encuentra perros reportados en tu zona y ayuda en su rescate
          </Typography>
        </Box>

        {/* Filtros */}
        <Card sx={{ 
          backgroundColor: 'rgba(255,255,255,0.1)', 
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.2)',
          mb: 3
        }}>
          <CardContent>
            <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
              <FilterList sx={{ mr: 1 }} />
              Filtros de Búsqueda
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel sx={{ color: 'white' }}>Urgencia</InputLabel>
                  <Select
                    value={filters.urgency}
                    onChange={(e) => handleFilterChange('urgency', e.target.value)}
                    sx={{ 
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      color: 'white',
                      '& .MuiSvgIcon-root': { color: 'white' }
                    }}
                  >
                    <MenuItem value="all">Todas</MenuItem>
                    <MenuItem value="low">Baja</MenuItem>
                    <MenuItem value="normal">Normal</MenuItem>
                    <MenuItem value="high">Alta</MenuItem>
                    <MenuItem value="emergency">Emergencia</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel sx={{ color: 'white' }}>Condición</InputLabel>
                  <Select
                    value={filters.condition}
                    onChange={(e) => handleFilterChange('condition', e.target.value)}
                    sx={{ 
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      color: 'white',
                      '& .MuiSvgIcon-root': { color: 'white' }
                    }}
                  >
                    <MenuItem value="all">Todas</MenuItem>
                    <MenuItem value="stray">Callejero</MenuItem>
                    <MenuItem value="lost">Perdido</MenuItem>
                    <MenuItem value="abandoned">Abandonado</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel sx={{ color: 'white' }}>Tamaño</InputLabel>
                  <Select
                    value={filters.size}
                    onChange={(e) => handleFilterChange('size', e.target.value)}
                    sx={{ 
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      color: 'white',
                      '& .MuiSvgIcon-root': { color: 'white' }
                    }}
                  >
                    <MenuItem value="all">Todos</MenuItem>
                    <MenuItem value="small">Pequeño</MenuItem>
                    <MenuItem value="medium">Mediano</MenuItem>
                    <MenuItem value="large">Grande</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={filters.showOnlyRecent}
                      onChange={(e) => handleFilterChange('showOnlyRecent', e.target.checked)}
                      sx={{ 
                        '& .MuiSwitch-switchBase.Mui-checked': { color: '#4CAF50' },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#4CAF50' }
                      }}
                    />
                  }
                  label={<Typography sx={{ color: 'white' }}>Solo últimas 24h</Typography>}
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <Alert severity="info" sx={{ backgroundColor: 'rgba(33, 150, 243, 0.1)' }}>
                  <Typography variant="body2" sx={{ color: 'white' }}>
                    {filteredReports.length} perros encontrados
                  </Typography>
                </Alert>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Mapa Simulado y Lista de Reportes */}
        <Grid container spacing={3}>
          {/* Mapa */}
          <Grid item xs={12} md={8}>
            <Card sx={{ 
              backgroundColor: 'rgba(255,255,255,0.1)', 
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.2)',
              height: '600px'
            }}>
              <CardContent sx={{ height: '100%', p: 0 }}>
                <Box
                  sx={{
                    height: '100%',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    position: 'relative',
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column'
                  }}
                >
                  <Typography variant="h4" sx={{ color: 'white', mb: 2 }}>
                    🗺️ Mapa Interactivo
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)', textAlign: 'center', mb: 3 }}>
                    Aquí se mostraría un mapa real con Google Maps o Leaflet<br />
                    mostrando la ubicación de todos los perros reportados
                  </Typography>
                  
                  {/* Simulación de marcadores */}
                  {filteredReports.map((report, index) => (
                    <Fab
                      key={report.id}
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: `${20 + index * 15}%`,
                        left: `${30 + index * 20}%`,
                        backgroundColor: urgencyColors[report.urgency],
                        color: 'white',
                        '&:hover': {
                          backgroundColor: urgencyColors[report.urgency],
                          transform: 'scale(1.1)'
                        }
                      }}
                      onClick={() => setSelectedReport(report)}
                    >
                      <Pets />
                    </Fab>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Lista de Reportes */}
          <Grid item xs={12} md={4}>
            <Box sx={{ maxHeight: '600px', overflowY: 'auto' }}>
              {filteredReports.map((report) => (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Card
                    sx={{
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      mb: 2,
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        transform: 'translateY(-2px)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                    onClick={() => setSelectedReport(report)}
                  >
                    <CardContent>
                      <Box display="flex" alignItems="center" mb={2}>
                        <Avatar
                          src={report.photo}
                          sx={{ width: 50, height: 50, mr: 2 }}
                        >
                          <Pets />
                        </Avatar>
                        <Box flex={1}>
                          <Typography variant="h6" sx={{ color: 'white' }}>
                            {report.breed}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                            {getDistanceFromUser(report.latitude, report.longitude)} km de distancia
                          </Typography>
                        </Box>
                        <Chip
                          label={report.urgency}
                          size="small"
                          sx={{
                            backgroundColor: urgencyColors[report.urgency],
                            color: 'white'
                          }}
                        />
                      </Box>

                      <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                        <Chip
                          label={conditionLabels[report.condition]}
                          size="small"
                          sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
                        />
                        <Chip
                          label={sizeLabels[report.size]}
                          size="small"
                          sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
                        />
                        <Chip
                          label={report.temperament}
                          size="small"
                          sx={{
                            backgroundColor: temperamentColors[report.temperament],
                            color: 'white'
                          }}
                        />
                      </Box>

                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 1 }}>
                        <LocationOn sx={{ fontSize: 16, mr: 0.5 }} />
                        {report.address}
                      </Typography>

                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                        <AccessTime sx={{ fontSize: 14, mr: 0.5 }} />
                        Reportado: {formatDate(report.createdAt)}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </Box>
          </Grid>
        </Grid>

        {/* Dialog de Detalles */}
        <Dialog
          open={!!selectedReport}
          onClose={() => setSelectedReport(null)}
          maxWidth="md"
          fullWidth
        >
          {selectedReport && (
            <>
              <DialogTitle sx={{ backgroundColor: '#1976d2', color: 'white' }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Typography variant="h6">
                    Detalles del Reporte - {selectedReport.breed}
                  </Typography>
                  <Button
                    onClick={() => setSelectedReport(null)}
                    sx={{ color: 'white', minWidth: 'auto' }}
                  >
                    <Close />
                  </Button>
                </Box>
              </DialogTitle>
              
              <DialogContent sx={{ backgroundColor: '#f5f5f5' }}>
                <Grid container spacing={3} sx={{ mt: 1 }}>
                  <Grid item xs={12} md={6}>
                    <img
                      src={selectedReport.photo}
                      alt="Perro reportado"
                      style={{
                        width: '100%',
                        height: '300px',
                        objectFit: 'cover',
                        borderRadius: '8px'
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>
                      Información del Perro
                    </Typography>
                    
                    <Box mb={2}>
                      <Typography variant="body2" color="textSecondary">Raza:</Typography>
                      <Typography variant="body1">{selectedReport.breed}</Typography>
                    </Box>
                    
                    <Box mb={2}>
                      <Typography variant="body2" color="textSecondary">Tamaño:</Typography>
                      <Typography variant="body1">{sizeLabels[selectedReport.size]}</Typography>
                    </Box>
                    
                    <Box mb={2}>
                      <Typography variant="body2" color="textSecondary">Colores:</Typography>
                      <Typography variant="body1">{selectedReport.colors ? selectedReport.colors.join(', ') : 'No especificado'}</Typography>
                    </Box>
                    
                    <Box mb={2}>
                      <Typography variant="body2" color="textSecondary">Temperamento:</Typography>
                      <Chip
                        label={selectedReport.temperament}
                        size="small"
                        sx={{
                          backgroundColor: temperamentColors[selectedReport.temperament],
                          color: 'white'
                        }}
                      />
                    </Box>
                    
                    <Box mb={2}>
                      <Typography variant="body2" color="textSecondary">Condición:</Typography>
                      <Typography variant="body1">{conditionLabels[selectedReport.condition]}</Typography>
                    </Box>
                    
                    <Box mb={2}>
                      <Typography variant="body2" color="textSecondary">Urgencia:</Typography>
                      <Chip
                        label={selectedReport.urgency}
                        size="small"
                        sx={{
                          backgroundColor: urgencyColors[selectedReport.urgency],
                          color: 'white'
                        }}
                      />
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      Ubicación
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      <LocationOn sx={{ mr: 1 }} />
                      {selectedReport.address}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Coordenadas: {selectedReport.latitude}, {selectedReport.longitude}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      Descripción
                    </Typography>
                    <Typography variant="body1">
                      {selectedReport.description}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      Información del Reportante
                    </Typography>
                    <Typography variant="body1">
                      <strong>Nombre:</strong> {selectedReport.reporterName}
                    </Typography>
                    <Typography variant="body1">
                      <Phone sx={{ mr: 1 }} />
                      {selectedReport.reporterPhone}
                    </Typography>
                    <Typography variant="body1">
                      <Email sx={{ mr: 1 }} />
                      {selectedReport.reporterEmail}
                    </Typography>
                  </Grid>
                </Grid>
              </DialogContent>
              
              <DialogActions sx={{ backgroundColor: '#f5f5f5' }}>
                <Button
                  href={`tel:${selectedReport.reporterPhone}`}
                  startIcon={<Phone />}
                  variant="contained"
                  color="primary"
                >
                  Llamar
                </Button>
                <Button
                  href={`mailto:${selectedReport.reporterEmail}`}
                  startIcon={<Email />}
                  variant="outlined"
                >
                  Email
                </Button>
                <Button
                  href={`https://maps.google.com/?q=${selectedReport.latitude},${selectedReport.longitude}`}
                  target="_blank"
                  startIcon={<LocationOn />}
                  variant="outlined"
                >
                  Ver en Mapa
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      </motion.div>
    </Container>
  )
}

export default MapPage
