/**
 * LocationPicker Component
 * Selector de ubicación para reportes con Leaflet
 */

import React, { useState, useEffect } from 'react';
import { Box, TextField, Typography, Paper, Button, CircularProgress, Alert } from '@mui/material';
import { LocationOn, MyLocation, CheckCircle } from '@mui/icons-material';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix para los iconos de Leaflet en Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Componente para manejar clicks en el mapa
function LocationMarker({ position, onPositionChange }) {
  useMapEvents({
    click(e) {
      onPositionChange(e.latlng.lat, e.latlng.lng);
    },
  });

  return position ? (
    <Marker position={[position.latitude, position.longitude]}>
      <Popup>
        📍 Ubicación del avistamiento<br />
        Lat: {position.latitude.toFixed(6)}<br />
        Lng: {position.longitude.toFixed(6)}
      </Popup>
    </Marker>
  ) : null;
}

const LocationPicker = ({ location, address, onLocationChange, onAddressChange, error }) => {
  const [gettingLocation, setGettingLocation] = React.useState(false);
  const [fetchingAddress, setFetchingAddress] = React.useState(false);
  const [addressFetched, setAddressFetched] = React.useState(false);
  
  // Función para obtener dirección desde coordenadas (Geocoding Inverso)
  const fetchAddressFromCoordinates = async (lat, lng) => {
    setFetchingAddress(true);
    setAddressFetched(false);
    
    try {
      // Usar API de Nominatim de OpenStreetMap (gratuita)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'es'
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        
        // Construir dirección legible
        const addressParts = [];
        if (data.address.road) addressParts.push(data.address.road);
        if (data.address.house_number) addressParts.push(data.address.house_number);
        if (data.address.suburb) addressParts.push(data.address.suburb);
        if (data.address.city || data.address.town || data.address.village) {
          addressParts.push(data.address.city || data.address.town || data.address.village);
        }
        if (data.address.state) addressParts.push(data.address.state);
        
        const formattedAddress = addressParts.length > 0 
          ? addressParts.join(', ')
          : data.display_name;
        
        onAddressChange(formattedAddress);
        setAddressFetched(true);
        
        // Ocultar el mensaje después de 3 segundos
        setTimeout(() => setAddressFetched(false), 3000);
      }
    } catch (error) {
      console.error('Error fetching address:', error);
    } finally {
      setFetchingAddress(false);
    }
  };
  
  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      setGettingLocation(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          onLocationChange(lat, lng);
          setGettingLocation(false);
          
          // Obtener dirección automáticamente
          await fetchAddressFromCoordinates(lat, lng);
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('No se pudo obtener tu ubicación. Por favor ingresa la dirección manualmente o haz clic en el mapa.');
          setGettingLocation(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      alert('Tu navegador no soporta geolocalización');
    }
  };
  
  // Función para manejar el click en el mapa con geocoding
  const handleMapClick = async (lat, lng) => {
    onLocationChange(lat, lng);
    await fetchAddressFromCoordinates(lat, lng);
  };

  return (
    <Box>
      <Typography 
        variant="h5" 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1.5, 
          mb: 4,
          color: '#1e293b',
          fontWeight: 600
        }}
      >
        <LocationOn sx={{ color: '#3b82f6', fontSize: 28 }} /> 
        Ubicación del Avistamiento
      </Typography>
      
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          mb: 3, 
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(147, 197, 253, 0.05) 100%)',
          border: '1px solid rgba(59, 130, 246, 0.2)',
          borderRadius: 2
        }}
      >
        <Typography variant="body2" sx={{ color: '#475569', lineHeight: 1.6 }}>
          <strong>📍 Importante:</strong> Marca la ubicación exacta donde viste al perro. Esto ayudará a las autoridades a encontrarlo más rápido.
        </Typography>
      </Paper>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Estado de carga de dirección */}
        {fetchingAddress && (
          <Alert 
            severity="info" 
            icon={<CircularProgress size={20} />}
            sx={{ mb: -1 }}
          >
            Obteniendo dirección automáticamente...
          </Alert>
        )}
        
        {/* Confirmación de dirección obtenida */}
        {addressFetched && (
          <Alert 
            severity="success" 
            icon={<CheckCircle />}
            sx={{ mb: -1 }}
          >
            ✅ Dirección obtenida automáticamente. Puedes editarla si es necesario.
          </Alert>
        )}
        
        {/* Dirección */}
        <TextField
          fullWidth
          label="Dirección"
          value={address}
          onChange={(e) => onAddressChange(e.target.value)}
          error={!!error}
          helperText={error || 'Ingresa la dirección donde viste al perro'}
          required
          placeholder="Ej: Av. El Sol 123, Centro de Puno"
          multiline
          rows={2}
        />

        {/* Botón de ubicación actual */}
        <Button
          variant="contained"
          startIcon={gettingLocation ? null : <MyLocation />}
          onClick={handleGetCurrentLocation}
          disabled={gettingLocation}
          sx={{ 
            alignSelf: 'flex-start',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: 'white',
            px: 3,
            py: 1.5,
            fontWeight: 600,
            boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
            '&:hover': {
              background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 20px rgba(16, 185, 129, 0.4)'
            },
            '&:disabled': {
              background: '#94a3b8'
            },
            transition: 'all 0.3s ease'
          }}
        >
          {gettingLocation ? 'Obteniendo ubicación...' : 'Usar mi ubicación actual'}
        </Button>

        {/* Coordenadas */}
        <Paper 
          elevation={0} 
          sx={{ 
            p: 3, 
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(147, 197, 253, 0.08) 100%)',
            border: '2px solid rgba(59, 130, 246, 0.2)',
            borderRadius: 2
          }}
        >
          <Typography 
            variant="subtitle2" 
            sx={{ 
              color: '#1e40af', 
              fontWeight: 600,
              mb: 1.5,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <LocationOn sx={{ fontSize: 18 }} />
            Coordenadas Geográficas
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <Box>
              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>
                Latitud
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600, color: '#1e293b', fontFamily: 'monospace' }}>
                {location.latitude.toFixed(6)}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>
                Longitud
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600, color: '#1e293b', fontFamily: 'monospace' }}>
                {location.longitude.toFixed(6)}
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Mapa interactivo con Leaflet */}
        <Box
          sx={{
            height: 400,
            borderRadius: 2,
            overflow: 'hidden',
            border: '2px solid #e0e0e0',
            '& .leaflet-container': {
              height: '100%',
              width: '100%',
              borderRadius: 2
            }
          }}
        >
          <MapContainer
            center={[location.latitude, location.longitude]}
            zoom={15}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <LocationMarker
              position={location}
              onPositionChange={handleMapClick}
            />
          </MapContainer>
        </Box>
        <Paper 
          elevation={0}
          sx={{ 
            p: 2.5, 
            mt: -1,
            background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.08) 0%, rgba(245, 158, 11, 0.08) 100%)',
            border: '1px solid rgba(251, 191, 36, 0.3)',
            borderRadius: 2
          }}
        >
          <Typography 
            variant="body2" 
            sx={{ 
              color: '#92400e',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'flex-start',
              gap: 1
            }}
          >
            <span style={{ fontSize: '1.2rem' }}>📍</span>
            <Box>
              <strong>Cómo usar el mapa:</strong>
              <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
                <li>Haz clic en el mapa para marcar la ubicación → <strong>La dirección se obtiene automáticamente</strong></li>
                <li>Usa el botón "Usar mi ubicación actual" → <strong>Obtiene tu ubicación y dirección</strong></li>
                <li>Puedes editar la dirección manualmente si es necesario</li>
              </ul>
            </Box>
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
};

export default LocationPicker;
