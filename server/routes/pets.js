/**
 * Pet Routes
 * Defines API endpoints for pet management
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const petsController = require('../controllers/petsController');
const { uploadLimiter, searchLimiter } = require('../config/security');
const { optionalAuth } = require('../middleware/auth');
const { validate, validateQuery, registerSchema, searchSchema } = require('../middleware/validation');

// Multer configuration for file uploads
const uploadsDir = path.join(__dirname, '../uploads');
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Configure multer for multiple file uploads
const uploadMultiple = upload.fields([
  { name: 'photo', maxCount: 1 },
  { name: 'photoLateral', maxCount: 1 },
  { name: 'photoFrontal', maxCount: 1 },
  { name: 'dniPhoto', maxCount: 1 },
  { name: 'vaccinationCard', maxCount: 1 },
  { name: 'rabiesVaccine', maxCount: 1 }
]);

/**
 * @route   POST /api/register
 * @desc    Register new pet (with optional authentication)
 * @access  Public
 */
router.post('/register', 
  uploadLimiter, 
  optionalAuth, 
  uploadMultiple, 
  validate(registerSchema), 
  petsController.register
);

/**
 * @route   GET /api/pets
 * @desc    Get all pets with pagination
 * @access  Public
 * @query   page - Page number (default: 1)
 * @query   limit - Items per page (default: 20)
 */
router.get('/pets', 
  petsController.getAll
);

/**
 * @route   GET /api/search
 * @desc    Search pets by DNI or CUI
 * @access  Public
 * @query   q - Search query (DNI or CUI)
 */
router.get('/search', 
  searchLimiter, 
  validateQuery(searchSchema), 
  petsController.search
);

/**
 * @route   GET /api/pet/:cui
 * @desc    Get specific pet by CUI
 * @access  Public
 */
router.get('/pet/:cui', 
  petsController.getByCUI
);

module.exports = router;
