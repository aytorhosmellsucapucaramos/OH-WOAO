/**
 * Upload Service
 * Configuración y manejo centralizado de uploads de archivos
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Directorio de uploads
const uploadsDir = path.join(__dirname, '../uploads');

// Crear directorio si no existe
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

/**
 * Configuración de almacenamiento de multer
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

/**
 * Filtro de tipos de archivo permitidos
 */
const fileFilter = (req, file, cb) => {
  // Tipos permitidos
  const allowedTypes = /jpeg|jpg|png|pdf|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos de imagen (JPEG, PNG, GIF) o PDF'));
  }
};

/**
 * Configuración base de multer
 */
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max
  },
  fileFilter: fileFilter
});

/**
 * Middleware para upload de archivo único
 */
const uploadSingle = (fieldName) => upload.single(fieldName);

/**
 * Middleware para upload múltiple con campos específicos
 */
const uploadMultiple = upload.fields([
  { name: 'photo', maxCount: 1 },
  { name: 'photoLateral', maxCount: 1 },
  { name: 'photoFrontal', maxCount: 1 },
  { name: 'dniPhoto', maxCount: 1 },
  { name: 'vaccinationCard', maxCount: 1 },
  { name: 'rabiesVaccine', maxCount: 1 }
]);

/**
 * Obtiene la ruta de un archivo subido
 * 
 * @param {Object} files - Objeto de archivos de multer
 * @param {string} fieldName - Nombre del campo
 * @returns {string|null} Nombre del archivo o null
 */
function getUploadedFilePath(files, fieldName) {
  if (files && files[fieldName] && files[fieldName][0]) {
    return files[fieldName][0].filename;
  }
  return null;
}

/**
 * Elimina un archivo del sistema
 * 
 * @param {string} filename - Nombre del archivo a eliminar
 * @returns {Promise<boolean>} True si se eliminó exitosamente
 */
async function deleteFile(filename) {
  try {
    const filePath = path.join(uploadsDir, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
}

module.exports = {
  upload,
  uploadSingle,
  uploadMultiple,
  getUploadedFilePath,
  deleteFile,
  uploadsDir
};
