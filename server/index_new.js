/**
 * WebPerritos Server - Refactorizado
 * Sistema de registro de mascotas para la Municipalidad de Puno
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// =====================================================
// CONFIGURACIÓN Y UTILIDADES
// =====================================================

// Database
const { testConnection, initializeDatabase } = require('./config/database');

// Logger
const logger = require('./config/logger');
const { requestLogger, errorLogger } = require('./middleware/requestLogger');

// Security
const { apiLimiter, helmetConfig } = require('./config/security');

// Validar JWT_SECRET al inicio
if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'tu_jwt_secret_super_seguro_aqui_cambiar_en_produccion') {
  logger.error('❌ ERROR CRÍTICO: JWT_SECRET no está configurado en .env');
  logger.error('Genera uno con: npm run generate-jwt');
  process.exit(1);
}

logger.info('✅ JWT_SECRET configurado correctamente');

// =====================================================
// INICIALIZAR APLICACIÓN
// =====================================================

const app = express();
const PORT = process.env.PORT || 5000;

// =====================================================
// MIDDLEWARE DE SEGURIDAD
// =====================================================

// Helmet - Headers de seguridad
app.use(helmetConfig);

// CORS configurado
const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use(requestLogger);

// Rate limiting general para API
app.use('/api/', apiLimiter);

// Archivos estáticos
app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));

// =====================================================
// INICIALIZAR BASE DE DATOS
// =====================================================

(async () => {
  try {
    const isConnected = await testConnection();
    if (isConnected) {
      await initializeDatabase();
    }
  } catch (error) {
    logger.error('Failed to initialize database', { error: error.message });
  }
})();

// =====================================================
// RUTAS MODULARES
// =====================================================

// Import routes
const petsRoutes = require('./routes/pets');
const authRoutes = require('./routes/auth_new');
const strayReportsRoutes = require('./routes/strayReports_new');
const adminRoutes = require('./routes/admin');

// Mount routes
app.use('/api', petsRoutes);              // Rutas de mascotas
app.use('/api/auth', authRoutes);         // Rutas de autenticación
app.use('/api/stray-reports', strayReportsRoutes);  // Rutas de reportes callejeros
app.use('/api/admin', adminRoutes);       // Rutas de administración

// =====================================================
// HEALTH CHECK
// =====================================================

app.get('/api/health', async (req, res) => {
  try {
    const isConnected = await testConnection();
    res.json({ 
      status: isConnected ? 'OK' : 'Database connection failed', 
      timestamp: new Date().toISOString(),
      version: '2.0.0',
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'Error', 
      error: error.message,
      timestamp: new Date().toISOString() 
    });
  }
});

// =====================================================
// ERROR HANDLING MIDDLEWARE
// =====================================================

app.use(errorLogger);

const multer = require('multer');

app.use((error, req, res, next) => {
  // Manejo especial de errores de Multer
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      logger.warn('File upload rejected - Size limit exceeded', { 
        file: req.file?.originalname,
        userId: req.user?.id 
      });
      return res.status(400).json({ 
        success: false,
        error: 'El archivo es demasiado grande. Máximo 10MB.' 
      });
    }
  }
  
  // Log del error
  logger.error('Unhandled error', {
    error: error.message,
    stack: error.stack,
    method: req.method,
    url: req.originalUrl,
    userId: req.user?.id
  });
  
  // Respuesta genérica
  res.status(500).json({ 
    success: false,
    error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor' 
  });
});

// =====================================================
// INICIAR SERVIDOR
// =====================================================

const server = app.listen(PORT, () => {
  logger.info(`✅ Server running on port ${PORT}`);
  logger.info(`🌎 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`🔒 Security: Rate limiting, Helmet, CORS configured`);
  logger.info(`📝 Logs directory: ${path.join(__dirname, 'logs')}`);
  logger.info(`🏗️  Architecture: Modular (Controllers, Services, Utils)`);
});

// =====================================================
// GRACEFUL SHUTDOWN
// =====================================================

process.on('SIGINT', async () => {
  logger.info('Received SIGINT signal, shutting down gracefully...');
  
  server.close(() => {
    logger.info('HTTP server closed');
  });
  
  try {
    const { pool } = require('./config/database');
    await pool.end();
    logger.info('Database pool closed');
  } catch (error) {
    logger.error('Error closing database pool', { error: error.message });
  }
  
  process.exit(0);
});

// Manejo de errores no capturados
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', { 
    error: error.message,
    stack: error.stack
  });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', { 
    reason: reason,
    promise: promise 
  });
});

// =====================================================
// EXPORTAR APP PARA TESTS
// =====================================================

module.exports = app;
