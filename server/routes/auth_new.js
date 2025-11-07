/**
 * Auth Routes - Refactorizado
 * Rutas de autenticación y gestión de usuarios
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');
const { authLimiter } = require('../config/security');
const { validate, loginSchema } = require('../middleware/validation');
const { uploadSingle } = require('../services/uploadService');

// POST /api/auth/login - Iniciar sesión
router.post('/login',
  // authLimiter, // TEMPORAL: Desactivado para desarrollo
  validate(loginSchema),
  authController.login
);

// GET /api/auth/me - Obtener información del usuario autenticado
router.get('/me',
  verifyToken,
  authController.getMe
);

// GET /api/auth/my-pets - Obtener mascotas del usuario
router.get('/my-pets',
  verifyToken,
  authController.getMyPets
);

// PUT /api/auth/profile - Actualizar perfil del usuario
router.put('/profile',
  verifyToken,
  uploadSingle('profilePhoto'),
  authController.updateProfile
);

// PUT /api/auth/pet/:id - Actualizar información de una mascota
router.put('/pet/:id',
  verifyToken,
  authController.updatePet
);

module.exports = router;
