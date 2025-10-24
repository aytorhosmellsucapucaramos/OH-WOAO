/**
 * Script para actualizar la vista view_stray_reports_complete
 * Incluye colores de la tabla pivote stray_report_colors
 */

const { pool } = require('../config/database');
const logger = require('../config/logger');

async function updateStrayReportsView() {
  const connection = await pool.getConnection();
  
  try {
    logger.info('🔄 Actualizando vista view_stray_reports_complete...');
    
    // Eliminar vista existente
    await connection.query('DROP VIEW IF EXISTS view_stray_reports_complete');
    
    // Crear vista actualizada con colores
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
          GROUP_CONCAT(c.name ORDER BY src.display_order SEPARATOR ', ') as colors
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
    
    logger.info('✅ Vista view_stray_reports_complete actualizada correctamente');
    
    // Verificar que funciona
    const [testResult] = await connection.query('SELECT COUNT(*) as count FROM view_stray_reports_complete');
    logger.info(`📊 Vista contiene ${testResult[0].count} reportes`);
    
  } catch (error) {
    logger.error('❌ Error actualizando vista:', error.message);
    throw error;
  } finally {
    connection.release();
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  updateStrayReportsView()
    .then(() => {
      logger.info('✅ Script completado');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('❌ Script falló:', error.message);
      process.exit(1);
    });
}

module.exports = { updateStrayReportsView };
