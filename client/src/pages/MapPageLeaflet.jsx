import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Paper,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  LocationOn,
  Pets,
  FilterList,
  Visibility,
  Phone,
  Email,
  Warning,
  AccessTime,
  Info,
  Close,
  MyLocation,
  KeyboardArrowUp,
  KeyboardArrowDown,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import axios from "axios";
import { getUploadUrl, getApiUrl } from "../utils/urls";
import ReportDetailModal from "../components/features/strayReports/ReportDetailModal";

// Fix for default markers in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// SVG placeholder inline para evitar bloqueos de ad-blockers
const PLACEHOLDER_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect fill='%23f0f0f0' width='200' height='200'/%3E%3Ctext fill='%23999' font-family='sans-serif' font-size='16' dy='10.5' font-weight='bold' x='50%25' y='50%25' text-anchor='middle'%3ESin Foto%3C/text%3E%3C/svg%3E";

// Componente helper para Avatar con fallback
const SafeAvatar = ({ src, alt, children, sx, ...props }) => {
  const [imgSrc, setImgSrc] = React.useState(src || PLACEHOLDER_IMAGE);
  
  React.useEffect(() => {
    setImgSrc(src || PLACEHOLDER_IMAGE);
  }, [src]);
  
  return (
    <Avatar {...props} sx={sx}>
      {imgSrc && imgSrc !== PLACEHOLDER_IMAGE ? (
        <img
          src={imgSrc}
          alt={alt}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={() => setImgSrc(PLACEHOLDER_IMAGE)}
        />
      ) : (
        children || <Pets />
      )}
    </Avatar>
  );
};

// Component to recenter map with zoom and smooth animation
function MapRecenter({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom || map.getZoom(), {
      duration: 1.5, // Animación suave de 1.5 segundos
      easeLinearity: 0.25,
    });
  }, [center, zoom, map]);
  return null;
}

const MapPageLeaflet = () => {
  const [strayReports, setStrayReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    urgency: "all",
    condition: "all",
    size: "all",
    temperament: "all",
    showOnlyRecent: false,
  });
  const [loading, setLoading] = useState(true);
  const [mapCenter, setMapCenter] = useState([
    -15.8402, -70.0219,
  ]); /* Line 51 omitted */
  const [mapZoom, setMapZoom] = useState(14);
  const [userLocation, setUserLocation] = useState(null);
  const [usingMockData, setUsingMockData] = useState(false);
  const [activeMarkerId, setActiveMarkerId] = useState(null);
  const markerRefs = React.useRef({});
  
  // Estados para scroll de cards
  const [showScrollButtons, setShowScrollButtons] = useState(false);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);
  const scrollContainerRef = React.useRef(null);

  // Simulación de datos (en producción vendría de la API)
  const mockReports = [
    {
      id: 1,
      reporterName: "María González",
      reporterPhone: "+51 987654321",
      reporterEmail: "maria@email.com",
      latitude: -15.8402,
      longitude: -70.0219,
      address: "Jr. Lima 123, Puno",
      breed: "Mestizo",
      size: "medium",
      colors: ["marron"],
      temperament: "friendly",
      condition: "stray",
      urgency: "normal",
      description: "Perro amigable que busca comida cerca del parque",
      photo: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=300",
      createdAt: new Date().toISOString(),
      status: "active",
    },
    {
      id: 2,
      reporterName: "Carlos Ruiz",
      reporterPhone: "+51 912345678",
      reporterEmail: "carlos@email.com",
      latitude: -15.838,
      longitude: -70.025,
      address: "Av. El Sol 456, Puno",
      breed: "Labrador",
      size: "large",
      colors: ["dorado"],
      temperament: "shy",
      condition: "lost",
      urgency: "high",
      description: "Perro grande con collar, parece estar perdido",
      photo:
        "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=300",
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      status: "active",
    },
    {
      id: 3,
      reporterName: "Ana Torres",
      reporterPhone: "+51 998877665",
      reporterEmail: "ana@email.com",
      latitude: -15.842,
      longitude: -70.018,
      address: "Jr. Puno 789, Puno",
      breed: "Chihuahua",
      size: "small",
      colors: ["negro"],
      temperament: "scared",
      condition: "abandoned",
      urgency: "emergency",
      description:
        "Cachorro muy pequeño, necesita atención veterinaria urgente",
      photo:
        "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=300",
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      status: "active",
    },
  ];

  const temperamentColors = {
    friendly: "#4CAF50",
    shy: "#FF9800",
    aggressive: "#F44336",
    scared: "#9C27B0",
    playful: "#2196F3",
    calm: "#009688",
    neutral: "#9E9E9E",
  };

  const urgencyColors = {
    low: "#4CAF50",
    normal: "#FF9800",
    high: "#F44336",
    emergency: "#9C27B0",
  };

  const conditionLabels = {
    stray: "Callejero",
    lost: "Perdido",
    abandoned: "Abandonado",
    injured: "Herido",
  };

  const sizeLabels = {
    small: "Pequeño",
    medium: "Mediano",
    large: "Grande",
  };

  const temperamentLabels = {
    friendly: "Amigable",
    shy: "Tímido",
    aggressive: "Agresivo",
    scared: "Asustado",
    playful: "Juguetón",
    calm: "Tranquilo",
    neutral: "Neutral",
  };

  const urgencyLabels = {
    low: "Baja",
    normal: "Normal",
    high: "Alta",
    emergency: "Emergencia",
  };

  // Función para capitalizar texto
  const capitalizeText = (text) => {
    if (!text) return "";
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  };

  // Custom circular icon for different urgency levels
  const createCustomIcon = (urgency) => {
    const color = urgencyColors[urgency] || "#FF9800";
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
    `;
    return L.divIcon({
      html: html,
      className: "custom-circular-marker",
      iconSize: [30, 30],
      iconAnchor: [15, 15],
      popupAnchor: [0, -15],
    });
  };

  useEffect(() => {
    loadStrayReports();
    getUserLocation();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [strayReports, filters]);

  const getUserLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
          setMapCenter([latitude, longitude]);
        },
        (error) => {
          console.log("Error getting location:", error);
          // Keep default location (Puno)
        }
      );
    }
  };

  const loadStrayReports = async () => {
    setLoading(true);
    setUsingMockData(false);
    try {
      console.log("🔄 Cargando reportes desde el servidor...");
      const response = await axios.get(
        getApiUrl("/stray-reports"),
        {
          timeout: 5000, // 5 segundos de timeout
        }
      );

      console.log("📦 Respuesta recibida:", response.data);

      if (response.data.success) {
        const reports = response.data.data || [];
        console.log(`✅ ${reports.length} reportes reales cargados desde la base de datos`);
        setStrayReports(reports);

        if (reports.length === 0) {
          console.log("ℹ️ No hay reportes registrados aún. La base de datos está vacía.");
        }
      } else {
        console.error("❌ Error en respuesta:", response.data.error);
        setStrayReports([]);
      }
    } catch (error) {
      if (error.code === "ERR_NETWORK" || error.code === "ECONNREFUSED") {
        console.log(
          "❌ No se pudo conectar con el servidor. Usando datos de demostración."
        );
        console.log(
          "💡 Asegúrate de que el backend esté corriendo y accesible desde la red"
        );
      } else if (error.code === "ECONNABORTED") {
        console.error("❌ Timeout: El servidor no respondió a tiempo.");
      } else {
        console.error("❌ Error al cargar reportes:", error.message);
      }
      // Solo usar mock si el servidor no está disponible
      console.log(
        `📊 Mostrando ${mockReports.length} reportes de demostración (servidor no disponible)`
      );
      setStrayReports(mockReports);
      setUsingMockData(true);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...strayReports];

    if (filters.urgency !== "all") {
      filtered = filtered.filter(
        (report) => report.urgency === filters.urgency
      );
    }

    if (filters.condition !== "all") {
      filtered = filtered.filter(
        (report) => report.condition === filters.condition
      );
    }

    if (filters.size !== "all") {
      filtered = filtered.filter((report) => report.size === filters.size);
    }

    if (filters.temperament !== "all") {
      filtered = filtered.filter(
        (report) => report.temperament === filters.temperament
      );
    }

    if (filters.showOnlyRecent) {
      const oneDayAgo = new Date(Date.now() - 86400000);
      filtered = filtered.filter(
        (report) => new Date(report.created_at || report.createdAt) > oneDayAgo
      );
    }

    setFilteredReports(filtered);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
  };

  // Funciones para scroll de cards
  const checkScrollButtons = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const hasScroll = scrollHeight > clientHeight;
    
    setShowScrollButtons(hasScroll);
    setCanScrollUp(scrollTop > 0);
    setCanScrollDown(scrollTop < scrollHeight - clientHeight - 1);
  };

  const scrollUp = () => {
    const container = scrollContainerRef.current;
    if (!container) return;
    container.scrollBy({ top: -200, behavior: 'smooth' });
  };

  const scrollDown = () => {
    const container = scrollContainerRef.current;
    if (!container) return;
    container.scrollBy({ top: 200, behavior: 'smooth' });
  };

  // Efecto para detectar cambios en scroll
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    checkScrollButtons();
    container.addEventListener('scroll', checkScrollButtons);
    
    return () => container.removeEventListener('scroll', checkScrollButtons);
  }, [filteredReports]);

  // Efecto para detectar cambios de tamaño
  useEffect(() => {
    const resizeObserver = new ResizeObserver(checkScrollButtons);
    if (scrollContainerRef.current) {
      resizeObserver.observe(scrollContainerRef.current);
    }
    return () => resizeObserver.disconnect();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'Fecha no disponible';

    try {
      const date = new Date(dateString);

      // Verificar si la fecha es válida
      if (isNaN(date.getTime())) {
        return 'Fecha inválida';
      }

      return date.toLocaleDateString("es-ES", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      console.error('Error formateando fecha:', error);
      return 'Fecha inválida';
    }
  };

  const getDistanceFromUser = (lat, lng) => {
    if (!userLocation) return "N/A";

    const R = 6371; // Radio de la Tierra en km
    const dLat = ((lat - userLocation[0]) * Math.PI) / 180;
    const dLng = ((lng - userLocation[1]) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((userLocation[0] * Math.PI) / 180) *
      Math.cos((lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance.toFixed(1);
  };

  return (
    <Container maxWidth="xl" sx={{ pt: { xs: 10, sm: 12, md: 14 }, pb: 6 }}>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <Box textAlign="center" mb={4}>
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
            Mapa de Perros Callejeros
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{
              color: "#64748b",
              fontWeight: 500,
              fontSize: "1.1rem",
              maxWidth: 700,
              mx: "auto",
              lineHeight: 1.6
            }}
          >
            Encuentra perros reportados en tu zona y ayuda en su rescate
          </Typography>
        </Box>

        {/* Indicador de fuente de datos */}
        {usingMockData && (
          <Alert
            severity="warning"
            sx={{
              mb: 3,
              backgroundColor: 'rgba(255, 167, 38, 0.1)',
              border: '1px solid rgba(255, 167, 38, 0.3)',
              '& .MuiAlert-icon': {
                color: '#f57c00'
              }
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              ⚠️ <strong>Servidor no disponible.</strong> Mostrando datos de demostración.
              Asegúrate de que el backend esté corriendo y accesible desde la red.
            </Typography>
          </Alert>
        )}

        {!usingMockData && strayReports.length === 0 && !loading && (
          <Alert
            severity="info"
            sx={{
              mb: 3,
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              '& .MuiAlert-icon': {
                color: '#3b82f6'
              }
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              ℹ️ No hay reportes de perros callejeros registrados aún.
              Sé el primero en <strong>reportar un perro</strong> para ayudar a la comunidad.
            </Typography>
          </Alert>
        )}

        {/* Filtros */}
        <Card
          elevation={0}
          sx={{
            background: "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(249, 250, 251, 0.95) 100%)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(226, 232, 240, 0.5)",
            borderRadius: 3,
            boxShadow: "0 4px 15px rgba(0,0,0,0.05), 0 1px 4px rgba(0,0,0,0.03)",
            mb: 3,
          }}
        >
          <CardContent>
            <Typography
              variant="h6"
              sx={{
                color: "#1e293b",
                mb: 3,
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: 1
              }}
            >
              <FilterList sx={{ color: "#3b82f6" }} />
              Filtros de Búsqueda
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Urgencia</InputLabel>
                  <Select
                    value={filters.urgency}
                    onChange={(e) =>
                      handleFilterChange("urgency", e.target.value)
                    }
                    sx={{
                      backgroundColor: "#ffffff",
                      borderColor: "#e5e7eb",
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
                  <InputLabel>Condición</InputLabel>
                  <Select
                    value={filters.condition}
                    onChange={(e) =>
                      handleFilterChange("condition", e.target.value)
                    }
                    sx={{
                      backgroundColor: "#ffffff",
                      borderColor: "#e5e7eb",
                    }}
                  >
                    <MenuItem value="all">Todas</MenuItem>
                    <MenuItem value="stray">Callejero</MenuItem>
                    <MenuItem value="lost">Perdido</MenuItem>
                    <MenuItem value="abandoned">Abandonado</MenuItem>
                    <MenuItem value="injured">Herido</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Tamaño</InputLabel>
                  <Select
                    value={filters.size}
                    onChange={(e) => handleFilterChange("size", e.target.value)}
                    sx={{
                      backgroundColor: "#ffffff",
                      borderColor: "#e5e7eb",
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
                      onChange={(e) =>
                        handleFilterChange("showOnlyRecent", e.target.checked)
                      }
                      sx={{
                        "& .MuiSwitch-switchBase.Mui-checked": {
                          color: "#4CAF50",
                        },
                        "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                          { backgroundColor: "#4CAF50" },
                      }}
                    />
                  }
                  label={
                    <Typography sx={{ color: "#1e293b" }}>
                      Solo últimas 24h
                    </Typography>
                  }
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <Alert
                  severity="info"
                  icon={false}
                  sx={{
                    backgroundColor: "#eff6ff",
                    color: "#1e40af",
                    border: "1px solid #bfdbfe",
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
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
            <Card
              elevation={0}
              sx={{
                background: "linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(249, 250, 251, 0.98) 100%)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(226, 232, 240, 0.5)",
                borderRadius: 3,
                boxShadow: "0 8px 25px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.04)",
                height: "600px",
                position: "relative",
                overflow: "hidden",
                transition: "all 0.3s ease",
                "&:hover": {
                  boxShadow: "0 12px 35px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.06)",
                }
              }}
            >
              <CardContent sx={{ height: "100%", p: 0 }}>
                {loading ? (
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    height="100%"
                  >
                    <CircularProgress />
                  </Box>
                ) : (
                  <MapContainer
                    center={mapCenter}
                    zoom={mapZoom}
                    style={{ height: "100%", width: "100%" }}
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
                        ref={(ref) => {
                          if (ref) {
                            markerRefs.current[report.id] = ref;
                            // Abrir popup si este marcador es el activo
                            if (activeMarkerId === report.id) {
                              setTimeout(() => {
                                ref.openPopup();
                                setActiveMarkerId(null);
                              }, 100);
                            }
                          }
                        }}
                      >
                        <Popup maxWidth={280}>
                          <Box sx={{ minWidth: 250, p: 1 }}>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                mb: 1,
                              }}
                            >
                              <SafeAvatar
                                src={report.photo_path ? getUploadUrl(report.photo_path) : report.photo}
                                alt={report.breed}
                                sx={{ width: 50, height: 50 }}
                              >
                                <Pets />
                              </SafeAvatar>
                              <Box flex={1}>
                                <Typography
                                  variant="subtitle1"
                                  fontWeight="bold"
                                >
                                  {report.breed}
                                </Typography>
                                <Chip
                                  label={
                                    urgencyLabels[report.urgency] ||
                                    report.urgency
                                  }
                                  size="small"
                                  sx={{
                                    backgroundColor:
                                      urgencyColors[report.urgency],
                                    color: "white",
                                    height: 20,
                                  }}
                                />
                              </Box>
                            </Box>
                            <Typography
                              variant="body2"
                              sx={{
                                mb: 1,
                                display: "flex",
                                alignItems: "center",
                                gap: 0.5,
                              }}
                            >
                              <LocationOn fontSize="small" /> {report.address}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="textSecondary"
                              sx={{ display: "block", mb: 1 }}
                            >
                              {report.description?.substring(0, 60)}...
                            </Typography>
                            <Button
                              fullWidth
                              variant="contained"
                              size="small"
                              onClick={() => {
                                setSelectedReport(report);
                                setDetailsModalOpen(true);
                              }}
                              sx={{
                                mt: 1,
                                background:
                                  "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
                                boxShadow:
                                  "0 3px 5px 2px rgba(33, 203, 243, .3)",
                                transition: "all 0.3s ease",
                                '&:hover': {
                                  transform: "scale(1.05)",
                                  boxShadow: "0 5px 15px rgba(33, 203, 243, .5)",
                                },
                                '&:active': {
                                  transform: "scale(0.98)",
                                }
                              }}
                            >
                              <Info sx={{ mr: 0.5, fontSize: 16 }} />
                              Ver Detalles
                            </Button>
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
                    position: "absolute",
                    bottom: 20,
                    right: 20,
                    zIndex: 1000,
                    background: "linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)",
                    color: "white",
                    fontWeight: 600,
                    px: 3,
                    py: 1.5,
                    boxShadow: "0 4px 15px rgba(59, 130, 246, 0.4)",
                    "&:hover": {
                      background: "linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)",
                      transform: "translateY(-2px)",
                      boxShadow: "0 6px 20px rgba(59, 130, 246, 0.5)",
                    },
                    transition: "all 0.3s ease",
                  }}
                  onClick={() => {
                    setMapCenter(userLocation);
                    setMapZoom(15); // Reset to default zoom for user location
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
            <Box sx={{ position: "relative" }}>
              {/* Botón de scroll hacia arriba */}
              {showScrollButtons && canScrollUp && (
                <Box
                  sx={{
                    position: "absolute",
                    top: "10px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    zIndex: 10,
                    background: "rgba(255, 255, 255, 0.9)",
                    borderRadius: "50%",
                    width: "40px",
                    height: "40px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      background: "rgba(255, 255, 255, 1)",
                      transform: "translateX(-50%) translateY(-2px)",
                      boxShadow: "0 4px 15px rgba(0,0,0,0.25)",
                    }
                  }}
                  onClick={scrollUp}
                >
                  <KeyboardArrowUp sx={{ color: "#667eea" }} />
                </Box>
              )}
              
              {/* Botón de scroll hacia abajo */}
              {showScrollButtons && canScrollDown && (
                <Box
                  sx={{
                    position: "absolute",
                    bottom: "10px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    zIndex: 10,
                    background: "rgba(255, 255, 255, 0.9)",
                    borderRadius: "50%",
                    width: "40px",
                    height: "40px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      background: "rgba(255, 255, 255, 1)",
                      transform: "translateX(-50%) translateY(2px)",
                      boxShadow: "0 4px 15px rgba(0,0,0,0.25)",
                    }
                  }}
                  onClick={scrollDown}
                >
                  <KeyboardArrowDown sx={{ color: "#667eea" }} />
                </Box>
              )}
              
              <Box 
                ref={scrollContainerRef}
                sx={{
                  maxHeight: "600px",
                  overflowY: "auto",
                  pr: 1,
                  "&::-webkit-scrollbar": {
                    width: "8px",
                  },
                  "&::-webkit-scrollbar-track": {
                    background: "rgba(226, 232, 240, 0.3)",
                    borderRadius: "10px",
                  },
                  "&::-webkit-scrollbar-thumb": {
                    background: "rgba(59, 130, 246, 0.3)",
                    borderRadius: "10px",
                    "&:hover": {
                      background: "rgba(59, 130, 246, 0.5)",
                    },
                  },
                }}>
              {filteredReports.length === 0 ? (
                <Box
                  sx={{
                    textAlign: 'center',
                    py: 6,
                    px: 3
                  }}
                >
                  <Pets sx={{ fontSize: 60, color: '#94a3b8', mb: 2 }} />
                  <Typography variant="h6" sx={{ color: '#64748b', mb: 1, fontWeight: 600 }}>
                    No hay reportes
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                    {strayReports.length === 0
                      ? "Aún no hay perros reportados"
                      : "No hay perros que coincidan con los filtros seleccionados"}
                  </Typography>
                </Box>
              ) : (
                filteredReports.map((report) => (
                  <motion.div
                    key={report.id}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Card
                      elevation={0}
                      sx={{
                        background: "linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(249, 250, 251, 0.98) 100%)",
                        backdropFilter: "blur(20px)",
                        border: "1px solid rgba(226, 232, 240, 0.6)",
                        borderRadius: 3,
                        boxShadow: "0 4px 15px rgba(0,0,0,0.05), 0 1px 4px rgba(0,0,0,0.03)",
                        mb: 2,
                        cursor: "pointer",
                        "&:hover": {
                          boxShadow: "0 12px 30px rgba(59, 130, 246, 0.15), 0 4px 12px rgba(0,0,0,0.08)",
                          transform: "translateY(-4px)",
                          borderColor: "rgba(59, 130, 246, 0.4)",
                        },
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      }}
                      onClick={() => {
                        // Centrar el mapa y abrir el popup del marcador
                        setMapCenter([report.latitude, report.longitude]);
                        setMapZoom(18);
                        setActiveMarkerId(report.id);
                        
                        // Intentar abrir el popup directamente si el marcador ya está renderizado
                        setTimeout(() => {
                          const marker = markerRefs.current[report.id];
                          if (marker && marker.openPopup) {
                            marker.openPopup();
                          }
                        }, 500); // Esperar a que el mapa termine de hacer zoom
                      }}
                    >
                      <CardContent>
                        <Box display="flex" alignItems="center" mb={2}>
                          <SafeAvatar
                            src={report.photo_path ? getUploadUrl(report.photo_path) : report.photo}
                            alt={report.breed}
                            sx={{ width: 50, height: 50, mr: 2 }}
                          >
                            <Pets />
                          </SafeAvatar>
                          <Box flex={1}>
                            <Typography
                              variant="h6"
                              sx={{ color: "#1e293b", fontWeight: 600 }}
                            >
                              {report.breed}
                            </Typography>
                            <Typography variant="body2" sx={{ color: "#64748b" }}>
                              {getDistanceFromUser(
                                report.latitude,
                                report.longitude
                              )}{" "}
                              km de distancia
                            </Typography>
                          </Box>
                          <Chip
                            label={report.urgency}
                            size="small"
                            sx={{
                              backgroundColor: urgencyColors[report.urgency],
                              color: "white",
                              fontWeight: 600,
                            }}
                          />
                        </Box>

                        <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                          <Chip
                            label={conditionLabels[report.condition]}
                            size="small"
                            sx={{
                              backgroundColor: "#f1f5f9",
                              color: "#475569",
                              border: "1px solid #e2e8f0",
                            }}
                          />
                          <Chip
                            label={sizeLabels[report.size]}
                            size="small"
                            sx={{
                              backgroundColor: "#f1f5f9",
                              color: "#475569",
                              border: "1px solid #e2e8f0",
                            }}
                          />
                          <Chip
                            label={
                              temperamentLabels[report.temperament] ||
                              report.temperament
                            }
                            size="small"
                            sx={{
                              backgroundColor:
                                temperamentColors[report.temperament],
                              color: "white",
                              fontWeight: 500,
                            }}
                          />
                        </Box>

                        <Typography
                          variant="body2"
                          sx={{
                            color: "#64748b",
                            mb: 1,
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <LocationOn sx={{ fontSize: 16, mr: 0.5 }} />
                          {report.address}
                        </Typography>

                        <Typography
                          variant="caption"
                          sx={{
                            color: "#94a3b8",
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <AccessTime sx={{ fontSize: 14, mr: 0.5 }} />
                          Reportado: {formatDate(report.created_at || report.createdAt)}
                        </Typography>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </Box>
            </Box>
          </Grid>
        </Grid>

        {/* Dialog de Detalles usando ReportDetailModal */}
        <ReportDetailModal
          report={selectedReport}
          open={detailsModalOpen}
          onClose={() => setDetailsModalOpen(false)}
        />
      </motion.div>
    </Container>
  );
};

export default MapPageLeaflet;
