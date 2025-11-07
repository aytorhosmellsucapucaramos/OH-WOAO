import React, { useState } from "react";
import {
  Container,
  Typography,
  Button,
  Box,
  Grid,
  Card,
  CardContent,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { PersonAdd, Description, Payment, CardGiftcard, CheckCircle, LocationOn, Gavel, Search, QrCode } from "@mui/icons-material";
import { motion } from "framer-motion";

const HomePage = () => {
  const navigate = useNavigate();

  const [hoveredCard, setHoveredCard] = useState(null);

  const registrationSteps = [
    {
      stepNumber: 1,
      title: "Crear Cuenta",
      description: "Regístrate en el sistema con tus datos personales y crea tu cuenta de usuario.",
      image: "/images/cards/dog1.svg",
    },
    {
      stepNumber: 2,
      title: "Completar Formulario",
      description: "Llena el formulario con la información de tu mascota, incluyendo datos básicos y de salud.",
      image: "/images/cards/dog2.svg",
    },
    {
      stepNumber: 3,
      title: "Realizar Pago",
      description: "El pago de la tasa municipal solo es obligatorio para canes considerados potencialmente peligrosos.",
      image: "/images/cards/dog3.svg",
    },
    {
      stepNumber: 4,
      title: "Obtener Carnet",
      description: "Recibe tu carnet digital con código QR único para identificar a tu mascota.",
      image: "/images/cards/dog4.svg",
    },
  ];

  // Valores independientes de translateY para cada tarjeta
  const cardAnimations = [
    {
      // TARJETA 1: Crear Cuenta
      initialY: 30,      // Aparece desde 30px abajo
      hoverY: -8,        // Se eleva 8px al hacer hover
      dogEmergenceY: -116 // Imagen del perro emerge 120px hacia arriba
    },
    {
      // TARJETA 2: Completar Formulario
      initialY: 40,      // Aparece desde 40px abajo (más pronunciado)
      hoverY: -10,       // Se eleva 10px al hacer hover (más que tarjeta 1)
      dogEmergenceY: -112 // Imagen del perro emerge 130px hacia arriba
    },
    {
      // TARJETA 3: Realizar Pago
      initialY: 35,      // Aparece desde 35px abajo
      hoverY: -12,       // Se eleva 12px al hacer hover (más elevación)
      dogEmergenceY: -105 // Imagen del perro emerge 125px hacia arriba
    },
    {
      // TARJETA 4: Obtener Carnet
      initialY: 45,      // Aparece desde 45px abajo (el más pronunciado)
      hoverY: -9,        // Se eleva 9px al hacer hover
      dogEmergenceY: -92 // Imagen del perro emerge 135px hacia arriba (el más alto)
    }
  ];

  return (
    <Box sx={{ minHeight: '100vh', background: '#ffffff' }}>
      {/* Subtle animated background pattern */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 0,
          pointerEvents: 'none',
          opacity: 0.03,
          background: 'radial-gradient(circle at 20% 50%, rgba(37, 99, 235, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(16, 185, 129, 0.1) 0%, transparent 50%)',
        }}
      />

      {/* Banner Hero Section - Full Width */}
      <Box
        sx={{
          width: '100vw',
          position: 'relative',
          left: '50%',
          right: '50%',
          marginLeft: '-50vw',
          marginRight: '-50vw',
          mb: 8,
          overflow: 'hidden',
          mt: { xs: 8, md: 0 }, // Agregar margen superior en móvil para no ser tapado por navbar
        }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <Box
            sx={{
              position: 'relative',
              minHeight: { xs: '550px', sm: '580px', md: '600px' }, // Aumentar altura en móvil
              display: 'flex',
              alignItems: 'center',
              background: '#e6ccc7',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                opacity: 0.03,
                background: 'radial-gradient(circle at 20% 50%, rgba(0,0,0,0.1) 0%, transparent 50%)',
                zIndex: 1,
              },
            }}
          >
            <Container 
              maxWidth="lg" 
              sx={{ 
                position: 'relative', 
                zIndex: 2,
                py: { xs: 6, md: 8 }
              }}
            >
              <Grid 
                container 
                spacing={4} 
                alignItems="center"
                sx={{
                  flexDirection: { xs: 'column-reverse', md: 'row' },
                }}
              >
                {/* Left Content - Text */}
                <Grid item xs={12} md={6}>
                  <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                    {/* Main Title con animación */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                    >
                      <Typography
                        sx={{
                          fontFamily: '"Roboto", ui-sans-serif, sans-serif',
                          fontSize: 'clamp(2.65rem, 6vw, 4rem)',
                          fontWeight: 700,
                          lineHeight: 1.15,
                          mb: 3,
                          color: '#1a1a1a',
                        }}
                      >
                        Registro Municipal de Canes
                      </Typography>
                    </motion.div>

                    {/* Subtitle */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.4 }}
                    >
                      <Typography
                        sx={{
                          fontFamily: '"Roboto", ui-sans-serif, sans-serif',
                          fontSize: 'clamp(1rem, 2vw, 1.125rem)',
                          fontWeight: 400,
                          lineHeight: 1.5,
                          mb: 4,
                          color: '#4b5563',
                        }}
                      >
                        Sistema Oficial de Identificación y Registro Canino
                        <br />
                        <Typography component="span" sx={{ fontSize: { xs: '0.9rem', md: '1.1rem' }, color: '#1a1a1a', fontWeight: 600 }}>
                          Municipalidad Provincial de Puno
                        </Typography>
                      </Typography>
                    </motion.div>

                    {/* Button */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.6 }}
                    >
                      <Button
                        variant="contained"
                        size="large"
                        onClick={() => navigate("/register")}
                        sx={{
                          background: "#4a90e2",
                          color: "white",
                          px: 3,
                          py: 1.5,
                          fontSize: '1rem',
                          fontWeight: 500,
                          borderRadius: '3rem',
                          boxShadow: 'rgba(0, 0, 0, 0.1) 0px 4px 6px -1px, rgba(0, 0, 0, 0.06) 0px 2px 4px -1px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          columnGap: '0.35rem',
                          "&:hover": {
                            background: "#3a7bc8",
                            transform: "translateY(-2px)",
                            boxShadow: 'rgba(0, 0, 0, 0.15) 0px 6px 12px -2px',
                          },
                          transition: "all 0.25s ease",
                        }}
                      >
                        Registrar Mascota
                        <Box component="i" className="bx bx-chevron-right" sx={{ fontSize: '1.5rem' }} />
                      </Button>
                    </motion.div>
                  </Box>
                </Grid>

                {/* Right Content - Image */}
                <Grid item xs={12} md={6}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ 
                      opacity: 1, 
                      scale: 1,
                      y: [0, -10, 0],
                    }}
                    transition={{ 
                      duration: 0.8, 
                      delay: 0.3,
                      y: {
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <motion.div
                        whileHover={{ scale: 1.05, rotate: 2 }}
                        transition={{ type: 'spring', stiffness: 200 }}
                        style={{
                          width: '100%',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}
                      >
                        <Box
                          sx={{
                            background: '#f4e4e1',
                            borderRadius: '50%',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            boxShadow: 'rgba(0, 0, 0, 0.15) 0px 15px 25px -5px, rgba(0, 0, 0, 0.1) 0px 10px 10px -5px',
                            overflow: 'hidden',
                            width: { xs: '280px', sm: '320px', md: '400px' },
                            height: { xs: '280px', sm: '320px', md: '400px' },
                          }}
                        >
                          <Box
                            component="img"
                            src="/images/banner/perro.webp"
                            alt="Perro"
                            sx={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              borderRadius: '50%',
                            }}
                          />
                        </Box>
                      </motion.div>
                    </Box>
                  </motion.div>
                </Grid>
              </Grid>

              {/* Logos institucionales - Desktop: lado derecho, Mobile: abajo */}
              <Box
                sx={{
                  position: 'absolute',
                  display: { xs: 'none', lg: 'grid' },
                  top: '30%',
                  right: '1.5rem',
                  justifyItems: 'center',
                  rowGap: '0.5rem',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    width: '4rem',
                    height: '1.5px',
                    transform: 'rotate(90deg)',
                    background: '#9ca3af',
                    top: '-3rem',
                  },
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    width: '4rem',
                    height: '1.5px',
                    transform: 'rotate(90deg)',
                    background: '#9ca3af',
                    bottom: '-3rem',
                  },
                }}
              >
                <motion.img
                  whileHover={{ scale: 1.2, rotate: 5 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  src="/images/logos/Logo Escudo MPP 2023-vetical_UU.png"
                  alt="Municipalidad Provincial de Puno"
                  style={{ 
                    height: '48px', 
                    width: 'auto',
                    cursor: 'pointer',
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                  }}
                />
                <motion.img
                  whileHover={{ scale: 1.2, rotate: 5 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  src="/images/logos/GMASS.png"
                  alt="GMASS"
                  style={{ 
                    height: '48px', 
                    width: 'auto',
                    cursor: 'pointer',
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                  }}
                />
                <motion.img
                  whileHover={{ scale: 1.2, rotate: -5 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  src="/images/logos/gestionambiental.png"
                  alt="Gerencia Ambiental"
                  style={{ 
                    height: '48px', 
                    width: 'auto',
                    cursor: 'pointer',
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                  }}
                />
              </Box>

              {/* Logos institucionales - Version móvil (abajo) */}
              <Box
                sx={{
                  position: 'relative',
                  display: { xs: 'flex', lg: 'none' },
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: 2,
                  mt: 4,
                  flexWrap: 'wrap',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    width: '3rem',
                    height: '1.5px',
                    background: '#9ca3af',
                    left: 'calc(50% - 150px)',
                  },
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    width: '3rem',
                    height: '1.5px',
                    background: '#9ca3af',
                    right: 'calc(50% - 150px)',
                  },
                }}
              >
                <motion.img
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  src="/images/logos/Logo Escudo MPP 2023-vetical_UU.png"
                  alt="Municipalidad Provincial de Puno"
                  style={{ 
                    height: '42px', 
                    width: 'auto',
                    cursor: 'pointer',
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                  }}
                />
                <motion.img
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  src="/images/logos/GMASS.png"
                  alt="GMASS"
                  style={{ 
                    height: '42px', 
                    width: 'auto',
                    cursor: 'pointer',
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                  }}
                />
                <motion.img
                  whileHover={{ scale: 1.1, rotate: -5 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  src="/images/logos/gestionambiental.png"
                  alt="Gerencia Ambiental"
                  style={{ 
                    height: '42px', 
                    width: 'auto',
                    cursor: 'pointer',
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                  }}
                />
              </Box>
            </Container>
          </Box>
        </motion.div>
      </Box>

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>

      {/* Requisitos para Registro Presencial */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <Card
          sx={{
            mb: 8,
            p: 4,
            background: "#f9fafb",
            borderRadius: 3,
            border: "1px solid #e5e7eb",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 4 }}>
            <QrCode sx={{ fontSize: 32, color: '#2563eb' }} />
            <Typography
              variant="h4"
              sx={{
                color: "#1a1a1a",
                fontWeight: 700,
                textAlign: "center",
                fontSize: { xs: '1.5rem', md: '2rem' },
              }}
            >
              Requisitos para Registro Presencial
            </Typography>
          </Box>

          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <CheckCircle sx={{ color: '#2563eb', fontSize: 28 }} />
                <Typography variant="body1" sx={{ color: "#4b5563", flex: 1 }}>
                  Documento de identidad del propietario
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <CheckCircle sx={{ color: '#2563eb', fontSize: 28 }} />
                <Typography variant="body1" sx={{ color: "#4b5563", flex: 1 }}>
                  Fotografía del can
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <CheckCircle sx={{ color: '#2563eb', fontSize: 28 }} />
                <Typography variant="body1" sx={{ color: "#4b5563", flex: 1 }}>
                  Tarjeta de vacunación antirrábica emitido por médico veterinario colegiado o por el Ministerio de Salud
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <LocationOn sx={{ color: '#10b981', fontSize: 28 }} />
                <Typography variant="body1" sx={{ color: "#4b5563", flex: 1 }}>
                  Puedes realizar el registro en la <strong>Sub Gerencia de gestion Ambiental y salud publica</strong>
                </Typography>
              </Box>
            </Grid>
          </Grid>

          {/* Marco Legal */}
          <Box sx={{ mt: 4, mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Description sx={{ fontSize: 24, color: '#2563eb' }} />
              <Typography 
                variant="h6" 
                sx={{ 
                  color: "#1a1a1a", 
                  fontWeight: 700,
                  fontSize: '1.25rem'
                }}
              >
                Marco Legal
              </Typography>
            </Box>
          </Box>

          {/* Ley Nacional */}
          <Box
            sx={{
              p: 3,
              background: "#eff6ff",
              borderRadius: 2,
              borderLeft: "4px solid #2563eb",
              mb: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 1 }}>
              <Gavel sx={{ color: '#2563eb', fontSize: 24, mt: 0.5 }} />
              <Typography
                variant="body1"
                sx={{ color: "#1e40af", fontWeight: 700 }}
              >
                Ley N° 27596 - Régimen Jurídico de Canes
              </Typography>
            </Box>
            <Typography
              variant="body2"
              sx={{ color: "#4b5563", lineHeight: 1.6, pl: 5 }}
            >
              Regula la crianza, adiestramiento, comercialización, tenencia y
              transferencia de canes; especialmente aquellos considerados
              potencialmente peligrosos dentro del territorio nacional; con la
              finalidad de salvaguardar la integridad, salud y tranquilidad de
              las personas.
            </Typography>
          </Box>

          {/* Ordenanza Municipal */}
          <Box
            sx={{
              p: 3,
              background: "#eff6ff",
              borderRadius: 2,
              borderLeft: "4px solid #1e40af",
              mb: 3,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 1 }}>
              <Description sx={{ color: '#1e40af', fontSize: 24, mt: 0.5 }} />
              <Typography
                variant="body1"
                sx={{ color: "#1e40af", fontWeight: 700 }}
              >
                Ordenanza Municipal Nº 223-2008-CMPP
              </Typography>
            </Box>
            <Typography
              variant="body2"
              sx={{ color: "#4b5563", lineHeight: 1.6, pl: 5 }}
            >
              Ordenanza que reglamenta la tenencia responsable de animales de compañía
              y animales domésticos en la provincia de Puno, estableciendo el registro
              obligatorio de canes y los requisitos para su empadronamiento municipal.
            </Typography>
          </Box>

          {/* Artículos Relevantes */}
          <Box>
            <Typography 
              variant="subtitle1" 
              sx={{ 
                color: "#1a1a1a", 
                fontWeight: 700,
                mb: 2,
                fontSize: '1rem'
              }}
            >
              Artículos Destacados:
            </Typography>

            <Box
              sx={{
                p: 2.5,
                background: "#f9fafb",
                borderRadius: 2,
                borderLeft: "3px solid #2563eb",
                mb: 1.5,
              }}
            >
              <Typography variant="body2" sx={{ color: "#4b5563", lineHeight: 1.6 }}>
                <strong>Art. 12 (Ley 27596):</strong> La autoridad de salud dispondrá la
                esterilización cuando las características del animal determinen un
                comportamiento de agresividad incontrolada.
              </Typography>
            </Box>

            <Box
              sx={{
                p: 2.5,
                background: "#f9fafb",
                borderRadius: 2,
                borderLeft: "3px solid #2563eb",
                mb: 1.5,
              }}
            >
              <Typography variant="body2" sx={{ color: "#4b5563", lineHeight: 1.6 }}>
                <strong>Art. 17 (Ord. 223-2008):</strong> Actualícese y amplíese el registro 
                municipal de canes en el distrito de Puno, en el cual los propietarios o 
                responsables de la crianza y tenencia de canes deberán registrar de manera 
                obligatoria a todos los canes que tuvieren a cargo y los considerados 
                potencialmente peligrosos, en los respectivos registros, a fin de obtener 
                el correspondiente carnet y código de identificación.
              </Typography>
            </Box>

            <Box
              sx={{
                p: 2.5,
                background: "#f9fafb",
                borderRadius: 2,
                borderLeft: "3px solid #2563eb",
              }}
            >
              <Typography variant="body2" sx={{ color: "#4b5563", lineHeight: 1.6 }}>
                <strong>Art. 19 (Ord. 223-2008):</strong> Declarado procedente el registro 
                del can, la municipalidad entregará al interesado, en el plazo de atención 
                de quince (15) días hábiles, el Documento de Identificación Canina (DIC), 
                donde se consignará el número de registro de empadronamiento (código) 
                asignado durante la inscripción.
              </Typography>
            </Box>
          </Box>
        </Card>
      </motion.div>

      {/* Registration Steps Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <Box sx={{ mb: 6 }}>
          <Typography
            variant="h4"
            sx={{
              textAlign: "center",
              fontWeight: 700,
              color: "#1a1a1a",
              mb: 2,
            }}
          >
            Pasos para Registrarse
          </Typography>
          <Typography
            variant="body1"
            textAlign="center"
            sx={{
              color: "#6b7280",
              mb: 15,
              maxWidth: 700,
              mx: 'auto',
            }}
          >
            Sigue estos sencillos pasos para registrar a tu mascota en el sistema oficial
          </Typography>

          <Grid container spacing={4}>
            {registrationSteps.map((step, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: cardAnimations[index].initialY }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.9 + index * 0.1 }}
                  whileHover={{ y: cardAnimations[index].hoverY }}
                  onMouseEnter={() => setHoveredCard(index)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <Card
                    sx={{
                      height: "100%",
                      minHeight: 320,
                      border: "1px solid #e5e7eb",
                      borderRadius: 2,
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                      transition: "all 0.3s ease",
                      background: '#f9fafb',
                      position: 'relative',
                      overflow: 'visible',
                      "&:hover": {
                        boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
                        borderColor: '#2563eb',
                      },
                    }}
                  >
                    <CardContent sx={{ p: 3, textAlign: "center", display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', position: 'relative' }}>
                      <Box
                        sx={{
                          position: 'relative',
                          width: 80,
                          height: 80,
                          mb: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Box
                          component="img"
                          src="/images/cards/paw-darkblue.svg"
                          alt="paw"
                          sx={{
                            width: '100%',
                            height: '100%',
                            position: 'absolute',
                          }}
                        />
                        <Typography
                          sx={{
                            position: 'relative',
                            zIndex: 2,
                            fontSize: '1.5rem',
                            fontWeight: 700,
                            color: '#ffffff',
                            mt: '24px',
                            mr: '2px',
                          }}
                        >
                          {step.stepNumber}
                        </Typography>
                      </Box>

                      <Typography
                        variant="h6"
                        sx={{ 
                          mb: 1.5, 
                          fontWeight: 600, 
                          color: '#1a1a1a',
                          fontSize: '1.1rem',
                        }}
                      >
                        {step.title}
                      </Typography>

                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: '#6b7280',
                          lineHeight: 1.6,
                          mb: 2,
                        }}
                      >
                        {step.description}
                      </Typography>

                      <motion.div
                        initial={{ y: 0, opacity: 0 }}
                        animate={{
                          y: hoveredCard === index ? cardAnimations[index].dogEmergenceY : 0,
                          opacity: hoveredCard === index ? 1 : 0,
                        }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: '25%',
                          transform: 'translateX(-50%)',
                          zIndex: 10,
                          pointerEvents: 'none',
                        }}
                      >
                        <Box
                          component="img"   
                          src={step.image}
                          alt={step.title}
                          sx={{
                            width: 120,
                            height: 120,
                            objectFit: 'contain',
                            filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.2))',
                          }}
                        />
                      </motion.div>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Box>
      </motion.div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.4 }}
      >
        <Box
          sx={{
            py: 4,
            borderTop: "1px solid #e5e7eb",
            textAlign: "center",
          }}
        >
          <Typography variant="body2" sx={{ color: "#4b5563", mb: 1, fontWeight: 500 }}>
            Municipalidad Provincial de Puno - Sub Gerencia de Gestión Ambiental y Salud Pública
          </Typography>
          <Typography variant="caption" sx={{ color: "#9ca3af" }}>
            Sistema Oficial de Registro e Identificación Canina
          </Typography>
        </Box>
      </motion.div>
      </Container>
    </Box>
  );
};

export default HomePage;
