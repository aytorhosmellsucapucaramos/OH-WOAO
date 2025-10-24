const jwt = require('jsonwebtoken');
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
      dni: user.dni 
    },
    JWT_SECRET,
    { 
      expiresIn: '7d' 
    }
  );
};

// Verify JWT Token Middleware
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      error: 'No se proporcionó token de autenticación' 
    });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
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

module.exports = {
  generateToken,
  verifyToken,
  optionalAuth
};
