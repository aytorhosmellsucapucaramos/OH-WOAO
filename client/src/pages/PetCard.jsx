import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import {
  Container, Typography, Card, CardContent, Box, Avatar, Grid,
  Chip, CircularProgress, Alert, Button
} from '@mui/material'
import { Pets, Person, Phone, LocationOn, CalendarToday, Print } from '@mui/icons-material'
import { QRCodeSVG } from 'qrcode.react'
import { motion } from 'framer-motion'
import axios from 'axios'

const PetCard = () => {
  const { cui } = useParams()
  const [petData, setPetData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchPetData = async () => {
      try {
        const response = await axios.get(`/api/pet/${cui}`)
        setPetData(response.data)
      } catch (err) {
        setError('No se encontró la mascota con el CUI proporcionado')
      } finally {
        setLoading(false)
      }
    }

    fetchPetData()
  }, [cui])

  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress size={60} sx={{ color: 'white' }} />
        <Typography variant="h6" sx={{ color: 'white', mt: 2 }}>
          Cargando carnet digital...
        </Typography>
      </Container>
    )
  }

  if (error) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    )
  }

  const qrData = JSON.stringify({
    cui: petData.cui,
    petName: `${petData.pet_name} ${petData.pet_last_name || ''}`.trim(),
    species: petData.species,
    breed: petData.breed,
    adoptionDate: petData.adoption_date,
    adopter: `${petData.adopter_name} ${petData.adopter_last_name}`,
    dni: petData.dni,
    phone: petData.phone,
    address: `${petData.address}, ${petData.district}, ${petData.province}, ${petData.department}`
  })

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
      >
        <Box textAlign="center" sx={{ mb: 3 }}>
          <Button
            variant="outlined"
            startIcon={<Print />}
            onClick={handlePrint}
            sx={{
              color: 'white',
              borderColor: 'white',
              '&:hover': {
                borderColor: 'white',
                backgroundColor: 'rgba(255,255,255,0.1)',
              }
            }}
          >
            Imprimir Carnet
          </Button>
        </Box>

        <Card 
          sx={{ 
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
            border: '3px solid #2196f3',
            borderRadius: 3,
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
          }}
        >
          {/* Header */}
          <Box 
            sx={{ 
              background: 'linear-gradient(45deg, #2196f3 30%, #64b5f6 90%)',
              color: 'white',
              p: 2,
              textAlign: 'center'
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              CARNET DIGITAL DE MASCOTA
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Sistema Municipal de Registro
            </Typography>
          </Box>

          <CardContent sx={{ p: 3 }}>
            <Grid container spacing={3}>
              {/* Pet Photo and Basic Info */}
              <Grid item xs={12} sm={4}>
                <Box textAlign="center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                  >
                    <Avatar
                      src={petData.photo_path ? `/api/uploads/${petData.photo_path}` : undefined}
                      sx={{ 
                        width: 120, 
                        height: 120, 
                        mx: 'auto', 
                        mb: 2,
                        border: '4px solid #2196f3',
                        boxShadow: '0 4px 15px rgba(33, 150, 243, 0.3)'
                      }}
                    >
                      <Pets sx={{ fontSize: 60 }} />
                    </Avatar>
                  </motion.div>
                  
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#1976d2' }}>
                    {petData.pet_name} {petData.pet_last_name}
                  </Typography>
                  
                  <Box sx={{ mt: 1 }}>
                    <Chip 
                      label={petData.species} 
                      color="primary" 
                      size="small" 
                      sx={{ mr: 0.5 }} 
                    />
                    <Chip 
                      label={petData.breed} 
                      variant="outlined" 
                      size="small" 
                    />
                  </Box>
                </Box>
              </Grid>

              {/* Pet and Adopter Details */}
              <Grid item xs={12} sm={8}>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1976d2', mb: 1 }}>
                      <Pets sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Información de la Mascota
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      <strong>CUI:</strong> {petData.cui}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      <strong>Fecha de Adopción:</strong> {new Date(petData.adoption_date).toLocaleDateString('es-PE')}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1976d2', mb: 1 }}>
                      <Person sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Información del Adoptante
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      <strong>Nombre:</strong> {petData.adopter_name} {petData.adopter_last_name}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      <strong>DNI:</strong> {petData.dni}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      <Phone sx={{ mr: 0.5, fontSize: 16, verticalAlign: 'middle' }} />
                      {petData.phone}
                    </Typography>
                    <Typography variant="body2">
                      <LocationOn sx={{ mr: 0.5, fontSize: 16, verticalAlign: 'middle' }} />
                      {petData.address}, {petData.district}, {petData.province}, {petData.department}
                    </Typography>
                  </Box>
                </motion.div>
              </Grid>

              {/* QR Code */}
              <Grid item xs={12}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                >
                  <Box 
                    sx={{ 
                      textAlign: 'center',
                      p: 2,
                      background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                      borderRadius: 2,
                      border: '2px dashed #2196f3'
                    }}
                  >
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: '#1976d2' }}>
                      <QrCode sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Código QR - Información Completa
                    </Typography>
                    <QRCodeSVG
                      value={qrData}
                      size={150}
                      bgColor="#ffffff"
                      fgColor="#1976d2"
                      level="M"
                      includeMargin={true}
                    />
                    <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
                      Escanea para ver toda la información
                    </Typography>
                  </Box>
                </motion.div>
              </Grid>
            </Grid>
          </CardContent>

          {/* Footer */}
          <Box 
            sx={{ 
              background: 'linear-gradient(45deg, #2196f3 30%, #64b5f6 90%)',
              color: 'white',
              p: 1,
              textAlign: 'center'
            }}
          >
            <Typography variant="caption">
              WebPerritos - Sistema Municipal de Registro • CUI: {petData.cui}
            </Typography>
          </Box>
        </Card>
      </motion.div>
    </Container>
  )
}

export default PetCard
