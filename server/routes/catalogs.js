/**
 * Catalog Routes
 * Endpoints para obtener catálogos (razas, colores, tamaños, etc.)
 */

const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const logger = require('../config/logger');

/**
 * @route   GET /api/catalogs/breeds
 * @desc    Obtener todas las razas
 * @access  Public
 */
router.get('/breeds', async (req, res) => {
  try {
    const [breeds] = await pool.query(
      'SELECT id, name FROM breeds ORDER BY name ASC'
    );
    
    res.json({
      success: true,
      data: breeds
    });
  } catch (error) {
    logger.error('Error fetching breeds', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Error al obtener las razas'
    });
  }
});

/**
 * @route   GET /api/catalogs/colors
 * @desc    Obtener todos los colores
 * @access  Public
 */
router.get('/colors', async (req, res) => {
  try {
    const [colors] = await pool.query(
      'SELECT id, name FROM colors ORDER BY name ASC'
    );
    
    res.json({
      success: true,
      data: colors
    });
  } catch (error) {
    logger.error('Error fetching colors', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Error al obtener los colores'
    });
  }
});

/**
 * @route   GET /api/catalogs/sizes
 * @desc    Obtener todos los tamaños
 * @access  Public
 */
router.get('/sizes', async (req, res) => {
  try {
    const [sizes] = await pool.query(
      'SELECT id, code, name, description FROM sizes ORDER BY id ASC'
    );
    
    res.json({
      success: true,
      data: sizes
    });
  } catch (error) {
    logger.error('Error fetching sizes', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Error al obtener los tamaños'
    });
  }
});

/**
 * @route   GET /api/catalogs/all
 * @desc    Obtener todos los catálogos de una vez
 * @access  Public
 */
router.get('/all', async (req, res) => {
  try {
    const [breeds] = await pool.query(
      'SELECT id, name FROM breeds ORDER BY name ASC'
    );
    
    const [colors] = await pool.query(
      'SELECT id, name FROM colors ORDER BY name ASC'
    );
    
    const [sizes] = await pool.query(
      'SELECT id, code, name, description FROM sizes ORDER BY id ASC'
    );
    
    const [temperaments] = await pool.query(
      'SELECT id, code, name, description FROM temperaments WHERE active = 1 ORDER BY id ASC'
    );
    
    const [conditions] = await pool.query(
      'SELECT id, code, name, description FROM report_conditions WHERE active = 1 ORDER BY id ASC'
    );
    
    const [urgencies] = await pool.query(
      'SELECT id, code, name, description, color, priority FROM urgency_levels WHERE active = 1 ORDER BY priority ASC'
    );
    
    res.json({
      success: true,
      data: {
        breeds,
        colors,
        sizes,
        temperaments,
        conditions,
        urgencies
      }
    });
  } catch (error) {
    logger.error('Error fetching catalogs', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Error al obtener los catálogos'
    });
  }
});

module.exports = router;
