/**
 * User Service
 * Handles user/adopter authentication and management
 */

const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');
const logger = require('../config/logger');

/**
 * Find user by DNI or email
 * @param {string} dni - User's DNI
 * @param {string} email - User's email
 * @returns {Promise<object|null>}
 */
async function findUserByDniOrEmail(dni, email) {
  const connection = await pool.getConnection();
  try {
    const [users] = await connection.query(
      'SELECT * FROM adopters WHERE dni = ? OR email = ?',
      [dni, email]
    );
    return users.length > 0 ? users[0] : null;
  } finally {
    connection.release();
  }
}

/**
 * Create new adopter/user
 * @param {object} userData - User data
 * @param {string} hashedPassword - Hashed password
 * @returns {Promise<number>} - New user ID
 */
async function createUser(userData, hashedPassword) {
  const connection = await pool.getConnection();
  try {
    const { firstName, lastName, dni, dniPhotoPath, email, phone, address } = userData;
    
    const [result] = await connection.query(
      `INSERT INTO adopters (first_name, last_name, dni, dni_photo_path, email, password, phone, address) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [firstName, lastName, dni, dniPhotoPath || null, email, hashedPassword, phone, address]
    );
    
    logger.info(`New user created: ${email}`, { userId: result.insertId, dni });
    
    return result.insertId;
  } catch (error) {
    logger.error('Error creating user', { email: userData.email, error: error.message });
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * Verify user password
 * @param {string} password - Plain text password
 * @param {string} hashedPassword - Hashed password from database
 * @returns {Promise<boolean>}
 */
async function verifyPassword(password, hashedPassword) {
  return bcrypt.compare(password, hashedPassword);
}

/**
 * Hash password
 * @param {string} password - Plain text password
 * @returns {Promise<string>} - Hashed password
 */
async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

/**
 * Get or create user for pet registration
 * @param {object} userData - User data
 * @param {string} password - User password
 * @param {object} authenticatedUser - Already authenticated user (if any)
 * @returns {Promise<object>} - { userId, email, dni, isNewUser }
 */
async function getOrCreateUser(userData, password, authenticatedUser = null) {
  // If user is already authenticated, use their ID
  if (authenticatedUser) {
    return {
      userId: authenticatedUser.id,
      email: authenticatedUser.email,
      dni: authenticatedUser.dni,
      isNewUser: false
    };
  }

  const { dni, email } = userData;
  
  // Check if user exists
  const existingUser = await findUserByDniOrEmail(dni, email);
  
  if (existingUser) {
    // Verify password
    const validPassword = await verifyPassword(password, existingUser.password);
    if (!validPassword) {
      throw new Error('Contraseña incorrecta para el usuario existente');
    }
    
    return {
      userId: existingUser.id,
      email: existingUser.email,
      dni: existingUser.dni,
      isNewUser: false
    };
  }
  
  // Create new user
  const hashedPassword = await hashPassword(password);
  const userId = await createUser(userData, hashedPassword);
  
  return {
    userId,
    email,
    dni,
    isNewUser: true
  };
}

module.exports = {
  findUserByDniOrEmail,
  createUser,
  verifyPassword,
  hashPassword,
  getOrCreateUser
};
