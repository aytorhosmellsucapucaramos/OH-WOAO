/**
 * Cache Configuration
 * Sistema de caché centralizado usando node-cache
 */

const NodeCache = require('node-cache');
const logger = require('./logger');

// Configuración del caché
// stdTTL: Tiempo de vida estándar en segundos (10 minutos)
// checkperiod: Intervalo de limpieza de claves expiradas
const cache = new NodeCache({
  stdTTL: 600, // 10 minutos
  checkperiod: 120, // Verificar cada 2 minutos
  useClones: false // No clonar objetos (mejor performance)
});

// Event listeners para debugging
cache.on('set', (key, value) => {
  logger.debug(`Cache SET: ${key}`);
});

cache.on('del', (key) => {
  logger.debug(`Cache DEL: ${key}`);
});

cache.on('expired', (key, value) => {
  logger.debug(`Cache EXPIRED: ${key}`);
});

/**
 * Obtiene un valor del caché
 * @param {string} key - Clave del caché
 * @returns {any|undefined} - Valor cacheado o undefined
 */
function get(key) {
  try {
    return cache.get(key);
  } catch (error) {
    logger.error('Cache GET error', { key, error: error.message });
    return undefined;
  }
}

/**
 * Guarda un valor en el caché
 * @param {string} key - Clave del caché
 * @param {any} value - Valor a cachear
 * @param {number} ttl - Tiempo de vida en segundos (opcional)
 * @returns {boolean} - true si se guardó exitosamente
 */
function set(key, value, ttl) {
  try {
    return cache.set(key, value, ttl);
  } catch (error) {
    logger.error('Cache SET error', { key, error: error.message });
    return false;
  }
}

/**
 * Elimina una clave del caché
 * @param {string} key - Clave a eliminar
 * @returns {number} - Número de claves eliminadas
 */
function del(key) {
  try {
    return cache.del(key);
  } catch (error) {
    logger.error('Cache DEL error', { key, error: error.message });
    return 0;
  }
}

/**
 * Elimina múltiples claves que coinciden con un patrón
 * @param {string} pattern - Patrón de búsqueda (ej: 'pets_*')
 * @returns {number} - Número de claves eliminadas
 */
function delPattern(pattern) {
  try {
    const keys = cache.keys().filter(key => key.startsWith(pattern.replace('*', '')));
    return cache.del(keys);
  } catch (error) {
    logger.error('Cache DEL PATTERN error', { pattern, error: error.message });
    return 0;
  }
}

/**
 * Limpia todo el caché
 */
function flush() {
  try {
    cache.flushAll();
    logger.info('Cache flushed');
  } catch (error) {
    logger.error('Cache FLUSH error', { error: error.message });
  }
}

/**
 * Obtiene estadísticas del caché
 * @returns {object} - Estadísticas
 */
function getStats() {
  return cache.getStats();
}

/**
 * Middleware para cachear respuestas
 * @param {string} keyPrefix - Prefijo de la clave de caché
 * @param {number} ttl - Tiempo de vida en segundos
 * @returns {Function} - Middleware de Express
 */
function cacheMiddleware(keyPrefix, ttl = 600) {
  return (req, res, next) => {
    // Solo cachear GET requests
    if (req.method !== 'GET') {
      return next();
    }
    
    // Generar clave única basada en URL y query params
    const cacheKey = `${keyPrefix}_${req.originalUrl}`;
    
    // Intentar obtener del caché
    const cachedResponse = get(cacheKey);
    
    if (cachedResponse) {
      logger.debug(`Cache HIT: ${cacheKey}`);
      return res.json(cachedResponse);
    }
    
    logger.debug(`Cache MISS: ${cacheKey}`);
    
    // Interceptar el método json de res para cachear la respuesta
    const originalJson = res.json.bind(res);
    
    res.json = function(data) {
      // Solo cachear respuestas exitosas
      if (data && data.success !== false) {
        set(cacheKey, data, ttl);
      }
      return originalJson(data);
    };
    
    next();
  };
}

module.exports = {
  get,
  set,
  del,
  delPattern,
  flush,
  getStats,
  cacheMiddleware
};
