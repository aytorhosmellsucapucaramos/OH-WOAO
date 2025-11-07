/**
 * User Profile Routes
 * Rutas para gestión del perfil del usuario (todos los roles)
 * Incluye cambio de contraseña
 */

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { pool } = require('../config/database');
const { verifyToken } = require('../middleware/auth');
const logger = require('../config/logger');

// Todas las rutas requieren autenticación
router.use(verifyToken);

/**
 * GET /api/profile
 * Obtener perfil del usuario autenticado
 */
router.get('/', async (req, res) => {
  try {
    const [users] = await pool.query(`
      SELECT 
        a.id,
        a.first_name,
        a.last_name,
        a.email,
        a.dni,
        a.phone,
        a.address,
        a.role_id,
        a.assigned_zone,
        a.employee_code,
        a.created_at,
        r.code as role_code,
        r.name as role_name
      FROM adopters a
      LEFT JOIN roles r ON a.role_id = r.id
      WHERE a.id = ?
    `, [req.user.id]);

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      data: users[0]
    });

  } catch (error) {
    logger.error('Error al obtener perfil', { error: error.message, userId: req.user.id });
    res.status(500).json({
      success: false,
      error: 'Error al obtener perfil'
    });
  }
});

/**
 * PUT /api/profile
 * Actualizar perfil del usuario (datos básicos)
 */
router.put('/', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const {
      first_name,
      last_name,
      phone,
      address
    } = req.body;

    await connection.beginTransaction();

    // Solo permitir actualizar ciertos campos
    // Email, DNI y rol NO se pueden cambiar por el usuario
    await connection.query(
      `UPDATE adopters 
       SET 
         first_name = COALESCE(?, first_name),
         last_name = COALESCE(?, last_name),
         phone = COALESCE(?, phone),
         address = COALESCE(?, address)
       WHERE id = ?`,
      [first_name, last_name, phone, address, req.user.id]
    );

    await connection.commit();

    logger.info('Perfil actualizado', { userId: req.user.id });

    res.json({
      success: true,
      message: 'Perfil actualizado exitosamente'
    });

  } catch (error) {
    await connection.rollback();
    logger.error('Error al actualizar perfil', { error: error.message, userId: req.user.id });
    res.status(500).json({
      success: false,
      error: 'Error al actualizar perfil'
    });
  } finally {
    connection.release();
  }
});

/**
 * PUT /api/profile/change-password
 * Cambiar contraseña del usuario
 */
router.put('/change-password', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const {
      current_password,
      new_password,
      confirm_password
    } = req.body;

    // Validaciones
    if (!current_password || !new_password || !confirm_password) {
      return res.status(400).json({
        success: false,
        error: 'Todos los campos son requeridos'
      });
    }

    if (new_password !== confirm_password) {
      return res.status(400).json({
        success: false,
        error: 'Las contraseñas no coinciden'
      });
    }

    if (new_password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'La nueva contraseña debe tener al menos 6 caracteres'
      });
    }

    // Obtener contraseña actual del usuario
    const [users] = await connection.query(
      'SELECT password FROM adopters WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }

    // Verificar contraseña actual
    const isValidPassword = await bcrypt.compare(current_password, users[0].password);
    
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'La contraseña actual es incorrecta'
      });
    }

    await connection.beginTransaction();

    // Hash de la nueva contraseña
    const hashedPassword = await bcrypt.hash(new_password, 10);

    // Actualizar contraseña
    await connection.query(
      'UPDATE adopters SET password = ? WHERE id = ?',
      [hashedPassword, req.user.id]
    );

    await connection.commit();

    logger.info('Contraseña cambiada', { 
      userId: req.user.id,
      userRole: req.user.role_code 
    });

    res.json({
      success: true,
      message: 'Contraseña cambiada exitosamente'
    });

  } catch (error) {
    await connection.rollback();
    logger.error('Error al cambiar contraseña', { 
      error: error.message, 
      userId: req.user.id 
    });
    res.status(500).json({
      success: false,
      error: 'Error al cambiar contraseña'
    });
  } finally {
    connection.release();
  }
});

/**
 * PUT /api/profile/reset-password/:userId (solo para admin)
 * Admin puede resetear la contraseña de cualquier usuario
 */
router.put('/reset-password/:userId', async (req, res) => {
  // Verificar que sea admin
  if (req.user.role_code !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Solo los administradores pueden resetear contraseñas'
    });
  }

  const connection = await pool.getConnection();
  
  try {
    const { userId } = req.params;
    const { new_password } = req.body;

    if (!new_password) {
      return res.status(400).json({
        success: false,
        error: 'Debe proporcionar una nueva contraseña'
      });
    }

    if (new_password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'La contraseña debe tener al menos 6 caracteres'
      });
    }

    await connection.beginTransaction();

    // Hash de la nueva contraseña
    const hashedPassword = await bcrypt.hash(new_password, 10);

    // Actualizar contraseña
    await connection.query(
      'UPDATE adopters SET password = ? WHERE id = ?',
      [hashedPassword, userId]
    );

    await connection.commit();

    logger.info('Contraseña reseteada por admin', { 
      targetUserId: userId,
      adminId: req.user.id 
    });

    res.json({
      success: true,
      message: 'Contraseña reseteada exitosamente'
    });

  } catch (error) {
    await connection.rollback();
    logger.error('Error al resetear contraseña', { 
      error: error.message, 
      adminId: req.user.id 
    });
    res.status(500).json({
      success: false,
      error: 'Error al resetear contraseña'
    });
  } finally {
    connection.release();
  }
});

module.exports = router;
