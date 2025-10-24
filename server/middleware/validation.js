const Joi = require('joi');

// =====================================================
// ESQUEMAS DE VALIDACIÓN
// =====================================================

// Validación para registro de usuario/mascota
const registerSchema = Joi.object({
  // Datos del propietario
  firstName: Joi.string().min(2).max(50).trim().required()
    .messages({
      'string.empty': 'El nombre es requerido',
      'string.min': 'El nombre debe tener al menos 2 caracteres',
      'string.max': 'El nombre no puede exceder 50 caracteres'
    }),
  
  lastName: Joi.string().min(2).max(50).trim().required()
    .messages({
      'string.empty': 'El apellido es requerido',
      'string.min': 'El apellido debe tener al menos 2 caracteres',
      'string.max': 'El apellido no puede exceder 50 caracteres'
    }),
  
  dni: Joi.string().pattern(/^\d{8}$/).required()
    .messages({
      'string.pattern.base': 'El DNI debe tener exactamente 8 dígitos',
      'string.empty': 'El DNI es requerido'
    }),
  
  email: Joi.string().email().lowercase().trim().required()
    .messages({
      'string.email': 'El email debe ser válido',
      'string.empty': 'El email es requerido'
    }),
  
  password: Joi.string().min(6).max(100).required()
    .messages({
      'string.min': 'La contraseña debe tener al menos 6 caracteres',
      'string.empty': 'La contraseña es requerida'
    }),
  
  phone: Joi.string().pattern(/^\d{9}$/).required()
    .messages({
      'string.pattern.base': 'El teléfono debe tener 9 dígitos',
      'string.empty': 'El teléfono es requerido'
    }),
  
  address: Joi.string().min(10).max(255).trim().required()
    .messages({
      'string.min': 'La dirección debe tener al menos 10 caracteres',
      'string.empty': 'La dirección es requerida'
    }),

  // Datos de la mascota
  petName: Joi.string().min(2).max(50).trim().required()
    .messages({
      'string.empty': 'El nombre de la mascota es requerido',
      'string.min': 'El nombre debe tener al menos 2 caracteres'
    }),
  
  sex: Joi.string().valid('male', 'female').required()
    .messages({
      'any.only': 'El sexo debe ser "male" o "female"',
      'string.empty': 'El sexo es requerido'
    }),
  
  breed: Joi.string().min(2).max(100).trim().required()
    .messages({
      'string.empty': 'La raza es requerida'
    }),
  
  age: Joi.number().integer().min(0).max(360).required()
    .messages({
      'number.min': 'La edad no puede ser negativa',
      'number.max': 'La edad no puede exceder 360 meses (30 años)',
      'number.base': 'La edad debe ser un número'
    }),
  
  size: Joi.string().valid('small', 'medium', 'large').required()
    .messages({
      'any.only': 'El tamaño debe ser "small", "medium" o "large"'
    }),
  
  color: Joi.string().min(2).max(100).trim().required()
    .messages({
      'string.empty': 'El color es requerido'
    }),
  
  additionalFeatures: Joi.string().max(500).allow('').optional(),
  medicalHistory: Joi.string().max(1000).allow('').optional(),
  
  hasVaccinationCard: Joi.string().valid('yes', 'no').required(),
  hasRabiesVaccine: Joi.string().valid('yes', 'no').required(),
  
  aggressionHistory: Joi.string().valid('yes', 'no').default('no'),
  aggressionDetails: Joi.string().max(500).allow('').optional(),
  
  birthDate: Joi.date().max('now').allow('', null).optional(),
  
  // Datos de pago (opcional para razas peligrosas)
  receiptNumber: Joi.string().max(100).allow('').optional(),
  receiptIssueDate: Joi.date().max('now').allow('', null).optional(),
  receiptPayer: Joi.string().max(255).allow('').optional(),
  receiptAmount: Joi.number().min(0).allow('', null).optional()
});

// Validación para login
const loginSchema = Joi.object({
  email: Joi.string().email().lowercase().trim().required()
    .messages({
      'string.email': 'El email debe ser válido',
      'string.empty': 'El email es requerido'
    }),
  
  password: Joi.string().required()
    .messages({
      'string.empty': 'La contraseña es requerida'
    })
});

// Validación para búsqueda
const searchSchema = Joi.object({
  q: Joi.string().min(1).max(20).trim().required()
    .messages({
      'string.empty': 'El parámetro de búsqueda es requerido',
      'string.min': 'Ingresa al menos 1 carácter',
      'string.max': 'La búsqueda no puede exceder 20 caracteres'
    })
});

// Validación para reporte de perros callejeros
const strayReportSchema = Joi.object({
  reporterName: Joi.string().min(2).max(255).trim().required()
    .messages({
      'string.empty': 'El nombre del reportante es requerido'
    }),
  
  reporterPhone: Joi.string().pattern(/^\d{9}$/).required()
    .messages({
      'string.pattern.base': 'El teléfono debe tener 9 dígitos'
    }),
  
  reporterEmail: Joi.string().email().lowercase().trim().required()
    .messages({
      'string.email': 'El email debe ser válido'
    }),
  
  latitude: Joi.number().min(-90).max(90).required()
    .messages({
      'number.base': 'La latitud debe ser un número',
      'number.min': 'La latitud debe estar entre -90 y 90',
      'number.max': 'La latitud debe estar entre -90 y 90'
    }),
  
  longitude: Joi.number().min(-180).max(180).required()
    .messages({
      'number.base': 'La longitud debe ser un número',
      'number.min': 'La longitud debe estar entre -180 y 180',
      'number.max': 'La longitud debe estar entre -180 y 180'
    }),
  
  address: Joi.string().max(255).allow('').optional(),
  zone: Joi.string().max(100).allow('').optional(),
  
  breed: Joi.string().max(100).allow('').optional(),
  size: Joi.string().valid('small', 'medium', 'large').required(),
  temperament: Joi.string().valid('friendly', 'shy', 'aggressive', 'scared', 'playful', 'calm').required(),
  condition_type: Joi.string().valid('stray', 'lost', 'abandoned').required(),
  urgency_level: Joi.string().valid('low', 'normal', 'high', 'emergency').required(),
  
  description: Joi.string().min(10).max(1000).trim().required()
    .messages({
      'string.min': 'La descripción debe tener al menos 10 caracteres'
    }),
  
  colors: Joi.alternatives().try(
    Joi.string(),
    Joi.array().items(Joi.string())
  ).optional(),
  
  reporterCui: Joi.string().max(20).allow('').optional()
});

// =====================================================
// MIDDLEWARE DE VALIDACIÓN
// =====================================================

const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false, // Retorna todos los errores, no solo el primero
      stripUnknown: true // Elimina campos no definidos en el schema
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        error: 'Error de validación',
        errors: errors
      });
    }

    // Reemplaza req.body con los valores validados y sanitizados
    req.body = value;
    next();
  };
};

// Middleware para validar query params
const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        error: 'Error de validación',
        errors: errors
      });
    }

    req.query = value;
    next();
  };
};

module.exports = {
  validate,
  validateQuery,
  registerSchema,
  loginSchema,
  searchSchema,
  strayReportSchema
};
