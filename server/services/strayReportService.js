/**
 * Stray Report Service
 * Lógica de negocio para reportes de perros callejeros
 */

const { pool } = require('../config/database');
const logger = require('../config/logger');

/**
 * Obtiene el ID de un adoptante a partir del CUI de su mascota
 * 
 * @param {string} cui - CUI de la mascota
 * @returns {Promise<number|null>} ID del adoptante o null
 */
async function getAdopterIdFromCUI(cui) {
  if (!cui) return null;
  
  const connection = await pool.getConnection();
  try {
    const [petResult] = await connection.query(
      'SELECT adopter_id FROM pets WHERE cui = ?',
      [cui]
    );
    
    return petResult.length > 0 ? petResult[0].adopter_id : null;
  } finally {
    connection.release();
  }
}

/**
 * Obtiene el ID de un catálogo por código o nombre
 * 
 * @param {string} table - Nombre de la tabla de catálogo
 * @param {string} field - Nombre del campo (code o name)
 * @param {string} value - Valor a buscar
 * @returns {Promise<number|null>} ID encontrado o null
 */
async function getCatalogId(table, field, value) {
  if (!value) return null;
  
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.query(
      `SELECT id FROM ${table} WHERE ${field} = ? LIMIT 1`,
      [value]
    );
    
    return result.length > 0 ? result[0].id : null;
  } finally {
    connection.release();
  }
}

/**
 * Parsea un array de colores desde diferentes formatos
 * 
 * @param {string|Array} colors - Colores en formato string JSON, CSV o array
 * @returns {Array} Array de colores
 */
function parseColors(colors) {
  if (!colors) return [];
  
  if (typeof colors === 'string') {
    try {
      return JSON.parse(colors);
    } catch (e) {
      return colors.split(',').map(c => c.trim());
    }
  }
  
  return Array.isArray(colors) ? colors : [];
}

/**
 * Crea un nuevo reporte de perro callejero
 * 
 * @param {Object} reportData - Datos del reporte
 * @param {Object} file - Archivo de foto (opcional)
 * @returns {Promise<Object>} Reporte creado
 */
async function createStrayReport(reportData, file = null) {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const {
      reporterCui, reporterName, reporterPhone, reporterEmail,
      latitude, longitude, address, zone,
      breed, size, colors, temperament,
      condition, urgency,
      description
    } = reportData;
    
    // Mapear nombres del frontend al backend
    const condition_type = condition;
    const urgency_level = urgency;
    
    // Obtener ID del reportante si tiene CUI
    const reporterId = await getAdopterIdFromCUI(reporterCui);
    
    // Manejar foto subida
    const photoPath = file ? file.filename : null;
    
    // Obtener IDs de catálogos
    const breedId = await getCatalogId('breeds', 'name', breed);
    const sizeId = await getCatalogId('sizes', 'code', size);
    const temperamentId = await getCatalogId('temperaments', 'code', temperament);
    const conditionId = await getCatalogId('report_conditions', 'code', condition_type);
    const urgencyId = await getCatalogId('urgency_levels', 'code', urgency_level);
    
    logger.info('Creating stray report', {
      breedId, sizeId, temperamentId, conditionId, urgencyId
    });
    
    // SISTEMA NORMALIZADO: Obtener ID del estado 'Nuevo'
    const [statusType] = await pool.query(
      'SELECT id FROM stray_report_status_types WHERE code = ?',
      ['n']
    );
    
    if (statusType.length === 0) {
      throw new Error('Estado "Nuevo" no encontrado en el catálogo de estados');
    }
    
    const newStatusId = statusType[0].id;
    
    // Crear el reporte principal con sistema normalizado
    const [result] = await pool.query(`
      INSERT INTO stray_reports (
        reporter_id, reporter_name, reporter_phone, reporter_email,
        address, zone, latitude, longitude,
        breed_id, size_id, temperament_id, condition_id, urgency_level_id,
        description, photo_path, status_type_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      reporterId, reporterName, reporterPhone, reporterEmail,
      address, zone, latitude, longitude,
      breedId, sizeId, temperamentId,
      conditionId, urgencyId,
      description, photoPath, newStatusId
    ]);
    
    const reportId = result.insertId;
    
    // Insertar colores en tabla pivote
    const colorsArray = parseColors(colors);
    if (colorsArray.length > 0) {
      for (let i = 0; i < colorsArray.length; i++) {
        const colorId = await getCatalogId('colors', 'name', colorsArray[i]);
        if (colorId) {
          await pool.query(
            'INSERT INTO stray_report_colors (stray_report_id, color_id, display_order) VALUES (?, ?, ?)',
            [reportId, colorId, i]
          );
        }
      }
    }
    
    await connection.commit();
    
    logger.logActivity('stray_report_created', reporterId, { reportId, address });
    
    return {
      reportId,
      status: 'n'
    };
    
  } catch (error) {
    await connection.rollback();
    logger.error('Error creating stray report', { error: error.message });
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * Obtiene todos los reportes activos para el mapa
 * 
 * @returns {Promise<Array>} Lista de reportes
 */
async function getActiveReports() {
  const connection = await pool.getConnection();
  
  try {
    const [reports] = await connection.query(`
      SELECT 
        sr.*,
        st.code as status,
        st.name as status_name,
        b.name as breed,
        s.name as size,
        t.name as temperament,
        rc.name as condition_type,
        ul.name as urgency_level,
        CONCAT(a.first_name, ' ', a.last_name) as adopter_name,
        a.phone as adopter_phone,
        a.email as adopter_email,
        GROUP_CONCAT(c.name ORDER BY src.display_order SEPARATOR ', ') as colors
      FROM stray_reports sr
      JOIN stray_report_status_types st ON sr.status_type_id = st.id
      LEFT JOIN breeds b ON sr.breed_id = b.id
      LEFT JOIN sizes s ON sr.size_id = s.id
      LEFT JOIN temperaments t ON sr.temperament_id = t.id
      LEFT JOIN report_conditions rc ON sr.condition_id = rc.id
      LEFT JOIN urgency_levels ul ON sr.urgency_level_id = ul.id
      LEFT JOIN adopters a ON sr.reporter_id = a.id
      LEFT JOIN stray_report_colors src ON sr.id = src.stray_report_id
      LEFT JOIN colors c ON src.color_id = c.id
      WHERE st.code IN ('n', 'a', 'p', 'd')
      GROUP BY sr.id
      ORDER BY sr.created_at DESC
    `);
    
    // Formatear reportes
    return reports.map(report => ({
      id: report.id,
      reporterName: report.reporter_name || report.adopter_name || 'Anónimo',
      reporterPhone: report.reporter_phone || report.adopter_phone || 'No disponible',
      reporterEmail: report.reporter_email || report.adopter_email || 'No disponible',
      latitude: parseFloat(report.latitude),
      longitude: parseFloat(report.longitude),
      address: report.address,
      zone: report.zone,
      breed: report.breed || 'Desconocido',
      size: report.size || 'medium',
      colors: report.colors ? report.colors.split(', ') : ['marrón'],
      temperament: report.temperament || 'unknown',
      condition: report.condition_type || 'stray',
      urgency: report.urgency_level || 'normal',
      description: report.description,
      photoPath: report.photo_path,
      status: report.status,
      createdAt: report.created_at
    }));
    
  } finally {
    connection.release();
  }
}

/**
 * Obtiene los reportes de un usuario específico
 * 
 * @param {number} userId - ID del usuario
 * @returns {Promise<Array>} Lista de reportes del usuario
 */
async function getUserReports(userId) {
  const connection = await pool.getConnection();
  
  try {
    const [reports] = await connection.query(`
      SELECT 
        sr.*,
        b.name as breed,
        s.name as size,
        t.name as temperament,
        rc.name as condition_type,
        ul.name as urgency_level,
        GROUP_CONCAT(c.name ORDER BY src.display_order SEPARATOR ', ') as colors
      FROM stray_reports sr
      LEFT JOIN breeds b ON sr.breed_id = b.id
      LEFT JOIN sizes s ON sr.size_id = s.id
      LEFT JOIN temperaments t ON sr.temperament_id = t.id
      LEFT JOIN report_conditions rc ON sr.condition_id = rc.id
      LEFT JOIN urgency_levels ul ON sr.urgency_level_id = ul.id
      LEFT JOIN stray_report_colors src ON sr.id = src.stray_report_id
      LEFT JOIN colors c ON src.color_id = c.id
      WHERE sr.reporter_id = ?
      GROUP BY sr.id
      ORDER BY sr.created_at DESC
    `, [userId]);
    
    return reports;
    
  } finally {
    connection.release();
  }
}

module.exports = {
  createStrayReport,
  getActiveReports,
  getUserReports
};
