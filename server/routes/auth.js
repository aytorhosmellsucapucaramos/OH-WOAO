const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');
const { generateToken, verifyToken } = require('../middleware/auth');

// Register new user (when registering a pet)
router.post('/register', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const {
      // Adopter info
      adopterName, adopterLastName, dni, email, password, phone, 
      department, province, district, address
    } = req.body;
    
    // Validate required fields
    if (!email || !password || !dni) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email, contraseña y DNI son requeridos' 
      });
    }
    
    // Check if user already exists
    const [existingUsers] = await connection.query(
      'SELECT id FROM adopters WHERE email = ? OR dni = ?',
      [email, dni]
    );
    
    if (existingUsers.length > 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'El email o DNI ya está registrado' 
      });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert new adopter
    const fullName = `${adopterName} ${adopterLastName}`;
    const [result] = await connection.query(
      `INSERT INTO adopters (full_name, dni, email, password, phone, address, district, province, department) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [fullName, dni, email, hashedPassword, phone, address, district, province, department]
    );
    
    // Generate token
    const token = generateToken({ 
      id: result.insertId, 
      email, 
      dni 
    });
    
    res.json({ 
      success: true, 
      message: 'Usuario registrado exitosamente',
      token,
      user: {
        id: result.insertId,
        fullName,
        email,
        dni
      }
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error al registrar usuario' 
    });
  } finally {
    connection.release();
  }
});

// Login
router.post('/login', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { email, password } = req.body;
    
    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email y contraseña son requeridos' 
      });
    }
    
    // Find user by email
    const [users] = await connection.query(
      'SELECT id, full_name, dni, email, password FROM adopters WHERE email = ?',
      [email]
    );
    
    if (users.length === 0) {
      return res.status(401).json({ 
        success: false, 
        error: 'Credenciales inválidas' 
      });
    }
    
    const user = users[0];
    
    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return res.status(401).json({ 
        success: false, 
        error: 'Credenciales inválidas' 
      });
    }
    
    // Generate token
    const token = generateToken({ 
      id: user.id, 
      email: user.email, 
      dni: user.dni 
    });
    
    res.json({ 
      success: true, 
      message: 'Inicio de sesión exitoso',
      token,
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        dni: user.dni
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error al iniciar sesión' 
    });
  } finally {
    connection.release();
  }
});

// Get current user
router.get('/me', verifyToken, async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const [users] = await connection.query(
      'SELECT id, full_name, dni, email, phone, address, district, province, department FROM adopters WHERE id = ?',
      [req.user.id]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Usuario no encontrado' 
      });
    }
    
    res.json({ 
      success: true, 
      user: users[0] 
    });
    
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error al obtener información del usuario' 
    });
  } finally {
    connection.release();
  }
});

// Get user's pets
router.get('/my-pets', verifyToken, async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const [pets] = await connection.query(
      `SELECT p.*, a.full_name as adopter_name, a.dni, a.email 
       FROM pets p
       JOIN adopters a ON p.adopter_id = a.id
       WHERE a.id = ?
       ORDER BY p.created_at DESC`,
      [req.user.id]
    );
    
    res.json({ 
      success: true, 
      pets 
    });
    
  } catch (error) {
    console.error('Get pets error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error al obtener mascotas del usuario' 
    });
  } finally {
    connection.release();
  }
});

// Update card printed status
router.put('/pet/:cui/card-printed', verifyToken, async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { cui } = req.params;
    const { printed } = req.body;
    
    // Verify pet belongs to user
    const [pets] = await connection.query(
      `SELECT p.id FROM pets p 
       JOIN adopters a ON p.adopter_id = a.id 
       WHERE p.cui = ? AND a.id = ?`,
      [cui, req.user.id]
    );
    
    if (pets.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Mascota no encontrada o no pertenece al usuario' 
      });
    }
    
    // Update card printed status
    await connection.query(
      'UPDATE pets SET card_printed = ? WHERE cui = ?',
      [printed, cui]
    );
    
    res.json({ 
      success: true, 
      message: 'Estado del carnet actualizado' 
    });
    
  } catch (error) {
    console.error('Update card status error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error al actualizar estado del carnet' 
    });
  } finally {
    connection.release();
  }
});

module.exports = router;
