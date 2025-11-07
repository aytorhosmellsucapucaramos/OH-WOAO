import React, { useState } from 'react'
import {
  Container, Typography, Card, CardContent, TextField, Button,
  Box, Grid, Avatar, Chip, Alert, CircularProgress
} from '@mui/material'
import { Search, Pets, Person } from '@mui/icons-material'
import { motion } from 'framer-motion'
import axios from 'axios'

const SearchPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchTerm.trim()) return

    setLoading(true)
    setError('')

    try {
      const response = await axios.get(`/api/search?q=${encodeURIComponent(searchTerm)}`)
      const results = response.data.success ? response.data.data : []
      setSearchResults(results)
      if (results.length === 0) {
        setError('No se encontraron mascotas con ese DNI o CUI')
      }
    } catch (err) {
      console.error('Search error:', err)
      setError('Error al buscar mascotas')
    } finally {
      setLoading(false)
    }
  }


  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
        pt: { xs: 10, sm: 11, md: 12 }, // Padding top para evitar el navbar
        pb: { xs: 10, md: 4 } // Padding bottom para el BottomNav en móvil
      }}
    >
      <Container maxWidth="lg">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header mejorado */}
          <Box 
            sx={{ 
              textAlign: 'center',
              mb: { xs: 4, md: 5 }
            }}
          >
            {/*<Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: { xs: 60, md: 70 },
                height: { xs: 60, md: 70 },
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                boxShadow: '0 8px 24px rgba(37, 99, 235, 0.3)',
                mb: 2
              }}
            >
               <Search sx={{ fontSize: { xs: 30, md: 36 }, color: 'white' }} />
            </Box>*/}
            <Typography
              variant="h3"
              sx={{
                color: '#1e293b',
                fontWeight: 800,
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                mb: 1.5,
                background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              Buscar Mascota
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: '#64748b',
                fontWeight: 500,
                fontSize: { xs: '1rem', md: '1.1rem' },
                maxWidth: '600px',
                mx: 'auto'
              }}
            >
              Busca mascotas registradas por DNI del propietario o CUI de la mascota
            </Typography>
          </Box>

        <Card
          elevation={0}
          sx={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(226, 232, 240, 0.5)',
            boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
            borderRadius: 3,
            mb: 4,
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: '0 15px 50px rgba(0,0,0,0.1)'
            }
          }}
        >
          <CardContent sx={{ p: { xs: 3, sm: 4, md: 5 } }}>
            <form onSubmit={handleSearch}>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 600,
                  color: '#1e293b',
                  mb: 3,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <Search sx={{ color: '#3b82f6' }} />
                Ingresa los datos de búsqueda
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 2 }}>
                <TextField
                  fullWidth
                  label="DNI del propietario o CUI de la mascota"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Ej: 12345678 o 43451826-7"
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: '#3b82f6'
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#2563eb',
                        borderWidth: 2
                      }
                    }
                  }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  size="large"
                  sx={{
                    minWidth: { xs: '100%', sm: 140 },
                    height: 56,
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    textTransform: 'none',
                    fontSize: '1rem',
                    fontWeight: 600,
                    boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                      boxShadow: '0 6px 20px rgba(37, 99, 235, 0.5)',
                      transform: 'translateY(-2px)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Buscar'}
                </Button>
              </Box>

              {error && (
                <Alert 
                  severity="info" 
                  sx={{ 
                    mt: 2,
                    borderRadius: 2,
                    backgroundColor: 'rgba(239, 246, 255, 0.8)',
                    border: '1px solid rgba(147, 197, 253, 0.3)'
                  }}
                >
                  {error}
                </Alert>
              )}
              
              <Box
                sx={{
                  mt: 3,
                  p: 2,
                  background: 'rgba(241, 245, 249, 0.8)',
                  borderRadius: 2,
                  border: '1px solid #e2e8f0'
                }}
              >
                <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.875rem' }}>
                  <strong>💡 Tip:</strong> Puedes buscar usando el DNI completo del propietario (8 dígitos) o el código CUI de la mascota (formato: XXXXXXXX-X)
                </Typography>
              </Box>
            </form>
          </CardContent>
        </Card>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 3,
                p: 2,
                background: 'rgba(34, 197, 94, 0.1)',
                borderRadius: 2,
                border: '1px solid rgba(34, 197, 94, 0.2)'
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  color: '#1e293b',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <Pets sx={{ color: '#22c55e' }} />
                Resultados Encontrados
              </Typography>
              <Chip 
                label={`${searchResults.length} ${searchResults.length === 1 ? 'mascota' : 'mascotas'}`}
                sx={{
                  background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '0.9rem'
                }}
              />
            </Box>

            <Grid container spacing={3}>
              {searchResults.map((pet, index) => (
                <Grid item xs={12} key={pet.cui}>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card
                      elevation={0}
                      sx={{
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(226, 232, 240, 0.8)',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                        borderRadius: 3,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          boxShadow: '0 12px 35px rgba(37, 99, 235, 0.15)',
                          transform: 'translateY(-4px)',
                          borderColor: 'rgba(59, 130, 246, 0.3)'
                        }
                      }}
                    >
                      <CardContent sx={{ p: 3 }}>
                        <Grid container spacing={3} sx={{ alignItems: 'center' }}>
                          <Grid item xs={12} sm={3}>
                            <Avatar
                              src={pet.photo_frontal_path ? `http://localhost:5000/api/uploads/${pet.photo_frontal_path}` : undefined}
                              sx={{
                                width: 150,
                                height: 150,
                                mx: 'auto',
                                border: '3px solid #2196f3'
                              }}
                            >
                              <Pets sx={{ fontSize: 50 }} />
                            </Avatar>
                          </Grid>

                          {/* Información de la Mascota */}
                          <Grid item xs={12} sm={4.5}>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#1976d2' }}>
                              🐕 Información de la Mascota
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 500, mb: 1, textTransform: 'uppercase' }}>
                            <strong>Nombre:</strong> {pet.pet_name} {pet.sex === 'male' ? '♂️' : pet.sex === 'female' ? '♀️' : ''}
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                              <strong>Raza:</strong> {pet.breed_name || pet.breed || 'N/A'}
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 0.5 }}>
                              <strong>🎨 Color:</strong> {pet.color_name || pet.color || 'N/A'}
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 0.5 }}>
                              <strong>📅 Edad:</strong> {pet.age} meses
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 0.5 }}>
                              <strong>📏 Tamaño:</strong> {pet.size_name || pet.size || 'N/A'}
                            </Typography>
                          </Grid>

                          {/* Información del Propietario */}
                          <Grid item xs={12} sm={4.5}>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#388e3c' }}>
                              👤 Información del Propietario
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                              <strong>Nombres:</strong> {pet.owner_first_name} {pet.owner_last_name}
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 0.5 }}>
                              <strong>📞 Teléfono:</strong> {pet.owner_phone}
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 0.5 }}>
                              <strong>📧 Email:</strong> {pet.owner_email}
                            </Typography>
                            <Typography variant="body2" >
                              <strong>📍 Dirección:</strong> {pet.owner_address}
                            </Typography>
                            <Typography variant="body2" >
                              <strong>🆔 DNI:</strong> {pet.owner_dni}
                            </Typography>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </motion.div>
        )}
        </motion.div>
      </Container>
    </Box>
  )
}

export default SearchPage
