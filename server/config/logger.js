const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Crear directorio de logs si no existe
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Formato personalizado para logs
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Formato para consola (más legible)
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
      msg += ` ${JSON.stringify(meta)}`;
    }
    return msg;
  })
);

// Configuración de Winston
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'webperritos-api' },
  transports: [
    // Log de errores
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    
    // Log combinado
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    
    // Log de actividad de usuarios
    new winston.transports.File({
      filename: path.join(logsDir, 'activity.log'),
      level: 'info',
      maxsize: 5242880, // 5MB
      maxFiles: 3,
    }),
  ],
});

// En desarrollo, también log a consola
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: consoleFormat,
  }));
}

// Funciones helper para logging específico
logger.logActivity = (action, userId, details = {}) => {
  logger.info('User Activity', {
    action,
    userId,
    ...details,
    timestamp: new Date().toISOString()
  });
};

logger.logAuth = (action, email, success, ip = null) => {
  logger.info('Authentication', {
    action,
    email,
    success,
    ip,
    timestamp: new Date().toISOString()
  });
};

logger.logUpload = (userId, fileName, fileSize, fileType) => {
  logger.info('File Upload', {
    userId,
    fileName,
    fileSize,
    fileType,
    timestamp: new Date().toISOString()
  });
};

logger.logError = (error, context = {}) => {
  logger.error('Application Error', {
    message: error.message,
    stack: error.stack,
    ...context,
    timestamp: new Date().toISOString()
  });
};

logger.logSecurity = (event, severity, details = {}) => {
  logger.warn('Security Event', {
    event,
    severity,
    ...details,
    timestamp: new Date().toISOString()
  });
};

module.exports = logger;
