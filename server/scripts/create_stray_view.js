/**
 * Script de emergencia para crear la vista view_stray_reports_complete
 * Ejecutar con: node scripts/create_stray_view.js
 */

const { pool } = require('../config/database');
const logger = require('../config/logger');

async function createStrayReportsView() {
  const connection = await pool.getConnection();
  
  try {
    logger.info('🔄 Creando vista view_stray_reports_complete...');
    
    // Eliminar vista si existe
    await connection.query('DROP VIEW IF EXISTS view_stray_reports_complete');
    logger.info('✅ Vista anterior eliminada (si existía)');
    
    // Crear vista completa
    await connection.query(`
      CREATE VIEW view_stray_reports_complete AS
      SELECT 
          sr.*,
          b.name as breed_name,
          s.name as size_name,
          s.code as size_code,
          t.name as temperament_name,
          t.code as temperament_code,
          t.color as temperament_color,
          rc.name as condition_name,
          rc.code as condition_code,
          ul.name as urgency_name,
          ul.code as urgency_code,
          ul.color as urgency_color,
          ul.priority as urgency_priority,
          GROUP_CONCAT(c.name SEPARATOR ', ') as colors
      FROM stray_reports sr
      LEFT JOIN breeds b ON sr.breed_id = b.id
      LEFT JOIN sizes s ON sr.size_id = s.id
      LEFT JOIN temperaments t ON sr.temperament_id = t.id
      LEFT JOIN report_conditions rc ON sr.condition_id = rc.id
      LEFT JOIN urgency_levels ul ON sr.urgency_level_id = ul.id
      LEFT JOIN stray_report_colors src ON sr.id = src.stray_report_id
      LEFT JOIN colors c ON src.color_id = c.id
      GROUP BY sr.id
    `);
    
    logger.info('✅ Vista view_stray_reports_complete creada correctamente');
    
    // Verificar que funciona
    const [testResult] = await connection.query('SELECT COUNT(*) as count FROM view_stray_reports_complete');
    logger.info(`📊 Vista contiene ${testResult[0].count} reportes`);
    
    // Mostrar algunos reportes de ejemplo
    const [sampleReports] = await connection.query('SELECT id, breed_name, reporter_name, address FROM view_stray_reports_complete LIMIT 5');
    logger.info(`📋 Primeros reportes:`, sampleReports);
    
  } catch (error) {
    logger.error('❌ Error al crear la vista:', error.message);
    throw error;
  } finally {
    connection.release();
  }
}

createStrayReportsView()
  .then(() => {
    logger.info('✅ Script completado exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    logger.error('❌ Script falló:', error);
    process.exit(1);
  });
