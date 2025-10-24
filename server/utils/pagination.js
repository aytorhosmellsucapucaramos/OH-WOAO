/**
 * Pagination Utility
 * Estandariza la paginación en toda la aplicación
 */

/**
 * Genera parámetros de paginación SQL
 * @param {number} page - Número de página (1-indexed)
 * @param {number} limit - Elementos por página
 * @returns {object} - { offset, limit, page }
 */
function getPaginationParams(page = 1, limit = 10) {
  const pageNum = parseInt(page) || 1;
  const limitNum = Math.min(parseInt(limit) || 10, 100); // Máximo 100
  const offset = (pageNum - 1) * limitNum;
  
  return {
    offset,
    limit: limitNum,
    page: pageNum
  };
}

/**
 * Construye respuesta paginada estandarizada
 * @param {array} data - Datos de la página actual
 * @param {number} total - Total de elementos
 * @param {number} page - Página actual
 * @param {number} limit - Elementos por página
 * @returns {object} - Respuesta estandarizada
 */
function paginationResponse(data, total, page, limit) {
  const totalPages = Math.ceil(total / limit);
  
  return {
    success: true,
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
      nextPage: page < totalPages ? page + 1 : null,
      prevPage: page > 1 ? page - 1 : null
    }
  };
}

/**
 * Agrega cláusula LIMIT y OFFSET a una query SQL
 * @param {string} baseQuery - Query SQL base
 * @param {number} page - Número de página
 * @param {number} limit - Elementos por página
 * @returns {object} - { query, params: { offset, limit } }
 */
function paginateQuery(baseQuery, page = 1, limit = 10) {
  const { offset, limit: limitNum } = getPaginationParams(page, limit);
  
  return {
    query: `${baseQuery} LIMIT ? OFFSET ?`,
    params: { offset, limit: limitNum },
    page: parseInt(page) || 1,
    limit: limitNum
  };
}

/**
 * Extrae parámetros de paginación de query string
 * @param {object} query - req.query object
 * @returns {object} - { page, limit }
 */
function extractPaginationFromQuery(query) {
  return {
    page: parseInt(query.page) || 1,
    limit: Math.min(parseInt(query.limit) || 10, 100)
  };
}

module.exports = {
  getPaginationParams,
  paginationResponse,
  paginateQuery,
  extractPaginationFromQuery
};
