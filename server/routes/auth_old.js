const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Registrar nuevo usuario con mascota
router.post('/register', async (req, res) => {
  const { 
    // Datos del propietario
    dni, fullName, phone, email, password, address, district, province, department,
    // Datos de la mascota
    petName, petLastName, species, breed, gender, color, birthDate, adoptionDate
  } = req.body;

  try {
    // Verificar si el email ya existe
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertar nuevo usuario con contraseña
    const [userResult] = await pool.execute(
      `INSERT INTO users (dni, full_name, phone, email, address, district, province, department, password_hash) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [dni, fullName, phone, email, address, district, province, department, hashedPassword]
    );

    // Generar token JWT
    const token = jwt.sign(
      { userId: result.insertId, dni },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Usuario registrado exitosamente',
      token,
      user: {
        id: result.insertId,
        dni,
        fullName,
        isPasswordSet: false
      },
      requirePasswordSetup: true
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
});

// Establecer contraseña por primera vez
router.post('/set-password', authenticateToken, async (req, res) => {
  const { password } = req.body;
  const userId = req.user.id;

  if (!password || password.length < 6) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.execute(
      'UPDATE users SET password_hash = ?, is_password_set = TRUE WHERE id = ?',
      [hashedPassword, userId]
    );

    res.json({
      success: true,
      message: 'Contraseña establecida exitosamente. Por favor, recoja su carnet en la Gerencia Ambiental.'
    });
  } catch (error) {
    console.error('Error al establecer contraseña:', error);
    res.status(500).json({ error: 'Error al establecer contraseña' });
  }
});

// Iniciar sesión
router.post('/login', async (req, res) => {
  const { dni, password } = req.body;

  try {
    // Buscar usuario por DNI
    const [users] = await pool.execute(
      'SELECT id, dni, full_name, password_hash, is_password_set, is_admin FROM users WHERE dni = ?',
      [dni]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'DNI o contraseña incorrectos' });
    }

    const user = users[0];

    // Verificar si el usuario ha establecido su contraseña
    if (!user.is_password_set) {
      return res.status(401).json({ 
        error: 'Debe registrarse primero para establecer su contraseña',
        requireRegistration: true 
      });
    }

    // Verificar contraseña
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'DNI o contraseña incorrectos' });
    }

    // Generar token JWT
    const token = jwt.sign(
      { userId: user.id, dni: user.dni, isAdmin: user.is_admin },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        dni: user.dni,
        fullName: user.full_name,
        isAdmin: user.is_admin,
        isPasswordSet: true
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

// Obtener información del usuario actual
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const [users] = await pool.execute(
      `SELECT id, dni, full_name, phone, email, address, district, province, department, 
              is_password_set, is_admin, created_at 
       FROM users WHERE id = ?`,
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({
      success: true,
      user: users[0]
    });
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({ error: 'Error al obtener información del usuario' });
  }
});

// Cerrar sesión (invalida el token en el cliente)
router.post('/logout', authenticateToken, (req, res) => {
  // En una implementación real, podrías mantener una lista negra de tokens
  res.json({
    success: true,
    message: 'Sesión cerrada exitosamente'
  });
});

// Verificar si el DNI ya está registrado
router.post('/check-dni', async (req, res) => {
  const { dni } = req.body;

  try {
    const [users] = await pool.execute(
      'SELECT id, is_password_set FROM users WHERE dni = ?',
      [dni]
    );

    res.json({
      exists: users.length > 0,
      isPasswordSet: users.length > 0 ? users[0].is_password_set : false
    });
  } catch (error) {
    console.error('Error al verificar DNI:', error);
    res.status(500).json({ error: 'Error al verificar DNI' });
  }
});

module.exports = router;
