import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Container, Alert, CircularProgress, Box, Button } from '@mui/material'
import { ArrowBack } from '@mui/icons-material'
import { motion } from 'framer-motion'
import axios from 'axios'
import PetCard from '../components/PetCard'

const PetCardPage = () => {
  const { cui } = useParams()
  const navigate = useNavigate()
  const [petData, setPetData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Estilos para impresión
  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      @media print {
        /* Ocultar botón Volver en impresión */
        .MuiButton-root,
        .no-print {
          display: none !important;
        }
        
        /* Container sin padding en impresión */
        .MuiContainer-root {
          padding: 0 !important;
          margin: 0 !important;
          max-width: 100% !important;
        }
        
        /* Motion div sin animaciones */
        [class*="motion"] {
          animation: none !important;
          transform: none !important;
        }
      }
    `
    document.head.appendChild(style)
    return () => document.head.removeChild(style)
  }, [])

  useEffect(() => {
    const fetchPetData = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/pet/${cui}`)
        // The server sends data in response.data.data
        if (response.data.success) {
          setPetData(response.data.data)
        } else {
          setError(response.data.error || 'Error al cargar la mascota')
        }
      } catch (error) {
        console.error('Error fetching pet data:', error)
        setError('No se pudo cargar la información de la mascota')
      } finally {
        setLoading(false)
      }
    }

    if (cui) {
      fetchPetData()
    }
  }, [cui])

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <CircularProgress size={60} sx={{ color: 'white' }} />
          </motion.div>
        </Box>
      </Container>
    )
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate(-1)}
            sx={{ color: 'white', borderColor: 'white' }}
          >
            Volver
          </Button>
        </motion.div>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 }, px: { xs: 0, sm: 2 } }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box mb={3} sx={{ px: { xs: 2, sm: 0 } }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate(-1)}
            sx={{ 
              color: 'white', 
              borderColor: 'white',
              '&:hover': {
                borderColor: 'white',
                backgroundColor: 'rgba(255,255,255,0.1)'
              }
            }}
          >
            Volver
          </Button>
        </Box>

        {petData && <PetCard petData={petData} />}
      </motion.div>
    </Container>
  )
}

export default PetCardPage
