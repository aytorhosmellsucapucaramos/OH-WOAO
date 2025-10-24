/**
 * LocationPicker Component
 * Selector de ubicación para reportes con Leaflet
 */

import React, { useState, useEffect } from 'react';
import { Box, TextField, Typography, Paper, Button } from '@mui/material';
import { LocationOn, MyLocation } from '@mui/icons-material';
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
        Ubicación del avistamiento<br />
        Lat: {position.latitude.toFixed(6)}<br />
        Lng: {position.longitude.toFixed(6)}
      </Popup>
    </Marker>
  ) : null;
}

const LocationPicker = ({ location, address, onLocationChange, onAddressChange, error }) => {
  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          onLocationChange(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('No se pudo obtener tu ubicación. Por favor ingresa la dirección manualmente.');
        }
      );
    } else {
      alert('Tu navegador no soporta geolocalización');
    }
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <LocationOn /> Ubicación del Avistamiento
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
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
        />

        {/* Botón de ubicación actual */}
        <Button
          variant="outlined"
          startIcon={<MyLocation />}
          onClick={handleGetCurrentLocation}
          sx={{ alignSelf: 'flex-start' }}
        >
          Usar mi ubicación actual
        </Button>

        {/* Coordenadas */}
        <Paper elevation={0} sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
          <Typography variant="caption" color="text.secondary" gutterBottom display="block">
            Coordenadas (se detectan automáticamente)
          </Typography>
          <Typography variant="body2">
            <strong>Latitud:</strong> {location.latitude.toFixed(6)}
          </Typography>
          <Typography variant="body2">
            <strong>Longitud:</strong> {location.longitude.toFixed(6)}
          </Typography>
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
              onPositionChange={onLocationChange}
            />
          </MapContainer>
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ mt: -2 }}>
          📍 Haz clic en el mapa para seleccionar la ubicación exacta del avistamiento
        </Typography>
      </Box>
    </Box>
  );
};

export default LocationPicker;
