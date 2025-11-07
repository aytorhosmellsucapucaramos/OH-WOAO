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
      temperament,
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
    
    // Get temperament ID (temperaments use 'code' instead of 'name')
    let temperamentId = null;
    if (temperament) {
      const [temperamentResult] = await connection.query(
        'SELECT id FROM temperaments WHERE code = ? LIMIT 1',
        [temperament]
      );
      temperamentId = temperamentResult.length > 0 ? temperamentResult[0].id : null;
    }
    
    // Insert basic pet data
    const [petResult] = await connection.query(
      `INSERT INTO pets (
        cui, pet_name, sex, 
        breed_id, birth_date, age, size_id,
        temperament_id, additional_features,
        adopter_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        cui, petName, sex,
        breedId, birthDate || null, age, sizeId,
        temperamentId, additionalFeatures || '',
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
    const photoFrontalPath = files?.photoFront?.[0]?.filename || null;
    const photoPosteriorPath = files?.photoSide?.[0]?.filename || null;
    const vaccinationCardPath = files?.vaccinationCard?.[0]?.filename || null;
    const rabiesVaccinePath = files?.rabiesVaccineCard?.[0]?.filename || null;
    
    // Insert documents (photos and QR)
    await connection.query(
      `INSERT INTO pet_documents (pet_id, photo_frontal_path, photo_posterior_path, qr_code_path, card_printed)
       VALUES (?, ?, ?, ?, ?)`,
      [petId, photoFrontalPath, photoPosteriorPath, qrCodeFilename, false]
    );
    
    // Convert boolean values (acepta 'yes', 'si', 'true', true)
    const hasVaccCard = hasVaccinationCard === 'yes' || hasVaccinationCard === 'si' || hasVaccinationCard === true || hasVaccinationCard === 'true';
    const hasRabiesVac = hasRabiesVaccine === 'yes' || hasRabiesVaccine === 'si' || hasRabiesVaccine === true || hasRabiesVaccine === 'true';
    
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

/**
 * Update pet information
 * @param {number} petId - Pet ID
 * @param {number} adopterId - Owner/adopter ID (for authorization)
 * @param {object} updates - Fields to update
 * @returns {Promise<void>}
 */
async function updatePet(petId, adopterId, updates) {
  const connection = await pool.getConnection();
  
  try {
    // Verify pet belongs to the user
    const [pets] = await connection.query(
      'SELECT id, adopter_id FROM pets WHERE id = ?',
      [petId]
    );
    
    if (pets.length === 0) {
      throw new Error('PET_NOT_FOUND');
    }
    
    if (pets[0].adopter_id !== adopterId) {
      throw new Error('UNAUTHORIZED');
    }
    
    await connection.beginTransaction();
    
    // Prepare pet table updates
    const petUpdates = {};
    const allowedPetFields = ['pet_name', 'sex', 'birth_date', 'age', 'additional_features'];
    
    for (const field of allowedPetFields) {
      if (updates[field] !== undefined) {
        petUpdates[field] = updates[field];
      }
    }
    
    // Handle catalog fields (breed, size, temperament)
    if (updates.breed) {
      const breedId = await getOrCreateCatalogId('breeds', 'name', updates.breed, connection);
      petUpdates.breed_id = breedId;
    }
    
    if (updates.size) {
      const [sizeResult] = await connection.query(
        'SELECT id FROM sizes WHERE code = ? LIMIT 1',
        [updates.size]
      );
      if (sizeResult.length > 0) {
        petUpdates.size_id = sizeResult[0].id;
      }
    }
    
    if (updates.temperament) {
      const [temperamentResult] = await connection.query(
        'SELECT id FROM temperaments WHERE code = ? LIMIT 1',
        [updates.temperament]
      );
      if (temperamentResult.length > 0) {
        petUpdates.temperament_id = temperamentResult[0].id;
      }
    }
    
    // Update pet table
    if (Object.keys(petUpdates).length > 0) {
      const setClause = Object.keys(petUpdates).map(key => `${key} = ?`).join(', ');
      const values = Object.values(petUpdates);
      
      await connection.query(
        `UPDATE pets SET ${setClause} WHERE id = ?`,
        [...values, petId]
      );
    }
    
    // Update color if provided
    if (updates.color) {
      const colorId = await getOrCreateCatalogId('colors', 'name', updates.color, connection);
      
      // Delete existing colors
      await connection.query('DELETE FROM pet_colors WHERE pet_id = ?', [petId]);
      
      // Insert new color
      await connection.query(
        'INSERT INTO pet_colors (pet_id, color_id, display_order) VALUES (?, ?, 0)',
        [petId, colorId]
      );
    }
    
    // Update health records
    // First, check if health record exists, if not create it
    const [existingHealthRecord] = await connection.query(
      'SELECT id FROM pet_health_records WHERE pet_id = ?',
      [petId]
    );
    
    if (existingHealthRecord.length === 0) {
      // Create health record if it doesn't exist
      await connection.query(
        'INSERT INTO pet_health_records (pet_id) VALUES (?)',
        [petId]
      );
    }
    
    const healthUpdates = {};
    if (updates.hasVaccinationCard !== undefined) {
      const hasVaccCard = updates.hasVaccinationCard === 'yes' || updates.hasVaccinationCard === 'si' || 
                          updates.hasVaccinationCard === true || updates.hasVaccinationCard === 'true';
      healthUpdates.has_vaccination_card = hasVaccCard;
    }
    
    if (updates.hasRabiesVaccine !== undefined) {
      const hasRabiesVac = updates.hasRabiesVaccine === 'yes' || updates.hasRabiesVaccine === 'si' || 
                           updates.hasRabiesVaccine === true || updates.hasRabiesVaccine === 'true';
      healthUpdates.has_rabies_vaccine = hasRabiesVac;
    }
    
    // Handle medical history from catalog
    if (updates.medicalHistory !== undefined) {
      const [medicalHistoryResult] = await connection.query(
        'SELECT id FROM medical_histories WHERE code = ? LIMIT 1',
        [updates.medicalHistory]
      );
      if (medicalHistoryResult.length > 0) {
        healthUpdates.medical_history_id = medicalHistoryResult[0].id;
      }
    }
    
    // Handle medical history details (for "other" option)
    if (updates.medicalHistoryDetails !== undefined) {
      healthUpdates.medical_history_details = updates.medicalHistoryDetails;
    }
    
    if (Object.keys(healthUpdates).length > 0) {
      const setClause = Object.keys(healthUpdates).map(key => `${key} = ?`).join(', ');
      const values = Object.values(healthUpdates);
      
      await connection.query(
        `UPDATE pet_health_records SET ${setClause} WHERE pet_id = ?`,
        [...values, petId]
      );
    }
    
    await connection.commit();
    logger.info('Pet updated successfully', { petId, adopterId });
    
  } catch (error) {
    await connection.rollback();
    logger.error('Pet update failed', { error: error.message, petId, adopterId });
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = {
  registerPet,
  getAllPets,
  searchPets,
  getPetByCUI,
  updatePet
};
