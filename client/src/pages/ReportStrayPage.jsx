import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Avatar,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Paper,
  FormControlLabel,
  RadioGroup,
  Radio,
  Slider,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Autocomplete,
  IconButton,
  Checkbox,
} from "@mui/material";
import {
  PhotoCamera,
  LocationOn,
  Pets,
  ColorLens,
  Psychology,
  Save,
  MyLocation,
  PersonAdd,
  Search,
  CheckCircle,
  Celebration,
  CameraAlt,
  Close,
  CameraEnhance,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const ReportStrayPage = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isUserRegistered, setIsUserRegistered] = useState(false);
  const [userCUI, setUserCUI] = useState("");
  const [checkingUser, setCheckingUser] = useState(true);
  const [location, setLocation] = useState({
    lat: null,
    lng: null,
    address: "",
  });
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [cuiInput, setCuiInput] = useState("");
  const [verifyingCUI, setVerifyingCUI] = useState(false);
  const [cuiError, setCuiError] = useState("");
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [stream, setStream] = useState(null);
  const [useProfileData, setUseProfileData] = useState(true);
  const [userProfileData, setUserProfileData] = useState(null);
  const [myReports, setMyReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [showReports, setShowReports] = useState(false);

  const [formData, setFormData] = useState({
    // Información básica
    reporterName: "",
    reporterPhone: "",
    reporterEmail: "",

    // Ubicación
    latitude: "",
    longitude: "",
    address: "",
    zone: "",

    // Información del perro
    breed: "",
    size: "medium",
    colors: [],
    temperament: "friendly",
    condition: "stray",
    gender: "",
    estimatedAge: "",
    healthStatus: "good",

    // Detalles adicionales
    description: "",
    urgency: "normal",
    hasCollar: false,
    isInjured: false,
    needsRescue: false,
  });

  const steps = [
    "Información Personal",
    "Ubicación",
    "Datos del Perro",
    "Foto y Detalles",
  ];

  const breeds = [
    "Mestizo",
    "Labrador",
    "Golden Retriever",
    "Pastor Alemán",
    "Bulldog",
    "Chihuahua",
    "Poodle",
    "Rottweiler",
    "Beagle",
    "Husky Siberiano",
    "Boxer",
    "Cocker Spaniel",
    "Dálmata",
    "Pitbull",
    "Schnauzer",
    "Border Collie",
    "Shih Tzu",
    "Yorkshire Terrier",
    "Pug",
    "Dachshund",
    "Akita",
    "San Bernardo",
    "Gran Danés",
    "Maltés",
    "Pomerania",
    "Otro",
  ];

  const colors = [
    { value: "negro", label: "Negro", color: "#000000" },
    { value: "blanco", label: "Blanco", color: "#FFFFFF" },
    { value: "marron", label: "Marrón", color: "#8B4513" },
    { value: "dorado", label: "Dorado", color: "#FFD700" },
    { value: "gris", label: "Gris", color: "#808080" },
    {
      value: "manchado",
      label: "Manchado",
      color: "linear-gradient(45deg, #000 25%, #FFF 25%)",
    },
    {
      value: "tricolor",
      label: "Tricolor",
      color: "linear-gradient(120deg, #000 33%, #8B4513 33%, #FFF 66%)",
    },
  ];

  const temperaments = [
    { value: "friendly", label: "Amigable", color: "#4CAF50" },
    { value: "shy", label: "Tímido", color: "#FF9800" },
    { value: "aggressive", label: "Agresivo", color: "#F44336" },
    { value: "scared", label: "Asustado", color: "#9C27B0" },
    { value: "playful", label: "Juguetón", color: "#2196F3" },
    { value: "calm", label: "Tranquilo", color: "#009688" },
  ];

  const urgencyLevels = [
    { value: "low", label: "Baja", color: "#4CAF50" },
    { value: "normal", label: "Normal", color: "#FF9800" },
    { value: "high", label: "Alta", color: "#F44336" },
    { value: "emergency", label: "Emergencia", color: "#9C27B0" },
  ];

  // Obtener ubicación actual
  const getCurrentLocation = () => {
    setLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          setLocation({ lat, lng, address: "Obteniendo dirección..." });
          setFormData((prev) => ({
            ...prev,
            latitude: lat.toString(),
            longitude: lng.toString(),
          }));

          // Obtener dirección usando geocoding reverso
          try {
            const response = await fetch(
              `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=YOUR_API_KEY`
            );
            const data = await response.json();
            if (data.results && data.results[0]) {
              const address = data.results[0].formatted;
              setLocation((prev) => ({ ...prev, address }));
              setFormData((prev) => ({ ...prev, address }));
            }
          } catch (error) {
            console.error("Error obteniendo dirección:", error);
            setLocation((prev) => ({
              ...prev,
              address: "Dirección no disponible",
            }));
          }

          setLoading(false);
        },
        (error) => {
          console.error("Error obteniendo ubicación:", error);
          setLoading(false);
          alert(
            "No se pudo obtener la ubicación. Por favor, ingresa las coordenadas manualmente."
          );
        }
      );
    }
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onload = (e) => setPhotoPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const openCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment", // Usar cámara trasera en móviles
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      setStream(mediaStream);
      setCameraOpen(true);
    } catch (error) {
      console.error("Error accessing camera:", error);
      alert(
        "No se pudo acceder a la cámara. Verifica los permisos del navegador."
      );
    }
  };

  const closeCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setCameraOpen(false);
  };

  const capturePhoto = () => {
    const video = document.getElementById("camera-video");
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    canvas.toBlob(
      (blob) => {
        const file = new File([blob], `stray-dog-${Date.now()}.jpg`, {
          type: "image/jpeg",
        });
        setPhoto(file);
        setPhotoPreview(canvas.toDataURL());
        closeCamera();
      },
      "image/jpeg",
      0.8
    );
  };

  // Cleanup camera stream on component unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  useEffect(() => {
    checkUserRegistration();
    loadUserProfileData();
  }, []);

  // Cargar reportes del usuario
  const loadMyReports = async () => {
    setLoadingReports(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(
        "http://localhost:5000/api/stray-reports/my-reports",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.data.success) {
        setMyReports(response.data.data || []);
      }
    } catch (error) {
      console.error("Error loading reports:", error);
    }
    setLoadingReports(false);
  };

  // Load user profile data if logged in
  const loadUserProfileData = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (token) {
        const response = await axios.get("http://localhost:5000/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data.success) {
          const userData = response.data.user;
          setUserProfileData(userData);

          // Pre-fill form data if using profile data
          if (useProfileData) {
            setFormData((prev) => ({
              ...prev,
              reporterName: `${userData.first_name} ${userData.last_name}`,
              reporterPhone: userData.phone || "",
              reporterEmail: userData.email || "",
            }));
          }
        }
      }
    } catch (error) {
      console.log("No user logged in or error loading profile");
    }
  };

  // Update form data when useProfileData changes
  useEffect(() => {
    if (userProfileData) {
      if (useProfileData) {
        setFormData((prev) => ({
          ...prev,
          reporterName: `${userProfileData.first_name} ${userProfileData.last_name}`,
          reporterPhone: userProfileData.phone || "",
          reporterEmail: userProfileData.email || "",
        }));
      } else {
        // Clear reporter data when not using profile
        setFormData((prev) => ({
          ...prev,
          reporterName: "",
          reporterPhone: "",
          reporterEmail: "",
        }));
      }
    }
  }, [useProfileData, userProfileData]);

  const checkUserRegistration = async () => {
    setCheckingUser(true);
    try {
      // Verificar si el usuario tiene un CUI registrado
      const storedCUI = localStorage.getItem("userCUI");
      if (storedCUI) {
        // Verificar que el CUI existe en la base de datos
        const response = await axios.get(
          `http://localhost:5000/api/pet/${storedCUI}`
        );
        if (response.data.success) {
          setIsUserRegistered(true);
          setUserCUI(storedCUI);
        }
      }
    } catch (error) {
      console.log("Usuario no registrado o CUI inválido");
      setIsUserRegistered(false);
    }
    setCheckingUser(false);
  };

  const verifyCUIManually = async () => {
    if (!cuiInput.trim()) {
      setCuiError("Por favor ingresa un CUI válido");
      return;
    }

    setVerifyingCUI(true);
    setCuiError("");

    try {
      const response = await axios.get(
        `http://localhost:5000/api/pet/${cuiInput.trim()}`
      );
      if (response.data.success) {
        // CUI válido, almacenar y dar acceso
        localStorage.setItem("userCUI", cuiInput.trim());
        setUserCUI(cuiInput.trim());
        setIsUserRegistered(true);
        setCuiInput("");
      } else {
        setCuiError("CUI no encontrado en el sistema");
      }
    } catch (error) {
      setCuiError("CUI no válido o no existe en el sistema");
    }

    setVerifyingCUI(false);
  };

  const handleSubmit = async () => {
    setLoading(true);

    const reportData = new FormData();

    // Add CUI to the report data
    reportData.append("reporterCui", userCUI);

    Object.keys(formData).forEach((key) => {
      if (key === "colors") {
        reportData.append(key, JSON.stringify(formData[key]));
      } else {
        reportData.append(key, formData[key]);
      }
    });

    if (photo) {
      reportData.append("photo", photo);
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/stray-reports",
        reportData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      // Mostrar modal de éxito
      setSuccessModalOpen(true);
      // Reset form
      setFormData({
        reporterName: "",
        reporterPhone: "",
        reporterEmail: "",
        latitude: "",
        longitude: "",
        address: "",
        zone: "",
        breed: "",
        size: "medium",
        colors: [],
        temperament: "friendly",
        condition: "stray",
        gender: "",
        estimatedAge: "",
        healthStatus: "good",
        description: "",
        urgency: "normal",
        hasCollar: false,
        isInjured: false,
        needsRescue: false,
      });
      setActiveStep(0);
      setPhoto(null);
      setPhotoPreview(null);

      // Redirigir después de 3 segundos
      setTimeout(() => {
        setSuccessModalOpen(false);
        navigate("/user/dashboard");
      }, 3000);
    } catch (error) {
      console.error("Error enviando reporte:", error);
      alert("Error al enviar el reporte. Por favor, intenta nuevamente.");
    }

    setLoading(false);
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ color: "#1e293b", mb: 2, fontWeight: 600 }}>
                Información del Reportante
              </Typography>
              {userProfileData && (
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={useProfileData}
                      onChange={(e) => setUseProfileData(e.target.checked)}
                      sx={{ 
                        color: "#3b82f6",
                        "&.Mui-checked": {
                          color: "#3b82f6",
                        },
                      }}
                    />
                  }
                  label="Usar mis datos de perfil"
                  sx={{ color: "#1e293b", mb: 2 }}
                />
              )}
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nombre Completo"
                value={formData.reporterName}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    reporterName: e.target.value,
                  }))
                }
                disabled={useProfileData && !!userProfileData}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "#ffffff",
                    "& fieldset": { borderColor: "#e2e8f0" },
                  },
                  "& .MuiInputLabel-root": {
                    color: "#64748b",
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Teléfono"
                value={formData.reporterPhone}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    reporterPhone: e.target.value,
                  }))
                }
                disabled={useProfileData && !!userProfileData}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "#ffffff",
                    "& fieldset": { borderColor: "#e2e8f0" },
                  },
                  "& .MuiInputLabel-root": {
                    color: "#64748b",
                  },
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.reporterEmail}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    reporterEmail: e.target.value,
                  }))
                }
                disabled={useProfileData && !!userProfileData}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "#ffffff",
                    "& fieldset": { borderColor: "#e2e8f0" },
                  },
                  "& .MuiInputLabel-root": {
                    color: "#64748b",
                  },
                }}
              />
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <Typography variant="h6" sx={{ color: "#1e293b", fontWeight: 600 }}>
                  Ubicación del Avistamiento
                </Typography>
                <Fab
                  size="small"
                  color="primary"
                  onClick={getCurrentLocation}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={20} /> : <MyLocation />}
                </Fab>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Latitud"
                value={formData.latitude}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, latitude: e.target.value }))
                }
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "#ffffff",
                    "& fieldset": { borderColor: "#e2e8f0" },
                  },
                  "& .MuiInputLabel-root": {
                    color: "#64748b",
                  },
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Longitud"
                value={formData.longitude}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    longitude: e.target.value,
                  }))
                }
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "#ffffff",
                    "& fieldset": { borderColor: "#e2e8f0" },
                  },
                  "& .MuiInputLabel-root": {
                    color: "#64748b",
                  },
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Dirección/Referencia"
                multiline
                rows={3}
                value={formData.address}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, address: e.target.value }))
                }
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "#ffffff",
                    "& fieldset": { borderColor: "#e2e8f0" },
                  },
                  "& .MuiInputLabel-root": {
                    color: "#64748b",
                  },
                }}
              />
            </Grid>

            {location.lat && (
              <Grid item xs={12}>
                <Alert
                  severity="success"
                  sx={{ backgroundColor: "rgba(255,255,255,0.9)" }}
                >
                  <strong>Ubicación detectada:</strong>
                  <br />
                  Lat: {location.lat}, Lng: {location.lng}
                  <br />
                  {location.address}
                </Alert>
              </Grid>
            )}
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ color: "#1e293b", fontWeight: 600 }}>
                Información del Perro
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Autocomplete
                options={breeds}
                value={formData.breed || ""}
                onChange={(event, newValue) => {
                  setFormData((prev) => ({ ...prev, breed: newValue || "" }));
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Raza del Perro"
                    sx={{
                      backgroundColor: "#ffffff",
                      borderRadius: 1,
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": { borderColor: "#e2e8f0" },
                      },
                    }}
                  />
                )}
                freeSolo
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography gutterBottom sx={{ color: "#1e293b", fontWeight: 500 }}>
                Tamaño
              </Typography>
              <RadioGroup
                row
                value={formData.size}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, size: e.target.value }))
                }
              >
                <FormControlLabel
                  value="small"
                  control={<Radio sx={{ color: "#3b82f6" }} />}
                  label={<Typography sx={{ color: "#1e293b" }}>Pequeño</Typography>}
                />
                <FormControlLabel
                  value="medium"
                  control={<Radio sx={{ color: "#3b82f6" }} />}
                  label={<Typography sx={{ color: "#1e293b" }}>Mediano</Typography>}
                />
                <FormControlLabel
                  value="large"
                  control={<Radio sx={{ color: "#3b82f6" }} />}
                  label={<Typography sx={{ color: "#1e293b" }}>Grande</Typography>}
                />
              </RadioGroup>
            </Grid>

            <Grid item xs={12}>
              <Typography gutterBottom sx={{ color: "#1e293b", fontWeight: 500 }}>
                Colores
              </Typography>
              <Typography variant="body2" color="#1e293b">
                (máximo 2 colores)
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {colors.map((color) => {
                  const isSelected = formData.colors.includes(color.value);
                  return (
                    <Chip
                      key={color.value}
                      label={color.label}
                      onClick={() => {
                        setFormData((prev) => {
                          const currentColors = prev.colors || [];
                          if (isSelected) {
                            // Remover color si ya está seleccionado
                            return {
                              ...prev,
                              colors: currentColors.filter(
                                (c) => c !== color.value
                              ),
                            };
                          } else if (currentColors.length < 2) {
                            // Agregar color si no se han seleccionado 2
                            return {
                              ...prev,
                              colors: [...currentColors, color.value],
                            };
                          }
                          return prev;
                        });
                      }}
                      sx={{
                        backgroundColor: color.color,
                        color: color.value === "blanco" ? "black" : "white",
                        border: isSelected
                          ? "3px solid #2196F3"
                          : "1px solid rgba(255,255,255,0.3)",
                        opacity:
                          formData.colors.length >= 2 && !isSelected ? 0.5 : 1,
                        transform: isSelected ? "scale(1.05)" : "scale(1)",
                        transition: "all 0.2s ease",
                      }}
                      avatar={
                        <Avatar sx={{ backgroundColor: color.color }}> </Avatar>
                      }
                    />
                  );
                })}
              </Box>
              {formData.colors.length > 0 && (
                <Box mt={1}>
                  <Typography variant="body2" color="rgba(255,255,255,0.7)">
                    Colores seleccionados: {formData.colors.join(", ")}
                  </Typography>
                </Box>
              )}
            </Grid>

            <Grid item xs={12}>
              <Typography gutterBottom sx={{ color: "#1e293b", fontWeight: 500 }}>
                Temperamento
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {temperaments.map((temp) => (
                  <Chip
                    key={temp.value}
                    label={temp.label}
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        temperament: temp.value,
                      }))
                    }
                    sx={{
                      backgroundColor: temp.color,
                      color: "white",
                      border:
                        formData.temperament === temp.value
                          ? "3px solid white"
                          : "none",
                    }}
                    icon={<Psychology />}
                  />
                ))}
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography gutterBottom sx={{ color: "#1e293b", fontWeight: 500 }}>
                Condición
              </Typography>
              <RadioGroup
                value={formData.condition}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    condition: e.target.value,
                  }))
                }
              >
                <FormControlLabel
                  value="stray"
                  control={<Radio sx={{ color: "#3b82f6" }} />}
                  label={<Typography sx={{ color: "#1e293b" }}>Callejero</Typography>}
                />
                <FormControlLabel
                  value="lost"
                  control={<Radio sx={{ color: "#3b82f6" }} />}
                  label={<Typography sx={{ color: "#1e293b" }}>Perdido</Typography>}
                />
                <FormControlLabel
                  value="abandoned"
                  control={<Radio sx={{ color: "#3b82f6" }} />}
                  label={<Typography sx={{ color: "#1e293b" }}>Abandonado</Typography>}
                />
              </RadioGroup>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography gutterBottom sx={{ color: "#1e293b", fontWeight: 500 }}>
                Género
              </Typography>
              <RadioGroup
                row
                value={formData.gender}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, gender: e.target.value }))
                }
              >
                <FormControlLabel
                  value="male"
                  control={<Radio sx={{ color: "#3b82f6" }} />}
                  label={<Typography sx={{ color: "#1e293b" }}>Macho</Typography>}
                />
                <FormControlLabel
                  value="female"
                  control={<Radio sx={{ color: "#3b82f6" }} />}
                  label={<Typography sx={{ color: "#1e293b" }}>Hembra</Typography>}
                />
                <FormControlLabel
                  value="unknown"
                  control={<Radio sx={{ color: "#3b82f6" }} />}
                  label={<Typography sx={{ color: "#1e293b" }}>No sé</Typography>}
                />
              </RadioGroup>
            </Grid>
          </Grid>
        );

      case 3:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ color: "#1e293b", fontWeight: 600 }}>
                Foto y Detalles Adicionales
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper
                sx={{
                  p: 2,
                  textAlign: "center",
                  backgroundColor: "rgba(255,255,255,0.9)",
                }}
              >
                {!cameraOpen ? (
                  <>
                    {/* Botón para abrir cámara */}
                    <Button
                      variant="contained"
                      onClick={openCamera}
                      startIcon={<CameraAlt />}
                      fullWidth
                      sx={{
                        mb: 1,
                        backgroundColor: "#4CAF50",
                        "&:hover": { backgroundColor: "#45a049" },
                      }}
                    >
                      📸 Abrir Cámara
                    </Button>

                    {/* Botón para subir desde galería */}
                    <input
                      accept="image/*"
                      style={{ display: "none" }}
                      id="photo-upload"
                      type="file"
                      onChange={handlePhotoChange}
                    />
                    <label htmlFor="photo-upload">
                      <Button
                        variant="outlined"
                        component="span"
                        startIcon={<PhotoCamera />}
                        fullWidth
                        sx={{
                          mb: 2,
                          borderColor: "#2196F3",
                          color: "#2196F3",
                          "&:hover": {
                            borderColor: "#1976D2",
                            backgroundColor: "rgba(33, 150, 243, 0.1)",
                          },
                        }}
                      >
                        📁 Subir desde Galería
                      </Button>
                    </label>
                  </>
                ) : (
                  <>
                    {/* Vista de cámara */}
                    <Box sx={{ position: "relative", mb: 2 }}>
                      <video
                        id="camera-video"
                        autoPlay
                        playsInline
                        muted
                        ref={(video) => {
                          if (video && stream) {
                            video.srcObject = stream;
                          }
                        }}
                        style={{
                          width: "100%",
                          maxHeight: "300px",
                          borderRadius: "8px",
                          backgroundColor: "#000",
                        }}
                      />

                      {/* Botón cerrar cámara */}
                      <IconButton
                        onClick={closeCamera}
                        sx={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                          backgroundColor: "rgba(0,0,0,0.5)",
                          color: "white",
                          "&:hover": { backgroundColor: "rgba(0,0,0,0.7)" },
                        }}
                      >
                        <Close />
                      </IconButton>
                    </Box>

                    {/* Botón capturar foto */}
                    <Button
                      variant="contained"
                      onClick={capturePhoto}
                      startIcon={<CameraEnhance />}
                      fullWidth
                      sx={{
                        backgroundColor: "#FF5722",
                        "&:hover": { backgroundColor: "#E64A19" },
                        py: 1.5,
                        fontSize: "1.1rem",
                      }}
                    >
                      📷 Capturar Foto
                    </Button>
                  </>
                )}

                {photoPreview && !cameraOpen && (
                  <Box mt={2}>
                    <img
                      src={photoPreview}
                      alt="Preview"
                      style={{
                        width: "100%",
                        maxHeight: "200px",
                        objectFit: "cover",
                        borderRadius: "8px",
                        border: "2px solid #4CAF50",
                      }}
                    />
                    <Typography
                      variant="body2"
                      sx={{ mt: 1, color: "#4CAF50", fontWeight: "bold" }}
                    >
                      ✅ Foto capturada correctamente
                    </Typography>
                    <Button
                      variant="text"
                      onClick={() => {
                        setPhoto(null);
                        setPhotoPreview(null);
                      }}
                      sx={{ mt: 1, color: "#f44336" }}
                    >
                      🗑️ Eliminar foto
                    </Button>
                  </Box>
                )}

                {!photoPreview && !cameraOpen && (
                  <Box
                    mt={2}
                    sx={{
                      border: "2px dashed #ccc",
                      borderRadius: "8px",
                      p: 3,
                      backgroundColor: "#f5f5f5",
                    }}
                  >
                    <PhotoCamera sx={{ fontSize: 48, color: "#ccc", mb: 1 }} />
                    <Typography variant="body2" color="textSecondary">
                      Abre la cámara para tomar una foto o sube una imagen del
                      perro
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography gutterBottom sx={{ color: "#1e293b", fontWeight: 500 }}>
                Nivel de Urgencia
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                {urgencyLevels.map((level) => (
                  <Chip
                    key={level.value}
                    label={level.label}
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, urgency: level.value }))
                    }
                    sx={{
                      backgroundColor: level.color,
                      color: "white",
                      border:
                        formData.urgency === level.value
                          ? "3px solid white"
                          : "none",
                    }}
                  />
                ))}
              </Box>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descripción adicional"
                multiline
                rows={4}
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Describe cualquier detalle adicional sobre el perro, su comportamiento, estado de salud, etc."
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "#ffffff",
                    "& fieldset": { borderColor: "#e2e8f0" },
                  },
                  "& .MuiInputLabel-root": {
                    color: "#64748b",
                  },
                }}
              />
            </Grid>
          </Grid>
        );

      default:
        return null;
    }
  };

  // Si está verificando el usuario, mostrar loading
  if (checkingUser) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="60vh"
        >
          <Card
            sx={{
              backgroundColor: "rgba(255,255,255,0.1)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.2)",
              p: 4,
              textAlign: "center",
            }}
          >
            <CircularProgress size={60} sx={{ color: "white", mb: 2 }} />
            <Typography variant="h6" sx={{ color: "white" }}>
              Verificando registro de usuario...
            </Typography>
          </Card>
        </Box>
      </Container>
    );
  }

  // Si el usuario no está registrado, mostrar mensaje de restricción
  if (!isUserRegistered) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Box textAlign="center" mb={4}>
            <Typography
              variant="h3"
              sx={{ color: "white", fontWeight: "bold", mb: 2 }}
            >
              🚫 Acceso Restringido
            </Typography>
            <Typography variant="h6" sx={{ color: "rgba(255,255,255,0.8)" }}>
              Solo usuarios con carnet registrado pueden reportar perros
              callejeros
            </Typography>
          </Box>

          <Card
            sx={{
              backgroundColor: "rgba(255,255,255,0.1)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.2)",
              maxWidth: 600,
              mx: "auto",
            }}
          >
            <CardContent sx={{ p: 4, textAlign: "center" }}>
              <Box mb={3}>
                <Pets
                  sx={{ fontSize: 80, color: "rgba(255,255,255,0.7)", mb: 2 }}
                />
                <Typography variant="h5" sx={{ color: "white", mb: 2 }}>
                  ¿Por qué necesitas estar registrado?
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ color: "rgba(255,255,255,0.8)", mb: 3 }}
                >
                  Para garantizar la veracidad de los reportes y poder
                  contactarte en caso de emergencias, solo usuarios que han
                  registrado previamente una mascota pueden reportar perros
                  callejeros.
                </Typography>
              </Box>

              <Alert
                severity="info"
                sx={{ backgroundColor: "rgba(33, 150, 243, 0.1)", mb: 3 }}
              >
                <Typography sx={{ color: "white" }}>
                  <strong>¿Qué necesitas hacer?</strong>
                  <br />
                  1. Registra una mascota en el sistema
                  <br />
                  2. Obtén tu carnet digital
                  <br />
                  3. Regresa aquí para reportar perros callejeros
                </Typography>
              </Alert>

              {/* Formulario para ingresar CUI manualmente */}
              <Box
                sx={{
                  mb: 3,
                  p: 3,
                  backgroundColor: "rgba(255,255,255,0.1)",
                  borderRadius: 2,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ color: "white", mb: 2, textAlign: "center" }}
                >
                  ¿Ya tienes un CUI registrado?
                </Typography>
                <Box display="flex" gap={2} alignItems="flex-start">
                  <TextField
                    fullWidth
                    label="Ingresa tu CUI"
                    value={cuiInput}
                    onChange={(e) => {
                      setCuiInput(e.target.value);
                      setCuiError("");
                    }}
                    placeholder="Ej: 43451826-7"
                    error={!!cuiError}
                    helperText={cuiError}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: "rgba(255,255,255,0.9)",
                        "& fieldset": { borderColor: "rgba(255,255,255,0.3)" },
                      },
                    }}
                  />
                  <Button
                    variant="contained"
                    onClick={verifyCUIManually}
                    disabled={verifyingCUI || !cuiInput.trim()}
                    sx={{
                      backgroundColor: "#2196F3",
                      "&:hover": { backgroundColor: "#1976D2" },
                      minWidth: 120,
                      height: 56,
                    }}
                  >
                    {verifyingCUI ? (
                      <CircularProgress size={20} />
                    ) : (
                      "Verificar"
                    )}
                  </Button>
                </Box>
                <Typography
                  variant="body2"
                  sx={{
                    color: "rgba(255,255,255,0.7)",
                    mt: 1,
                    textAlign: "center",
                  }}
                >
                  Ingresa el CUI que obtuviste al registrar tu mascota
                </Typography>
              </Box>

              <Box
                display="flex"
                gap={2}
                justifyContent="center"
                flexWrap="wrap"
              >
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<PersonAdd />}
                  onClick={() => (window.location.href = "/register")}
                  sx={{
                    backgroundColor: "#4CAF50",
                    "&:hover": { backgroundColor: "#45a049" },
                    minWidth: 200,
                  }}
                >
                  Registrar Mascota
                </Button>

                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<Search />}
                  onClick={() => (window.location.href = "/search")}
                  sx={{
                    borderColor: "white",
                    color: "white",
                    "&:hover": {
                      borderColor: "white",
                      backgroundColor: "rgba(255,255,255,0.1)",
                    },
                    minWidth: 200,
                  }}
                >
                  Buscar mi CUI
                </Button>
              </Box>

              <Typography
                variant="body2"
                sx={{ color: "rgba(255,255,255,0.6)", mt: 3 }}
              >
                Si no recuerdas tu CUI, puedes buscarlo en la sección "Buscar"
                usando tu DNI
              </Typography>
            </CardContent>
          </Card>
        </motion.div>
      </Container>
    );
  }

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

      {/* Patrón de fondo animado con patitas */}
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
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={`paw-${i}`}
            initial={{
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
              y: -50,
              rotate: Math.random() * 360,
              scale: 0.5 + Math.random() * 0.5,
            }}
            animate={{
              y: (typeof window !== 'undefined' ? window.innerHeight : 800) + 50,
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
            }}
          >
            🐾
          </motion.div>
        ))}
      </Box>

      <Container maxWidth="lg" sx={{ py: 4, position: 'relative', zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Box textAlign="center" mb={4}>
            {/* Header con logos */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: 8,
                mb: 3,
              }}
            >
            </Box>
            <Typography
              variant="h3"
              sx={{
                color: "#1e293b",
                fontWeight: 800,
                mb: 2,
                background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              🐕 Reportar Perro Callejero
            </Typography>
            <Typography
              variant="h6"
              sx={{ color: "#64748b", mb: 3, fontWeight: 400 }}
            >
              Ayuda a los perros callejeros reportando su ubicación y estado
            </Typography>
            <Alert
              severity="success"
              icon={false}
              sx={{
                backgroundColor: "rgba(76, 175, 80, 0.1)",
                maxWidth: 600,
                mx: "auto",
                mb: 2,
                border: "1px solid rgba(76, 175, 80, 0.3)",
              }}
            >
              <Typography sx={{ color: "#15803d", fontWeight: 600 }}>
                ✅ <strong>Usuario verificado:</strong> CUI {userCUI}
              </Typography>
            </Alert>

            {/* Botón para ver mis reportes */}
            <Box
              sx={{
                display: "flex",
                gap: 2,
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <Button
                variant="contained"
                onClick={() => {
                  setShowReports(!showReports);
                  if (!showReports && myReports.length === 0) {
                    loadMyReports();
                  }
                }}
                sx={{
                  background: showReports 
                    ? "linear-gradient(135deg, #64748b 0%, #475569 100%)"
                    : "linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)",
                  color: "white",
                  px: 4,
                  py: 1.5,
                  fontWeight: 600,
                  boxShadow: "0 4px 15px rgba(59, 130, 246, 0.3)",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: "0 6px 20px rgba(59, 130, 246, 0.4)",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                {showReports ? "📝 Nuevo Reporte" : "📋 Ver Mis Reportes"}
              </Button>
            </Box>
          </Box>

          {/* Lista de mis reportes */}
          {showReports && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card
                sx={{
                  backgroundColor: "rgba(255,255,255,0.95)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(226, 232, 240, 0.8)",
                  borderRadius: 3,
                  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                  mb: 4,
                  p: 3,
                }}
              >
                <Typography
                  variant="h5"
                  sx={{ color: "#1e293b", mb: 3, fontWeight: 700 }}
                >
                  📋 Mis Reportes de Perros Callejeros
                </Typography>

                {loadingReports ? (
                  <Box display="flex" justifyContent="center" py={4}>
                    <CircularProgress sx={{ color: "#3b82f6" }} />
                  </Box>
                ) : myReports.length === 0 ? (
                  <Alert
                    severity="info"
                    sx={{ 
                      backgroundColor: "rgba(59, 130, 246, 0.1)",
                      border: "1px solid rgba(59, 130, 246, 0.2)"
                    }}
                  >
                    <Typography sx={{ color: "#1e40af", fontWeight: 500 }}>
                      No has realizado reportes todavía. ¡Crea tu primer reporte
                      para ayudar a los perros callejeros!
                    </Typography>
                  </Alert>
                ) : (
                  <Grid container spacing={3}>
                    {myReports.map((report) => (
                      <Grid item xs={12} md={6} key={report.id}>
                        <Card
                          sx={{
                            backgroundColor: "rgba(255,255,255,0.98)",
                            border: "1px solid rgba(226, 232, 240, 0.8)",
                            height: "100%",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                            transition: "all 0.3s ease",
                            "&:hover": {
                              boxShadow: "0 8px 20px rgba(59, 130, 246, 0.15)",
                              transform: "translateY(-2px)",
                            },
                          }}
                        >
                          <CardContent>
                            <Box
                              display="flex"
                              justifyContent="space-between"
                              alignItems="flex-start"
                              mb={2}
                            >
                              <Typography
                                variant="h6"
                                sx={{ color: "#1e293b", fontWeight: 600 }}
                              >
                                {report.breed || "Mestizo"}
                              </Typography>
                              <Chip
                                label={
                                  report.status === "pending"
                                    ? "Pendiente"
                                    : report.status === "resolved"
                                    ? "Resuelto"
                                    : "En Proceso"
                                }
                                size="small"
                                sx={{
                                  backgroundColor:
                                    report.status === "pending"
                                      ? "#FF9800"
                                      : report.status === "resolved"
                                      ? "#4CAF50"
                                      : "#2196F3",
                                  color: "white",
                                }}
                              />
                            </Box>

                            <Grid container spacing={1}>
                              <Grid item xs={6}>
                                <Typography
                                  variant="body2"
                                  sx={{ color: "#64748b" }}
                                >
                                  <strong>Tamaño:</strong>{" "}
                                  {report.size === "small"
                                    ? "Pequeño"
                                    : report.size === "medium"
                                    ? "Mediano"
                                    : "Grande"}
                                </Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography
                                  variant="body2"
                                  sx={{ color: "#64748b" }}
                                >
                                  <strong>Urgencia:</strong>{" "}
                                  {report.urgency === "low"
                                    ? "Baja"
                                    : report.urgency === "normal"
                                    ? "Normal"
                                    : report.urgency === "high"
                                    ? "Alta"
                                    : "Emergencia"}
                                </Typography>
                              </Grid>
                              <Grid item xs={12}>
                                <Typography
                                  variant="body2"
                                  sx={{ color: "#64748b", mt: 1 }}
                                >
                                  <LocationOn
                                    sx={{
                                      fontSize: 16,
                                      verticalAlign: "middle",
                                      mr: 0.5,
                                      color: "#3b82f6",
                                    }}
                                  />
                                  {report.address ||
                                    `Lat: ${report.latitude}, Lng: ${report.longitude}`}
                                </Typography>
                              </Grid>
                              {report.description && (
                                <Grid item xs={12}>
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      color: "#475569",
                                      mt: 1,
                                      fontStyle: "italic",
                                    }}
                                  >
                                    "{report.description}"
                                  </Typography>
                                </Grid>
                              )}
                              <Grid item xs={12}>
                                <Typography
                                  variant="caption"
                                  sx={{ color: "#94a3b8", mt: 1 }}
                                >
                                  Reportado:{" "}
                                  {new Date(report.created_at).toLocaleString(
                                    "es-PE"
                                  )}
                                </Typography>
                              </Grid>
                            </Grid>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Card>
            </motion.div>
          )}

          {/* Formulario de nuevo reporte */}
          {!showReports && (
            <Card
              sx={{
                backgroundColor: "rgba(255,255,255,0.95)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(226, 232, 240, 0.8)",
                borderRadius: 3,
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                mb: 4,
              }}
            >
              <CardContent>
                <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                  {steps.map((label) => (
                    <Step key={label}>
                      <StepLabel
                        sx={{ 
                          "& .MuiStepLabel-label": { 
                            color: "#1e293b",
                            fontWeight: 500
                          },
                          "& .MuiStepLabel-label.Mui-active": {
                            color: "#3b82f6",
                            fontWeight: 600
                          },
                          "& .MuiStepLabel-label.Mui-completed": {
                            color: "#15803d"
                          }
                        }}
                      >
                        {label}
                      </StepLabel>
                    </Step>
                  ))}
                </Stepper>

                {renderStepContent(activeStep)}

                <Box display="flex" justifyContent="space-between" mt={4}>
                  <Button
                    disabled={activeStep === 0}
                    onClick={() => setActiveStep((prev) => prev - 1)}
                    sx={{ 
                      color: "#64748b", 
                      borderColor: "#cbd5e1",
                      "&:hover": {
                        borderColor: "#94a3b8",
                        backgroundColor: "rgba(100, 116, 139, 0.05)"
                      }
                    }}
                    variant="outlined"
                  >
                    Anterior
                  </Button>

                  {activeStep === steps.length - 1 ? (
                    <Button
                      variant="contained"
                      onClick={handleSubmit}
                      disabled={loading}
                      startIcon={
                        loading ? <CircularProgress size={20} /> : <Save />
                      }
                      sx={{
                        background: "linear-gradient(135deg, #22c55e 0%, #15803d 100%)",
                        color: "white",
                        px: 4,
                        py: 1.5,
                        fontWeight: 600,
                        boxShadow: "0 4px 15px rgba(34, 197, 94, 0.3)",
                        "&:hover": {
                          transform: "translateY(-2px)",
                          boxShadow: "0 6px 20px rgba(34, 197, 94, 0.4)",
                        },
                        "&:disabled": {
                          background: "#94a3b8",
                        },
                        transition: "all 0.3s ease",
                      }}
                    >
                      {loading ? "Enviando..." : "Enviar Reporte"}
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      onClick={() => setActiveStep((prev) => prev + 1)}
                      sx={{
                        background: "linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)",
                        color: "white",
                        px: 4,
                        py: 1.5,
                        fontWeight: 600,
                        boxShadow: "0 4px 15px rgba(59, 130, 246, 0.3)",
                        "&:hover": {
                          transform: "translateY(-2px)",
                          boxShadow: "0 6px 20px rgba(59, 130, 246, 0.4)",
                        },
                        transition: "all 0.3s ease",
                      }}
                    >
                      Siguiente
                    </Button>
                  )}
                </Box>
              </CardContent>
            </Card>
          )}
        </motion.div>

        {/* Success Modal */}
        <Dialog
          open={successModalOpen}
          TransitionComponent={motion.div}
          TransitionProps={{
            initial: { opacity: 0, scale: 0.5 },
            animate: { opacity: 1, scale: 1 },
            exit: { opacity: 0, scale: 0.5 },
            transition: {
              duration: 0.5,
              type: "spring",
              stiffness: 260,
              damping: 20,
            },
          }}
          PaperProps={{
            sx: {
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              borderRadius: 3,
              minWidth: 400,
              overflow: "hidden",
            },
          }}
        >
          <Box
            sx={{
              position: "relative",
              textAlign: "center",
              py: 4,
              px: 3,
            }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <CheckCircle
                sx={{
                  fontSize: 80,
                  color: "white",
                  mb: 2,
                  filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.1))",
                }}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Typography
                variant="h4"
                sx={{ color: "white", fontWeight: 700, mb: 2 }}
              >
                ¡Reporte Enviado!
              </Typography>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Typography
                variant="body1"
                sx={{ color: "rgba(255,255,255,0.95)", mb: 3 }}
              >
                Gracias por ayudar a los perros callejeros 🐶
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "rgba(255,255,255,0.85)" }}
              >
                Redirigiendo a tu panel en 3 segundos...
              </Typography>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "100%",
                pointerEvents: "none",
                overflow: "hidden",
              }}
            >
              <Celebration
                sx={{
                  position: "absolute",
                  fontSize: 200,
                  color: "rgba(255,255,255,0.1)",
                  top: -50,
                  left: -50,
                  animation: "float 3s ease-in-out infinite",
                }}
              />
              <Celebration
                sx={{
                  position: "absolute",
                  fontSize: 150,
                  color: "rgba(255,255,255,0.08)",
                  bottom: -30,
                  right: -30,
                  animation: "float 3s ease-in-out infinite reverse",
                }}
              />
            </motion.div>

            <Box
              sx={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: 4,
                backgroundColor: "rgba(255,255,255,0.2)",
              }}
            >
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 3, ease: "linear" }}
                style={{
                  height: "100%",
                  backgroundColor: "white",
                  boxShadow: "0 0 10px rgba(255,255,255,0.5)",
                }}
              />
            </Box>
          </Box>
        </Dialog>

        <style>{`
        @keyframes float {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
          100% { transform: translateY(0px) rotate(360deg); }
        }
      `}</style>
      </Container>
    </Box>
  );
};

export default ReportStrayPage;
