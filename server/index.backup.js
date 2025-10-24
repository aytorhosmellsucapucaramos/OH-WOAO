const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const QRCode = require('qrcode');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Database configuration
const { pool, testConnection, initializeDatabase } = require('./config/database');

// Logger configuration
const logger = require('./config/logger');
const { requestLogger, errorLogger } = require('./middleware/requestLogger');

// Security configuration
const { authLimiter, apiLimiter, uploadLimiter, searchLimiter, helmetConfig } = require('./config/security');
const { validate, validateQuery, registerSchema, loginSchema, searchSchema, strayReportSchema } = require('./middleware/validation');

// Validar JWT_SECRET al inicio
if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'tu_jwt_secret_super_seguro_aqui_cambiar_en_produccion') {
  logger.error('❌ ERROR CRÍTICO: JWT_SECRET no está configurado en .env');
  logger.error('Genera uno con: node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'hex\'))"');
  process.exit(1);
}

logger.info('✅ JWT_SECRET configurado correctamente');

const app = express();
const PORT = process.env.PORT || 5000;

// JWT Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Token de autenticación requerido'
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        error: 'Token inválido o expirado'
      });
    }
    req.user = user;
    next();
  });
};

// =====================================================
// MIDDLEWARE DE SEGURIDAD
// =====================================================

// Helmet - Headers de seguridad
app.use(helmetConfig);

// CORS configurado
const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use(requestLogger);

// Rate limiting general para API
app.use('/api/', apiLimiter);

// Archivos estáticos
app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer configuration for file uploads
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

// Initialize database on startup
(async () => {
  try {
    const isConnected = await testConnection();
    if (isConnected) {
      await initializeDatabase();
    }
  } catch (error) {
    console.error('Failed to initialize database:', error);
  }
})();

// Generate unique CUI (8 digits + check digit)
function generateCUI() {
  const randomNumber = Math.floor(10000000 + Math.random() * 90000000);
  const checkDigit = randomNumber % 10;
  return `${randomNumber}-${checkDigit}`;
}

// Check if CUI already exists
async function checkCUIExists(cui) {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query('SELECT cui FROM pets WHERE cui = ?', [cui]);
    return rows.length > 0;
  } finally {
    connection.release();
  }
}

// Generate unique CUI
async function generateUniqueCUI() {
  let cui;
  let exists = true;
  
  while (exists) {
    cui = generateCUI();
    exists = await checkCUIExists(cui);
  }
  
  return cui;
}

// Import middleware
const { optionalAuth, generateToken } = require('./middleware/auth');

// Import routes
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

// Configure multer for multiple file uploads
const uploadMultiple = upload.fields([
  { name: 'photo', maxCount: 1 },
  { name: 'photoLateral', maxCount: 1 },
  { name: 'photoFrontal', maxCount: 1 },
  { name: 'dniPhoto', maxCount: 1 },
  { name: 'vaccinationCard', maxCount: 1 },
  { name: 'rabiesVaccine', maxCount: 1 }
])

// Register new pet (with optional authentication)
app.post('/api/register', uploadLimiter, optionalAuth, uploadMultiple, validate(registerSchema), async (req, res) => {
  const connection = await pool.getConnection();
  
  console.log('=== INICIO DE REGISTRO ===');
  console.log('Request body:', req.body);
  console.log('Request file:', req.file);
  console.log('User authenticated:', !!req.user);
  
  try {
    await connection.beginTransaction();
    
    const {
      petName, sex, breed, birthDate, age, size, color, additionalFeatures,
      aggressionHistory, aggressionDetails,
      hasVaccinationCard, hasRabiesVaccine, medicalHistory,
      receiptNumber, receiptIssueDate, receiptPayer, receiptAmount,
      firstName, lastName, dni, email, password, phone, address
    } = req.body;
    
    console.log('Datos extraídos:', req.body);

    // Validate required fields for pet
    if (!petName || !sex || !breed || !age || !size || !color) {
      return res.status(400).json({ 
        success: false,
        error: 'Los campos obligatorios de la mascota son requeridos (nombre, sexo, raza, edad, tamaño, color)' 
      });
    }
    
    // If user is not authenticated, validate all adopter fields
    if (!req.user && (!firstName || !lastName || !dni || !email || !password || !phone || !address)) {
      return res.status(400).json({ 
        success: false,
        error: 'Todos los campos del propietario son requeridos' 
      });
    }

    let adopterId;
    let isNewUser = false;
    let userEmail = email;
    let userDni = dni;
    
    // If user is authenticated, use their existing adopter ID
    if (req.user) {
      console.log('Usuario autenticado, usando ID existente:', req.user.id);
      adopterId = req.user.id;
      userEmail = req.user.email;
      userDni = req.user.dni;
    } else {
      // User not authenticated, handle registration/login
      // Check if adopter exists
      const [existingAdopter] = await connection.query(
        'SELECT id, password FROM adopters WHERE dni = ? OR email = ?',
        [dni, email]
      );
      
      if (existingAdopter.length > 0) {
        // Adopter exists, verify password
        const validPassword = await bcrypt.compare(password, existingAdopter[0].password);
        if (!validPassword) {
          await connection.rollback();
          return res.status(401).json({ 
            success: false,
            error: 'Contraseña incorrecta para el usuario existente' 
          });
        }
        adopterId = existingAdopter[0].id;
      } else {
        // New adopter, hash password and create
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Handle DNI photo upload
        const dniPhotoPath = req.files?.dniPhoto?.[0]?.filename || null;
        
        const [adopterResult] = await connection.query(
          `INSERT INTO adopters (first_name, last_name, dni, dni_photo_path, email, password, phone, address) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [firstName, lastName, dni, dniPhotoPath, email, hashedPassword, phone, address]
        );
        adopterId = adopterResult.insertId;
        isNewUser = true;
      }
    }
    
    // Generate unique CUI
    const cui = await generateUniqueCUI();
    
    // Handle file uploads
    const photoFrontalPath = req.files?.photoFrontal?.[0]?.filename || null;
    const photoPosteriorPath = req.files?.photoPosterior?.[0]?.filename || null;
    const vaccinationCardPath = req.files?.vaccinationCard?.[0]?.filename || null;
    const rabiesVaccinePath = req.files?.rabiesVaccine?.[0]?.filename || null;
    
    // Convert boolean values
    const hasVaccCard = hasVaccinationCard === 'si' ? true : false;
    const hasRabiesVac = hasRabiesVaccine === 'si' ? true : false;
    
    // Helper function to get or create catalog entry
    const getOrCreateCatalogId = async (table, field, value) => {
      if (!value) return null;
      
      // Try to find existing entry (case-insensitive)
      const [existing] = await connection.query(
        `SELECT id FROM ${table} WHERE LOWER(${field}) = LOWER(?) LIMIT 1`,
        [value]
      );
      
      if (existing.length > 0) {
        return existing[0].id;
      }
      
      // If not found, insert new entry
      const [result] = await connection.query(
        `INSERT INTO ${table} (${field}) VALUES (?)`,
        [value]
      );
      
      return result.insertId;
    };
    
    // Get or create catalog IDs
    const breedId = await getOrCreateCatalogId('breeds', 'name', breed);
    const colorId = await getOrCreateCatalogId('colors', 'name', color);
    
    // Get size ID (sizes use 'code' instead of 'name')
    let sizeId = null;
    if (size) {
      const [sizeResult] = await connection.query(
        `SELECT id FROM sizes WHERE code = ? LIMIT 1`,
        [size]
      );
      sizeId = sizeResult.length > 0 ? sizeResult[0].id : null;
    }
    
    // Insert pet using catalog IDs - SOLO DATOS BÁSICOS (Refactorización FASE 1)
    const [petResult] = await connection.query(
      `INSERT INTO pets (
        cui, pet_name, sex, 
        breed_id, birth_date, age, size_id,
        additional_features,
        adopter_id
      ) VALUES (
        ?, ?, ?,
        ?, ?, ?, ?,
        ?,
        ?
      )`,
      [
        cui, petName, sex,
        breedId, birthDate || null, age, sizeId,
        additionalFeatures || '',
        adopterId
      ]
    );
    
    const petId = petResult.insertId;
    
    // Insertar color en tabla pivote pet_colors
    if (colorId) {
      await connection.query(
        `INSERT INTO pet_colors (pet_id, color_id, display_order) VALUES (?, ?, 0)`,
        [petId, colorId]
      );
    }

    // Generate QR code with URL to pet card
    const qrData = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/pet/${cui}`;
    const qrCodePath = `qr_${cui.replace('-', '_')}.png`;
    await QRCode.toFile(path.join(uploadsDir, qrCodePath), qrData);

    // Insertar datos en tablas especializadas - FASE 1
    
    // 1. Insertar documentos (fotos y QR)
    await connection.query(
      `INSERT INTO pet_documents (pet_id, photo_frontal_path, photo_posterior_path, qr_code_path, card_printed)
       VALUES (?, ?, ?, ?, ?)`,
      [petId, photoFrontalPath, photoPosteriorPath, qrCodePath, false]
    );
    
    // 2. Insertar registros de salud
    await connection.query(
      `INSERT INTO pet_health_records (
        pet_id, has_vaccination_card, vaccination_card_path,
        has_rabies_vaccine, rabies_vaccine_path, medical_history,
        aggression_history, aggression_details
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        petId, hasVaccCard, vaccinationCardPath,
        hasRabiesVac, rabiesVaccinePath, medicalHistory || null,
        aggressionHistory || 'no', aggressionDetails || null
      ]
    );
    
    // 3. Insertar datos de pago (solo si es raza peligrosa y tiene recibo)
    if (receiptNumber && receiptIssueDate && receiptPayer && receiptAmount) {
      await connection.query(
        `INSERT INTO pet_payments (
          pet_id, receipt_number, receipt_issue_date,
          receipt_payer, receipt_amount, payment_type, status
        ) VALUES (?, ?, ?, ?, ?, 'registration', 'pending')`,
        [petId, receiptNumber, receiptIssueDate, receiptPayer, receiptAmount]
      );
    }

    await connection.commit();

    // Generate JWT token only for new users
    let token = null;
    if (!req.user) {
      token = generateToken({ 
        id: adopterId, 
        email: userEmail, 
        dni: userDni 
      });
    }

    res.json({ 
      success: true, 
      cui,
      message: req.user 
        ? 'Mascota agregada exitosamente a tu panel' 
        : (isNewUser 
          ? 'Usuario y mascota registrados exitosamente' 
          : 'Mascota registrada exitosamente'),
      token,
      user: req.user ? null : {
        id: adopterId,
        email: userEmail,
        dni: userDni
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error('Registration error:', error);
    console.error('Error stack:', error.stack);
    
    let errorMessage = 'Error interno del servidor';
    let statusCode = 500;
    
    if (error.code === 'ER_DUP_ENTRY') {
      errorMessage = 'El DNI o email ya está registrado';
      statusCode = 400;
    } else if (error.message) {
      errorMessage = `Error: ${error.message}`;
    }
    
    res.status(statusCode).json({ 
      success: false,
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    connection.release();
  }
});

// Get all pets (public)
app.get('/api/pets', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    // Usar vista para obtener todos los datos con catálogos
    const [rows] = await connection.query(`
      SELECT * FROM view_pets_complete
      ORDER BY created_at DESC
    `);
    
    // LOG TEMPORAL para diagnóstico
    console.log('🔍 Datos del endpoint /api/pets:');
    console.log('Total mascotas:', rows.length);
    if (rows.length > 0) {
      console.log('Primera mascota:', {
        cui: rows[0].cui,
        pet_name: rows[0].pet_name,
        breed_name: rows[0].breed_name,
        color_name: rows[0].color_name,
        size_name: rows[0].size_name,
        breed_id: rows[0].breed_id,
        color_id: rows[0].color_id,
        size_id: rows[0].size_id
      });
    }
    
    const results = rows;
    
    res.json({
      success: true,
      data: results
    });
    
  } catch (error) {
    console.error('Pets fetch error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error al obtener mascotas' 
    });
  } finally {
    connection.release();
  }
});

// Search pets by DNI or CUI
app.get('/api/search', searchLimiter, validateQuery(searchSchema), async (req, res) => {
  const connection = await pool.getConnection();
  const { q } = req.query;
  
  if (!q) {
    return res.status(400).json({ 
      success: false,
      error: 'Parámetro de búsqueda requerido' 
    });
  }

  try {
    // Usar vista para buscar por DNI o CUI
    const [rows] = await connection.query(`
      SELECT * FROM view_pets_complete
      WHERE owner_dni = ? OR cui = ?
      ORDER BY created_at DESC
    `, [q, q]);
    
    // Format results for display
    const results = rows.map(row => ({
      ...row,
      adopter_name: row.owner_first_name,
      adopter_last_name: row.owner_last_name
    }));
    
    res.json({
      success: true,
      data: results
    });
    
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error en la búsqueda' 
    });
  } finally {
    connection.release();
  }
});

// Get all stray reports for map
app.get('/api/stray-reports', async (req, res) => {
  console.log('📍 ENDPOINT GET /api/stray-reports LLAMADO');
  const connection = await pool.getConnection();
  
  try {
    const [reports] = await connection.query(`
      SELECT 
        sr.*,
        CONCAT(a.first_name, ' ', a.last_name) as adopter_name,
        a.phone as adopter_phone,
        a.email as adopter_email,
        b.name as breed_name,
        s.code as size_code,
        s.name as size_name,
        t.code as temperament_code,
        t.name as temperament_name,
        rc.code as condition_code,
        rc.name as condition_name,
        ul.code as urgency_code,
        ul.name as urgency_name,
        GROUP_CONCAT(c.name) as color_names
      FROM stray_reports sr
      LEFT JOIN adopters a ON sr.reporter_id = a.id
      LEFT JOIN breeds b ON sr.breed_id = b.id
      LEFT JOIN sizes s ON sr.size_id = s.id
      LEFT JOIN temperaments t ON sr.temperament_id = t.id
      LEFT JOIN report_conditions rc ON sr.condition_id = rc.id
      LEFT JOIN urgency_levels ul ON sr.urgency_level_id = ul.id
      LEFT JOIN stray_report_colors src ON sr.id = src.stray_report_id
      LEFT JOIN colors c ON src.color_id = c.id
      WHERE sr.status IN ('active', 'in_progress', 'pending')
      GROUP BY sr.id
      ORDER BY sr.created_at DESC
    `);
    
    console.log(`📍 Total reportes encontrados: ${reports.length}`);
    
    // Format the data for frontend
    const formattedReports = reports.map(report => {
      console.log(`📍 Reporte #${report.id}:`, {
        breed: report.breed_name,
        size: report.size_code,
        temperament: report.temperament_code,
        condition: report.condition_code,
        urgency: report.urgency_code
      });
      
      return {
        id: report.id,
        reporterName: report.reporter_name || report.adopter_name || 'Anónimo',
        reporterPhone: report.reporter_phone || report.adopter_phone || 'No disponible',
        reporterEmail: report.reporter_email || report.adopter_email || 'No disponible',
        latitude: parseFloat(report.latitude) || -15.8402,
        longitude: parseFloat(report.longitude) || -70.0219,
        address: report.address || 'Ubicación no especificada',
        zone: report.zone || 'Puno',
        breed: report.breed_name || 'Mestizo',
        size: report.size_code || 'medium',
        colors: report.color_names ? report.color_names.split(',').map(c => c.trim().toLowerCase()) : ['marrón'],
        temperament: report.temperament_code || 'friendly',
        condition: report.condition_code || 'stray',
        urgency: report.urgency_code || 'normal',
        description: report.description || 'Sin descripción adicional',
        photo: report.photo_path ? `http://localhost:5000/api/uploads/${report.photo_path}` : 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=300',
        createdAt: report.created_at,
        status: report.status || 'active'
      };
    });
    
    console.log(`📍 Devolviendo ${formattedReports.length} reportes al frontend`);
    
    res.json({
      success: true,
      data: formattedReports
    });
    
  } catch (error) {
    console.error('📍 ERROR fetching stray reports:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error al obtener reportes de perros callejeros' 
    });
  } finally {
    connection.release();
  }
});

// Get my stray reports (user's own reports)
app.get('/api/stray-reports/my-reports', authenticateToken, async (req, res) => {
  console.log('📍 ENDPOINT GET /api/stray-reports/my-reports LLAMADO');
  console.log('📍 Usuario autenticado:', req.user);
  
  const connection = await pool.getConnection();
  
  try {
    const userId = req.user.id;
    
    const [reports] = await connection.query(`
      SELECT 
        sr.*,
        b.name as breed_name,
        s.code as size_code,
        s.name as size_name,
        t.code as temperament_code,
        t.name as temperament_name,
        rc.code as condition_code,
        rc.name as condition_name,
        ul.code as urgency_code,
        ul.name as urgency_name,
        GROUP_CONCAT(c.name) as color_names
      FROM stray_reports sr
      LEFT JOIN breeds b ON sr.breed_id = b.id
      LEFT JOIN sizes s ON sr.size_id = s.id
      LEFT JOIN temperaments t ON sr.temperament_id = t.id
      LEFT JOIN report_conditions rc ON sr.condition_id = rc.id
      LEFT JOIN urgency_levels ul ON sr.urgency_level_id = ul.id
      LEFT JOIN stray_report_colors src ON sr.id = src.stray_report_id
      LEFT JOIN colors c ON src.color_id = c.id
      WHERE sr.reporter_id = ?
      GROUP BY sr.id
      ORDER BY sr.created_at DESC
    `, [userId]);
    
    console.log(`📍 Reportes del usuario #${userId}: ${reports.length}`);
    
    const formattedReports = reports.map(report => ({
      id: report.id,
      reporterName: report.reporter_name,
      reporterPhone: report.reporter_phone,
      reporterEmail: report.reporter_email,
      latitude: parseFloat(report.latitude),
      longitude: parseFloat(report.longitude),
      address: report.address || 'Ubicación no especificada',
      zone: report.zone || '',
      breed: report.breed_name || 'Mestizo',
      size: report.size_code || 'medium',
      colors: report.color_names ? report.color_names.split(',').map(c => c.trim()) : [],
      temperament: report.temperament_code || 'friendly',
      condition: report.condition_code || 'stray',
      urgency: report.urgency_code || 'normal',
      description: report.description || '',
      photo: report.photo_path ? `http://localhost:5000/api/uploads/${report.photo_path}` : null,
      createdAt: report.created_at,
      status: report.status
    }));
    
    res.json({
      success: true,
      data: formattedReports
    });
    
  } catch (error) {
    console.error('📍 ERROR obteniendo reportes del usuario:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener tus reportes'
    });
  } finally {
    connection.release();
  }
});

// Create new stray report
app.post('/api/stray-reports', uploadLimiter, upload.single('photo'), validate(strayReportSchema), async (req, res) => {
  console.log('📍 ENDPOINT POST /api/stray-reports LLAMADO');
  console.log('📍 Body recibido:', req.body);
  console.log('📍 Archivo recibido:', req.file ? req.file.filename : 'No hay archivo');
  
  const connection = await pool.getConnection();
  
  try {
    const {
      reporterCui, reporterName, reporterPhone, reporterEmail,
      latitude, longitude, address, zone,
      breed, size, colors, temperament, 
      condition, urgency, // Frontend envía "condition" y "urgency"
      description
    } = req.body;
    
    // Mapear nombres del frontend al backend
    const condition_type = condition;
    const urgency_level = urgency;

    // Get reporter ID if CUI is provided
    let reporterId = null;
    if (reporterCui) {
      const [petResult] = await connection.query(
        'SELECT adopter_id FROM pets WHERE cui = ?',
        [reporterCui]
      );
      if (petResult.length > 0) {
        reporterId = petResult[0].adopter_id;
      }
    }

    // Handle photo upload
    let photoPath = null;
    if (req.file) {
      photoPath = req.file.filename;
    }

    // Obtener IDs de catálogos
    console.log('📍 Buscando IDs para:', { breed, size, temperament, condition: condition_type, urgency: urgency_level });
    let breedId = null, sizeId = null, temperamentId = null, conditionId = null, urgencyId = null;
    
    // Buscar breed_id
    if (breed) {
      const [breedResult] = await connection.query('SELECT id FROM breeds WHERE name = ? LIMIT 1', [breed]);
      breedId = breedResult.length > 0 ? breedResult[0].id : null;
      console.log('📍 breed_id encontrado:', breedId);
    }
    
    // Buscar size_id
    if (size) {
      const [sizeResult] = await connection.query('SELECT id FROM sizes WHERE code = ? LIMIT 1', [size]);
      sizeId = sizeResult.length > 0 ? sizeResult[0].id : null;
    }
    
    // Buscar temperament_id
    if (temperament) {
      const [tempResult] = await connection.query('SELECT id FROM temperaments WHERE code = ? LIMIT 1', [temperament]);
      temperamentId = tempResult.length > 0 ? tempResult[0].id : null;
    }
    
    // Buscar condition_id
    if (condition_type) {
      const [condResult] = await connection.query('SELECT id FROM report_conditions WHERE code = ? LIMIT 1', [condition_type]);
      conditionId = condResult.length > 0 ? condResult[0].id : null;
    }
    
    // Buscar urgency_level_id
    if (urgency_level) {
      const [urgResult] = await connection.query('SELECT id FROM urgency_levels WHERE code = ? LIMIT 1', [urgency_level]);
      urgencyId = urgResult.length > 0 ? urgResult[0].id : null;
    }

    // Parse colors array
    let colorsArray = [];
    if (typeof colors === 'string') {
      try {
        colorsArray = JSON.parse(colors);
      } catch (e) {
        colorsArray = colors.split(',').map(c => c.trim());
      }
    } else if (Array.isArray(colors)) {
      colorsArray = colors;
    }

    // Insert the report (sin columna colors - ahora usa tabla pivote)
    const [result] = await connection.query(`
      INSERT INTO stray_reports (
        reporter_id, reporter_name, reporter_phone, reporter_email,
        address, zone, latitude, longitude,
        breed_id, size_id, temperament_id, condition_id, urgency_level_id,
        description, photo_path, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
    `, [
      reporterId, reporterName, reporterPhone, reporterEmail,
      address, zone, latitude, longitude,
      breedId, sizeId, temperamentId,
      conditionId, urgencyId,
      description, photoPath
    ]);

    const reportId = result.insertId;
    console.log('📍 Reporte insertado exitosamente. ID:', reportId);

    // Insertar colores en la tabla pivote
    if (colorsArray.length > 0) {
      for (const colorName of colorsArray) {
        // Buscar el color_id (mapear nombres del frontend a nombres en BD)
        const colorMap = {
          'negro': 'Negro',
          'blanco': 'Blanco',
          'marron': 'Marrón',
          'dorado': 'Dorado',
          'gris': 'Gris',
          'manchado': 'Manchado',
          'tricolor': 'Tricolor'
        };
        
        const colorNameDB = colorMap[colorName.toLowerCase()] || colorName;
        const [colorResult] = await connection.query(
          'SELECT id FROM colors WHERE name = ? LIMIT 1',
          [colorNameDB]
        );
        
        if (colorResult.length > 0) {
          await connection.query(
            'INSERT INTO stray_report_colors (stray_report_id, color_id) VALUES (?, ?)',
            [reportId, colorResult[0].id]
          );
          console.log(`📍 Color "${colorNameDB}" asociado al reporte`);
        }
      }
    }

    res.json({
      success: true,
      message: 'Reporte creado exitosamente',
      reportId: result.insertId
    });

  } catch (error) {
    console.error('📍 ERROR al crear reporte:', error);
    console.error('📍 Detalles del error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Error al crear el reporte',
      details: error.message
    });
  } finally {
    connection.release();
  }
});

// Get specific pet by CUI
app.get('/api/pet/:cui', async (req, res) => {
  const connection = await pool.getConnection();
  const { cui } = req.params;

  try {
    // Usar vista para obtener datos con catálogos
    const [rows] = await connection.query(`
      SELECT * FROM view_pets_complete
      WHERE cui = ?
    `, [cui]);
    
    if (rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: 'Mascota no encontrada' 
      });
    }
    
    const result = rows[0];
    
    res.json({ 
      success: true,
      data: result
    });
    
  } catch (error) {
    console.error('Pet fetch error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error al obtener información de la mascota' 
    });
  } finally {
    connection.release();
  }
});

// Health check
app.get('/api/health', async (req, res) => {
  try {
    const isConnected = await testConnection();
    res.json({ 
      status: isConnected ? 'OK' : 'Database connection failed', 
      timestamp: new Date().toISOString() 
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'Error', 
      error: error.message,
      timestamp: new Date().toISOString() 
    });
  }
});

// Error handling middleware
app.use(errorLogger);

app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      logger.warn('File upload rejected - Size limit exceeded', { 
        file: req.file?.originalname,
        userId: req.user?.id 
      });
      return res.status(400).json({ 
        success: false,
        error: 'El archivo es demasiado grande. Máximo 5MB.' 
      });
    }
  }
  
  logger.logError(error, {
    method: req.method,
    url: req.originalUrl,
    userId: req.user?.id
  });
  
  res.status(500).json({ 
    success: false,
    error: 'Error interno del servidor' 
  });
});

app.listen(PORT, () => {
  logger.info(`✅ Server running on port ${PORT}`);
  logger.info(`🌎 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`🔒 Security: Rate limiting, Helmet, CORS configured`);
  logger.info(`📝 Logs directory: ${path.join(__dirname, 'logs')}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Received SIGINT signal, shutting down gracefully...');
  try {
    await pool.end();
    logger.info('Database pool closed');
  } catch (error) {
    logger.error('Error closing database pool:', error);
  }
  process.exit(0);
});

// Manejo de errores no capturados
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', { promise, reason });
});
