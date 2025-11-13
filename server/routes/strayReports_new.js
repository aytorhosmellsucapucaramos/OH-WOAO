/**
 * Stray Reports Routes - Completo con Caché
 * Rutas para reportes de perros callejeros
 */

const express = require('express');
const router = express.Router();
const strayController = require('../controllers/strayController');
const { uploadSingle } = require('../services/uploadService');
const { verifyToken, optionalAuth } = require('../middleware/auth');
const { uploadLimiter } = require('../config/security');
const { validate, strayReportSchema } = require('../middleware/validation');
const { cacheMiddleware } = require('../config/cache');

// POST /api/stray-reports - Crear nuevo reporte
router.post('/',
  uploadLimiter,
  optionalAuth, // Auth opcional (puede reportar sin cuenta)
  uploadSingle('photo'),
  validate(strayReportSchema),
  strayController.create
);

// GET /api/stray-reports - Obtener todos los reportes activos (con caché)
router.get('/',
  cacheMiddleware('stray_reports_list', 300), // Cache 5 minutos
  strayController.getAll
);

// GET /api/stray-reports/my-reports - Obtener reportes del usuario
router.get('/my-reports',
  verifyToken,
  strayController.getMyReports
);

// GET /api/stray-reports/stats - Estadísticas de reportes
router.get('/stats', async (req, res) => {
  try {
    const { pool } = require('../config/database');
    
    const [total] = await pool.query('SELECT COUNT(*) as count FROM stray_reports');
    const [byUrgency] = await pool.query(`
      SELECT ul.code, ul.name, COUNT(*) as count 
      FROM stray_reports sr
      LEFT JOIN urgency_levels ul ON sr.urgency_level_id = ul.id
      GROUP BY ul.code, ul.name
    `);
    const [byStatus] = await pool.query(`
      SELECT status, COUNT(*) as count 
      FROM stray_reports 
      GROUP BY status
    `);
    
    res.json({
      success: true,
      total: total[0].count,
      byUrgency,
      byStatus
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error al obtener estadísticas' });
  }
});

// GET /api/stray-reports/assigned - Obtener reportes asignados (solo seguimiento)
router.get('/assigned',
  verifyToken,
  strayController.getAssignedReports
);

// PUT /api/stray-reports/:id/assign - Asignar reporte a seguimiento
router.put('/:id/assign',
  verifyToken,
  strayController.assign
);

// PUT /api/stray-reports/:id/unassign - Desasignar reporte
router.put('/:id/unassign',
  verifyToken,
  strayController.unassign
);

// PUT /api/stray-reports/:id/status - Actualizar estado (solo seguimiento asignado)
router.put('/:id/status',
  verifyToken,
  strayController.updateStatus
);

module.exports = router;
