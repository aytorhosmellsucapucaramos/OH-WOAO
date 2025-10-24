/**
 * ReportFilters Component
 * Filtros para el mapa de reportes
 */

import React from 'react';
import {
  Paper, FormControl, InputLabel, Select, MenuItem,
  FormControlLabel, Switch, Box, Typography, Chip, IconButton
} from '@mui/material';
import { FilterList, Clear } from '@mui/icons-material';

const ReportFilters = ({ filters, onFilterChange, onResetFilters, totalReports, visibleReports }) => {
  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 3, 
        mb: 3,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white'
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FilterList />
          <Typography variant="h6">Filtros de Búsqueda</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Chip 
            label={`${visibleReports} de ${totalReports} reportes`}
            sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
          />
          <IconButton 
            onClick={onResetFilters}
            sx={{ color: 'white' }}
            title="Limpiar filtros"
          >
            <Clear />
          </IconButton>
        </Box>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, gap: 2 }}>
        {/* Filtro Urgencia */}
        <FormControl fullWidth size="small">
          <InputLabel sx={{ color: 'rgba(255,255,255,0.9)' }}>Urgencia</InputLabel>
          <Select
            value={filters.urgency}
            onChange={(e) => onFilterChange('urgency', e.target.value)}
            label="Urgencia"
            sx={{ 
              backgroundColor: 'rgba(255,255,255,0.15)',
              color: 'white',
              '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.5)' },
              '& .MuiSvgIcon-root': { color: 'white' }
            }}
          >
            <MenuItem value="all">Todas</MenuItem>
            <MenuItem value="emergency">🔴 Emergencia</MenuItem>
            <MenuItem value="high">🟠 Alta</MenuItem>
            <MenuItem value="normal">🟡 Normal</MenuItem>
            <MenuItem value="low">🟢 Baja</MenuItem>
          </Select>
        </FormControl>

        {/* Filtro Condición */}
        <FormControl fullWidth size="small">
          <InputLabel sx={{ color: 'rgba(255,255,255,0.9)' }}>Condición</InputLabel>
          <Select
            value={filters.condition}
            onChange={(e) => onFilterChange('condition', e.target.value)}
            label="Condición"
            sx={{ 
              backgroundColor: 'rgba(255,255,255,0.15)',
              color: 'white',
              '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.5)' },
              '& .MuiSvgIcon-root': { color: 'white' }
            }}
          >
            <MenuItem value="all">Todas</MenuItem>
            <MenuItem value="stray">Callejero</MenuItem>
            <MenuItem value="injured">Herido</MenuItem>
            <MenuItem value="lost">Perdido</MenuItem>
          </Select>
        </FormControl>

        {/* Filtro Tamaño */}
        <FormControl fullWidth size="small">
          <InputLabel sx={{ color: 'rgba(255,255,255,0.9)' }}>Tamaño</InputLabel>
          <Select
            value={filters.size}
            onChange={(e) => onFilterChange('size', e.target.value)}
            label="Tamaño"
            sx={{ 
              backgroundColor: 'rgba(255,255,255,0.15)',
              color: 'white',
              '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.5)' },
              '& .MuiSvgIcon-root': { color: 'white' }
            }}
          >
            <MenuItem value="all">Todos</MenuItem>
            <MenuItem value="small">Pequeño</MenuItem>
            <MenuItem value="medium">Mediano</MenuItem>
            <MenuItem value="large">Grande</MenuItem>
          </Select>
        </FormControl>

        {/* Filtro Temperamento */}
        <FormControl fullWidth size="small">
          <InputLabel sx={{ color: 'rgba(255,255,255,0.9)' }}>Temperamento</InputLabel>
          <Select
            value={filters.temperament}
            onChange={(e) => onFilterChange('temperament', e.target.value)}
            label="Temperamento"
            sx={{ 
              backgroundColor: 'rgba(255,255,255,0.15)',
              color: 'white',
              '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.5)' },
              '& .MuiSvgIcon-root': { color: 'white' }
            }}
          >
            <MenuItem value="all">Todos</MenuItem>
            <MenuItem value="friendly">Amigable</MenuItem>
            <MenuItem value="neutral">Neutral</MenuItem>
            <MenuItem value="aggressive">Agresivo</MenuItem>
            <MenuItem value="scared">Asustado</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Switch para reportes recientes */}
      <Box sx={{ mt: 2 }}>
        <FormControlLabel
          control={
            <Switch
              checked={filters.showOnlyRecent}
              onChange={(e) => onFilterChange('showOnlyRecent', e.target.checked)}
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': { color: 'white' },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: 'rgba(255,255,255,0.5)' }
              }}
            />
          }
          label="Mostrar solo reportes recientes (últimos 7 días)"
          sx={{ color: 'white' }}
        />
      </Box>
    </Paper>
  );
};

export default ReportFilters;
