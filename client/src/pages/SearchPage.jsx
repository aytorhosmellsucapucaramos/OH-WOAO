import React, { useState } from 'react'
import {
  Container, Typography, Card, CardContent, TextField, Button,
  Box, Grid, Avatar, Chip, Alert, CircularProgress
} from '@mui/material'
import { Search, Pets, Person, QrCode } from '@mui/icons-material'
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
      setSearchResults(response.data)
      if (response.data.length === 0) {
        setError('No se encontraron mascotas con ese DNI o CUI')
      }
    } catch (err) {
      setError('Error al buscar mascotas')
    } finally {
      setLoading(false)
    }
  }

  const handleViewCard = (cui) => {
    window.open(`/pet/${cui}`, '_blank')
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
          Buscar Mascota
        </Typography>

        <Card 
          sx={{ 
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)',
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
                    background: 'linear-gradient(45deg, #2196f3 30%, #64b5f6 90%)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #1976d2 30%, #2196f3 90%)',
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
                color: 'white', 
                mb: 2, 
                fontWeight: 600,
                textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
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
                        background: 'rgba(255,255,255,0.95)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.2)'
                      }}
                    >
                      <CardContent sx={{ p: 3 }}>
                        <Grid container spacing={3} alignItems="center">
                          <Grid item xs={12} sm={3}>
                            <Avatar
                              src={pet.photo_path ? `/api/uploads/${pet.photo_path}` : undefined}
                              sx={{ 
                                width: 80, 
                                height: 80, 
                                mx: 'auto',
                                border: '3px solid #2196f3'
                              }}
                            >
                              <Pets sx={{ fontSize: 40 }} />
                            </Avatar>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                              {pet.pet_name} {pet.pet_last_name}
                            </Typography>
                            <Box sx={{ mb: 1 }}>
                              <Chip 
                                label={pet.species} 
                                size="small" 
                                color="primary" 
                                sx={{ mr: 1 }} 
                              />
                              <Chip 
                                label={pet.breed} 
                                size="small" 
                                variant="outlined" 
                              />
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                              <strong>CUI:</strong> {pet.cui}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              <strong>Adoptante:</strong> {pet.adopter_name} {pet.adopter_last_name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              <strong>DNI:</strong> {pet.dni}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={3}>
                            <Button
                              fullWidth
                              variant="contained"
                              startIcon={<QrCode />}
                              onClick={() => handleViewCard(pet.cui)}
                              sx={{
                                background: 'linear-gradient(45deg, #ff9800 30%, #ffb74d 90%)',
                                '&:hover': {
                                  background: 'linear-gradient(45deg, #f57c00 30%, #ff9800 90%)',
                                  transform: 'translateY(-2px)',
                                },
                                transition: 'all 0.3s ease'
                              }}
                            >
                              Ver Carnet
                            </Button>
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
