/**
 * Script para probar y arreglar contraseñas
 * Ejecutar con: node scripts/test_passwords.js
 */

const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');
const logger = require('../config/logger');

async function testPasswords() {
  try {
    logger.info('🔍 Verificando contraseñas en la base de datos...\n');
    
    // Obtener todos los usuarios
    const [users] = await pool.query('SELECT id, email, password FROM adopters');
    
    logger.info(`📋 Encontrados ${users.length} usuarios:\n`);
    
    for (const user of users) {
      logger.info(`👤 Usuario: ${user.email}`);
      logger.info(`   ID: ${user.id}`);
      logger.info(`   Password hash: ${user.password?.substring(0, 20)}...`);
      logger.info(`   Length: ${user.password?.length}`);
      logger.info(`   Prefix: ${user.password?.substring(0, 7)}`);
      
      // Verificar si el hash es válido (debe empezar con $2a$10$ o $2b$10$)
      const isValidHash = user.password?.match(/^\$2[ab]\$\d{2}\$/);
      logger.info(`   ✅ Hash válido: ${isValidHash ? 'SÍ' : 'NO'}`);
      
      if (!isValidHash) {
        logger.warn(`   ⚠️  ADVERTENCIA: El hash no parece válido!`);
      }
      
      logger.info('');
    }
    
    // Preguntar si quiere re-hashear contraseñas
    logger.info('\n═══════════════════════════════════════════════════');
    logger.info('Si algún usuario tiene problemas para iniciar sesión:');
    logger.info('1. Pídele que se registre nuevamente con la misma contraseña');
    logger.info('2. O ejecuta: node scripts/reset_user_password.js <email>');
    logger.info('═══════════════════════════════════════════════════\n');
    
  } catch (error) {
    logger.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

testPasswords();
