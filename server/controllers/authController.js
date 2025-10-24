/**
 * Auth Controller
 * Controladores para autenticación y gestión de usuarios
 */

const userService = require('../services/userService');
const { sendSuccess, sendError, sendUnauthorized } = require('../utils/responseHandler');
const logger = require('../config/logger');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');

/**
 * Login de usuario
 * POST /api/auth/login
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, 'Email y contraseña son requeridos', 400);
    }

    // Buscar usuario por email
    const [users] = await pool.query('SELECT * FROM adopters WHERE email = ?', [email]);
    
    if (users.length === 0) {
      return sendUnauthorized(res, 'Credenciales inválidas');
    }
    
    const user = users[0];
    const validPassword = await bcrypt.compare(password, user.password);
    
    if (!validPassword) {
      return sendUnauthorized(res, 'Credenciales inválidas');
    }
    
    // Determinar rol (admin si es admin@municipio.gob.pe, user por defecto)
    const role = user.role || (user.email === 'admin@municipio.gob.pe' ? 'admin' : 'user');
    
    // Generar token
    const token = jwt.sign(
      { id: user.id, dni: user.dni, email: user.email, role: role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.status(200).json({
      success: true,
      message: 'Login exitoso',
      token,
      user: {
        id: user.id,
        dni: user.dni,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: role
      }
    });

  } catch (error) {
    logger.error('Login error', { error: error.message });
    sendError(res, 'Error en el login');
  }
};

/**
 * Obtiene información del usuario autenticado
 * GET /api/auth/me
 */
exports.getMe = async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT id, first_name, last_name, dni, email, phone, address, photo_path FROM adopters WHERE id = ?',
      [req.user.id]
    );
    
    if (users.length === 0) {
      return sendError(res, 'Usuario no encontrado', 404);
    }

    res.status(200).json({
      success: true,
      user: users[0]
    });

  } catch (error) {
    logger.error('Get user info error', { error: error.message, userId: req.user.id });
    sendError(res, 'Error al obtener información del usuario');
  }
};

/**
 * Obtiene las mascotas del usuario autenticado
 * GET /api/auth/my-pets
 */
exports.getMyPets = async (req, res) => {
  try {
    const [pets] = await pool.query(
      'SELECT * FROM view_pets_complete WHERE adopter_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );

    res.status(200).json({
      success: true,
      pets: pets // Cambiar data por pets para coincidir con el cliente
    });

  } catch (error) {
    logger.error('Get user pets error', { error: error.message, userId: req.user.id });
    sendError(res, 'Error al obtener las mascotas');
  }
};

/**
 * Actualiza el perfil del usuario
 * PUT /api/auth/profile
 */
exports.updateProfile = async (req, res) => {
  try {
    const updates = req.body;
    const userId = req.user.id;
    
    // Validar que haya algo que actualizar
    if (Object.keys(updates).length === 0) {
      return sendError(res, 'No hay campos para actualizar', 400);
    }
    
    // Validar email si se proporciona
    if (updates.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(updates.email)) {
        return sendError(res, 'Email inválido', 400);
      }
    }
    
    // Construir query dinámicamente
    const allowedFields = ['first_name', 'last_name', 'phone', 'email', 'address'];
    const updateFields = [];
    const values = [];
    
    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key) && value !== undefined) {
        updateFields.push(`${key} = ?`);
        values.push(value);
      }
    }
    
    if (updateFields.length === 0) {
      return sendError(res, 'No hay campos válidos para actualizar', 400);
    }
    
    values.push(userId);
    
    await pool.query(
      `UPDATE adopters SET ${updateFields.join(', ')} WHERE id = ?`,
      values
    );
    
    res.status(200).json({
      success: true,
      message: 'Perfil actualizado exitosamente'
    });

  } catch (error) {
    logger.error('Update profile error', { error: error.message, userId: req.user.id });
    sendError(res, 'Error al actualizar el perfil');
  }
};

/**
 * Actualiza una mascota del usuario
 * PUT /api/auth/pet/:id
 */
exports.updatePet = async (req, res) => {
  try {
    const petId = parseInt(req.params.id);
    const updates = req.body;

    await userService.updatePet(petId, req.user.id, updates);

    sendSuccess(res, {
      message: 'Mascota actualizada exitosamente'
    });

  } catch (error) {
    if (error.message === 'PET_NOT_FOUND') {
      return sendError(res, 'Mascota no encontrada', 404);
    }
    if (error.message === 'UNAUTHORIZED') {
      return sendUnauthorized(res, 'No tienes permiso para editar esta mascota');
    }

    logger.error('Update pet error', { error: error.message, petId: req.params.id });
    sendError(res, 'Error al actualizar la mascota');
  }
};

module.exports = exports;
