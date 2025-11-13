import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Container, Alert, CircularProgress, Box, Button } from '@mui/material'
import { ArrowBack } from '@mui/icons-material'
import { motion } from 'framer-motion'
import axios from 'axios'
import PetCard from '../components/PetCard'
import { getApiUrl } from '../utils/urls'

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
        /* Ocultar navbar y elementos de navegación */
        nav,
        .MuiAppBar-root,
        .MuiBottomNavigation-root,
        .MuiFab-root,
        [class*="navbar"],
        [class*="bottom-nav"],
        [class*="bottomnav"],
        [class*="fab"],
        [class*="reportfab"] {
          display: none !important;
        }

        /* Ocultar botón Volver y otros botones */
        .MuiButton-root,
        .no-print,
        button {
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

        /* Ocultar scrollbars y indicadores */
        .animate-bounce,
        .scroll-indicator,
        [class*="scroll"] {
          display: none !important;
        }

        /* Asegurar que los colores se impriman */
        * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          color-adjust: exact !important;
        }

        /* Body y html sin márgenes extra */
        body, html {
          margin: 0 !important;
          padding: 0 !important;
          background: white !important;
        }

        /* Ocultar cualquier overlay o modal */
        .MuiModal-root,
        .MuiBackdrop-root {
          display: none !important;
        }
      }
    `
    document.head.appendChild(style)
    return () => document.head.removeChild(style)
  }, [])

  useEffect(() => {
    const fetchPetData = async () => {
      try {
        const response = await axios.get(getApiUrl(`/pet/${cui}`))
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
            className="no-print"
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
