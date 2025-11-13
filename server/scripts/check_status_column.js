/**
 * Script para verificar la estructura de la columna 'status' en stray_reports
 * y determinar su límite de caracteres
 */

const mysql = require('mysql2/promise');

async function checkStatusColumn() {
  let connection;
  
  try {
    // Crear conexión a la base de datos
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'webcanina'
    });

    console.log('🔍 [CHECK] Verificando estructura de la tabla stray_reports...\n');

    // Obtener información de la columna status
    const [columns] = await connection.query(`
      DESCRIBE stray_reports
    `);

    console.log('📋 [INFO] Estructura completa de la tabla stray_reports:');
    console.table(columns);

    // Buscar específicamente la columna status
    const statusColumn = columns.find(col => col.Field === 'status');
    
    if (statusColumn) {
      console.log('\n🎯 [FOUND] Información de la columna "status":');
      console.log(`   - Tipo: ${statusColumn.Type}`);
      console.log(`   - Null: ${statusColumn.Null}`);
      console.log(`   - Key: ${statusColumn.Key}`);
      console.log(`   - Default: ${statusColumn.Default}`);
      console.log(`   - Extra: ${statusColumn.Extra}`);
      
      // Extraer el límite de caracteres del tipo
      const typeMatch = statusColumn.Type.match(/varchar\((\d+)\)/i);
      if (typeMatch) {
        const maxLength = parseInt(typeMatch[1]);
        console.log(`\n🚨 [LIMIT] La columna 'status' permite máximo ${maxLength} caracteres`);
        
        // Sugerir estados compatibles
        console.log('\n💡 [SUGGESTION] Estados recomendados:');
        if (maxLength >= 4) {
          console.log('   - new (3 chars) ✅');
          console.log('   - done (4 chars) ✅');
          if (maxLength >= 5) {
            console.log('   - asign (5 chars) ✅');
            console.log('   - activ (5 chars) ✅');
          } else {
            console.log('   - asgn (4 chars) ✅');
            console.log('   - prog (4 chars) ✅');
          }
        } else {
          console.log('   ⚠️  Columna muy pequeña, considerar ampliarla');
        }
      }
    } else {
      console.log('❌ [ERROR] No se encontró la columna "status"');
    }

    // Verificar estados actuales en la tabla
    console.log('\n📊 [CURRENT] Estados actuales en la base de datos:');
    const [currentStatuses] = await connection.query(`
      SELECT status, COUNT(*) as count, LENGTH(status) as length
      FROM stray_reports 
      GROUP BY status 
      ORDER BY count DESC
    `);

    console.table(currentStatuses);

    // Verificar si hay estados que exceden el límite
    if (statusColumn && statusColumn.Type.includes('varchar')) {
      const typeMatch = statusColumn.Type.match(/varchar\((\d+)\)/i);
      if (typeMatch) {
        const maxLength = parseInt(typeMatch[1]);
        const problematicStatuses = currentStatuses.filter(s => s.length > maxLength);
        
        if (problematicStatuses.length > 0) {
          console.log('\n🚨 [PROBLEM] Estados que exceden el límite:');
          console.table(problematicStatuses);
        } else {
          console.log('\n✅ [OK] Todos los estados actuales caben en la columna');
        }
      }
    }

  } catch (error) {
    console.error('❌ [ERROR] Error al verificar la estructura:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Ejecutar el script
checkStatusColumn();
