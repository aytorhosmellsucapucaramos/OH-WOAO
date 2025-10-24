const mysql = require('mysql2/promise');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

// Create a connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'pets_db',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// Test database connection
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully to MySQL');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    return false;
  }
}

// Initialize database (create tables if they don't exist)
async function initializeDatabase() {
  try {
    const connection = await pool.getConnection();
    
    // Create database if it doesn't exist
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'pets_db'}`);
    await connection.query(`USE ${process.env.DB_NAME || 'pets_db'}`);
    
    // Read and execute the V3 init SQL file with support for stored routines
    const initSQL = fs.readFileSync(path.join(__dirname, '../database/init_database_v3.sql'), 'utf8');

    // Build statements safely: handle CREATE PROCEDURE/FUNCTION/TRIGGER blocks
    const lines = initSQL.split(/\r?\n/);
    const statements = [];
    let buffer = '';
    let inRoutine = false; // inside CREATE PROCEDURE/FUNCTION/TRIGGER block

    const routineStartRegex = /^\s*CREATE\s+(DEFINER\s*=\s*[^ ]+\s+)?(PROCEDURE|FUNCTION|TRIGGER)\b/i;
    const delimiterLineRegex = /^\s*DELIMITER\b/i;

    for (let rawLine of lines) {
      // Skip DELIMITER directives (client-only)
      if (delimiterLineRegex.test(rawLine)) {
        continue;
      }

      let line = rawLine;
      // Convert any END // or END// to END; so we can rely on semicolon
      if (/^\s*END\s*\/\/.*/i.test(line)) {
        line = line.replace(/END\s*\/.*/i, 'END;');
      }
      // Also convert trailing // to ;
      if (/\/\/\s*$/.test(line)) {
        line = line.replace(/\/\/\s*$/, ';');
      }

      if (!inRoutine && routineStartRegex.test(line)) {
        inRoutine = true;
      }

      buffer += line + '\n';

      // If we're in a routine, we finalize only when we see END; at statement end
      if (inRoutine) {
        if (/\bEND\s*;\s*$/.test(line)) {
          statements.push(buffer);
          buffer = '';
          inRoutine = false;
        }
        continue; // keep accumulating until END;
      }

      // For normal statements, split on semicolon boundaries
      if (/(;\s*)$/.test(line)) {
        statements.push(buffer);
        buffer = '';
      }
    }
    if (buffer.trim()) {
      statements.push(buffer);
    }

    for (const statement of statements) {
      const sql = statement.trim();
      if (!sql) continue;
      try {
        await connection.query(sql);
      } catch (err) {
        // Ignore errors for CREATE DATABASE and USE statements if database exists
        const msg = err && err.message ? err.message : String(err);
        if (!/database exists/i.test(msg) && !/USE/i.test(msg)) {
          console.error('Error executing statement:', msg);
        }
      }
    }
    
    console.log('✅ Database tables initialized successfully with V3 structure');
    
    // Migración: Agregar nuevas columnas si no existen (para bases de datos existentes)
    const addColumnIfMissing = async (table, column, definition) => {
      try {
        const [columns] = await connection.query(
          `SHOW COLUMNS FROM ${table} LIKE '${column}'`
        );
        if (columns.length === 0) {
          await connection.query(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
          console.log(`✅ Column ${column} added to ${table}`);
        }
      } catch (err) {
        console.error(`❌ Error adding column ${column}:`, err.message);
      }
    };
    
    // Agregar nuevas columnas para el formulario actualizado
    await addColumnIfMissing('pets', 'birth_date', "DATE COMMENT 'Fecha de nacimiento del can'");
    await addColumnIfMissing('pets', 'aggression_history', "ENUM('yes', 'no') DEFAULT 'no' COMMENT 'Antecedentes de agresividad'");
    await addColumnIfMissing('pets', 'aggression_details', "TEXT COMMENT 'Detalles de antecedentes de agresividad'");
    await addColumnIfMissing('pets', 'receipt_number', "VARCHAR(100) COMMENT 'Número de recibo de caja'");
    await addColumnIfMissing('pets', 'receipt_issue_date', "DATE COMMENT 'Fecha de emisión del recibo'");
    await addColumnIfMissing('pets', 'receipt_payer', "VARCHAR(255) COMMENT 'Nombre o razón social del pagador'");
    await addColumnIfMissing('pets', 'receipt_amount', "DECIMAL(10, 2) COMMENT 'Monto del pago'");
    
    // Migración para normalizar colores con tabla pivote
    console.log('🔄 Iniciando migración de normalización de colores...');
    
    // Verificar si existe la columna color_id en pets
    const [petColorColumn] = await connection.query("SHOW COLUMNS FROM pets LIKE 'color_id'");
    
    if (petColorColumn.length > 0) {
      console.log('📦 Migrando datos de color_id a pet_colors...');
      
      // Migrar datos existentes de pets a pet_colors
      await connection.query(`
        INSERT IGNORE INTO pet_colors (pet_id, color_id, display_order)
        SELECT id, color_id, 0
        FROM pets
        WHERE color_id IS NOT NULL
      `);
      
      // IMPORTANTE: Primero eliminar la foreign key constraint, luego la columna
      try {
        // Eliminar todas las posibles foreign keys relacionadas con color_id
        const possibleFKNames = ['pets_ibfk_3', 'fk_pets_color', 'pets_color_fk'];
        
        for (const fkName of possibleFKNames) {
          try {
            await connection.query(`ALTER TABLE pets DROP FOREIGN KEY ${fkName}`);
            console.log(`✅ Foreign key ${fkName} eliminada`);
          } catch (e) {
            // Ignorar si la FK no existe
          }
        }
        
        // También eliminar el índice si existe
        try {
          await connection.query('ALTER TABLE pets DROP INDEX color_id');
        } catch (e) {
          // Ignorar si el índice no existe
        }
        
        // Ahora sí eliminar la columna
        await connection.query('ALTER TABLE pets DROP COLUMN color_id');
        console.log('✅ Columna color_id eliminada de pets, datos migrados a pet_colors');
      } catch (err) {
        console.error('⚠️  Error al eliminar color_id:', err.message);
        // No es crítico, continuar
      }
    }
    
    // Verificar si existe la columna colors en stray_reports
    const [reportColorsColumn] = await connection.query("SHOW COLUMNS FROM stray_reports LIKE 'colors'");
    
    if (reportColorsColumn.length > 0) {
      console.log('📦 Migrando datos de colors (JSON) a stray_report_colors...');
      
      // Eliminar la columna colors de stray_reports
      // NOTA: Los datos JSON no se pueden migrar automáticamente de forma segura
      // Se perderán los colores antiguos, pero el sistema seguirá funcionando
      await connection.query('ALTER TABLE stray_reports DROP COLUMN colors');
      console.log('✅ Columna colors eliminada de stray_reports');
      console.log('⚠️  ADVERTENCIA: Reportes antiguos perderán información de colores');
    }
    
    console.log('✅ Migración de normalización completada');
    
    // =====================================================
    // MIGRACIÓN FASE 1 - REFACTORIZACIÓN DE PETS
    // =====================================================
    console.log('🔄 Iniciando migración FASE 1: Refactorización de tabla pets...');
    
    // Verificar si existen columnas antiguas en pets que deben migrarse
    const [petsColumns] = await connection.query('SHOW COLUMNS FROM pets');
    const columnNames = petsColumns.map(col => col.Field);
    
    const hasOldHealthColumns = columnNames.includes('has_vaccination_card') || 
                                columnNames.includes('aggression_history');
    const hasOldDocumentColumns = columnNames.includes('photo_frontal_path') || 
                                   columnNames.includes('qr_code_path');
    const hasOldPaymentColumns = columnNames.includes('receipt_number');
    
    if (hasOldHealthColumns) {
      console.log('📦 Migrando datos de salud a pet_health_records...');
      
      // Construir SELECT dinámicamente solo con columnas existentes
      const healthFieldsMap = {
        'has_vaccination_card': 'COALESCE(has_vaccination_card, FALSE)',
        'vaccination_card_path': 'vaccination_card_path',
        'has_rabies_vaccine': 'COALESCE(has_rabies_vaccine, FALSE)',
        'rabies_vaccine_path': 'rabies_vaccine_path',
        'medical_history': 'medical_history',
        'aggression_history': "COALESCE(aggression_history, 'no')",
        'aggression_details': 'aggression_details'
      };
      
      const existingFields = [];
      const selectFields = ['id'];
      
      for (const [col, expr] of Object.entries(healthFieldsMap)) {
        if (columnNames.includes(col)) {
          existingFields.push(col);
          selectFields.push(expr);
        } else {
          // Agregar valor por defecto si la columna no existe
          if (col.includes('has_')) {
            selectFields.push('FALSE');
          } else if (col === 'aggression_history') {
            selectFields.push("'no'");
          } else {
            selectFields.push('NULL');
          }
        }
      }
      
      // Solo migrar si hay al menos una columna de salud
      if (existingFields.length > 0) {
        await connection.query(`
          INSERT INTO pet_health_records (
            pet_id, has_vaccination_card, vaccination_card_path,
            has_rabies_vaccine, rabies_vaccine_path, medical_history,
            aggression_history, aggression_details
          )
          SELECT ${selectFields.join(', ')}
          FROM pets
          ON DUPLICATE KEY UPDATE pet_id=pet_id
        `);
      }
      
      // Eliminar columnas de salud
      const healthColumns = ['has_vaccination_card', 'vaccination_card_path', 
                            'has_rabies_vaccine', 'rabies_vaccine_path', 
                            'medical_history', 'aggression_history', 'aggression_details'];
      for (const col of healthColumns) {
        if (columnNames.includes(col)) {
          try {
            await connection.query(`ALTER TABLE pets DROP COLUMN ${col}`);
          } catch (err) {
            console.error(`⚠️  Error al eliminar columna ${col}:`, err.message);
          }
        }
      }
      console.log('✅ Datos de salud migrados y columnas eliminadas');
    }
    
    if (hasOldDocumentColumns) {
      console.log('📦 Migrando datos de documentos a pet_documents...');
      
      // Construir SELECT dinámicamente solo con columnas existentes
      const docFieldsMap = {
        'photo_frontal_path': 'photo_frontal_path',
        'photo_posterior_path': 'photo_posterior_path',
        'qr_code_path': 'qr_code_path',
        'card_printed': 'COALESCE(card_printed, FALSE)'
      };
      
      const existingDocFields = [];
      const selectDocFields = ['id'];
      
      for (const [col, expr] of Object.entries(docFieldsMap)) {
        if (columnNames.includes(col)) {
          existingDocFields.push(col);
          selectDocFields.push(expr);
        } else {
          // Agregar valor por defecto
          if (col === 'card_printed') {
            selectDocFields.push('FALSE');
          } else {
            selectDocFields.push('NULL');
          }
        }
      }
      
      // Solo migrar si hay al menos una columna de documentos
      if (existingDocFields.length > 0) {
        await connection.query(`
          INSERT INTO pet_documents (
            pet_id, photo_frontal_path, photo_posterior_path,
            qr_code_path, card_printed
          )
          SELECT ${selectDocFields.join(', ')}
          FROM pets
          ON DUPLICATE KEY UPDATE pet_id=pet_id
        `);
      }
      
      // Eliminar columnas de documentos
      const docColumns = ['photo_frontal_path', 'photo_posterior_path', 
                         'qr_code_path', 'card_printed'];
      for (const col of docColumns) {
        if (columnNames.includes(col)) {
          try {
            await connection.query(`ALTER TABLE pets DROP COLUMN ${col}`);
          } catch (err) {
            console.error(`⚠️  Error al eliminar columna ${col}:`, err.message);
          }
        }
      }
      console.log('✅ Datos de documentos migrados y columnas eliminadas');
    }
    
    if (hasOldPaymentColumns) {
      console.log('📦 Migrando datos de pagos a pet_payments...');
      
      // Construir SELECT dinámicamente solo con columnas existentes
      const paymentFieldsMap = {
        'receipt_number': 'receipt_number',
        'receipt_issue_date': 'receipt_issue_date',
        'receipt_payer': 'receipt_payer',
        'receipt_amount': 'receipt_amount'
      };
      
      const existingPaymentFields = [];
      const selectPaymentFields = ['id'];
      
      for (const [col, expr] of Object.entries(paymentFieldsMap)) {
        if (columnNames.includes(col)) {
          existingPaymentFields.push(col);
          selectPaymentFields.push(expr);
        } else {
          selectPaymentFields.push('NULL');
        }
      }
      
      // Solo migrar si hay al menos una columna de pagos Y tiene receipt_number
      if (existingPaymentFields.length > 0 && columnNames.includes('receipt_number')) {
        await connection.query(`
          INSERT INTO pet_payments (
            pet_id, receipt_number, receipt_issue_date,
            receipt_payer, receipt_amount
          )
          SELECT ${selectPaymentFields.join(', ')}
          FROM pets
          WHERE receipt_number IS NOT NULL
        `);
      }
      
      // Eliminar columnas de pagos
      const paymentColumns = ['receipt_number', 'receipt_issue_date', 
                             'receipt_payer', 'receipt_amount'];
      for (const col of paymentColumns) {
        if (columnNames.includes(col)) {
          try {
            await connection.query(`ALTER TABLE pets DROP COLUMN ${col}`);
          } catch (err) {
            console.error(`⚠️  Error al eliminar columna ${col}:`, err.message);
          }
        }
      }
      console.log('✅ Datos de pagos migrados y columnas eliminadas');
    }
    
    if (hasOldHealthColumns || hasOldDocumentColumns || hasOldPaymentColumns) {
      console.log('🎉 ¡Migración FASE 1 completada exitosamente!');
      console.log('📊 Tabla pets ahora es más limpia y modular');
    } else {
      console.log('✅ No se requiere migración (estructura ya actualizada)');
    }
    
    // =====================================================
    // ACTUALIZAR VISTA view_pets_complete
    // =====================================================
    console.log('🔄 Actualizando vista view_pets_complete...');
    
    try {
      // Eliminar vista existente
      await connection.query('DROP VIEW IF EXISTS view_pets_complete');
      
      // Crear vista actualizada con tablas especializadas
      await connection.query(`
        CREATE VIEW view_pets_complete AS
        SELECT 
            p.id, p.cui, p.pet_name, p.sex, p.breed_id, p.birth_date, p.age, 
            p.size_id, p.additional_features, p.adopter_id, p.created_at, p.updated_at,
            b.name as breed_name, s.name as size_name, s.code as size_code,
            GROUP_CONCAT(DISTINCT c.name ORDER BY pc.display_order SEPARATOR ', ') as color_name,
            GROUP_CONCAT(DISTINCT c.hex_code ORDER BY pc.display_order SEPARATOR ',') as color_hex,
            a.first_name as owner_first_name, a.last_name as owner_last_name,
            a.dni as owner_dni, a.email as owner_email, a.phone as owner_phone,
            a.address as owner_address, a.photo_path as owner_photo_path,
            h.has_vaccination_card, h.vaccination_card_path, h.has_rabies_vaccine,
            h.rabies_vaccine_path, h.medical_history, h.aggression_history,
            h.aggression_details, h.last_checkup_date,
            d.photo_frontal_path, d.photo_posterior_path, d.qr_code_path,
            d.card_printed, d.print_date, d.print_count,
            CASE WHEN MAX(pay.id) IS NOT NULL THEN 1 ELSE 0 END as has_payments
        FROM pets p
        LEFT JOIN breeds b ON p.breed_id = b.id
        LEFT JOIN sizes s ON p.size_id = s.id
        LEFT JOIN adopters a ON p.adopter_id = a.id
        LEFT JOIN pet_health_records h ON p.id = h.pet_id
        LEFT JOIN pet_documents d ON p.id = d.pet_id
        LEFT JOIN pet_colors pc ON p.id = pc.pet_id
        LEFT JOIN colors c ON pc.color_id = c.id
        LEFT JOIN pet_payments pay ON p.id = pay.pet_id
        GROUP BY p.id
      `);
      
      console.log('✅ Vista actualizada con tablas especializadas');
    } catch (viewError) {
      console.error('⚠️  Error al actualizar vista:', viewError.message);
      // No es crítico, continuar
    }
    
    connection.release();
  } catch (error) {
    console.error('❌ Database initialization error:', error.message);
    throw error;
  }
}

module.exports = {
  pool,
  testConnection,
  initializeDatabase
};
