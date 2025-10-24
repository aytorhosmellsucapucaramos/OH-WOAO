/**
 * QR Code Service
 * Handles QR code generation for pet cards
 */

const QRCode = require('qrcode');
const path = require('path');
const logger = require('../config/logger');

/**
 * Generate QR code for a pet
 * @param {string} cui - Pet's CUI
 * @param {string} uploadsDir - Directory to save QR code
 * @returns {Promise<string>} - QR code filename
 */
async function generateQRCode(cui, uploadsDir) {
  try {
    const qrData = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/pet/${cui}`;
    const qrCodeFilename = `qr_${cui.replace('-', '_')}.png`;
    const qrCodePath = path.join(uploadsDir, qrCodeFilename);
    
    await QRCode.toFile(qrCodePath, qrData);
    
    logger.info(`QR code generated for CUI: ${cui}`, { filename: qrCodeFilename });
    
    return qrCodeFilename;
  } catch (error) {
    logger.error(`Error generating QR code for CUI: ${cui}`, error);
    throw new Error('Failed to generate QR code');
  }
}

module.exports = {
  generateQRCode
};
