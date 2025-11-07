const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');
require('dotenv').config();

// Validación estricta de JWT_SECRET
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET === 'tu_jwt_secret_super_seguro_aqui_cambiar_en_produccion') {
  console.error('❌ ERROR CRÍTICO: JWT_SECRET no está configurado correctamente en .env');
  console.error('Genera uno con: node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'hex\'))"');
  process.exit(1);
}

// Generate JWT Token
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email,
      dni: user.dni,
      role_id: user.role_id || 1  // Incluir rol en el token
    },
    JWT_SECRET,
    { 
      expiresIn: '7d' 
    }
  );
};

// Verify JWT Token Middleware (con información completa del usuario)
const verifyToken = async (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      error: 'No se proporcionó token de autenticación' 
    });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Obtener información completa del usuario incluyendo rol
    const [users] = await pool.query(`
      SELECT 
        a.id, a.first_name, a.last_name, a.email, a.dni, 
        a.role_id, a.assigned_zone, a.employee_code, a.is_active,
        r.code as role_code, r.name as role_name, r.permissions
      FROM adopters a
      LEFT JOIN roles r ON a.role_id = r.id
      WHERE a.id = ?
    `, [decoded.id]);
    
    if (users.length === 0 || !users[0].is_active) {
      return res.status(401).json({ 
        success: false, 
        error: 'Usuario no encontrado o inactivo' 
      });
    }
    
    req.user = users[0];
    console.log('✅ Usuario autenticado:', { 
      id: users[0].id, 
      email: users[0].email,
      role_code: users[0].role_code,
      role_id: users[0].role_id
    });
    next();
  } catch (error) {
    console.error('❌ Error en verifyToken:', error.message);
    return res.status(403).json({ 
      success: false, 
      error: 'Token inválido o expirado' 
    });
  }
};

// Optional authentication - doesn't require token but adds user info if present
const optionalAuth = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  
  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
    } catch (error) {
      // Token is invalid but we continue anyway since it's optional
      req.user = null;
    }
  } else {
    req.user = null;
  }
  
  next();
};

// Middleware de autorización por roles
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      console.error('❌ authorize: No hay req.user');
      return res.status(401).json({ 
        success: false,
        error: 'No autenticado' 
      });
    }
    
    console.log('🔐 Verificando autorización:', {
      required_roles: allowedRoles,
      user_role_code: req.user.role_code,
      user_role_id: req.user.role_id
    });
    
    // Verificar si el rol del usuario está en los roles permitidos
    if (!allowedRoles.includes(req.user.role_code)) {
      console.error('❌ authorize: Rol no permitido');
      return res.status(403).json({ 
        success: false,
        error: 'No tienes permisos para acceder a este recurso',
        required_role: allowedRoles,
        your_role: req.user.role_code
      });
    }
    
    console.log('✅ Autorización exitosa');
    next();
  };
};

module.exports = {
  generateToken,
  verifyToken,
  optionalAuth,
  authorize
};
