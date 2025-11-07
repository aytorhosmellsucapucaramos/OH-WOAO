/**
 * Pets Controller
 * Handles HTTP requests for pet management
 */

const petService = require('../services/petService');
const userService = require('../services/userService');
const { generateToken } = require('../middleware/auth');
const { sendSuccess, sendError, sendPaginated } = require('../utils/responseHandler');
const logger = require('../config/logger');

/**
 * Register new pet
 * POST /api/register
 */
exports.register = async (req, res) => {
  try {
    const {
      firstName, lastName, dni, email, password, phone, address
    } = req.body;
    
    logger.info('Pet registration started', { 
      authenticated: !!req.user, 
      dni: req.user?.dni || dni 
    });
    
    // Validate required fields if user is not authenticated
    if (!req.user && (!firstName || !lastName || !dni || !email || !password || !phone || !address)) {
      return sendError(res, 'Todos los campos del propietario son requeridos', 400);
    }
    
    // Get or create user/adopter
    const userData = {
      firstName, lastName, dni, email, phone, address,
      dniPhotoPath: req.files?.dniPhoto?.[0]?.filename
    };
    
    const { userId, email: userEmail, dni: userDni, isNewUser } = await userService.getOrCreateUser(
      userData,
      password,
      req.user
    );
    
    // Register pet
    const result = await petService.registerPet(req.body, req.files, userId);
    
    // Log activity
    logger.logActivity('pet_registered', userId, { 
      cui: result.cui, 
      petId: result.petId 
    });
    
    // Generate JWT token for all non-authenticated users (new or existing)
    let token = null;
    if (!req.user) {
      token = generateToken({ id: userId, email: userEmail, dni: userDni });
    }
    
    const message = req.user 
      ? 'Mascota agregada exitosamente a tu panel' 
      : (isNewUser 
        ? 'Usuario y mascota registrados exitosamente' 
        : 'Mascota registrada exitosamente');
    
    res.json({
      success: true,
      cui: result.cui,
      message,
      token,
      user: req.user ? null : { id: userId, email: userEmail, dni: userDni }
    });
    
  } catch (error) {
    logger.error('Pet registration error', { error: error.message });
    
    let errorMessage = 'Error interno del servidor';
    let statusCode = 500;
    
    if (error.code === 'ER_DUP_ENTRY') {
      errorMessage = 'El DNI o email ya está registrado';
      statusCode = 400;
    } else if (error.message.includes('Contraseña incorrecta')) {
      errorMessage = error.message;
      statusCode = 401;
    } else if (error.message) {
      errorMessage = error.message;
      statusCode = 400;
    }
    
    sendError(res, errorMessage, statusCode, error.message);
  }
};

/**
 * Get all pets (with pagination)
 * GET /api/pets?page=1&limit=20
 */
exports.getAll = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    
    const result = await petService.getAllPets(page, limit);
    
    logger.info('Pets retrieved', { 
      page, 
      limit, 
      total: result.pagination.total 
    });
    
    sendPaginated(res, result.data, result.pagination);
    
  } catch (error) {
    logger.error('Error fetching pets', { error: error.message });
    sendError(res, 'Error al obtener mascotas', 500);
  }
};

/**
 * Search pets by DNI or CUI
 * GET /api/search?q=12345678
 */
exports.search = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return sendError(res, 'Parámetro de búsqueda requerido', 400);
    }
    
    const pets = await petService.searchPets(q);
    
    sendSuccess(res, pets);
    
  } catch (error) {
    logger.error('Pet search error', { error: error.message });
    sendError(res, 'Error en la búsqueda', 500);
  }
};

/**
 * Get pet by CUI
 * GET /api/pet/:cui
 */
exports.getByCUI = async (req, res) => {
  try {
    const { cui } = req.params;
    
    const pet = await petService.getPetByCUI(cui);
    
    if (!pet) {
      return sendError(res, 'Mascota no encontrada', 404);
    }
    
    sendSuccess(res, pet);
    
  } catch (error) {
    logger.error('Error fetching pet by CUI', { error: error.message, cui: req.params.cui });
    sendError(res, 'Error al obtener información de la mascota', 500);
  }
};

module.exports = exports;
