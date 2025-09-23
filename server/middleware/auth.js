const jwt = require('jsonwebtoken');
require('dotenv').config();

// Generate JWT Token
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email,
      dni: user.dni 
    },
    process.env.JWT_SECRET || 'default_secret_key',
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
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret_key');
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
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret_key');
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
