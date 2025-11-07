/**
 * Admin Users Routes
 * Rutas para gestión de usuarios municipales (admin y personal de seguimiento)
 */

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { pool } = require('../config/database');
const { verifyToken, authorize } = require('../middleware/auth');
const logger = require('../config/logger');

// Todas las rutas requieren autenticación
router.use(verifyToken);
// authorize('admin') se aplicará individualmente a cada ruta que lo necesite

/**
 * GET /api/admin/users
 * Obtener todos los usuarios
 */
router.get('/', authorize('admin'), async (req, res) => {
  try {
    const [users] = await pool.query(`
      SELECT 
        a.id,
        a.first_name,
        a.last_name,
        a.email,
        a.dni,
        a.phone,
        a.address,
        a.role_id,
        a.assigned_zone,
        a.employee_code,
        a.is_active,
        a.created_at,
        r.code as role_code,
        r.name as role_name
      FROM adopters a
      LEFT JOIN roles r ON a.role_id = r.id
      ORDER BY a.created_at DESC
    `);

    res.json({
      success: true,
      data: users,
      total: users.length
    });

  } catch (error) {
    logger.error('Error al obtener usuarios', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Error al obtener usuarios'
    });
  }
});

/**
 * GET /api/admin/users/:id
 * Obtener un usuario específico
 */
router.get('/:id', authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    const [users] = await pool.query(`
      SELECT 
        a.id,
        a.first_name,
        a.last_name,
        a.email,
        a.dni,
        a.phone,
        a.address,
        a.role_id,
        a.assigned_zone,
        a.employee_code,
        a.is_active,
        a.created_at,
        r.code as role_code,
        r.name as role_name
      FROM adopters a
      LEFT JOIN roles r ON a.role_id = r.id
      WHERE a.id = ?
    `, [id]);

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      data: users[0]
    });

  } catch (error) {
    logger.error('Error al obtener usuario', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Error al obtener usuario'
    });
  }
});

/**
 * POST /api/admin/users/create
 * Crear nuevo usuario municipal (admin o personal de seguimiento)
 * NUEVO: Código de empleado generado automáticamente
 */
router.post('/create', authorize('admin', 'super_admin'), async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const {
      first_name,
      last_name,
      dni,
      email,
      password,
      phone,
      address,
      role_id,
      assigned_zone
    } = req.body;

    // Validación 1: Solo se pueden crear roles admin (2), seguimiento (3) o super_admin (4)
    const allowedRoles = req.user.role_code === 'super_admin' ? [2, 3, 4] : [2, 3];
    if (!allowedRoles.includes(parseInt(role_id))) {
      return res.status(400).json({
        success: false,
        error: req.user.role_code === 'super_admin' 
          ? 'Solo puedes crear usuarios Admin, Super Admin o Personal de Seguimiento'
          : 'Solo puedes crear usuarios Admin o Personal de Seguimiento'
      });
    }

    // Validación 2: Email único
    const [existingEmail] = await connection.query(
      'SELECT id FROM adopters WHERE email = ?',
      [email]
    );
    
    if (existingEmail.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'El email ya está registrado'
      });
    }

    // Validación 3: DNI único para personal municipal
    const [existingDNI] = await connection.query(
      'SELECT id FROM adopters WHERE dni = ? AND role_id IN (2, 3, 4)',
      [dni]
    );
    
    if (existingDNI.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Ya existe un empleado municipal con ese DNI'
      });
    }

    // Validación 5: Campos requeridos
    if (!first_name || !last_name || !dni || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Faltan campos requeridos'
      });
    }

    await connection.beginTransaction();

    // Obtener role_code para generar el código
    const [roles] = await connection.query(
      'SELECT code FROM roles WHERE id = ?',
      [role_id]
    );
    const role_code = roles[0].code;

    // Generar código de empleado automáticamente
    const [[{employee_code}]] = await connection.query(
      'SELECT generate_employee_code(?) as employee_code',
      [role_code]
    );

    logger.info('✅ Código generado:', { employee_code, role_code, role_id });

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertar usuario
    const [result] = await connection.query(
      `INSERT INTO adopters (
        first_name, last_name, dni, email, password, 
        phone, address, role_id, assigned_zone, employee_code, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE)`,
      [
        first_name,
        last_name,
        dni,
        email,
        hashedPassword,
        phone || null,
        address || null,
        role_id,
        role_id === 3 ? assigned_zone : null,  // Solo seguimiento tiene zona
        employee_code
      ]
    );

    // Registrar auditoría
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];
    
    await connection.query(
      `SET @current_user_id = ?`,
      [req.user.id]
    );

    await connection.query(
      `INSERT INTO user_audit_log (
        action, target_user_id, performed_by_user_id,
        new_values, ip_address, user_agent, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        'create',
        result.insertId,
        req.user.id,
        JSON.stringify({ role_id, email, employee_code }),
        ip,
        userAgent,
        `Usuario municipal creado con código ${employee_code}`
      ]
    );

    await connection.commit();

    logger.info('Usuario municipal creado', {
      userId: result.insertId,
      createdBy: req.user.id,
      createdByEmail: req.user.email,
      role_id,
      employee_code
    });

    // Emitir evento WebSocket para actualizar en tiempo real
    const io = req.app.get('io');
    if (io) {
      io.to('admin-room').emit('user-created', {
        id: result.insertId,
        first_name,
        last_name,
        email,
        role_code,
        employee_code
      });
      logger.info('📡 Evento WebSocket emitido: user-created');
    }

    res.json({
      success: true,
      message: 'Usuario creado exitosamente',
      userId: result.insertId,
      employee_code: employee_code
    });

  } catch (error) {
    await connection.rollback();
    logger.error('Error al crear usuario', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Error al crear usuario'
    });
  } finally {
    connection.release();
  }
});

/**
 * PUT /api/admin/users/:id
 * Actualizar un usuario
 */
router.put('/:id', authorize('admin'), async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { id } = req.params;
    const {
      first_name,
      last_name,
      phone,
      address,
      assigned_zone,
      employee_code
    } = req.body;

    await connection.beginTransaction();

    // Actualizar solo campos permitidos (no email, dni, ni password)
    await connection.query(
      `UPDATE adopters 
       SET 
         first_name = COALESCE(?, first_name),
         last_name = COALESCE(?, last_name),
         phone = COALESCE(?, phone),
         address = COALESCE(?, address),
         assigned_zone = ?,
         employee_code = COALESCE(?, employee_code)
       WHERE id = ?`,
      [first_name, last_name, phone, address, assigned_zone, employee_code, id]
    );

    await connection.commit();

    logger.info('Usuario actualizado', { userId: id, updatedBy: req.user.id });

    res.json({
      success: true,
      message: 'Usuario actualizado exitosamente'
    });

  } catch (error) {
    await connection.rollback();
    logger.error('Error al actualizar usuario', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Error al actualizar usuario'
    });
  } finally {
    connection.release();
  }
});

/**
 * PUT /api/admin/users/:id/role
 * Cambiar el rol de un usuario
 */
router.put('/:id/role', authorize('admin'), async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { id } = req.params;
    const { role_id } = req.body;

    // Validar que el rol exista
    if (![1, 2, 3].includes(parseInt(role_id))) {
      return res.status(400).json({
        success: false,
        error: 'Rol inválido'
      });
    }

    await connection.beginTransaction();

    await connection.query(
      'UPDATE adopters SET role_id = ? WHERE id = ?',
      [role_id, id]
    );

    await connection.commit();

    logger.info('Rol de usuario cambiado', {
      userId: id,
      newRoleId: role_id,
      changedBy: req.user.id
    });

    res.json({
      success: true,
      message: 'Rol actualizado exitosamente'
    });

  } catch (error) {
    await connection.rollback();
    logger.error('Error al cambiar rol', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Error al cambiar rol'
    });
  } finally {
    connection.release();
  }
});

/**
 * DELETE /api/admin/users/:id
 * Desactivar un usuario (no eliminar, para mantener historial)
 */
router.delete('/:id', authorize('admin'), async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { id } = req.params;

    // No permitir desactivarse a sí mismo
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({
        success: false,
        error: 'No puedes desactivar tu propia cuenta'
      });
    }

    await connection.beginTransaction();

    await connection.query(
      'UPDATE adopters SET is_active = FALSE WHERE id = ?',
      [id]
    );

    await connection.commit();

    logger.info('Usuario desactivado', { userId: id, deactivatedBy: req.user.id });

    res.json({
      success: true,
      message: 'Usuario desactivado exitosamente'
    });

  } catch (error) {
    await connection.rollback();
    logger.error('Error al desactivar usuario', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Error al desactivar usuario'
    });
  } finally {
    connection.release();
  }
});

/**
 * PUT /api/admin/users/:id/activate
 * Reactivar un usuario desactivado
 */
router.put('/:id/activate', authorize('admin'), async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { id } = req.params;

    await connection.beginTransaction();

    await connection.query(
      'UPDATE adopters SET is_active = TRUE WHERE id = ?',
      [id]
    );

    await connection.commit();

    logger.info('Usuario reactivado', { userId: id, reactivatedBy: req.user.id });

    res.json({
      success: true,
      message: 'Usuario reactivado exitosamente'
    });

  } catch (error) {
    await connection.rollback();
    logger.error('Error al reactivar usuario', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Error al reactivar usuario'
    });
  } finally {
    connection.release();
  }
});

/**
 * GET /api/admin/roles
 * Obtener todos los roles (filtrado según rol del usuario)
 */
router.get('/catalog/roles', async (req, res) => {
  try {
    const { exclude } = req.query;
    const userRoleCode = req.user?.role_code;
    
    let query = 'SELECT id, code, name, description FROM roles WHERE active = TRUE';
    
    // Excluir el rol 'user' si se pide
    if (exclude === 'user') {
      query += ' AND code != "user"';
    }
    
    // Si NO es super_admin, excluir también el rol super_admin
    if (userRoleCode !== 'super_admin') {
      query += ' AND code != "super_admin"';
    }
    
    const [roles] = await pool.query(query);

    res.json({
      success: true,
      data: roles
    });

  } catch (error) {
    logger.error('Error al obtener roles', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Error al obtener roles'
    });
  }
});

/**
 * GET /api/admin/zones
 * Obtener todas las zonas
 */
router.get('/catalog/zones', async (req, res) => {
  try {
    const [zones] = await pool.query(
      'SELECT id, code, name, description FROM zones WHERE active = TRUE'
    );

    res.json({
      success: true,
      data: zones
    });

  } catch (error) {
    logger.error('Error al obtener zonas', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Error al obtener zonas'
    });
  }
});

module.exports = router;
