import React, { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import {
  Container, Typography, Box, Card, CardContent, Chip, Avatar,
  FormControl, InputLabel, Select, MenuItem, Switch, FormControlLabel,
  Paper, Grid, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  Alert, CircularProgress
} from '@mui/material'
import {
  LocationOn, Pets, FilterList, Visibility, Phone, Email,
  Warning, AccessTime, Info, Close, MyLocation
} from '@mui/icons-material'
import { motion } from 'framer-motion'
import axios from 'axios'

// Fix for default markers in React Leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Component to recenter map with zoom
function MapRecenter({ center, zoom }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, zoom || map.getZoom())
  }, [center, zoom, map])
  return null
}

const MapPageLeaflet = () => {
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
  const [mapCenter, setMapCenter] = useState([-15.8402, -70.0219]) // Puno, Peru
  const [mapZoom, setMapZoom] = useState(14)
  const [userLocation, setUserLocation] = useState(null)

  // Simulación de datos (en producción vendría de la API)
  const mockReports = [
    {
      id: 1,
      reporterName: 'María González',
      reporterPhone: '+51 987654321',
      reporterEmail: 'maria@email.com',
      latitude: -15.8402,
      longitude: -70.0219,
      address: 'Jr. Lima 123, Puno',
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
      latitude: -15.8380,
      longitude: -70.0250,
      address: 'Av. El Sol 456, Puno',
      breed: 'Labrador',
      size: 'large',
      colors: ['dorado'],
      temperament: 'shy',
      condition: 'lost',
      urgency: 'high',
      description: 'Perro grande con collar, parece estar perdido',
      photo: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=300',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      status: 'active'
    },
    {
      id: 3,
      reporterName: 'Ana Torres',
      reporterPhone: '+51 998877665',
      reporterEmail: 'ana@email.com',
      latitude: -15.8420,
      longitude: -70.0180,
      address: 'Jr. Puno 789, Puno',
      breed: 'Chihuahua',
      size: 'small',
      colors: ['negro'],
      temperament: 'scared',
      condition: 'abandoned',
      urgency: 'emergency',
      description: 'Cachorro muy pequeño, necesita atención veterinaria urgente',
      photo: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=300',
      createdAt: new Date(Date.now() - 172800000).toISOString(),
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

  // Custom circular icon for different urgency levels
  const createCustomIcon = (urgency) => {
    const color = urgencyColors[urgency] || '#FF9800'
    const html = `
      <div style="
        background-color: ${color};
        width: 30px;
        height: 30px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <span style="color: white; font-size: 16px;">🐕</span>
      </div>
    `
    return L.divIcon({
      html: html,
      className: 'custom-circular-marker',
      iconSize: [30, 30],
      iconAnchor: [15, 15],
      popupAnchor: [0, -15]
    })
  }

  useEffect(() => {
    loadStrayReports()
    getUserLocation()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [strayReports, filters])

  const getUserLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setUserLocation([latitude, longitude])
          setMapCenter([latitude, longitude])
        },
        (error) => {
          console.log('Error getting location:', error)
          // Keep default location (Puno)
        }
      )
    }
  }

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
      setStrayReports(mockReports)
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
    if (!userLocation) return 'N/A'
    
    const R = 6371 // Radio de la Tierra en km
    const dLat = (lat - userLocation[0]) * Math.PI / 180
    const dLng = (lng - userLocation[1]) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(userLocation[0] * Math.PI / 180) * Math.cos(lat * Math.PI / 180) *
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

        {/* Mapa con Leaflet y Lista de Reportes */}
        <Grid container spacing={3}>
          {/* Mapa Leaflet */}
          <Grid item xs={12} md={8}>
            <Card sx={{ 
              backgroundColor: 'rgba(255,255,255,0.98)', 
              height: '600px',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <CardContent sx={{ height: '100%', p: 0 }}>
                {loading ? (
                  <Box display="flex" alignItems="center" justifyContent="center" height="100%">
                    <CircularProgress />
                  </Box>
                ) : (
                  <MapContainer 
                    center={mapCenter} 
                    zoom={mapZoom} 
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <MapRecenter center={mapCenter} zoom={mapZoom} />
                    
                    {/* User location marker */}
                    {userLocation && (
                      <Marker position={userLocation}>
                        <Popup>
                          <Typography variant="body2">
                            <MyLocation sx={{ mr: 1 }} />
                            Tu ubicación actual
                          </Typography>
                        </Popup>
                      </Marker>
                    )}
                    
                    {/* Stray dog markers */}
                    {filteredReports.map((report) => (
                      <Marker
                        key={report.id}
                        position={[report.latitude, report.longitude]}
                        icon={createCustomIcon(report.urgency)}
                        eventHandlers={{
                          click: () => {
                            setSelectedReport(report)
                            setMapCenter([report.latitude, report.longitude])
                            setMapZoom(18) // Zoom even closer when clicking the marker
                          }
                        }}
                      >
                        <Popup>
                          <Box sx={{ minWidth: 200 }}>
                            <Typography variant="subtitle2" fontWeight="bold">
                              {report.breed}
                            </Typography>
                            <Chip
                              label={report.urgency}
                              size="small"
                              sx={{
                                backgroundColor: urgencyColors[report.urgency],
                                color: 'white',
                                mb: 1
                              }}
                            />
                            <Typography variant="body2">
                              <LocationOn fontSize="small" /> {report.address}
                            </Typography>
                          </Box>
                        </Popup>
                      </Marker>
                    ))}
                  </MapContainer>
                )}
              </CardContent>
              
              {/* Button to center map on user location */}
              {userLocation && (
                <Button
                  variant="contained"
                  sx={{
                    position: 'absolute',
                    bottom: 20,
                    right: 20,
                    zIndex: 1000,
                    backgroundColor: 'white',
                    color: 'primary.main',
                    '&:hover': {
                      backgroundColor: '#f5f5f5'
                    }
                  }}
                  onClick={() => {
                    setMapCenter(userLocation)
                    setMapZoom(15) // Reset to default zoom for user location
                  }}
                  startIcon={<MyLocation />}
                >
                  Mi ubicación
                </Button>
              )}
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
                    onClick={() => {
                      // Center the map and zoom in closer
                      setMapCenter([report.latitude, report.longitude])
                      setMapZoom(17) // Zoom in closer to see the dog
                    }}
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
                      <Typography variant="body1">
                        {selectedReport.colors ? selectedReport.colors.join(', ') : 'No especificado'}
                      </Typography>
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
                  Ver en Google Maps
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      </motion.div>
    </Container>
  )
}

export default MapPageLeaflet
