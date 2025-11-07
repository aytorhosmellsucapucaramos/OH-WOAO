import React from 'react';
import { Box, LinearProgress, Typography } from '@mui/material';
import { motion } from 'framer-motion';

/**
 * StepProgress - Barra de progreso visual para formularios multi-paso
 * Muestra progreso lineal + información del paso actual
 */
const StepProgress = ({ 
  currentStep, 
  totalSteps, 
  stepLabels = [], 
  showPercentage = true,
  color = 'primary' 
}) => {
  const progress = ((currentStep + 1) / totalSteps) * 100;
  const stepNumber = currentStep + 1;

  return (
    <Box sx={{ width: '100%', mb: 3 }}>
      {/* Información del paso */}
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 1
        }}
      >
        <Typography 
          variant="body2" 
          sx={{ 
            fontWeight: 600, 
            color: '#428cef',
            fontSize: { xs: '0.85rem', md: '0.9rem' }
          }}
        >
          {stepLabels[currentStep] || `Paso ${stepNumber} de ${totalSteps}`}
        </Typography>
        
        {showPercentage && (
          <Typography 
            variant="caption" 
            sx={{ 
              fontWeight: 600, 
              color: '#757575',
              fontSize: { xs: '0.75rem', md: '0.8rem' }
            }}
          >
            {Math.round(progress)}%
          </Typography>
        )}
      </Box>

      {/* Barra de progreso */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{ transformOrigin: 'left' }}
      >
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 8,
            borderRadius: 4,
            backgroundColor: '#e0e0e0',
            '& .MuiLinearProgress-bar': {
              borderRadius: 4,
              background: color === 'primary' 
                ? 'linear-gradient(90deg, #428cef 0%, #667eea 100%)'
                : color === 'success'
                ? 'linear-gradient(90deg, #4caf50 0%, #66bb6a 100%)'
                : color === 'warning'
                ? 'linear-gradient(90deg, #ff9800 0%, #ffa726 100%)'
                : 'linear-gradient(90deg, #428cef 0%, #667eea 100%)',
              transition: 'transform 0.4s ease',
            },
          }}
        />
      </motion.div>

      {/* Indicadores de mini-steps */}
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          mt: 1,
          px: 0.5
        }}
      >
        {Array.from({ length: totalSteps }).map((_, index) => (
          <Box
            key={index}
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: index <= currentStep ? '#428cef' : '#e0e0e0',
              transition: 'all 0.3s ease',
              transform: index === currentStep ? 'scale(1.3)' : 'scale(1)',
            }}
          />
        ))}
      </Box>
    </Box>
  );
};

export default StepProgress;
