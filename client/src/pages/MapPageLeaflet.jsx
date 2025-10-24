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
} from "@mui/icons-material";
import { motion } from "framer-motion";
import axios from "axios";

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
      console.log("🔄 Intentando conectar con el servidor...");
      const response = await axios.get(
        "http://localhost:5000/api/stray-reports",
        {
          timeout: 5000, // 5 segundos de timeout
        }
      );

      console.log("📦 Respuesta recibida:", response.data);

      if (response.data.success) {
        const reports = response.data.data || [];
        console.log(`✅ ${reports.length} reportes cargados desde el servidor`);
        setStrayReports(reports);

        // Si no hay reportes en BD, usar mock para demostración
        if (reports.length === 0) {
          console.log(
            "⚠️ No hay reportes en la BD, usando datos de demostración"
          );
          setStrayReports(mockReports);
          setUsingMockData(true);
        }
      } else {
        console.error("❌ Error en respuesta:", response.data.error);
        console.log("📊 Usando datos de demostración");
        setStrayReports(mockReports);
        setUsingMockData(true);
      }
    } catch (error) {
      if (error.code === "ERR_NETWORK" || error.code === "ECONNREFUSED") {
        console.log(
          "⚠️ Servidor backend no disponible. Usando datos de demostración."
        );
        console.log(
          "💡 Para conectar con el servidor real, asegúrate de que el backend esté corriendo en el puerto 5000"
        );
      } else {
        console.error("❌ Error inesperado:", error.message);
      }
      // Usar mock como fallback
      console.log(
        `📊 Mostrando ${mockReports.length} reportes de demostración`
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
        (report) => new Date(report.createdAt) > oneDayAgo
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <Box textAlign="center" mb={4}>
          {/* Header con logos simétricos */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 3,
              mb: 2,
            }}
          >
            <Box>
              <Typography
                variant="h3"
                sx={{
                  color: "#1e293b",
                  fontWeight: 700,
                  letterSpacing: "-0.5px",
                }}
              >
                🗺️ Mapa de Perros Callejeros
              </Typography>
            </Box>
          </Box>
          <Typography
            variant="subtitle1"
            sx={{ color: "#64748b", fontWeight: 400 }}
          >
            Encuentra perros reportados en tu zona y ayuda en su rescate
          </Typography>
        </Box>

        {/* Alert para datos de demostración */}
        {usingMockData && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Alert
              severity="info"
              sx={{
                mb: 3,
                backgroundColor: "rgba(59, 130, 246, 0.1)",
                border: "1px solid rgba(59, 130, 246, 0.3)",
                "& .MuiAlert-icon": {
                  color: "#3b82f6",
                },
              }}
            >
              <Typography
                variant="body2"
                sx={{ color: "#1e40af", fontWeight: 500 }}
              >
                <strong>Modo Demostración:</strong> El servidor backend no está
                disponible. Mostrando datos de ejemplo para visualización.
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: "#64748b", display: "block", mt: 0.5 }}
              >
                💡 Para ver datos reales, inicia el servidor backend en el
                puerto 5000
              </Typography>
            </Alert>
          </motion.div>
        )}

        {/* Filtros */}
        <Card
          sx={{
            backgroundColor: "#ffffff",
            border: "1px solid #e5e7eb",
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            mb: 3,
          }}
        >
          <CardContent>
            <Typography
              variant="h6"
              sx={{ color: "#1e293b", mb: 2, fontWeight: 600 }}
            >
              <FilterList sx={{ mr: 1 }} />
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
              sx={{
                backgroundColor: "rgba(255,255,255,0.98)",
                height: "600px",
                position: "relative",
                overflow: "hidden",
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
                              <Avatar
                                src={report.photo}
                                sx={{ width: 50, height: 50 }}
                              >
                                <Pets />
                              </Avatar>
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
                    backgroundColor: "white",
                    color: "primary.main",
                    "&:hover": {
                      backgroundColor: "#f5f5f5",
                    },
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
            <Box sx={{ maxHeight: "600px", overflowY: "auto" }}>
              {filteredReports.map((report) => (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Card
                    sx={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #e5e7eb",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                      mb: 2,
                      cursor: "pointer",
                      "&:hover": {
                        boxShadow: "0 8px 20px rgba(37, 99, 235, 0.15)",
                        transform: "translateY(-2px)",
                        borderColor: "#3b82f6",
                      },
                      transition: "all 0.3s ease",
                    }}
                    onClick={() => {
                      // Solo centrar el mapa con animación suave, no abrir modal
                      setMapCenter([report.latitude, report.longitude]);
                      setMapZoom(18);
                    }}
                  >
                    <CardContent>
                      <Box display="flex" alignItems="center" mb={2}>
                        <Avatar
                          src={report.photo}
                          sx={{ width: 50, height: 50, mr: 2 }}
                        >
                          <Pets />
                        </Avatar>
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
                        Reportado: {formatDate(report.createdAt)}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </Box>
          </Grid>
        </Grid>

        {/* Dialog de Detalles */}
        <Dialog
          open={detailsModalOpen}
          onClose={() => setDetailsModalOpen(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            },
          }}
        >
          {selectedReport && (
            <>
              <DialogTitle
                sx={{
                  background:
                    "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
                  color: "white",
                  py: 3,
                }}
              >
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar
                      src={selectedReport.photo}
                      sx={{ width: 50, height: 50 }}
                    >
                      <Pets />
                    </Avatar>
                    <Box>
                      <Typography variant="h5" fontWeight="bold">
                        {selectedReport.breed}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Reporte #{selectedReport.id} •{" "}
                        {formatDate(selectedReport.createdAt)}
                      </Typography>
                    </Box>
                  </Box>
                  <Button
                    onClick={() => setDetailsModalOpen(false)}
                    sx={{
                      color: "white",
                      minWidth: "auto",
                      "&:hover": {
                        backgroundColor: "rgba(255,255,255,0.1)",
                      },
                    }}
                  >
                    <Close />
                  </Button>
                </Box>
              </DialogTitle>

              <DialogContent
                sx={{
                  background: "linear-gradient(to bottom, #f8f9fa, #ffffff)",
                  p: 3,
                }}
              >
                <Grid container spacing={3} sx={{ mt: 1 }}>
                  <Grid item xs={12} md={6}>
                    <Box
                      sx={{
                        position: "relative",
                        borderRadius: 3,
                        overflow: "hidden",
                        boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                      }}
                    >
                      <img
                        src={selectedReport.photo}
                        alt="Perro reportado"
                        style={{
                          width: "100%",
                          height: "350px",
                          objectFit: "cover",
                        }}
                      />
                      <Box
                        sx={{
                          position: "absolute",
                          top: 12,
                          right: 12,
                          display: "flex",
                          gap: 1,
                        }}
                      >
                        <Chip
                          label={
                            urgencyLabels[selectedReport.urgency] ||
                            selectedReport.urgency
                          }
                          sx={{
                            backgroundColor:
                              urgencyColors[selectedReport.urgency],
                            color: "white",
                            fontWeight: "bold",
                          }}
                        />
                        <Chip
                          label={conditionLabels[selectedReport.condition]}
                          sx={{
                            backgroundColor: "rgba(0,0,0,0.7)",
                            color: "white",
                          }}
                        />
                      </Box>
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Paper
                      sx={{ p: 2.5, borderRadius: 2, boxShadow: 2, mb: 2 }}
                    >
                      <Typography
                        variant="h6"
                        gutterBottom
                        sx={{ fontWeight: "bold", color: "#1976d2", mb: 2 }}
                      >
                        🐕 Información del Perro
                      </Typography>

                      <Box display="flex" flexDirection="column" gap={1.5}>
                        <Box display="flex" justifyContent="space-between">
                          <Typography
                            variant="body2"
                            color="textSecondary"
                            fontWeight="bold"
                          >
                            Raza:
                          </Typography>
                          <Typography variant="body1" fontWeight="600">
                            {capitalizeText(selectedReport.breed)}
                          </Typography>
                        </Box>

                        <Box display="flex" justifyContent="space-between">
                          <Typography
                            variant="body2"
                            color="textSecondary"
                            fontWeight="bold"
                          >
                            Tamaño:
                          </Typography>
                          <Chip
                            label={sizeLabels[selectedReport.size]}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        </Box>

                        <Box display="flex" justifyContent="space-between">
                          <Typography
                            variant="body2"
                            color="textSecondary"
                            fontWeight="bold"
                          >
                            Colores:
                          </Typography>
                          <Typography variant="body1" fontWeight="600">
                            {selectedReport.colors
                              ? selectedReport.colors
                                  .map((c) => capitalizeText(c))
                                  .join(", ")
                              : "No especificado"}
                          </Typography>
                        </Box>

                        <Box
                          display="flex"
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <Typography
                            variant="body2"
                            color="textSecondary"
                            fontWeight="bold"
                          >
                            Temperamento:
                          </Typography>
                          <Chip
                            label={
                              temperamentLabels[selectedReport.temperament] ||
                              capitalizeText(selectedReport.temperament)
                            }
                            size="small"
                            sx={{
                              backgroundColor:
                                temperamentColors[selectedReport.temperament],
                              color: "white",
                              fontWeight: "bold",
                            }}
                          />
                        </Box>
                      </Box>
                    </Paper>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Paper
                      sx={{
                        p: 2.5,
                        borderRadius: 2,
                        boxShadow: 2,
                        height: "100%",
                      }}
                    >
                      <Typography
                        variant="h6"
                        gutterBottom
                        sx={{ fontWeight: "bold", color: "#1976d2", mb: 2 }}
                      >
                        📍 Ubicación
                      </Typography>
                      <Typography
                        variant="body1"
                        gutterBottom
                        sx={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 1,
                        }}
                      >
                        <LocationOn color="error" />
                        <span>{selectedReport.address}</span>
                      </Typography>
                      <Typography
                        variant="caption"
                        color="textSecondary"
                        sx={{ display: "block", mt: 1 }}
                      >
                        Coordenadas: {selectedReport.latitude},{" "}
                        {selectedReport.longitude}
                      </Typography>
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<LocationOn />}
                        href={`https://maps.google.com/?q=${selectedReport.latitude},${selectedReport.longitude}`}
                        target="_blank"
                        sx={{ mt: 2 }}
                      >
                        Abrir en Google Maps
                      </Button>
                    </Paper>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Paper
                      sx={{
                        p: 2.5,
                        borderRadius: 2,
                        boxShadow: 2,
                        height: "100%",
                      }}
                    >
                      <Typography
                        variant="h6"
                        gutterBottom
                        sx={{ fontWeight: "bold", color: "#1976d2", mb: 2 }}
                      >
                        👤 Información del Reportante
                      </Typography>
                      <Box display="flex" flexDirection="column" gap={1.5}>
                        <Typography variant="body1">
                          <strong>Nombre:</strong> {selectedReport.reporterName}
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Phone color="primary" />
                          {selectedReport.reporterPhone}
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Email color="primary" />
                          {selectedReport.reporterEmail}
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>

                  <Grid item xs={12}>
                    <Paper
                      sx={{
                        p: 2.5,
                        borderRadius: 2,
                        boxShadow: 2,
                        backgroundColor: "#f8f9fa",
                      }}
                    >
                      <Typography
                        variant="h6"
                        gutterBottom
                        sx={{ fontWeight: "bold", color: "#1976d2", mb: 2 }}
                      >
                        📝 Descripción
                      </Typography>
                      <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                        {selectedReport.description}
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </DialogContent>

              <DialogActions
                sx={{
                  background: "linear-gradient(to bottom, #ffffff, #f8f9fa)",
                  p: 3,
                  gap: 2,
                }}
              >
                <Button
                  onClick={() => setDetailsModalOpen(false)}
                  variant="outlined"
                  size="large"
                  sx={{ flex: 0.5 }}
                >
                  Cerrar
                </Button>
                <Button
                  sx={{ display: "none" }}
                  href={`https://maps.google.com/?q=${selectedReport.latitude},${selectedReport.longitude}`}
                  target="_blank"
                  startIcon={<LocationOn />}
                  variant="outlined"
                >
                  Ver en Google Maps
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      </motion.div>
    </Container>
  );
};

export default MapPageLeaflet;
