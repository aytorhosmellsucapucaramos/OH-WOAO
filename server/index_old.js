const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const session = require('express-session');
require('dotenv').config();

const { pool, initializeDatabase } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors())
app.use(express.json())
app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')))

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('Solo se permiten archivos de imagen'), false)
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
})

// Database setup
const db = new sqlite3.Database('./pets.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
  if (err) {
    console.error('Error opening database:', err.message)
  } else {
    console.log('Connected to SQLite database')
    
    // Configure SQLite for better concurrency
    db.run('PRAGMA journal_mode = WAL')
    db.run('PRAGMA synchronous = NORMAL')
    db.run('PRAGMA cache_size = 1000')
    db.run('PRAGMA temp_store = memory')
    
    // Create adopters table
    db.run(`
      CREATE TABLE IF NOT EXISTS adopters (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        full_name TEXT NOT NULL,
        dni TEXT UNIQUE NOT NULL,
        phone TEXT NOT NULL,
        address TEXT NOT NULL,
        district TEXT NOT NULL,
        province TEXT NOT NULL,
        department TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create pets table
    db.run(`
      CREATE TABLE IF NOT EXISTS pets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cui VARCHAR(15) UNIQUE NOT NULL,
        pet_name TEXT NOT NULL,
        pet_last_name TEXT,
        species TEXT NOT NULL,
        breed TEXT NOT NULL,
        adoption_date DATE NOT NULL,
        photo_path TEXT,
        qr_code_path TEXT,
        adopter_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (adopter_id) REFERENCES adopters (id)
      )
    `)

    // Create stray_reports table (NUEVA TABLA NORMALIZADA)
    db.run(`CREATE TABLE IF NOT EXISTS stray_reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      report_id TEXT UNIQUE NOT NULL,
      
      -- Información del reportante (FK a pets table)
      reporter_cui TEXT NOT NULL,
      reporter_name TEXT NOT NULL,
      reporter_phone TEXT NOT NULL,
      reporter_email TEXT,
      
      -- Ubicación del reporte
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      address TEXT,
      zone TEXT,
      
      -- Información del perro
      breed TEXT DEFAULT 'Mestizo',
      size TEXT CHECK(size IN ('small', 'medium', 'large')) DEFAULT 'medium',
      colors TEXT, -- JSON array de colores
      temperament TEXT CHECK(temperament IN ('friendly', 'shy', 'aggressive', 'scared')) DEFAULT 'friendly',
      condition_type TEXT CHECK(condition_type IN ('stray', 'lost', 'abandoned')) DEFAULT 'stray',
      gender TEXT CHECK(gender IN ('male', 'female', 'unknown')) DEFAULT 'unknown',
      estimated_age TEXT,
      health_status TEXT,
      
      -- Estado del reporte
      urgency_level TEXT CHECK(urgency_level IN ('low', 'normal', 'high', 'emergency')) DEFAULT 'normal',
      status TEXT CHECK(status IN ('active', 'rescued', 'adopted', 'transferred', 'deceased')) DEFAULT 'active',
      
      -- Detalles adicionales
      description TEXT,
      has_collar BOOLEAN DEFAULT 0,
      is_injured BOOLEAN DEFAULT 0,
      needs_rescue BOOLEAN DEFAULT 1,
      
      -- Archivos y fechas
      photo_path TEXT,
      report_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
      
      -- Relación con tabla pets
      FOREIGN KEY (reporter_cui) REFERENCES pets(cui)
    )`, (err) => {
      if (err) {
        console.error('Error creating stray_reports table:', err.message)
      } else {
        console.log('Stray reports table ready')
      }
    })

    // Create status_updates table para historial de cambios
    db.run(`CREATE TABLE IF NOT EXISTS status_updates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      report_id TEXT NOT NULL,
      old_status TEXT,
      new_status TEXT NOT NULL,
      updated_by TEXT, -- CUI del usuario que actualizó
      update_reason TEXT,
      update_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      
      FOREIGN KEY (report_id) REFERENCES stray_reports(report_id)
    )`, (err) => {
      if (err) {
        console.error('Error creating status_updates table:', err.message)
      } else {
        console.log('Status updates table ready')
      }
    })
  }
})

function initializeDatabase() {
  // Create adopters table
  db.run(`
    CREATE TABLE IF NOT EXISTS adopters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      dni TEXT UNIQUE NOT NULL,
      phone TEXT NOT NULL,
      address TEXT NOT NULL,
      district TEXT NOT NULL,
      province TEXT NOT NULL,
      department TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Create pets table
  db.run(`
    CREATE TABLE IF NOT EXISTS pets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cui VARCHAR(15) UNIQUE NOT NULL,
      pet_name TEXT NOT NULL,
      pet_last_name TEXT,
      species TEXT NOT NULL,
      breed TEXT NOT NULL,
      adoption_date DATE NOT NULL,
      photo_path TEXT,
      qr_code_path TEXT,
      adopter_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (adopter_id) REFERENCES adopters (id)
    )
  `)
}

// Generate unique CUI (8 digits + check digit)
function generateCUI() {
  const randomNumber = Math.floor(10000000 + Math.random() * 90000000)
  const checkDigit = randomNumber % 10
  return `${randomNumber}-${checkDigit}`
}

// Check if CUI already exists
function checkCUIExists(cui) {
  return new Promise((resolve, reject) => {
    db.get('SELECT cui FROM pets WHERE cui = ?', [cui], (err, row) => {
      if (err) reject(err)
      else resolve(!!row)
    })
  })
}

// Generate unique CUI
async function generateUniqueCUI() {
  let cui
  let exists = true
  
  while (exists) {
    cui = generateCUI()
    exists = await checkCUIExists(cui)
  }
  
  return cui
}

// Import routes
const strayReportsRoutes = require('./routes/strayReports')
const adminRoutes = require('./routes/admin')

// Routes
app.use('/api/stray-reports', strayReportsRoutes)
app.use('/api/admin', adminRoutes)

// Register new pet and adopter
app.post('/api/register', upload.single('photo'), async (req, res) => {
  console.log('=== INICIO DE REGISTRO ===')
  console.log('Request body:', req.body)
  console.log('Request file:', req.file)
  console.log('Request headers:', req.headers)
  
  try {
    const {
      petName, petLastName, species, breed, adoptionDate,
      adopterName, adopterLastName, dni, phone, department, province, district, address
    } = req.body
    
    console.log('Datos extraídos:', {
      petName, petLastName, species, breed, adoptionDate,
      adopterName, adopterLastName, dni, phone, department, province, district, address
    })

    // Validate required fields
    if (!petName || !species || !breed || !adoptionDate || !adopterName || !adopterLastName || !dni || !phone || !address) {
      return res.status(400).json({ error: 'Todos los campos requeridos deben ser completados' })
    }

    const fullAdopterName = `${adopterName} ${adopterLastName}`
    
    // Generate unique CUI
    const cui = await generateUniqueCUI()

    // Insert or get adopter
    const adopterResult = await new Promise((resolve, reject) => {
      db.run(
        `INSERT OR IGNORE INTO adopters (full_name, dni, phone, address, district, province, department) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [fullAdopterName, dni, phone, address, district, province, department],
        function(err) {
          if (err) reject(err)
          else {
            // Get the adopter ID
            db.get('SELECT id FROM adopters WHERE dni = ?', [dni], (err, row) => {
              if (err) reject(err)
              else resolve(row.id)
            })
          }
        }
      )
    })

    // Insert pet
    const photoPath = req.file ? req.file.filename : null
    
    await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO pets (cui, pet_name, pet_last_name, species, breed, adoption_date, photo_path, adopter_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [cui, petName, petLastName || '', species, breed, adoptionDate, photoPath, adopterResult],
        function(err) {
          if (err) reject(err)
          else resolve(this.lastID)
        }
      )
    })

    // Generate QR code with URL to pet card
    const qrData = `http://localhost:3000/pet-card/${cui}`

    const qrCodePath = `qr_${cui.replace('-', '_')}.png`
    await QRCode.toFile(path.join(uploadsDir, qrCodePath), qrData)

    // Update pet with QR code path
    await new Promise((resolve, reject) => {
      db.run(
        'UPDATE pets SET qr_code_path = ? WHERE cui = ?',
        [qrCodePath, cui],
        (err) => {
          if (err) reject(err)
          else resolve()
        }
      )
    })

    res.json({ 
      success: true, 
      cui,
      message: 'Mascota registrada exitosamente'
    })

  } catch (error) {
    console.error('Registration error:', error)
    console.error('Error stack:', error.stack)
    console.error('Error message:', error.message)
    console.error('Error code:', error.code)
    
    let errorMessage = 'Error interno del servidor'
    let statusCode = 500
    
    if (error.code === 'SQLITE_BUSY') {
      errorMessage = 'Base de datos ocupada. Inténtalo de nuevo.'
      statusCode = 503
    } else if (error.code === 'SQLITE_CONSTRAINT') {
      errorMessage = 'Error de validación de datos. Verifica que el DNI no esté duplicado.'
      statusCode = 400
    } else if (error.message) {
      errorMessage = `Error: ${error.message}`
    }
    
    res.status(statusCode).json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// Get all pets
app.get('/api/pets', (req, res) => {
  const query = `
    SELECT 
      p.id, p.cui, p.pet_name, p.pet_last_name, p.species, p.breed, 
      p.adoption_date, p.photo_path, p.qr_code_path, p.created_at,
      a.full_name as adopter_name, a.dni, a.phone, a.address, 
      a.district, a.province, a.department
    FROM pets p
    JOIN adopters a ON p.adopter_id = a.id
    ORDER BY p.created_at DESC
  `

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('Pets fetch error:', err)
      res.status(500).json({ error: 'Error al obtener mascotas' })
    } else {
      // Split adopter name for display
      const results = rows.map(row => ({
        ...row,
        adopter_name: row.adopter_name.split(' ')[0],
        adopter_last_name: row.adopter_name.split(' ').slice(1).join(' ')
      }))
      res.json(results)
    }
  })
})

// Search pets by DNI or CUI
app.get('/api/search', (req, res) => {
  const { q } = req.query
  
  if (!q) {
    return res.status(400).json({ error: 'Parámetro de búsqueda requerido' })
  }

  const query = `
    SELECT 
      p.cui, p.pet_name, p.pet_last_name, p.species, p.breed, 
      p.adoption_date, p.photo_path,
      a.full_name as adopter_name, a.dni, a.phone, a.address, 
      a.district, a.province, a.department
    FROM pets p
    JOIN adopters a ON p.adopter_id = a.id
    WHERE a.dni = ? OR p.cui = ?
    ORDER BY p.created_at DESC
  `

  db.all(query, [q, q], (err, rows) => {
    if (err) {
      console.error('Search error:', err)
      res.status(500).json({ error: 'Error en la búsqueda' })
    } else {
      // Split adopter name for display
      const results = rows.map(row => ({
        ...row,
        adopter_name: row.adopter_name.split(' ')[0],
        adopter_last_name: row.adopter_name.split(' ').slice(1).join(' ')
      }))
      res.json(results)
    }
  })
})

// Get specific pet by CUI
app.get('/api/pet/:cui', (req, res) => {
  const { cui } = req.params

  const query = `
    SELECT 
      p.cui, p.pet_name, p.pet_last_name, p.species, p.breed, 
      p.adoption_date, p.photo_path, p.qr_code_path,
      a.full_name as adopter_name, a.dni, a.phone, a.address, 
      a.district, a.province, a.department
    FROM pets p
    JOIN adopters a ON p.adopter_id = a.id
    WHERE p.cui = ?
  `

  db.get(query, [cui], (err, row) => {
    if (err) {
      console.error('Pet fetch error:', err)
      res.status(500).json({ 
        success: false,
        error: 'Error al obtener información de la mascota' 
      })
    } else if (!row) {
      res.status(404).json({ 
        success: false,
        error: 'Mascota no encontrada' 
      })
    } else {
      // Split adopter name for display
      const result = {
        ...row,
        adopter_name: row.adopter_name.split(' ')[0],
        adopter_last_name: row.adopter_name.split(' ').slice(1).join(' ')
      }
      res.json({ 
        success: true,
        data: result
      })
    }
  })
})

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'El archivo es demasiado grande. Máximo 5MB.' })
    }
  }
  res.status(500).json({ error: 'Error interno del servidor' })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

// Graceful shutdown
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err)
    } else {
      console.log('Database connection closed')
    }
    process.exit(0)
  })
})
