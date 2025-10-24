import React from "react";
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
import { Pets, QrCode, Search, Security } from "@mui/icons-material";
import { motion } from "framer-motion";

const HomePage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Pets sx={{ fontSize: 40, color: "#FFB74D" }} />,
      title: "Registro Fácil",
      description:
        "Registra tu mascota de forma rápida y sencilla con toda la información necesaria.",
    },
    {
      icon: <QrCode sx={{ fontSize: 40, color: "#81C784" }} />,
      title: "Carnet Digital",
      description:
        "Genera automáticamente un carnet digital con código QR único para tu mascota.",
    },
    {
      icon: <Search sx={{ fontSize: 40, color: "#FF8A65" }} />,
      title: "Búsqueda Rápida",
      description:
        "Encuentra información de mascotas usando DNI del adoptante o código CUI.",
    },
    {
      icon: <Security sx={{ fontSize: 40, color: "#9575CD" }} />,
      title: "Seguro y Confiable",
      description:
        "Sistema seguro que protege la información de tus mascotas y adoptantes.",
    },
  ];

  return (
    <Box sx={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>
      {/* Marca de agua - Logo Puno Renace */}
      <Box
        sx={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%) rotate(-15deg)',
          opacity: 0.03,
          zIndex: 0,
          pointerEvents: 'none',
          width: '600px',
          height: '600px',
        }}
      >
        <motion.img
          src="/images/logos/Logo Puno Renace_UU.png"
          alt="Marca de agua"
          style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'grayscale(100%) opacity(0.3)' }}
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.015, 0.025, 0.015],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </Box>

      {/* Patrón de fondo animado con patitas, huesos y muellitas */}
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
        }}
      >
        <motion.div
          style={{
            width: '100%',
            height: '100%',
            background: `
              repeating-linear-gradient(45deg, transparent, transparent 100px, rgba(255,255,255,0.02) 100px, rgba(255,255,255,0.02) 200px)
            `,
          }}
        />
        {/* Patitas animadas */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={`paw-${i}`}
            initial={{
              x: Math.random() * window.innerWidth,
              y: -50,
              rotate: Math.random() * 360,
              scale: 0.5 + Math.random() * 0.5,
            }}
            animate={{
              y: window.innerHeight + 50,
              rotate: Math.random() * 360 + 360,
            }}
            transition={{
              duration: 15 + Math.random() * 10,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "linear",
            }}
            style={{
              position: 'absolute',
              fontSize: '40px',
              opacity: 0.04,
              filter: 'grayscale(30%)',
            }}
          >
            🐾
          </motion.div>
        ))}
        {/* Huesos animados */}
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={`bone-${i}`}
            initial={{
              x: Math.random() * window.innerWidth,
              y: window.innerHeight + 50,
              rotate: 0,
              scale: 0.4 + Math.random() * 0.4,
            }}
            animate={{
              y: -50,
              rotate: 360,
              x: Math.random() * window.innerWidth,
            }}
            transition={{
              duration: 20 + Math.random() * 10,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "linear",
            }}
            style={{
              position: 'absolute',
              fontSize: '35px',
              opacity: 0.03,
              filter: 'grayscale(30%)',
            }}
          >
            🦴
          </motion.div>
        ))}
        {/* Muellitas (juguetes) animadas */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={`toy-${i}`}
            initial={{
              x: -50,
              y: Math.random() * window.innerHeight,
              scale: 0.4 + Math.random() * 0.3,
            }}
            animate={{
              x: window.innerWidth + 50,
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 25 + Math.random() * 15,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "linear",
            }}
            style={{
              position: 'absolute',
              fontSize: '30px',
              opacity: 0.025,
              filter: 'grayscale(30%)',
            }}
          >
            🎾
          </motion.div>
        ))}
      </Box>

      <Container maxWidth="lg" sx={{ py: 4, position: 'relative', zIndex: 1 }}>
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Box textAlign="center" sx={{ mb: 4 }}>
            {/* Logos institucionales en el header */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: 80,
                mb: 3,
              }}
            >
              <Box
                component="img"
                src="/images/logos/Logo Escudo MPP 2023-vetical_UU.png"
                alt="MPP"
                sx={{ height: 80, width: "auto" }}
              />
              <Box
                component="img"
                src="/images/logos/GMASS.png"
                alt="GMASS"
                sx={{ height: 70, width: "auto" }}
              />
              <Box
                component="img"
                src="/images/logos/gestionambiental.png"
                alt="Gestión Ambiental"
                sx={{ height: 70, width: "auto" }}
              />
            </Box>

            <Typography
              variant="h2"
              component="h1"
              gutterBottom
              sx={{
                color: "#1e293b",
                fontWeight: 800,
                textShadow: "0 2px 10px rgba(0,0,0,0.1)",
                mb: 2,
                background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Registro Municipal de Mascotas
            </Typography>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="floating-action"
            >
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate("/register")}
                sx={{
                  background: "linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)",
                  color: "white",
                  px: 10,
                  py: 2,
                  fontSize: "1.2rem",
                  fontWeight: 700,
                  boxShadow: "0 10px 30px rgba(59, 130, 246, 0.4)",
                  border: "none",
                  borderRadius: 3,
                  "&:hover": {
                    background: "linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)",
                    transform: "translateY(-3px) scale(1.02)",
                    boxShadow: "0 15px 40px rgba(59, 130, 246, 0.5)",
                  },
                  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              >
                🐾 Registrar Mascota
              </Button>

            </motion.div>
          </Box>
        </motion.div>

        {/* Requisitos para Registro Presencial - PRIORIDAD */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <Box
            sx={{
              mt: 4,
              mb: 8,
              p: 4,
              background: "rgba(255,255,255,0.9)",
              borderRadius: 3,
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(226, 232, 240, 0.8)",
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 2,
                mb: 3,
              }}
            >
              <Typography
                variant="h4"
                sx={{
                  color: "#1e293b",
                  fontWeight: 700,
                  textAlign: "center",
                  background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Requisitos para Registro Presencial
              </Typography>

            </Box>

            <Box sx={{ mb: 3, pl: 2 }}>
              <Typography variant="body1" sx={{ mb: 1.5, color: "#475569", fontWeight: 500 }}>
                • Documento de identidad del propietario.
              </Typography>
              <Typography variant="body1" sx={{ mb: 1.5, color: "#475569", fontWeight: 500 }}>
                • Fotografía del can.
              </Typography>
              <Typography variant="body1" sx={{ mb: 1.5, color: "#475569", fontWeight: 500 }}>
                • Tarjeta de vacunación antirrábica emitido por médico veterinario
                colegiado o por el Ministerio de Salud.
              </Typography>
              <Typography variant="body1" sx={{ mb: 1.5, color: "#475569", fontWeight: 500 }}>
                • Puedes realizar el registro en la{" "}
                <strong style={{ color: '#1e40af' }}>Sub Gerencia de gestion Ambiental y salud publica</strong>
              </Typography>
            </Box>

            {/* Marco Legal */}
            <Box sx={{ mt: 4, mb: 2 }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: "#1e293b", 
                  fontWeight: "bold",
                  borderBottom: "2px solid rgba(59, 130, 246, 0.3)",
                  pb: 1,
                  mb: 2
                }}
              >
                📋 Marco Legal
              </Typography>
            </Box>

            {/* Ley Nacional */}
            <Box
              sx={{
                p: 2.5,
                background: "rgba(59, 130, 246, 0.08)",
                borderRadius: 2,
                borderLeft: "4px solid #3b82f6",
                mb: 2,
              }}
            >
              <Typography
                variant="body1"
                sx={{ color: "#1e40af", fontWeight: "bold", mb: 1 }}
              >
                🏛️ Ley N° 27596 - Régimen Jurídico de Canes
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "#475569", lineHeight: 1.6 }}
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
                p: 2.5,
                background: "rgba(59, 130, 246, 0.08)",
                borderRadius: 2,
                borderLeft: "4px solid #1e40af",
                mb: 2,
              }}
            >
              <Typography
                variant="body1"
                sx={{ color: "#1e40af", fontWeight: "bold", mb: 1 }}
              >
                📜 Ordenanza Municipal Nº 223-2008-CMPP
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "#475569", lineHeight: 1.6 }}
              >
                Ordenanza que reglamenta la tenencia responsable de animales de compañía
                y animales domésticos en la provincia de Puno, estableciendo el registro
                obligatorio de canes y los requisitos para su empadronamiento municipal.
              </Typography>
            </Box>

            {/* Artículos Relevantes */}
            <Box sx={{ mt: 3 }}>
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  color: "#1e293b", 
                  fontWeight: "bold",
                  mb: 1.5,
                  fontSize: "0.95rem"
                }}
              >
                Artículos Destacados:
              </Typography>

              <Box
                sx={{
                  p: 2,
                  background: "rgba(148, 163, 184, 0.1)",
                  borderRadius: 2,
                  borderLeft: "3px solid #3b82f6",
                  mb: 1.5,
                }}
              >
                <Typography variant="body2" sx={{ color: "#475569", lineHeight: 1.6 }}>
                  <strong>Art. 12 (Ley 27596):</strong> La autoridad de salud dispondrá la
                  esterilización cuando las características del animal determinen un
                  comportamiento de agresividad incontrolada.
                </Typography>
              </Box>

              <Box
                sx={{
                  p: 2,
                  background: "rgba(148, 163, 184, 0.1)",
                  borderRadius: 2,
                  borderLeft: "3px solid #3b82f6",
                  mb: 1.5,
                }}
              >
                <Typography variant="body2" sx={{ color: "#475569", lineHeight: 1.6 }}>
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
                  p: 2,
                  background: "rgba(148, 163, 184, 0.1)",
                  borderRadius: 2,
                  borderLeft: "3px solid #3b82f6",
                }}
              >
                <Typography variant="body2" sx={{ color: "#475569", lineHeight: 1.6 }}>
                  <strong>Art. 19 (Ord. 223-2008):</strong> Declarado procedente el registro 
                  del can, la municipalidad entregará al interesado, en el plazo de atención 
                  de quince (15) días hábiles, el Documento de Identificación Canina (DIC), 
                  donde se consignará el número de registro de empadronamiento (código) 
                  asignado durante la inscripción.
                </Typography>
              </Box>
            </Box>
          </Box>
        </motion.div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 2,
              mb: 4,
              mt: 6,
            }}
          >
            <Typography
              variant="h4"
              sx={{
                color: "#1e293b",
                fontWeight: 700,
                textShadow: "0 2px 10px rgba(0,0,0,0.1)",
                background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Beneficios del Sistema Digital
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <Card
                    className="pet-card"
                    sx={{
                      height: "100%",
                      background: "rgba(255,255,255,0.9)",
                      backdropFilter: "blur(20px)",
                      border: "1px solid rgba(226, 232, 240, 0.8)",
                      boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-5px)",
                        boxShadow: "0 8px 25px rgba(59, 130, 246, 0.2)",
                      }
                    }}
                  >
                    <CardContent sx={{ textAlign: "center", p: 3 }}>
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.5, delay: 1.2 + index * 0.1 }}
                      >
                        {feature.icon}
                      </motion.div>
                      <Typography
                        variant="h6"
                        sx={{ mt: 2, mb: 1, fontWeight: 600, color: "#1e293b" }}
                      >
                        {feature.title}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#64748b" }}>
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
          transition={{ duration: 0.8, delay: 1.8 }}
        >
          <Box
            textAlign="center"
            sx={{
              mt: 6,
              p: 4,
              background: "rgba(255,255,255,0.9)",
              borderRadius: 3,
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(226, 232, 240, 0.8)",
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            }}
          >
            <Typography
              variant="h5"
              sx={{
                color: "#1e293b",
                mb: 2,
                fontWeight: 600,
              }}
            >
              ¿Ya tienes una mascota registrada?
            </Typography>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate("/search")}
              sx={{
                color: "#3b82f6",
                borderColor: "#3b82f6",
                px: 3,
                py: 1,
                fontWeight: 600,
                "&:hover": {
                  borderColor: "#1e40af",
                  backgroundColor: "rgba(59, 130, 246, 0.1)",
                  transform: "translateY(-2px)",
                  color: "#1e40af",
                },
                transition: "all 0.3s ease",
              }}
            >
              Buscar Mascota
            </Button>
          </Box>
        </motion.div>

        {/* Footer con información de contacto */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 2.0 }}
        >
          <Box
            sx={{
              mt: 6,
              p: 3,
              background: "rgba(255,255,255,0.9)",
              borderRadius: 3,
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(226, 232, 240, 0.8)",
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              textAlign: "center",
            }}
          >
            <Typography variant="body2" sx={{ mb: 1, color: "#475569", fontWeight: 500 }}>
              Municipalidad Provincial de Puno - Sub Gerencia de gestion Ambiental
              y salud publica
            </Typography>
            <Typography variant="caption" sx={{ color: "#64748b" }}>
              Sistema Oficial de Registro e Identificación Canina
            </Typography>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
};

export default HomePage;
