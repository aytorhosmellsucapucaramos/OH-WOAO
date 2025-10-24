/**
 * Script para programar limpieza automática de archivos huérfanos
 * 
 * Se ejecuta diariamente a las 3:00 AM
 * Solo elimina archivos más antiguos que 7 días
 */

const cron = require('node-cron');
const { exec } = require('child_process');
const path = require('path');
const logger = require('../config/logger');

// Ejecutar limpieza diariamente a las 3:00 AM
const task = cron.schedule('0 3 * * *', () => {
  logger.info('🧹 Iniciando limpieza programada de archivos huérfanos...');
  
  const scriptPath = path.join(__dirname, 'cleanup-orphaned-files.js');
  
  exec(`node "${scriptPath}" --older-than-days=7`, (error, stdout, stderr) => {
    if (error) {
      logger.error('Error en limpieza automática:', error);
      return;
    }
    
    if (stderr) {
      logger.warn('Advertencias en limpieza:', stderr);
    }
    
    logger.info('Limpieza completada:', stdout);
  });
}, {
  scheduled: true,
  timezone: "America/Lima" // Ajusta según tu zona horaria
});

logger.info('✅ Tarea de limpieza programada: Diariamente a las 3:00 AM');

module.exports = task;
