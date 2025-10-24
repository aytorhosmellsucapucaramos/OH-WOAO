/**
 * Pet Service
 * Handles pet registration and management business logic
 */

const { pool } = require('../config/database');
const logger = require('../config/logger');
const { generateUniqueCUI } = require('../utils/cuiGenerator');
const qrService = require('./qrService');
const path = require('path');

/**
 * Get or create catalog entry (breeds, colors, sizes)
 * @param {string} table - Table name
 * @param {string} field - Field name
 * @param {string} value - Value to search/insert
 * @param {object} connection - Database connection
 * @returns {Promise<number|null>} - Catalog ID
 */
async function getOrCreateCatalogId(table, field, value, connection) {
  if (!value) return null;
  
  // Try to find existing entry (case-insensitive)
  const [existing] = await connection.query(
    `SELECT id FROM ${table} WHERE LOWER(${field}) = LOWER(?) LIMIT 1`,
    [value]
  );
  
  if (existing.length > 0) {
    return existing[0].id;
  }
  
  // If not found, insert new entry
  const [result] = await connection.query(
    `INSERT INTO ${table} (${field}) VALUES (?)`,
    [value]
  );
  
  return result.insertId;
}

/**
 * Register a new pet
 * @param {object} petData - Pet information
 * @param {object} files - Uploaded files
 * @param {number} adopterId - Owner/adopter ID
 * @returns {Promise<object>} - Registration result with CUI
 */
async function registerPet(petData, files, adopterId) {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const {
      petName, sex, breed, birthDate, age, size, color, additionalFeatures,
      aggressionHistory, aggressionDetails,
      hasVaccinationCard, hasRabiesVaccine, medicalHistory,
      receiptNumber, receiptIssueDate, receiptPayer, receiptAmount
    } = petData;
    
    // Validate required fields
    if (!petName || !sex || !breed || !age || !size || !color) {
      throw new Error('Los campos obligatorios de la mascota son requeridos');
    }
    
    // Generate unique CUI
    const cui = await generateUniqueCUI();
    logger.info(`Generated CUI for pet: ${cui}`, { petName, adopterId });
    
    // Get catalog IDs
    const breedId = await getOrCreateCatalogId('breeds', 'name', breed, connection);
    const colorId = await getOrCreateCatalogId('colors', 'name', color, connection);
    
    // Get size ID (sizes use 'code' instead of 'name')
    let sizeId = null;
    if (size) {
      const [sizeResult] = await connection.query(
        'SELECT id FROM sizes WHERE code = ? LIMIT 1',
        [size]
      );
      sizeId = sizeResult.length > 0 ? sizeResult[0].id : null;
    }
    
    // Insert basic pet data
    const [petResult] = await connection.query(
      `INSERT INTO pets (
        cui, pet_name, sex, 
        breed_id, birth_date, age, size_id,
        additional_features,
        adopter_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        cui, petName, sex,
        breedId, birthDate || null, age, sizeId,
        additionalFeatures || '',
        adopterId
      ]
    );
    
    const petId = petResult.insertId;
    logger.info(`Pet registered successfully`, { petId, cui, adopterId });
    
    // Insert color in pivot table
    if (colorId) {
      await connection.query(
        'INSERT INTO pet_colors (pet_id, color_id, display_order) VALUES (?, ?, 0)',
        [petId, colorId]
      );
    }
    
    // Generate QR code
    const uploadsDir = path.join(__dirname, '../uploads');
    const qrCodeFilename = await qrService.generateQRCode(cui, uploadsDir);
    
    // Handle file uploads
    const photoFrontalPath = files?.photoFrontal?.[0]?.filename || null;
    const photoPosteriorPath = files?.photoPosterior?.[0]?.filename || null;
    const vaccinationCardPath = files?.vaccinationCard?.[0]?.filename || null;
    const rabiesVaccinePath = files?.rabiesVaccine?.[0]?.filename || null;
    
    // Insert documents (photos and QR)
    await connection.query(
      `INSERT INTO pet_documents (pet_id, photo_frontal_path, photo_posterior_path, qr_code_path, card_printed)
       VALUES (?, ?, ?, ?, ?)`,
      [petId, photoFrontalPath, photoPosteriorPath, qrCodeFilename, false]
    );
    
    // Convert boolean values
    const hasVaccCard = hasVaccinationCard === 'si';
    const hasRabiesVac = hasRabiesVaccine === 'si';
    
    // Insert health records
    await connection.query(
      `INSERT INTO pet_health_records (
        pet_id, has_vaccination_card, vaccination_card_path,
        has_rabies_vaccine, rabies_vaccine_path, medical_history,
        aggression_history, aggression_details
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        petId, hasVaccCard, vaccinationCardPath,
        hasRabiesVac, rabiesVaccinePath, medicalHistory || null,
        aggressionHistory || 'no', aggressionDetails || null
      ]
    );
    
    // Insert payment data (if dangerous breed with receipt)
    if (receiptNumber && receiptIssueDate && receiptPayer && receiptAmount) {
      await connection.query(
        `INSERT INTO pet_payments (
          pet_id, receipt_number, receipt_issue_date,
          receipt_payer, receipt_amount, payment_type, status
        ) VALUES (?, ?, ?, ?, ?, 'registration', 'pending')`,
        [petId, receiptNumber, receiptIssueDate, receiptPayer, receiptAmount]
      );
    }
    
    await connection.commit();
    
    return {
      petId,
      cui,
      qrCodePath: qrCodeFilename
    };
    
  } catch (error) {
    await connection.rollback();
    logger.error('Pet registration failed', { error: error.message, adopterId });
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * Get all pets with pagination
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {Promise<object>} - Pets data with pagination
 */
async function getAllPets(page = 1, limit = 20) {
  const connection = await pool.getConnection();
  
  try {
    const offset = (page - 1) * limit;
    
    // Get pets with pagination
    const [pets] = await connection.query(
      `SELECT * FROM view_pets_complete ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    
    // Get total count
    const [[{ total }]] = await connection.query(
      'SELECT COUNT(*) as total FROM pets'
    );
    
    return {
      data: pets,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
    
  } finally {
    connection.release();
  }
}

/**
 * Search pets by DNI or CUI
 * @param {string} query - Search query (DNI or CUI)
 * @returns {Promise<array>} - Matching pets
 */
async function searchPets(query) {
  const connection = await pool.getConnection();
  
  try {
    const [pets] = await connection.query(
      `SELECT * FROM view_pets_complete 
       WHERE owner_dni = ? OR cui = ?
       ORDER BY created_at DESC`,
      [query, query]
    );
    
    logger.info(`Pet search completed`, { query, resultsCount: pets.length });
    
    return pets;
    
  } finally {
    connection.release();
  }
}

/**
 * Get pet by CUI
 * @param {string} cui - Pet's CUI
 * @returns {Promise<object|null>} - Pet data
 */
async function getPetByCUI(cui) {
  const connection = await pool.getConnection();
  
  try {
    const [pets] = await connection.query(
      'SELECT * FROM view_pets_complete WHERE cui = ?',
      [cui]
    );
    
    if (pets.length === 0) {
      return null;
    }
    
    return pets[0];
    
  } finally {
    connection.release();
  }
}

module.exports = {
  registerPet,
  getAllPets,
  searchPets,
  getPetByCUI
};
