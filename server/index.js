const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const QRCode = require('qrcode');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Database configuration
const { pool, testConnection, initializeDatabase } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
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
const strayReportsRoutes = require('./routes/strayReports_simple');
const adminRoutes = require('./routes/admin_simple');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/stray-reports', strayReportsRoutes);
app.use('/api/admin', adminRoutes);

// Register new pet (with optional authentication)
app.post('/api/register', optionalAuth, upload.single('photo'), async (req, res) => {
  const connection = await pool.getConnection();
  
  console.log('=== INICIO DE REGISTRO ===');
  console.log('Request body:', req.body);
  console.log('Request file:', req.file);
  console.log('User authenticated:', !!req.user);
  
  try {
    await connection.beginTransaction();
    
    const {
      petName, petLastName, species, breed, adoptionDate,
      adopterName, adopterLastName, dni, email, password, phone, 
      department, province, district, address
    } = req.body;
    
    console.log('Datos extraídos:', {
      petName, petLastName, species, breed, adoptionDate,
      adopterName, adopterLastName, dni, email, password, phone, 
      department, province, district, address
    });

    // Validate required fields for pet
    if (!petName || !species || !breed || !adoptionDate) {
      return res.status(400).json({ 
        success: false,
        error: 'Los campos de la mascota son requeridos' 
      });
    }
    
    // If user is not authenticated, validate all adopter fields
    if (!req.user && (!adopterName || !adopterLastName || !dni || !email || !password || !phone || !address)) {
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
      const fullAdopterName = `${adopterName} ${adopterLastName}`;
      
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
        const [adopterResult] = await connection.query(
          `INSERT INTO adopters (full_name, dni, email, password, phone, address, district, province, department) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [fullAdopterName, dni, email, hashedPassword, phone, address, district, province, department]
        );
        adopterId = adopterResult.insertId;
        isNewUser = true;
      }
    }
    
    // Generate unique CUI
    const cui = await generateUniqueCUI();
    
    // Insert pet
    const photoPath = req.file ? req.file.filename : null;
    
    const [petResult] = await connection.query(
      `INSERT INTO pets (cui, pet_name, pet_last_name, species, breed, adoption_date, photo_path, adopter_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [cui, petName, petLastName || '', species, breed, adoptionDate, photoPath, adopterId]
    );

    // Generate QR code with URL to pet card
    const qrData = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/pet/${cui}`;
    const qrCodePath = `qr_${cui.replace('-', '_')}.png`;
    await QRCode.toFile(path.join(uploadsDir, qrCodePath), qrData);

    // Update pet with QR code path
    await connection.query(
      'UPDATE pets SET qr_code_path = ? WHERE cui = ?',
      [qrCodePath, cui]
    );

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
    const [rows] = await connection.query(`
      SELECT 
        p.id, p.cui, p.pet_name, p.pet_last_name, p.species, p.breed, 
        p.adoption_date, p.photo_path, p.qr_code_path, p.card_printed, p.created_at,
        a.full_name as adopter_name, a.dni, a.phone, a.address, 
        a.district, a.province, a.department
      FROM pets p
      JOIN adopters a ON p.adopter_id = a.id
      ORDER BY p.created_at DESC
    `);
    
    // Split adopter name for display
    const results = rows.map(row => ({
      ...row,
      adopter_name: row.adopter_name.split(' ')[0],
      adopter_last_name: row.adopter_name.split(' ').slice(1).join(' ')
    }));
    
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
app.get('/api/search', async (req, res) => {
  const connection = await pool.getConnection();
  const { q } = req.query;
  
  if (!q) {
    return res.status(400).json({ 
      success: false,
      error: 'Parámetro de búsqueda requerido' 
    });
  }

  try {
    const [rows] = await connection.query(`
      SELECT 
        p.cui, p.pet_name, p.pet_last_name, p.species, p.breed, 
        p.adoption_date, p.photo_path, p.card_printed,
        a.full_name as adopter_name, a.dni, a.phone, a.address, 
        a.district, a.province, a.department, a.email
      FROM pets p
      JOIN adopters a ON p.adopter_id = a.id
      WHERE a.dni = ? OR p.cui = ?
      ORDER BY p.created_at DESC
    `, [q, q]);
    
    // Split adopter name for display
    const results = rows.map(row => ({
      ...row,
      adopter_name: row.adopter_name.split(' ')[0],
      adopter_last_name: row.adopter_name.split(' ').slice(1).join(' ')
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

// Get specific pet by CUI
app.get('/api/pet/:cui', async (req, res) => {
  const connection = await pool.getConnection();
  const { cui } = req.params;

  try {
    const [rows] = await connection.query(`
      SELECT 
        p.cui, p.pet_name, p.pet_last_name, p.species, p.breed, 
        p.adoption_date, p.photo_path, p.qr_code_path, p.card_printed,
        a.full_name as adopter_name, a.dni, a.phone, a.address, 
        a.district, a.province, a.department, a.email
      FROM pets p
      JOIN adopters a ON p.adopter_id = a.id
      WHERE p.cui = ?
    `, [cui]);
    
    if (rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: 'Mascota no encontrada' 
      });
    }
    
    // Split adopter name for display
    const result = {
      ...rows[0],
      adopter_name: rows[0].adopter_name.split(' ')[0],
      adopter_last_name: rows[0].adopter_name.split(' ').slice(1).join(' ')
    };
    
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
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        success: false,
        error: 'El archivo es demasiado grande. Máximo 5MB.' 
      });
    }
  }
  res.status(500).json({ 
    success: false,
    error: 'Error interno del servidor' 
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  try {
    await pool.end();
    console.log('Database pool closed');
  } catch (error) {
    console.error('Error closing database pool:', error);
  }
  process.exit(0);
});
