/**
 * Seguimiento Routes
 * Rutas para personal de seguimiento (field workers)
 */

const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { verifyToken } = require('../middleware/auth');
const strayController = require('../controllers/strayController');
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
    
    // SISTEMA NORMALIZADO: Consulta con JOIN a tabla de estados
    const [cases] = await pool.query(`
      SELECT 
        sr.*,
        st.code as status,
        st.name as status_name,
        st.color as status_color,
        st.requires_notes as status_requires_notes,
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
      JOIN stray_report_status_types st ON sr.status_type_id = st.id
      LEFT JOIN adopters reporter ON sr.reporter_id = reporter.id
      LEFT JOIN breeds ON sr.breed_id = breeds.id
      LEFT JOIN sizes ON sr.size_id = sizes.id
      LEFT JOIN temperaments ON sr.temperament_id = temperaments.id
      LEFT JOIN report_conditions conditions ON sr.condition_id = conditions.id
      LEFT JOIN urgency_levels urgencies ON sr.urgency_level_id = urgencies.id
      WHERE sr.assigned_to = ?
      ORDER BY 
        st.display_order ASC,
        urgencies.priority DESC,
        sr.created_at DESC
    `, [userId]);
    
    console.log(`📊 [SEGUIMIENTO-API] Casos obtenidos con sistema normalizado: ${cases.length}`);
    
    // Calcular estadísticas basadas en estados normalizados
    const realStats = cases.reduce((acc, caseItem) => {
      acc.total_assigned++;
      
      // Mapear estados normalizados a estadísticas
      switch(caseItem.status) {
        case 'a': // Asignado
          acc.a = (acc.a || 0) + 1;
          break;
        case 'p': // En Progreso 
          acc.p = (acc.p || 0) + 1;
          break;
        case 'd': // Completado
          acc.d = (acc.d || 0) + 1;
          break;
        case 'r': // En Revisión
          acc.r = (acc.r || 0) + 1;
          break;
        default:
          acc.other = (acc.other || 0) + 1;
      }
      
      return acc;
    }, { total_assigned: 0 });
    
    console.log(`📊 [SEGUIMIENTO-API] Estadísticas normalizadas calculadas:`, realStats);
    
    console.log(`📊 [SEGUIMIENTO-API] Enviando ${cases.length} casos normalizados al frontend`);
    
    res.json({
      success: true,
      cases: cases, // Usar casos con estados normalizados
      stats: realStats, // Usar estadísticas calculadas 
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
router.put('/cases/:id/status', verifyToken, strayController.updateStatus);

// GET /api/seguimiento/stats - Estadísticas del personal
router.get('/stats', verifyToken, verifySeguimiento, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const [stats] = await pool.query(`
      SELECT 
        COUNT(*) as total_cases,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
        SUM(CASE WHEN status = 'under_review' THEN 1 ELSE 0 END) as under_review,
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
