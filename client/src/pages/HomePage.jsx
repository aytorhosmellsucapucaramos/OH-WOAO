import React from 'react'
import { Container, Typography, Button, Box, Grid, Card, CardContent } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { Pets, QrCode, Search, Security } from '@mui/icons-material'
import { motion } from 'framer-motion'

const HomePage = () => {
  const navigate = useNavigate()

  const features = [
    {
      icon: <Pets sx={{ fontSize: 40, color: '#2196f3' }} />,
      title: 'Registro Fácil',
      description: 'Registra tu mascota de forma rápida y sencilla con toda la información necesaria.'
    },
    {
      icon: <QrCode sx={{ fontSize: 40, color: '#ff9800' }} />,
      title: 'Carnet Digital',
      description: 'Genera automáticamente un carnet digital con código QR único para tu mascota.'
    },
    {
      icon: <Search sx={{ fontSize: 40, color: '#4caf50' }} />,
      title: 'Búsqueda Rápida',
      description: 'Encuentra información de mascotas usando DNI del adoptante o código CUI.'
    },
    {
      icon: <Security sx={{ fontSize: 40, color: '#9c27b0' }} />,
      title: 'Seguro y Confiable',
      description: 'Sistema seguro que protege la información de tus mascotas y adoptantes.'
    }
  ]

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <Box textAlign="center" sx={{ mb: 6 }}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Pets sx={{ fontSize: 80, color: 'white', mb: 2 }} />
          </motion.div>
          
          <Typography 
            variant="h2" 
            component="h1" 
            gutterBottom 
            sx={{ 
              color: 'white', 
              fontWeight: 700,
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
              mb: 2
            }}
          >
            WebPerritos
          </Typography>
          
          <Typography 
            variant="h5" 
            sx={{ 
              color: 'rgba(255,255,255,0.9)', 
              mb: 4,
              textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
            }}
          >
            Sistema Municipal de Registro de Mascotas
          </Typography>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <Typography 
              variant="body1" 
              sx={{ 
                color: 'rgba(255,255,255,0.8)', 
                mb: 4,
                maxWidth: 600,
                mx: 'auto'
              }}
            >
              Registra tu mascota adoptada y obtén un carnet digital con código QR único. 
              Sistema oficial para el control y seguimiento de adopciones municipales.
            </Typography>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="floating-action"
          >
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/register')}
              sx={{
                background: 'linear-gradient(45deg, #ff9800 30%, #ffb74d 90%)',
                color: 'white',
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 600,
                boxShadow: '0 4px 15px rgba(255, 152, 0, 0.4)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #f57c00 30%, #ff9800 90%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(255, 152, 0, 0.6)',
                },
                transition: 'all 0.3s ease'
              }}
            >
              Registrar Mascota
            </Button>
          </motion.div>
        </Box>
      </motion.div>

      {/* Features Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.9 }}
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
          Características del Sistema
        </Typography>
        
        <Grid container spacing={3}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1 + index * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <Card 
                  className="pet-card"
                  sx={{ 
                    height: '100%',
                    background: 'rgba(255,255,255,0.95)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)'
                  }}
                >
                  <CardContent sx={{ textAlign: 'center', p: 3 }}>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.5, delay: 1.2 + index * 0.1 }}
                    >
                      {feature.icon}
                    </motion.div>
                    <Typography variant="h6" sx={{ mt: 2, mb: 1, fontWeight: 600 }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </motion.div>

      {/* Call to Action */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 1.5 }}
      >
        <Box 
          textAlign="center" 
          sx={{ 
            mt: 6,
            p: 4,
            background: 'rgba(255,255,255,0.1)',
            borderRadius: 3,
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)'
          }}
        >
          <Typography 
            variant="h5" 
            sx={{ 
              color: 'white', 
              mb: 2, 
              fontWeight: 600 
            }}
          >
            ¿Ya tienes una mascota registrada?
          </Typography>
          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate('/search')}
            sx={{
              color: 'white',
              borderColor: 'white',
              px: 3,
              py: 1,
              '&:hover': {
                borderColor: 'white',
                backgroundColor: 'rgba(255,255,255,0.1)',
                transform: 'translateY(-2px)',
              },
              transition: 'all 0.3s ease'
            }}
          >
            Buscar Mascota
          </Button>
        </Box>
      </motion.div>
    </Container>
  )
}

export default HomePage
