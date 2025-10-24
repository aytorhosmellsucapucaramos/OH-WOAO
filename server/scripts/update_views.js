/**
 * SCRIPT PARA ACTUALIZAR VISTAS DE BASE DE DATOS
 * Ejecutar después de cambios en la estructura de tablas
 */

const { pool } = require('./config/database');

async function updateViews() {
  const connection = await pool.getConnection();
  
  try {
    console.log('🔄 Actualizando vistas de base de datos...\n');
    
    // Eliminar vista existente
    await connection.query('DROP VIEW IF EXISTS view_pets_complete');
    console.log('✅ Vista anterior eliminada');
    
    // Crear vista actualizada
    await connection.query(`
      CREATE VIEW view_pets_complete AS
      SELECT 
          -- Datos básicos de la mascota
          p.id,
          p.cui,
          p.pet_name,
          p.sex,
          p.breed_id,
          p.birth_date,
          p.age,
          p.size_id,
          p.additional_features,
          p.adopter_id,
          p.created_at,
          p.updated_at,
          
          -- Catálogos
          b.name as breed_name,
          s.name as size_name,
          s.code as size_code,
          
          -- Colores (concatenados de la tabla pivote)
          GROUP_CONCAT(DISTINCT c.name ORDER BY pc.display_order SEPARATOR ', ') as color_name,
          GROUP_CONCAT(DISTINCT c.hex_code ORDER BY pc.display_order SEPARATOR ',') as color_hex,
          
          -- Datos del propietario
          a.first_name as owner_first_name,
          a.last_name as owner_last_name,
          a.dni as owner_dni,
          a.email as owner_email,
          a.phone as owner_phone,
          a.address as owner_address,
          a.photo_path as owner_photo_path,
          
          -- Datos de salud
          h.has_vaccination_card,
          h.vaccination_card_path,
          h.has_rabies_vaccine,
          h.rabies_vaccine_path,
          h.medical_history,
          h.aggression_history,
          h.aggression_details,
          h.last_checkup_date,
          
          -- Datos de documentos
          d.photo_frontal_path,
          d.photo_posterior_path,
          d.qr_code_path,
          d.card_printed,
          d.print_date,
          d.print_count,
          
          -- Verificar si tiene pagos registrados
          CASE WHEN pay.id IS NOT NULL THEN 1 ELSE 0 END as has_payments
          
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
    
    console.log('✅ Vista view_pets_complete creada con tablas especializadas\n');
    
    // Verificar que funciona
    const [test] = await connection.query('SELECT COUNT(*) as total FROM view_pets_complete');
    console.log(`📊 Total de mascotas en la vista: ${test[0].total}\n`);
    
    console.log('🎉 ¡Vistas actualizadas exitosamente!\n');
    
  } catch (error) {
    console.error('❌ Error al actualizar vistas:', error.message);
  } finally {
    connection.release();
    process.exit(0);
  }
}

updateViews();
