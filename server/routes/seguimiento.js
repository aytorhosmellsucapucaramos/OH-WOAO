/**
 * Seguimiento Routes
 * Rutas para personal de seguimiento (field workers)
 */

const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { verifyToken } = require('../middleware/auth');
const logger = require('../config/logger');

// Middleware para verificar que el usuario sea personal de seguimiento
const verifySeguimiento = (req, res, next) => {
  if (req.user.role_id !== 3) { // role_id = 3 es seguimiento
    return res.status(403).json({
      success: false,
      message: 'Acceso denegado. Solo personal de seguimiento puede acceder.'
    });
  }
  next();
};

// GET /api/seguimiento/assigned-cases - Obtener casos asignados al personal
router.get('/assigned-cases', verifyToken, verifySeguimiento, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const [cases] = await pool.query(`
      SELECT 
        sr.*,
        reporter.first_name as reporter_first_name,
        reporter.last_name as reporter_last_name,
        reporter.phone as reporter_phone,
        reporter.email as reporter_email,
        breeds.name as breed_name,
        sizes.name as size_name,
        sizes.code as size_code,
        temperaments.name as temperament_name,
        temperaments.code as temperament_code,
        conditions.name as condition_name,
        urgencies.name as urgency_name,
        urgencies.color as urgency_color,
        urgencies.priority as urgency_priority
      FROM stray_reports sr
      LEFT JOIN adopters reporter ON sr.reporter_id = reporter.id
      LEFT JOIN breeds ON sr.breed_id = breeds.id
      LEFT JOIN sizes ON sr.size_id = sizes.id
      LEFT JOIN temperaments ON sr.temperament_id = temperaments.id
      LEFT JOIN report_conditions conditions ON sr.condition_id = conditions.id
      LEFT JOIN urgency_levels urgencies ON sr.urgency_level_id = urgencies.id
      WHERE sr.assigned_to = ?
      ORDER BY 
        CASE sr.status
          WHEN 'in_progress' THEN 1
          WHEN 'active' THEN 2
          WHEN 'resolved' THEN 3
          WHEN 'closed' THEN 4
        END,
        urgencies.priority DESC,
        sr.created_at DESC
    `, [userId]);
    
    // Estadísticas del personal
    const [stats] = await pool.query(`
      SELECT 
        COUNT(*) as total_assigned,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
        SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved,
        SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) as closed
      FROM stray_reports
      WHERE assigned_to = ?
    `, [userId]);
    
    res.json({
      success: true,
      cases,
      stats: stats[0],
      total: cases.length
    });
  } catch (error) {
    logger.error('Error getting assigned cases:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener casos asignados',
      error: error.message
    });
  }
});

// PUT /api/seguimiento/cases/:id/status - Actualizar estado de un caso
router.put('/cases/:id/status', verifyToken, verifySeguimiento, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const userId = req.user.id;
    
    // Validar que el caso esté asignado al usuario
    const [assigned] = await pool.query(
      'SELECT id FROM stray_reports WHERE id = ? AND assigned_to = ?',
      [id, userId]
    );
    
    if (assigned.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Este caso no está asignado a ti'
      });
    }
    
    // Validar estados permitidos
    const validStatuses = ['in_progress', 'resolved', 'closed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Estado inválido'
      });
    }
    
    // Actualizar estado
    await pool.query(
      'UPDATE stray_reports SET status = ?, updated_at = NOW() WHERE id = ?',
      [status, id]
    );
    
    // Si hay notas, guardarlas (en una tabla de seguimiento si existe)
    if (notes) {
      logger.info(`Notas de seguimiento para caso ${id}:`, notes);
      // TODO: Implementar tabla de seguimiento de casos
    }
    
    // Obtener datos actualizados
    const [updatedCase] = await pool.query(
      'SELECT * FROM stray_reports WHERE id = ?',
      [id]
    );
    
    res.json({
      success: true,
      message: 'Estado actualizado exitosamente',
      case: updatedCase[0]
    });
  } catch (error) {
    logger.error('Error updating case status:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar estado',
      error: error.message
    });
  }
});

// GET /api/seguimiento/stats - Estadísticas del personal
router.get('/stats', verifyToken, verifySeguimiento, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const [stats] = await pool.query(`
      SELECT 
        COUNT(*) as total_cases,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
        SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved,
        SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) as closed,
        SUM(CASE WHEN DATE(created_at) = CURDATE() THEN 1 ELSE 0 END) as today,
        SUM(CASE WHEN WEEK(created_at) = WEEK(NOW()) THEN 1 ELSE 0 END) as this_week
      FROM stray_reports
      WHERE assigned_to = ?
    `, [userId]);
    
    res.json({
      success: true,
      stats: stats[0]
    });
  } catch (error) {
    logger.error('Error getting stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas',
      error: error.message
    });
  }
});

module.exports = router;
