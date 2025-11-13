/**
 * Auth Controller
 * Controladores para autenticación y gestión de usuarios
 */

const userService = require('../services/userService');
const petService = require('../services/petService');
const { sendSuccess, sendError, sendUnauthorized } = require('../utils/responseHandler');
const logger = require('../config/logger');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');

/**
 * Login de usuario
 * POST /api/auth/login
 */
exports.login = async (req, res) => {
  try {
    let { email, password } = req.body;
    
    // Limpiar espacios en blanco
    email = email?.trim();
    password = password?.trim();

    if (!email || !password) {
      return sendError(res, 'Email y contraseña son requeridos', 400);
    }

    logger.info('🔐 Intento de login', { email });

    // Buscar usuario por email con su rol
    const [users] = await pool.query(`
      SELECT 
        a.*,
        r.id as role_id,
        r.code as role_code,
        r.name as role_name
      FROM adopters a
      LEFT JOIN roles r ON a.role_id = r.id
      WHERE a.email = ?
    `, [email]);
    
    if (users.length === 0) {
      logger.warn('❌ Usuario no encontrado', { email });
      return sendUnauthorized(res, 'Credenciales inválidas');
    }
    
    const user = users[0];
    
    // Verificar si el usuario está activo
    if (user.is_active === false || user.is_active === 0) {
      logger.warn('❌ Usuario inactivo', { email });
      return sendUnauthorized(res, 'Tu cuenta ha sido desactivada. Contacta al administrador.');
    }
    
    logger.info('👤 Usuario encontrado', { 
      userId: user.id, 
      email: user.email,
      hasPassword: !!user.password,
      passwordLength: user.password?.length,
      passwordPrefix: user.password?.substring(0, 7) // $2a$10$ o $2b$10$
    });
    
    // Verificar contraseña
    const validPassword = await bcrypt.compare(password, user.password);
    
    logger.info('🔍 Resultado de comparación', { 
      email: user.email,
      validPassword,
      inputPasswordLength: password?.length
    });
    
    if (!validPassword) {
      logger.warn('❌ Contraseña incorrecta', { email: user.email });
      return sendUnauthorized(res, 'Credenciales inválidas');
    }
    
    logger.info('✅ Login exitoso', { 
      email: user.email, 
      userId: user.id,
      role: user.role_code 
    });
    
    // Generar token con rol del usuario
    const token = jwt.sign(
      { 
        id: user.id, 
        dni: user.dni, 
        email: user.email, 
        role_id: user.role_id,
        role_code: user.role_code 
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }  // 7 días de validez
    );
    
    res.status(200).json({
      success: true,
      message: 'Login exitoso',
      token,
      user: {
        id: user.id,
        dni: user.dni,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone,
        address: user.address,
        role_id: user.role_id,
        role_code: user.role_code,
        role_name: user.role_name,
        assigned_zone: user.assigned_zone,
        employee_code: user.employee_code
      }
    });

  } catch (error) {
    logger.error('Login error', { error: error.message });
    sendError(res, 'Error en el login');
  }
};

/**
 * Obtiene información del usuario autenticado
 * GET /api/auth/me
 */
exports.getMe = async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT id, first_name, last_name, dni, email, phone, address, photo_path FROM adopters WHERE id = ?',
      [req.user.id]
    );
    
    if (users.length === 0) {
      return sendError(res, 'Usuario no encontrado', 404);
    }

    res.status(200).json({
      success: true,
      user: users[0]
    });

  } catch (error) {
    logger.error('Get user info error', { error: error.message, userId: req.user.id });
    sendError(res, 'Error al obtener información del usuario');
  }
};

/**
 * Obtiene las mascotas del usuario autenticado
 * GET /api/auth/my-pets
 */
exports.getMyPets = async (req, res) => {
  try {
    const [pets] = await pool.query(
      'SELECT * FROM view_pets_complete WHERE adopter_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );

    res.status(200).json({
      success: true,
      pets: pets // Cambiar data por pets para coincidir con el cliente
    });

  } catch (error) {
    logger.error('Get user pets error', { error: error.message, userId: req.user.id });
    sendError(res, 'Error al obtener las mascotas');
  }
};

/**
 * Obtiene los reportes de perros callejeros del usuario autenticado
 * GET /api/auth/my-reports
 */
exports.getMyReports = async (req, res) => {
  try {
    // Verificar si la tabla de estados normalizados existe
    let reports;
    
    try {
      // Intentar con sistema normalizado primero
      [reports] = await pool.query(
        `SELECT 
          sr.*,
          st.code as status,
          st.name as status_name,
          st.color as status_color,
          breeds.name as breed_name,
          sizes.name as size_name,
          assigned_user.first_name as assigned_first_name,
          assigned_user.last_name as assigned_last_name,
          assigned_user.employee_code as assigned_employee_code
         FROM stray_reports sr
         JOIN stray_report_status_types st ON sr.status_type_id = st.id
         LEFT JOIN breeds ON sr.breed_id = breeds.id
         LEFT JOIN sizes ON sr.size_id = sizes.id
         LEFT JOIN adopters assigned_user ON sr.assigned_to = assigned_user.id
         WHERE sr.reporter_id = ?
         ORDER BY sr.created_at DESC`,
        [req.user.id]
      );
      
      logger.info('✅ Usando sistema de estados normalizado');
      
    } catch (normalizedError) {
      // Si falla, usar sistema antiguo
      logger.warn('⚠️ Sistema normalizado no disponible, usando sistema antiguo');
      
      [reports] = await pool.query(
        `SELECT 
          sr.*,
          breeds.name as breed_name,
          sizes.name as size_name,
          assigned_user.first_name as assigned_first_name,
          assigned_user.last_name as assigned_last_name,
          assigned_user.employee_code as assigned_employee_code
         FROM stray_reports sr
         LEFT JOIN breeds ON sr.breed_id = breeds.id
         LEFT JOIN sizes ON sr.size_id = sizes.id
         LEFT JOIN adopters assigned_user ON sr.assigned_to = assigned_user.id
         WHERE sr.reporter_id = ?
         ORDER BY sr.created_at DESC`,
        [req.user.id]
      );
      
      // Mapear estados antiguos a nuevos para compatibilidad
      reports = reports.map(report => ({
        ...report,
        status: report.status || 'n', // Usar status original o default 'nuevo'
        status_name: getStatusName(report.status || 'n'),
        status_color: getStatusColor(report.status || 'n')
      }));
    }

    res.status(200).json({
      success: true,
      reports: reports,
      total: reports.length
    });

  } catch (error) {
    logger.error('Get user reports error', { error: error.message, userId: req.user.id });
    sendError(res, 'Error al obtener los reportes del usuario');
  }
};

// Helper functions para mapeo de estados
const getStatusName = (status) => {
  const statusMap = {
    'n': 'Nuevo',
    'a': 'Asignado', 
    'p': 'En Progreso',
    'd': 'Completado',
    'r': 'En Revisión',
    'c': 'Cerrado'
  };
  return statusMap[status] || 'Nuevo';
};

const getStatusColor = (status) => {
  const colorMap = {
    'n': '#ef4444',
    'a': '#3b82f6',
    'p': '#8b5cf6', 
    'd': '#10b981',
    'r': '#f59e0b',
    'c': '#6b7280'
  };
  return colorMap[status] || '#ef4444';
};

/**
 * Actualiza el perfil del usuario
 * PUT /api/auth/profile
 */
exports.updateProfile = async (req, res) => {
  try {
    const updates = req.body;
    const userId = req.user.id;
    
    logger.info('📝 Actualización de perfil iniciada', { 
      userId, 
      updates: Object.keys(updates),
      hasFile: !!req.file,
      fileName: req.file?.filename 
    });
    
    // Construir query dinámicamente
    const allowedFields = ['first_name', 'last_name', 'phone', 'email', 'address'];
    const updateFields = [];
    const values = [];
    
    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key) && value !== undefined && value !== '') {
        updateFields.push(`${key} = ?`);
        values.push(value);
      }
    }
    
    // Manejar foto de perfil si se subió
    if (req.file) {
      logger.info('📸 Archivo de foto recibido', { filename: req.file.filename });
      updateFields.push('photo_path = ?');
      values.push(req.file.filename);
    }
    
    if (updateFields.length === 0) {
      return sendError(res, 'No hay campos válidos para actualizar', 400);
    }
    
    values.push(userId);
    
    await pool.query(
      `UPDATE adopters SET ${updateFields.join(', ')} WHERE id = ?`,
      values
    );
    
    // Obtener el usuario actualizado
    const [users] = await pool.query(
      'SELECT id, first_name, last_name, dni, email, phone, address, photo_path FROM adopters WHERE id = ?',
      [userId]
    );
    
    logger.info('✅ Perfil actualizado exitosamente', { 
      userId, 
      updatedFields: updateFields.length,
      photo_path: users[0]?.photo_path 
    });
    
    res.status(200).json({
      success: true,
      message: 'Perfil actualizado exitosamente',
      user: users[0]
    });

  } catch (error) {
    logger.error('❌ Error al actualizar perfil', { 
      error: error.message, 
      userId: req.user?.id,
      stack: error.stack 
    });
    sendError(res, 'Error al actualizar el perfil', 500, error.message);
  }
};

/**
 * Actualiza una mascota del usuario
 * PUT /api/auth/pet/:id
 */
exports.updatePet = async (req, res) => {
  try {
    const petId = parseInt(req.params.id);
    const updates = req.body;

    await petService.updatePet(petId, req.user.id, updates);

    sendSuccess(res, {
      message: 'Mascota actualizada exitosamente'
    });

  } catch (error) {
    if (error.message === 'PET_NOT_FOUND') {
      return sendError(res, 'Mascota no encontrada', 404);
    }
    if (error.message === 'UNAUTHORIZED') {
      return sendUnauthorized(res, 'No tienes permiso para editar esta mascota');
    }

    logger.error('Update pet error', { error: error.message, petId: req.params.id });
    sendError(res, 'Error al actualizar la mascota');
  }
};

module.exports = exports;
