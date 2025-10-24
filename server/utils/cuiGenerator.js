/**
 * CUI Generator Utility
 * Generates unique CUI codes for pets
 */

const { pool } = require('../config/database');

/**
 * Generate CUI with format: XXXXXXXX-Y
 * Where X is 8 random digits and Y is check digit
 */
function generateCUI() {
  const randomNumber = Math.floor(10000000 + Math.random() * 90000000);
  const checkDigit = randomNumber % 10;
  return `${randomNumber}-${checkDigit}`;
}

/**
 * Check if CUI already exists in database
 * @param {string} cui - CUI to check
 * @returns {Promise<boolean>}
 */
async function checkCUIExists(cui) {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query('SELECT cui FROM pets WHERE cui = ?', [cui]);
    return rows.length > 0;
  } finally {
    connection.release();
  }
}

/**
 * Generate unique CUI (checks database for uniqueness)
 * @returns {Promise<string>}
 */
async function generateUniqueCUI() {
  let cui;
  let exists = true;
  
  while (exists) {
    cui = generateCUI();
    exists = await checkCUIExists(cui);
  }
  
  return cui;
}

module.exports = {
  generateCUI,
  checkCUIExists,
  generateUniqueCUI
};
