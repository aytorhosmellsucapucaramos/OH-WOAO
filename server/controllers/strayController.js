/**
 * Stray Reports Controller - Completo
 * Controladores para reportes de perros callejeros
 */

const { pool } = require('../config/database');
const { sendSuccess, sendError, sendPaginated } = require('../utils/responseHandler');
const { paginationResponse, extractPaginationFromQuery } = require('../utils/pagination');
const cache = require('../config/cache');
const logger = require('../config/logger');

/**
 * Crea un nuevo reporte de perro callejero
 * POST /api/stray-reports
 */
exports.create = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const {
      reporterName,
      reporterPhone,
      reporterEmail,
      latitude,
      longitude,
      address,
      zone,
      breed,
      size,
      colors,
      temperament,
      condition,
      urgency,
      gender,
      description
    } = req.body;
    
    // Parse colors if it's a JSON string
    let parsedColors = colors;
    if (typeof colors === 'string') {
      try {
        parsedColors = JSON.parse(colors);
      } catch (e) {
        parsedColors = [];
      }
    }
    
    const reporterId = req.user ? req.user.id : null;
    const photoPath = req.file ? req.file.filename : null;

    // ❗ VALIDACIÓN OBLIGATORIA: La foto es requerida
    if (!photoPath) {
      await connection.rollback();
      return sendError(res, 'La foto del perro es obligatoria para crear el reporte', 400);
    }

    // Validar ubicación (warning si está fuera de Puno, pero permitir)
    const isInPuno = latitude >= -16.5 && latitude <= -15.0 && 
                     longitude >= -70.5 && longitude <= -69.5;
    
    if (!isInPuno) {
      logger.warn('Reporte fuera de Puno', { latitude, longitude });
    }

    // Obtener IDs de catálogos
    let breedId = null;
    if (breed) {
      const [breedResult] = await connection.query(
        'SELECT id FROM breeds WHERE name = ? LIMIT 1',
        [breed]
      );
      breedId = breedResult.length > 0 ? breedResult[0].id : null;
    }
    
    // Obtener size_id
    const [sizeResult] = await connection.query(
      'SELECT id FROM sizes WHERE code = ? LIMIT 1',
      [size || 'medium']
    );
    const sizeId = sizeResult.length > 0 ? sizeResult[0].id : null;
    
    // Obtener temperament_id
    let temperamentId = null;
    if (temperament) {
      const [tempResult] = await connection.query(
        'SELECT id FROM temperaments WHERE code = ? LIMIT 1',
        [temperament]
      );
      temperamentId = tempResult.length > 0 ? tempResult[0].id : null;
    }
    
    // Obtener condition_id
    const [conditionResult] = await connection.query(
      'SELECT id FROM report_conditions WHERE code = ? LIMIT 1',
      [condition || 'stray']
    );
    const conditionId = conditionResult.length > 0 ? conditionResult[0].id : null;
    
    if (!conditionId) {
      logger.error('Condition not found', { condition: condition || 'stray' });
      throw new Error(`Condition '${condition || 'stray'}' not found in database`);
    }
    
    // Obtener urgency_level_id
    const [urgencyResult] = await connection.query(
      'SELECT id FROM urgency_levels WHERE code = ? LIMIT 1',
      [urgency || 'normal']
    );
    const urgencyLevelId = urgencyResult.length > 0 ? urgencyResult[0].id : null;
    
    if (!urgencyLevelId) {
      logger.error('Urgency level not found', { urgency: urgency || 'normal' });
      throw new Error(`Urgency level '${urgency || 'normal'}' not found in database`);
    }

    // Insertar reporte
    const [result] = await connection.query(
      `INSERT INTO stray_reports (
        reporter_id, reporter_name, reporter_phone, reporter_email,
        latitude, longitude, address, zone,
        breed_id, size_id, temperament_id, condition_id, urgency_level_id,
        description, photo_path, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
      [
        reporterId,
        reporterName,
        reporterPhone || null,
        reporterEmail || null,
        latitude,
        longitude,
        address || null,
        zone || null,
        breedId,
        sizeId,
        temperamentId,
        conditionId,
        urgencyLevelId,
        description || null,
        photoPath
      ]
    );

    const reportId = result.insertId;

    // Insertar colores en tabla pivote
    if (parsedColors && Array.isArray(parsedColors) && parsedColors.length > 0) {
      // Verificar si la columna display_order existe
      let hasDisplayOrder = false;
      try {
        const [columns] = await connection.query(`
          SELECT COLUMN_NAME 
          FROM INFORMATION_SCHEMA.COLUMNS 
          WHERE TABLE_NAME = 'stray_report_colors' 
          AND COLUMN_NAME = 'display_order'
        `);
        hasDisplayOrder = columns.length > 0;
      } catch (error) {
        logger.warn('Could not check display_order column', { error: error.message });
      }
      
      for (let i = 0; i < parsedColors.length; i++) {
        const colorName = parsedColors[i];
        const [colorResult] = await connection.query(
          'SELECT id FROM colors WHERE name = ? LIMIT 1',
          [colorName]
        );
        
        if (colorResult.length > 0) {
          if (hasDisplayOrder) {
            await connection.query(
              'INSERT INTO stray_report_colors (stray_report_id, color_id, display_order) VALUES (?, ?, ?)',
              [reportId, colorResult[0].id, i]
            );
          } else {
            await connection.query(
              'INSERT INTO stray_report_colors (stray_report_id, color_id) VALUES (?, ?)',
              [reportId, colorResult[0].id]
            );
          }
        }
      }
    }

    await connection.commit();
    
    // Invalidar caché
    cache.delPattern('stray_reports_*');

    logger.info('Stray report created', { reportId });

    res.status(201).json({
      success: true,
      message: 'Reporte creado exitosamente',
      reportId: reportId,
      warning: !isInPuno ? 'Ubicación fuera de Puno' : null
    });

  } catch (error) {
    await connection.rollback();
    
    logger.error('Error creating stray report', { 
      error: error.message,
      stack: error.stack,
      body: req.body
    });

    sendError(res, 'Error al crear el reporte: ' + error.message, 500);
  } finally {
    connection.release();
  }
};

/**
 * Obtiene todos los reportes activos con paginación y filtros
 * GET /api/stray-reports
 */
exports.getAll = async (req, res) => {
  try {
    const { page, limit } = extractPaginationFromQuery(req.query);
    const { urgency, status = 'active', breed, zone } = req.query;
    
    // Construir WHERE clause
    const conditions = ['status = ?'];
    const params = [status];
    
    if (urgency) {
      conditions.push('urgency = ?');
      params.push(urgency);
    }
    
    if (breed) {
      conditions.push('breed LIKE ?');
      params.push(`%${breed}%`);
    }
    
    if (zone) {
      conditions.push('zone = ?');
      params.push(zone);
    }
    
    const whereClause = conditions.join(' AND ');
    
    // Obtener total
    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total FROM view_stray_reports_complete WHERE ${whereClause}`,
      params
    );
    const total = countResult[0].total;
    
    // Obtener datos paginados
    const offset = (page - 1) * limit;
    const [reports] = await pool.query(
      `SELECT 
        id, reporter_name, reporter_phone, reporter_email,
        latitude, longitude, address, zone,
        breed_name as breed, 
        size_code as size, size_name,
        temperament_code as temperament, temperament_name,
        condition_code as \`condition\`, condition_name,
        urgency_code as urgency, urgency_name, urgency_color,
        colors, description, photo_path, status, created_at
       FROM view_stray_reports_complete 
       WHERE ${whereClause}
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    logger.info('Fetched stray reports', { count: reports.length, total, page });

    res.json(paginationResponse(reports, total, page, limit));

  } catch (error) {
    logger.error('Error fetching stray reports', { error: error.message });
    sendError(res, 'Error al obtener los reportes', 500);
  }
};

/**
 * Obtiene los reportes del usuario autenticado
 * GET /api/stray-reports/my-reports
 */
exports.getMyReports = async (req, res) => {
  try {
    const { page, limit } = extractPaginationFromQuery(req.query);
    const userId = req.user.id;
    
    // Obtener total
    const [countResult] = await pool.query(
      'SELECT COUNT(*) as total FROM stray_reports WHERE reporter_id = ?',
      [userId]
    );
    const total = countResult[0].total;
    
    // Obtener datos paginados
    const offset = (page - 1) * limit;
    const [reports] = await pool.query(
      `SELECT 
        id, reporter_name, reporter_phone, reporter_email,
        latitude, longitude, address, zone,
        breed_name as breed,
        size_code as size, size_name,
        temperament_code as temperament, temperament_name,
        condition_code as \`condition\`, condition_name,
        urgency_code as urgency, urgency_name, urgency_color,
        colors, description, photo_path, status, created_at
       FROM view_stray_reports_complete 
       WHERE reporter_id = ?
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [userId, limit, offset]
    );

    logger.info('Fetched user stray reports', { 
      userId,
      count: reports.length,
      total 
    });

    res.json(paginationResponse(reports, total, page, limit));

  } catch (error) {
    logger.error('Error fetching user stray reports', { 
      error: error.message,
      userId: req.user.id
    });
    sendError(res, 'Error al obtener tus reportes', 500);
  }
};

module.exports = exports;
