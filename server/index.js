/**
 * WebPerritos Server - Refactorizado
 * Sistema de registro de mascotas para la Municipalidad de Puno
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const socketIO = require('socket.io');
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

// CORS configurado - Permitir acceso desde localhost y red local
const corsOptions = {
  origin: function (origin, callback) {
    // Permitir requests sin origin (como apps móviles, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // Lista de orígenes permitidos específicos
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5000',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5000',
      'http://192.168.1.11:3000',
      'http://192.168.1.11:5000',
      process.env.CLIENT_URL
    ].filter(Boolean); // Eliminar undefined
    
    // Patrones para redes locales (más permisivo para desarrollo)
    const localNetworkPatterns = [
      /^http:\/\/localhost:\d+$/,                          // localhost con cualquier puerto
      /^http:\/\/127\.0\.0\.1:\d+$/,                       // 127.0.0.1 con cualquier puerto
      /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}:\d+$/,        // 192.168.x.x (WiFi normal)
      /^http:\/\/172\.\d{1,3}\.\d{1,3}\.\d{1,3}:\d+$/,    // 172.x.x.x (hotspot iPhone)
      /^http:\/\/10\.\d{1,3}\.\d{1,3}\.\d{1,3}:\d+$/,     // 10.x.x.x (otra red privada)
      /^http:\/\/26\.\d{1,3}\.\d{1,3}\.\d{1,3}:\d+$/      // 26.x.x.x (Hamachi/VPN)
    ];
    
    // Verificar si el origin está en la lista permitida
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    
    // Verificar si coincide con algún patrón de red local
    const isLocalNetwork = localNetworkPatterns.some(pattern => pattern.test(origin));
    
    if (isLocalNetwork) {
      callback(null, true);
    } else {
      logger.warn(`CORS bloqueó origen no permitido: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
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
// TEMPORAL: Desactivado para desarrollo
// app.use('/api/', apiLimiter);

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
const adminUsersRoutes = require('./routes/adminUsers');  // Gestión de usuarios
const userProfileRoutes = require('./routes/userProfile'); // Perfil de usuario
const catalogsRoutes = require('./routes/catalogs');
const seguimientoRoutes = require('./routes/seguimiento'); // Rutas de seguimiento

// Mount routes
app.use('/api', petsRoutes);              // Rutas de mascotas
app.use('/api/auth', authRoutes);         // Rutas de autenticación
app.use('/api/stray-reports', strayReportsRoutes);  // Rutas de reportes callejeros
app.use('/api/admin', adminRoutes);       // Rutas de administración (general)
app.use('/api/admin/users', adminUsersRoutes); // Rutas de gestión de usuarios (admin)
app.use('/api/profile', userProfileRoutes);    // Rutas de perfil de usuario (todos)
app.use('/api/catalogs', catalogsRoutes); // Rutas de catálogos
app.use('/api/seguimiento', seguimientoRoutes); // Rutas de personal de seguimiento

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
// INICIAR SERVIDOR CON WEBSOCKET
// =====================================================

const httpServer = http.createServer(app);
let io;
let server;

// Configurar Socket.IO
if (process.env.NODE_ENV !== 'test') {
  io = socketIO(httpServer, {
    cors: {
      origin: function (origin, callback) {
        // Permitir requests sin origin
        if (!origin) return callback(null, true);
        
        // Permitir localhost y red local
        const allowedOrigins = [
          'http://localhost:3000',
          'http://localhost:5000',
          'http://127.0.0.1:3000',
          'http://127.0.0.1:5000',
          'http://192.168.1.11:3000',
          'http://192.168.1.11:5000',
          process.env.CLIENT_URL
        ].filter(Boolean);
        
        // Patrones para redes locales (mismo que CORS principal)
        const localNetworkPatterns = [
          /^http:\/\/localhost:\d+$/,
          /^http:\/\/127\.0\.0\.1:\d+$/,
          /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}:\d+$/,        // WiFi normal
          /^http:\/\/172\.\d{1,3}\.\d{1,3}\.\d{1,3}:\d+$/,    // hotspot iPhone
          /^http:\/\/10\.\d{1,3}\.\d{1,3}\.\d{1,3}:\d+$/,     // otra red privada
          /^http:\/\/26\.\d{1,3}\.\d{1,3}\.\d{1,3}:\d+$/      // Hamachi/VPN
        ];
        
        if (allowedOrigins.indexOf(origin) !== -1) {
          return callback(null, true);
        }
        
        const isLocalNetwork = localNetworkPatterns.some(pattern => pattern.test(origin));
        
        if (isLocalNetwork) {
          callback(null, true);
        } else {
          logger.warn(`WebSocket CORS bloqueó origen: ${origin}`);
          callback(new Error('Not allowed by CORS'));
        }
      },
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // Guardar instancia de io globalmente para usarla en rutas
  app.set('io', io);

  // WebSocket: Eventos
  io.on('connection', (socket) => {
    logger.info(`🔌 Cliente conectado: ${socket.id}`);

    // Unirse a room de admin para notificaciones
    socket.on('join-admin', () => {
      socket.join('admin-room');
      logger.info(`👤 Usuario se unió a admin-room: ${socket.id}`);
    });

    // Desconexión
    socket.on('disconnect', () => {
      logger.info(`🔌 Cliente desconectado: ${socket.id}`);
    });
  });

  // Iniciar servidor
  server = httpServer.listen(PORT, '0.0.0.0', () => {
    logger.info(`✅ Server running on port ${PORT}`);
    logger.info(`🌎 Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.info(`🔒 Security: Rate limiting, Helmet, CORS configured`);
    logger.info(`📝 Logs directory: ${path.join(__dirname, 'logs')}`);
    logger.info(`🏗️  Architecture: Modular (Controllers, Services, Utils)`);
    logger.info(`⚡ WebSocket: Enabled`);
    
    // Mostrar IPs locales para acceso móvil
    const os = require('os');
    const networkInterfaces = os.networkInterfaces();
    logger.info(`📱 Acceso desde celular:`);
    Object.keys(networkInterfaces).forEach((interfaceName) => {
      networkInterfaces[interfaceName].forEach((iface) => {
        if (iface.family === 'IPv4' && !iface.internal) {
          logger.info(`   → http://${iface.address}:${PORT}`);
        }
      });
    });
  });
}

// =====================================================
// GRACEFUL SHUTDOWN
// =====================================================

process.on('SIGINT', async () => {
  logger.info('Received SIGINT signal, shutting down gracefully...');
  
  if (server) {
    server.close(() => {
      logger.info('HTTP server closed');
    });
  }
  
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
