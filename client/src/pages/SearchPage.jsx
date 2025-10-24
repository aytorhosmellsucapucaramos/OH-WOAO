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
    <Container maxWidth="md" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header con logos simétricos */}
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 3, mb: 4 }}>
          <Typography
            variant="h4"
            textAlign="center"
            sx={{
              color: '#1e293b',
              fontWeight: 700,
              letterSpacing: '-0.5px',
              minWidth: '280px'
            }}
          >
            Buscar Mascota
          </Typography>
        </Box>

        <Card
          sx={{
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            mb: 3
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <form onSubmit={handleSearch}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Search sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Buscar por DNI o Código CUI
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <TextField
                  fullWidth
                  label="Ingrese DNI del adoptante o CUI de la mascota"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Ej: 12345678 o 43451826-7"
                  required
                />
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  sx={{
                    minWidth: 120,
                    background: '#2563eb',
                    textTransform: 'none',
                    boxShadow: 'none',
                    '&:hover': {
                      background: '#1d4ed8',
                      boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)',
                    }
                  }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Buscar'}
                </Button>
              </Box>

              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}
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
            <Typography
              variant="h6"
              sx={{
                color: '#1e293b',
                mb: 2,
                fontWeight: 600
              }}
            >
              Resultados de la Búsqueda ({searchResults.length})
            </Typography>

            <Grid container spacing={3}>
              {searchResults.map((pet, index) => (
                <Grid item xs={12} key={pet.cui}>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card
                      className="pet-card"
                      sx={{
                        background: '#ffffff',
                        border: '1px solid #e5e7eb',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          boxShadow: '0 8px 25px rgba(37, 99, 235, 0.15)',
                          transform: 'translateY(-2px)'
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
  )
}

export default SearchPage
