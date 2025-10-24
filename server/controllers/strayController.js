/**
 * Stray Reports Controller
 * Controladores para reportes de perros callejeros
 */

const strayReportService = require('../services/strayReportService');
const { sendSuccess, sendError } = require('../utils/responseHandler');
const logger = require('../config/logger');

/**
 * Crea un nuevo reporte de perro callejero
 * POST /api/stray-reports
 */
exports.create = async (req, res) => {
  try {
    const reportData = req.body;
    const file = req.file;

    const result = await strayReportService.createStrayReport(reportData, file);

    logger.info('Stray report created', { reportId: result.reportId });

    sendSuccess(res, {
      message: 'Reporte creado exitosamente',
      reportId: result.reportId,
      status: result.status
    }, 201);

  } catch (error) {
    logger.error('Error creating stray report', { 
      error: error.message,
      stack: error.stack
    });

    sendError(res, 'Error al crear el reporte');
  }
};

/**
 * Obtiene todos los reportes activos
 * GET /api/stray-reports
 */
exports.getAll = async (req, res) => {
  try {
    const reports = await strayReportService.getActiveReports();

    logger.info('Fetched active stray reports', { count: reports.length });

    sendSuccess(res, { reports });

  } catch (error) {
    logger.error('Error fetching stray reports', { error: error.message });
    sendError(res, 'Error al obtener los reportes');
  }
};

/**
 * Obtiene los reportes del usuario autenticado
 * GET /api/stray-reports/my-reports
 */
exports.getMyReports = async (req, res) => {
  try {
    const reports = await strayReportService.getUserReports(req.user.id);

    logger.info('Fetched user stray reports', { 
      userId: req.user.id,
      count: reports.length 
    });

    sendSuccess(res, { reports });

  } catch (error) {
    logger.error('Error fetching user stray reports', { 
      error: error.message,
      userId: req.user.id
    });
    sendError(res, 'Error al obtener tus reportes');
  }
};

module.exports = exports;
