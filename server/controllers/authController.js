/**
 * Auth Controller
 * Controladores para autenticación y gestión de usuarios
 */

const userService = require('../services/userService');
const { sendSuccess, sendError, sendUnauthorized } = require('../utils/responseHandler');
const logger = require('../config/logger');

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

    const result = await userService.login(email, password);

    sendSuccess(res, {
      message: 'Login exitoso',
      token: result.token,
      user: result.user
    });

  } catch (error) {
    if (error.message === 'INVALID_CREDENTIALS') {
      return sendUnauthorized(res, 'Credenciales inválidas');
    }

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
    const user = await userService.getUserInfo(req.user.id);

    sendSuccess(res, { user });

  } catch (error) {
    if (error.message === 'USER_NOT_FOUND') {
      return sendError(res, 'Usuario no encontrado', 404);
    }

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
    const pets = await userService.getUserPets(req.user.id);

    sendSuccess(res, { pets });

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
    const files = req.files;

    const updatedUser = await userService.updateProfile(req.user.id, updates, files);

    sendSuccess(res, {
      message: 'Perfil actualizado exitosamente',
      user: updatedUser
    });

  } catch (error) {
    if (error.message === 'NO_FIELDS_TO_UPDATE') {
      return sendError(res, 'No hay campos para actualizar', 400);
    }

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
