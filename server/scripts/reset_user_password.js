/**
 * Script para resetear la contraseña de un usuario
 * Uso: node scripts/reset_user_password.js <email> <nueva_contraseña>
 * Ejemplo: node scripts/reset_user_password.js juan@gmail.com 12345678
 */

const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');
const logger = require('../config/logger');

async function resetPassword() {
  const email = process.argv[2];
  const newPassword = process.argv[3];
  
  if (!email || !newPassword) {
    console.log('❌ Uso incorrecto');
    console.log('Uso: node scripts/reset_user_password.js <email> <nueva_contraseña>');
    console.log('Ejemplo: node scripts/reset_user_password.js juan@gmail.com 12345678');
    process.exit(1);
  }
  
  try {
    logger.info('🔍 Buscando usuario...', { email });
    
    // Buscar usuario
    const [users] = await pool.query('SELECT * FROM adopters WHERE email = ?', [email]);
    
    if (users.length === 0) {
      logger.error('❌ Usuario no encontrado:', email);
      process.exit(1);
    }
    
    const user = users[0];
    logger.info('👤 Usuario encontrado:', { 
      id: user.id, 
      email: user.email,
      nombre: `${user.first_name} ${user.last_name}`
    });
    
    // Hashear nueva contraseña
    logger.info('🔒 Hasheando nueva contraseña...');
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    logger.info('✅ Contraseña hasheada:', { 
      length: hashedPassword.length,
      prefix: hashedPassword.substring(0, 7)
    });
    
    // Actualizar en BD
    await pool.query('UPDATE adopters SET password = ? WHERE id = ?', [hashedPassword, user.id]);
    
    logger.info('✅ Contraseña actualizada exitosamente');
    logger.info('');
    logger.info('═══════════════════════════════════════════════════');
    logger.info(`📧 Email: ${email}`);
    logger.info(`🔑 Nueva contraseña: ${newPassword}`);
    logger.info('═══════════════════════════════════════════════════');
    logger.info('');
    logger.info('Ahora puedes iniciar sesión con la nueva contraseña.');
    
    // Probar la contraseña
    logger.info('\n🧪 Probando la contraseña...');
    const isValid = await bcrypt.compare(newPassword, hashedPassword);
    logger.info(`✅ Prueba: ${isValid ? 'ÉXITO' : 'FALLO'}`);
    
  } catch (error) {
    logger.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

resetPassword();
