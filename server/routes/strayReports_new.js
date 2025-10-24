/**
 * Stray Reports Routes - Refactorizado
 * Rutas para reportes de perros callejeros
 */

const express = require('express');
const router = express.Router();
const strayController = require('../controllers/strayController');
const { uploadSingle } = require('../services/uploadService');
const { verifyToken } = require('../middleware/auth');
const { uploadLimiter } = require('../config/security');
const { validate, strayReportSchema } = require('../middleware/validation');

// POST /api/stray-reports - Crear nuevo reporte
router.post('/',
  uploadLimiter,
  uploadSingle('photo'),
  validate(strayReportSchema),
  strayController.create
);

// GET /api/stray-reports - Obtener todos los reportes activos
router.get('/',
  strayController.getAll
);

// GET /api/stray-reports/my-reports - Obtener reportes del usuario
router.get('/my-reports',
  verifyToken,
  strayController.getMyReports
);

module.exports = router;
