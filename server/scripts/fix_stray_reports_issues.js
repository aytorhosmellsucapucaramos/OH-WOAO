/**
 * Script para arreglar problemas con stray_reports:
 * 1. Agregar display_order a stray_report_colors
 * 2. Agregar condition 'injured' faltante
 * 3. Actualizar vista view_stray_reports_complete
 */

const { pool } = require('../config/database');
const logger = require('../config/logger');

async function fixStrayReportsIssues() {
  const connection = await pool.getConnection();
  
  try {
    logger.info('🔧 Arreglando problemas de stray_reports...');
    
    // 1. Agregar columna display_order a stray_report_colors si no existe
    try {
      await connection.query(`
        ALTER TABLE stray_report_colors 
        ADD COLUMN display_order INT DEFAULT 0
      `);
      logger.info('✅ Columna display_order agregada a stray_report_colors');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        logger.info('ℹ️  Columna display_order ya existe');
      } else {
        throw error;
      }
    }
    
    // 2. Verificar y agregar condition 'injured' si no existe
    const [existingConditions] = await connection.query(
      'SELECT code FROM report_conditions WHERE code IN ("injured", "stray", "lost", "abandoned")'
    );
    
    const existingCodes = existingConditions.map(c => c.code);
    
    const requiredConditions = [
      { code: 'stray', name: 'Callejero', description: 'Perro viviendo en la calle' },
      { code: 'lost', name: 'Perdido', description: 'Perro perdido buscando a su dueño' },
      { code: 'injured', name: 'Herido', description: 'Perro que necesita atención médica' },
      { code: 'abandoned', name: 'Abandonado', description: 'Perro abandonado por su dueño' }
    ];
    
    for (const condition of requiredConditions) {
      if (!existingCodes.includes(condition.code)) {
        await connection.query(
          'INSERT INTO report_conditions (code, name, description, active) VALUES (?, ?, ?, 1)',
          [condition.code, condition.name, condition.description]
        );
        logger.info(`✅ Condición '${condition.code}' agregada`);
      }
    }
    
    // 3. Eliminar vista existente
    await connection.query('DROP VIEW IF EXISTS view_stray_reports_complete');
    
    // 4. Crear vista actualizada (sin display_order por ahora, luego se puede agregar)
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
    
    logger.info('✅ Vista view_stray_reports_complete recreada');
    
    // 5. Verificar que funciona
    const [testResult] = await connection.query('SELECT COUNT(*) as count FROM view_stray_reports_complete');
    logger.info(`📊 Vista contiene ${testResult[0].count} reportes`);
    
    // 6. Mostrar condiciones disponibles
    const [conditions] = await connection.query('SELECT code, name FROM report_conditions WHERE active = 1');
    logger.info('📋 Condiciones disponibles:', conditions);
    
    logger.info('🎉 ¡Todos los problemas arreglados!');
    
  } catch (error) {
    logger.error('❌ Error arreglando problemas:', error.message);
    throw error;
  } finally {
    connection.release();
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  fixStrayReportsIssues()
    .then(() => {
      logger.info('✅ Script completado exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('❌ Script falló:', error.message);
      process.exit(1);
    });
}

module.exports = { fixStrayReportsIssues };
