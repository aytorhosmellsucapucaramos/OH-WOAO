const logger = require('../config/logger');

/**
 * Middleware para logging de requests HTTP
 */
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // Log cuando la respuesta termina
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent'),
    };

    // Solo incluir userId si está autenticado
    if (req.user && req.user.id) {
      logData.userId = req.user.id;
    }

    // Log según el código de estado
    if (res.statusCode >= 500) {
      logger.error('HTTP Request Failed', logData);
    } else if (res.statusCode >= 400) {
      logger.warn('HTTP Request Client Error', logData);
    } else {
      logger.info('HTTP Request', logData);
    }
  });

  next();
};

/**
 * Middleware para logging de errores no capturados
 */
const errorLogger = (err, req, res, next) => {
  logger.logError(err, {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userId: req.user?.id,
    body: req.body,
  });

  next(err);
};

module.exports = {
  requestLogger,
  errorLogger
};
