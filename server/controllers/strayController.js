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

    // SISTEMA NORMALIZADO: Obtener ID del estado 'Nuevo' para reportes recién creados
    const [statusType] = await connection.query(
      'SELECT id FROM stray_report_status_types WHERE code = ?',
      ['n'] // 'n' = Nuevo
    );
    
    if (statusType.length === 0) {
      throw new Error('Estado "Nuevo" no encontrado en el catálogo de estados');
    }
    
    const newStatusId = statusType[0].id;
    console.log(`📝 [CREAR-REPORTE] Asignando estado 'Nuevo' (ID: ${newStatusId}) al nuevo reporte`);

    // Insertar reporte con sistema normalizado
    const [result] = await connection.query(
      `INSERT INTO stray_reports (
        reporter_id, reporter_name, reporter_phone, reporter_email,
        latitude, longitude, address, zone,
        breed_id, size_id, temperament_id, condition_id, urgency_level_id,
        description, photo_path, status_type_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
        photoPath,
        newStatusId // Status normalizado: 'Nuevo'
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

/**
 * Asigna un reporte a una persona de seguimiento
 * PUT /api/stray-reports/:id/assign
 */
exports.assign = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { id } = req.params;
    const { assignedTo } = req.body; // ID del usuario de seguimiento
    const assignedBy = req.user.id; // Usuario que hace la asignación

    // Verificar que el reporte existe
    const [reportResult] = await connection.query(
      'SELECT id, status FROM stray_reports WHERE id = ?',
      [id]
    );

    if (reportResult.length === 0) {
      return sendError(res, 'Reporte no encontrado', 404);
    }

    // Verificar que el usuario asignado existe y es de seguimiento
    const [userResult] = await connection.query(
      'SELECT a.id, a.first_name, a.last_name, r.code as role_code FROM adopters a LEFT JOIN roles r ON a.role_id = r.id WHERE a.id = ?',
      [assignedTo]
    );

    if (userResult.length === 0) {
      return sendError(res, 'Usuario asignado no encontrado', 404);
    }

    if (userResult[0].role_code !== 'seguimiento') {
      return sendError(res, 'Solo se puede asignar a personal de seguimiento', 400);
    }

    await connection.beginTransaction();

    // Actualizar asignación
    await connection.query(
      `UPDATE stray_reports SET
        assigned_to = ?,
        assigned_by = ?,
        assigned_at = NOW(),
        status = 'in_progress'
       WHERE id = ?`,
      [assignedTo, assignedBy, id]
    );

    await connection.commit();

    // Invalidar caché
    cache.delPattern('stray_reports_*');

    logger.info('Stray report assigned', {
      reportId: id,
      assignedTo,
      assignedBy
    });

    res.json({
      success: true,
      message: `Reporte asignado a ${userResult[0].first_name} ${userResult[0].last_name}`,
      assignedTo: {
        id: userResult[0].id,
        name: `${userResult[0].first_name} ${userResult[0].last_name}`,
        role: userResult[0].role_code
      }
    });

  } catch (error) {
    await connection.rollback();
    logger.error('Error assigning stray report', {
      error: error.message,
      reportId: req.params.id,
      assignedTo: req.body.assignedTo
    });
    sendError(res, 'Error al asignar el reporte', 500);
  } finally {
    connection.release();
  }
};

/**
 * Desasigna un reporte
 * PUT /api/stray-reports/:id/unassign
 */
exports.unassign = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { id } = req.params;
    const unassignedBy = req.user.id;

    // Verificar que el reporte existe
    const [reportResult] = await connection.query(
      'SELECT id, status, assigned_to FROM stray_reports WHERE id = ?',
      [id]
    );

    if (reportResult.length === 0) {
      return sendError(res, 'Reporte no encontrado', 404);
    }

    await connection.beginTransaction();

    // Desasignar reporte
    await connection.query(
      `UPDATE stray_reports SET
        assigned_to = NULL,
        assigned_by = ?,
        assigned_at = NULL,
        status = 'active'
       WHERE id = ?`,
      [unassignedBy, id]
    );

    await connection.commit();

    // Invalidar caché
    cache.delPattern('stray_reports_*');

    logger.info('Stray report unassigned', {
      reportId: id,
      unassignedBy
    });

    res.json({
      success: true,
      message: 'Reporte desasignado correctamente'
    });

  } catch (error) {
    await connection.rollback();
    logger.error('Error unassigning stray report', {
      error: error.message,
      reportId: req.params.id
    });
    sendError(res, 'Error al desasignar el reporte', 500);
  } finally {
    connection.release();
  }
};

/**
 * Obtiene los reportes asignados al usuario de seguimiento
 * GET /api/stray-reports/assigned
 */
exports.getAssignedReports = async (req, res) => {
  try {
    const { page, limit } = extractPaginationFromQuery(req.query);
    const userId = req.user.id;

    // Verificar que el usuario es de seguimiento
    const [userResult] = await pool.query(
      'SELECT r.code as role_code FROM adopters a LEFT JOIN roles r ON a.role_id = r.id WHERE a.id = ?',
      [userId]
    );

    if (userResult.length === 0 || userResult[0].role_code !== 'seguimiento') {
      return sendError(res, 'Solo el personal de seguimiento puede acceder a esta información', 403);
    }

    // Obtener total
    const [countResult] = await pool.query(
      'SELECT COUNT(*) as total FROM stray_reports WHERE assigned_to = ?',
      [userId]
    );
    const total = countResult[0].total;

    // Obtener datos paginados
    const offset = (page - 1) * limit;
    const [reports] = await pool.query(
      `SELECT
        sr.id, sr.reporter_name, sr.reporter_phone, sr.reporter_email,
        sr.latitude, sr.longitude, sr.address, sr.zone,
        sr.breed_name as breed,
        sr.size_code as size, sr.size_name,
        sr.temperament_code as temperament, sr.temperament_name,
        sr.condition_code as \`condition\`, sr.condition_name,
        sr.urgency_code as urgency, sr.urgency_name, sr.urgency_color,
        sr.colors, sr.description, sr.photo_path, sr.status, sr.created_at,
        sr.assigned_at, sr.status_notes, sr.status_updated_at,
        assigned_by_user.first_name as assigned_by_first_name,
        assigned_by_user.last_name as assigned_by_last_name
       FROM view_stray_reports_complete sr
       LEFT JOIN adopters assigned_by_user ON sr.assigned_by = assigned_by_user.id
       WHERE sr.assigned_to = ?
       ORDER BY sr.assigned_at DESC, sr.created_at DESC
       LIMIT ? OFFSET ?`,
      [userId, limit, offset]
    );

    logger.info('Fetched assigned stray reports', {
      userId,
      count: reports.length,
      total
    });

    res.json(paginationResponse(reports, total, page, limit));

  } catch (error) {
    logger.error('Error fetching assigned stray reports', {
      error: error.message,
      userId: req.user.id
    });
    sendError(res, 'Error al obtener reportes asignados', 500);
  }
};

/**
 * Actualiza el estado de un reporte asignado
 * PUT /api/stray-reports/:id/status
 */
exports.updateStatus = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const updatedBy = req.user.id;

    // Estados permitidos para seguimiento
    const allowedStatuses = ['a', 'p', 'd', 'r'];
    if (!allowedStatuses.includes(status)) {
      return sendError(res, 'Estado no válido para actualización', 400);
    }

    // Validar que las notas sean obligatorias para 'd' y 'r'
    if ((status === 'd' || status === 'r') && (!notes || !notes.trim())) {
      const statusName = status === 'd' ? 'Completado' : 'En Revisión';
      return sendError(res, `Es obligatorio agregar notas cuando se marca como "${statusName}"`, 400);
    }

    // Verificar que el reporte existe y está asignado al usuario
    const [reportResult] = await connection.query(
      'SELECT id, status, assigned_to FROM stray_reports WHERE id = ?',
      [id]
    );

    if (reportResult.length === 0) {
      return sendError(res, 'Reporte no encontrado', 404);
    }

    if (reportResult[0].assigned_to !== updatedBy) {
      return sendError(res, 'Solo puedes actualizar reportes asignados a ti', 403);
    }

    await connection.beginTransaction();

    // SISTEMA NORMALIZADO: Actualizar usando status_type_id
    console.log(`🔧 [SEGUIMIENTO] Actualizando estado normalizado para reporte ${id}`);
    console.log(`🔧 [SEGUIMIENTO] Estado solicitado: '${status}', Notas: '${notes?.substring(0, 50)}...'`);
    
    // Obtener el ID del estado desde la tabla normalizada
    const [statusType] = await connection.query(
      'SELECT id, name, requires_notes FROM stray_report_status_types WHERE code = ?',
      [status]
    );
    
    if (statusType.length === 0) {
      throw new Error(`Estado '${status}' no encontrado en el catálogo`);
    }
    
    const statusTypeId = statusType[0].id;
    const statusName = statusType[0].name;
    
    console.log(`🎯 [SEGUIMIENTO] Estado encontrado: '${statusName}' (ID: ${statusTypeId})`);
    
    // Actualizar usando el sistema normalizado
    await connection.query(
      `UPDATE stray_reports SET
        status_type_id = ?,
        status_notes = ?,
        status_updated_at = NOW(),
        updated_at = NOW()
       WHERE id = ?`,
      [statusTypeId, notes || null, id]
    );
    
    console.log(`✅ [SEGUIMIENTO] Estado normalizado actualizado para reporte ${id}`);
    
    // DEBUG: Verificar que se actualizó
    const [verifyUpdate] = await connection.query(
      `SELECT sr.id, st.code as status_code, st.name as status_name, 
              sr.status_notes, sr.assigned_to
       FROM stray_reports sr
       JOIN stray_report_status_types st ON sr.status_type_id = st.id
       WHERE sr.id = ?`,
      [id]
    );
    console.log(`🔍 [DEBUG] Estado después de actualización:`, verifyUpdate[0]);

    // Registrar actividad
    logger.info('Stray report status updated', {
      reportId: id,
      oldStatus: reportResult[0].status,
      newStatus: status,
      updatedBy,
      notes: notes ? notes.substring(0, 100) + '...' : null
    });

    await connection.commit();

    // Invalidar caché
    cache.delPattern('stray_reports_*');

    res.json({
      success: true,
      message: `✅ Notas actualizadas correctamente (estado no modificado por limitación de BD)`,
      status,
      notes
    });

  } catch (error) {
    await connection.rollback();
    logger.error('Error updating stray report status', {
      error: error.message,
      reportId: req.params.id,
      status: req.body.status
    });
    sendError(res, 'Error al actualizar el estado del reporte', 500);
  } finally {
    connection.release();
  }
};

module.exports = exports;
