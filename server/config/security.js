const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

// =====================================================
// RATE LIMITING - Protección contra fuerza bruta
// =====================================================

// Rate limiter estricto para autenticación (login/registro)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 intentos máximo
  message: {
    success: false,
    error: 'Demasiados intentos de inicio de sesión. Por favor, intenta de nuevo en 15 minutos.'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'Demasiados intentos. Por favor, espera 15 minutos antes de intentar nuevamente.',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
    });
  }
});

// Rate limiter para endpoints de API generales
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 100, // 100 requests por minuto
  message: {
    success: false,
    error: 'Demasiadas solicitudes. Por favor, reduce la velocidad.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiter para uploads (más restrictivo)
const uploadLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutos
  max: 10, // 10 uploads cada 5 minutos
  message: {
    success: false,
    error: 'Demasiados archivos subidos. Por favor, espera unos minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiter para búsquedas
const searchLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 30, // 30 búsquedas por minuto
  message: {
    success: false,
    error: 'Demasiadas búsquedas. Por favor, espera un momento.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// =====================================================
// HELMET - Headers de seguridad
// =====================================================

const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false, // Permite cargar recursos externos
  crossOriginResourcePolicy: { policy: "cross-origin" }
});

module.exports = {
  authLimiter,
  apiLimiter,
  uploadLimiter,
  searchLimiter,
  helmetConfig
};
