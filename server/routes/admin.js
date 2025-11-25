const express = require('express');
const router = express.Router();

// Temporary admin routes - simplified for now
// You can add authentication middleware later

// GET /api/admin/pets - Get all pets
router.get('/pets', async (req, res) => {
  console.log('🔧 ENDPOINT /api/admin/pets LLAMADO');
  
  const { pool } = require('../config/database');
  
  try {
    // Usar la vista view_pets_complete para obtener todos los datos
    const [pets] = await pool.query(`
      SELECT * FROM view_pets_complete
      ORDER BY created_at DESC
    `);

    // LOG TEMPORAL para diagnóstico
    console.log('🔧 Datos del endpoint /api/admin/pets:');
    console.log('Total mascotas:', pets.length);
    if (pets.length > 0) {
      console.log('Primera mascota ADMIN:', {
        cui: pets[0].cui,
        pet_name: pets[0].pet_name,
        breed_name: pets[0].breed_name,
        color_name: pets[0].color_name,
        size_name: pets[0].size_name,
        breed_id: pets[0].breed_id,
        color_id: pets[0].color_id,
        size_id: pets[0].size_id
      });
      console.log('🔧 Objeto completo:', pets[0]);
    }

    res.json({
      success: true,
      data: pets,
      total: pets.length
    });
  } catch (error) {
    console.error('🔧 ERROR en /api/admin/pets:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener mascotas',
      error: error.message
    });
  }
});

// GET /api/admin/users - Get all users (adopters)
router.get('/users', async (req, res) => {
  console.log('🔧 ENDPOINT /api/admin/users LLAMADO');
  
  const { pool } = require('../config/database');
  
  try {
    const [users] = await pool.query(`
      SELECT 
        a.id, a.dni, a.first_name, a.last_name, a.email, a.phone, 
        a.address, a.photo_path, a.created_at,
        a.role_id, a.assigned_zone, a.employee_code, a.is_active,
        r.code as role_code, r.name as role_name
      FROM adopters a
      LEFT JOIN roles r ON a.role_id = r.id
      ORDER BY a.created_at DESC
    `);

    res.json({
      success: true,
      data: users,
      total: users.length
    });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuarios',
      error: error.message
    });
  }
});

// GET /api/admin/stray-reports - Get all stray reports
router.get('/stray-reports', async (req, res) => {
  console.log('🔧 ENDPOINT /api/admin/stray-reports LLAMADO');
  
  const { pool } = require('../config/database');
  
  try {
    // SISTEMA NORMALIZADO: Obtener reportes con estados normalizados
    const [reports] = await pool.query(`
      SELECT 
        sr.*,
        st.code as status,
        st.name as status_name,
        st.color as status_color,
        st.requires_notes as status_requires_notes,
        reporter.first_name as reporter_first_name,
        reporter.last_name as reporter_last_name,
        reporter.phone as reporter_phone,
        reporter.email as reporter_email,
        assigned_user.first_name as assigned_first_name,
        assigned_user.last_name as assigned_last_name,
        assigned_user.employee_code as assigned_employee_code,
        assigned_user.email as assigned_email,
        breeds.name as breed,
        sizes.name as size_name,
        temperaments.name as temperament_name
      FROM stray_reports sr
      JOIN stray_report_status_types st ON sr.status_type_id = st.id
      LEFT JOIN adopters reporter ON sr.reporter_id = reporter.id
      LEFT JOIN adopters assigned_user ON sr.assigned_to = assigned_user.id
      LEFT JOIN breeds breeds ON sr.breed_id = breeds.id
      LEFT JOIN sizes sizes ON sr.size_id = sizes.id
      LEFT JOIN temperaments temperaments ON sr.temperament_id = temperaments.id
      ORDER BY st.display_order ASC, sr.created_at DESC
    `);

    console.log(`✅ ${reports.length} reportes obtenidos`);

    res.json({
      success: true,
      data: reports,
      total: reports.length
    });
  } catch (error) {
    console.error('❌ Error al obtener reportes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener reportes',
      error: error.message
    });
  }
});

// GET /api/admin/stats - Get dashboard statistics  
router.get('/stats', async (req, res) => {
  console.log('🔧 ENDPOINT /api/admin/stats LLAMADO');
  
  const { pool } = require('../config/database');
  
  try {
    // Obtener estadísticas básicas
    const [petsStats] = await pool.query('SELECT COUNT(*) as total_pets FROM pets');
    const [usersStats] = await pool.query('SELECT COUNT(*) as total_users FROM adopters');
    const [activeReportsStats] = await pool.query(`
      SELECT COUNT(*) as active_reports FROM stray_reports 
      WHERE status IN ('pending', 'in_progress')
    `);
    const [cardsPrintedStats] = await pool.query(`
      SELECT COUNT(*) as cards_printed FROM pet_documents WHERE card_printed = 1
    `);
    const [cardsPendingStats] = await pool.query(`
      SELECT COUNT(*) as cards_pending FROM pet_documents WHERE card_printed = 0
    `);
    const [vaccinatedStats] = await pool.query(`
      SELECT COUNT(*) as vaccinated FROM pet_health_records WHERE has_rabies_vaccine = 1
    `);
    
    // Registros este mes
    const [newPetsThisMonth] = await pool.query(`
      SELECT COUNT(*) as count FROM pets 
      WHERE MONTH(created_at) = MONTH(CURRENT_DATE()) 
      AND YEAR(created_at) = YEAR(CURRENT_DATE())
    `);
    
    const [newUsersThisMonth] = await pool.query(`
      SELECT COUNT(*) as count FROM adopters 
      WHERE MONTH(created_at) = MONTH(CURRENT_DATE()) 
      AND YEAR(created_at) = YEAR(CURRENT_DATE())
    `);
    
    const stats = {
      totalPets: petsStats[0].total_pets,
      totalUsers: usersStats[0].total_users,
      activeReports: activeReportsStats[0].active_reports,
      cardsPrinted: cardsPrintedStats[0].cards_printed,
      cardsPending: cardsPendingStats[0].cards_pending,
      vaccinatedPets: vaccinatedStats[0].vaccinated,
      newPetsThisMonth: newPetsThisMonth[0].count,
      newUsersThisMonth: newUsersThisMonth[0].count,
      lastUpdate: new Date().toISOString()
    };

    res.json({
      success: true,
      stats: stats
    });
  } catch (error) {
    console.error('🔧 ERROR en /api/admin/stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas',
      error: error.message
    });
  }
});

// GET /api/admin/analytics - Get analytics data
router.get('/analytics', async (req, res) => {
  console.log('🔧 ENDPOINT /api/admin/analytics LLAMADO');
  
  const { pool } = require('../config/database');
  
  try {
    // Monthly registrations (últimos 6 meses)
    const [monthlyRegistrations] = await pool.query(`
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month,
        COUNT(*) as count
      FROM pets
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY month DESC
      LIMIT 6
    `);

    // Breed distribution (top 10)
    const [breedDistribution] = await pool.query(`
      SELECT 
        b.name as breed,
        COUNT(*) as count
      FROM pets p
      LEFT JOIN breeds b ON p.breed_id = b.id
      WHERE b.name IS NOT NULL
      GROUP BY b.name
      ORDER BY count DESC
      LIMIT 10
    `);

    // Color distribution (top 10)
    const [colorDistribution] = await pool.query(`
      SELECT 
        c.name as color,
        COUNT(DISTINCT p.id) as count
      FROM pets p
      LEFT JOIN pet_colors pc ON p.id = pc.pet_id
      LEFT JOIN colors c ON pc.color_id = c.id
      WHERE c.name IS NOT NULL
      GROUP BY c.name
      ORDER BY count DESC
      LIMIT 10
    `);

    // Age distribution
    const [ageDistribution] = await pool.query(`
      SELECT 
        CASE 
          WHEN age < 12 THEN 'Cachorro (< 1 año)'
          WHEN age >= 12 AND age < 84 THEN 'Adulto (1-7 años)'
          ELSE 'Senior (7+ años)'
        END as age_group,
        COUNT(*) as count
      FROM pets
      GROUP BY age_group
      ORDER BY 
        CASE age_group
          WHEN 'Cachorro (< 1 año)' THEN 1
          WHEN 'Adulto (1-7 años)' THEN 2
          ELSE 3
        END
    `);

    // Report status distribution
    const [reportStatusDistribution] = await pool.query(`
      SELECT 
        status,
        COUNT(*) as count
      FROM stray_reports
      GROUP BY status
    `);

    res.json({
      success: true,
      analytics: {
        monthlyRegistrations: monthlyRegistrations.reverse(), // Orden cronológico
        breedDistribution,
        colorDistribution,
        ageDistribution,
        reportStatusDistribution
      }
    });
  } catch (error) {
    console.error('🔧 ERROR en /api/admin/analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener analytics',
      error: error.message
    });
  }
});

// PUT /api/admin/pets/:id/card-status - Toggle card_printed status
router.put('/pets/:id/card-status', async (req, res) => {
  const { pool } = require('../config/database');
  const { id } = req.params;
  const { card_printed } = req.body;

  console.log('📝 Actualizando estado de carnet:', { id, card_printed });

  try {
    const [result] = await pool.query(
      'UPDATE pet_documents SET card_printed = ? WHERE pet_id = ?',
      [card_printed ? 1 : 0, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Documento de mascota no encontrado'
      });
    }

    console.log('✅ Estado actualizado correctamente');

    res.json({
      success: true,
      message: 'Estado del carnet actualizado exitosamente',
      card_printed: card_printed
    });

  } catch (error) {
    console.error('❌ Error al actualizar carnet:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar estado del carnet',
      error: error.message
    });
  }
});

// PUT /api/admin/stray-reports/:id/status - Update stray report status
router.put('/stray-reports/:id/status', async (req, res) => {
  const { pool } = require('../config/database');
  const { id } = req.params;
  const { status } = req.body;

  console.log(`🔍 [DEBUG] Actualizando estado del reporte:`);
  console.log(`   - ID: ${id}`);
  console.log(`   - Nuevo estado: '${status}' (${status.length} caracteres)`);

  try {
    let assigned_to = null;

    // Solo asignar automáticamente si el estado cambia a "asignado" Y no hay asignación previa
    if (status === 'a') {
      // Verificar si el reporte ya tiene asignación
      const [currentReport] = await pool.query(
        'SELECT assigned_to FROM stray_reports WHERE id = ?',
        [id]
      );

      if (currentReport.length > 0 && !currentReport[0].assigned_to) {
        // Solo asignar automáticamente si NO hay asignación previa
        const [followUpUsers] = await pool.query(
          `SELECT id, first_name, last_name, employee_code 
           FROM adopters 
           WHERE role_id = 3 
           ORDER BY id ASC 
           LIMIT 1`
        );

        if (followUpUsers.length > 0) {
          assigned_to = followUpUsers[0].id;
          console.log(`🎯 Reporte ${id} asignado automáticamente a: ${followUpUsers[0].first_name} ${followUpUsers[0].last_name} (${followUpUsers[0].employee_code})`);
        }
      } else if (currentReport.length > 0 && currentReport[0].assigned_to) {
        console.log(`🔄 Reporte ${id} ya tiene asignación manual, manteniendo assigned_to: ${currentReport[0].assigned_to}`);
        assigned_to = currentReport[0].assigned_to; // Mantener la asignación existente
      }
    }

    // SISTEMA NORMALIZADO: Actualizar usando status_type_id
    console.log(`🔧 [ADMIN] Actualizando con sistema normalizado`);
    
    // Obtener el ID del estado desde la tabla normalizada
    const [statusType] = await pool.query(
      'SELECT id, name FROM stray_report_status_types WHERE code = ?',
      [status]
    );
    
    if (statusType.length === 0) {
      return res.status(400).json({
        success: false,
        message: `Estado '${status}' no encontrado en el catálogo`
      });
    }
    
    const statusTypeId = statusType[0].id;
    const statusName = statusType[0].name;
    
    console.log(`🎯 [ADMIN] Estado encontrado: '${statusName}' (ID: ${statusTypeId})`);
    
    // Actualizar tanto estado como asignación si es necesario
    if (assigned_to) {
      console.log(`🔍 [DEBUG] Ejecutando query (estado + asignación):`);
      console.log(`   - Query: UPDATE stray_reports SET status_type_id = ?, assigned_to = ? WHERE id = ?`);
      console.log(`   - Params: [${statusTypeId}, ${assigned_to}, ${id}]`);
      
      const [result] = await pool.query(
        'UPDATE stray_reports SET status_type_id = ?, assigned_to = ? WHERE id = ?',
        [statusTypeId, assigned_to, id]
      );
      
      console.log(`✅ [SUCCESS] Estado y asignación actualizados correctamente`);
      
      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: 'Reporte no encontrado'
        });
      }
    } else {
      console.log(`🔍 [DEBUG] Ejecutando query (solo estado):`);
      console.log(`   - Query: UPDATE stray_reports SET status_type_id = ? WHERE id = ?`);
      console.log(`   - Params: [${statusTypeId}, ${id}]`);
      
      const [result] = await pool.query(
        'UPDATE stray_reports SET status_type_id = ? WHERE id = ?',
        [statusTypeId, id]
      );
      
      console.log(`✅ [SUCCESS] Estado actualizado correctamente`);
      
      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: 'Reporte no encontrado'
        });
      }
    }

    // Obtener datos actualizados del reporte con estado normalizado
    const [updatedReport] = await pool.query(
      `SELECT sr.*, 
              st.code as status,
              st.name as status_name,
              st.color as status_color,
              u.first_name as assigned_first_name, 
              u.last_name as assigned_last_name,
              u.employee_code as assigned_employee_code
       FROM stray_reports sr
       JOIN stray_report_status_types st ON sr.status_type_id = st.id
       LEFT JOIN adopters u ON sr.assigned_to = u.id
       WHERE sr.id = ?`,
      [id]
    );

    res.json({
      success: true,
      message: assigned_to 
        ? `✅ Estado actualizado a "${statusName}" y reporte asignado correctamente`
        : `✅ Estado actualizado a "${statusName}" exitosamente`,
      data: updatedReport[0]
    });

  } catch (error) {
    console.error(`❌ [ERROR] Error al actualizar estado del reporte:`);
    console.error(`   - Error code: ${error.code}`);
    console.error(`   - Error message: ${error.message}`);
    console.error(`   - SQL: ${error.sql}`);
    console.error(`   - Estado intentado: '${status}' (${status.length} caracteres)`);
    
    if (error.code === 'WARN_DATA_TRUNCATED') {
      console.error(`🚨 [TRUNCATION] La columna 'status' no acepta ${status.length} caracteres!`);
      console.error(`🚨 [TRUNCATION] Necesitamos usar estados de máximo 4 caracteres o menos`);
    }
    
    res.status(500).json({
      success: false,
      message: 'Error al actualizar estado del reporte',
      error: error.message,
      debug: {
        statusLength: status.length,
        status: status,
        errorCode: error.code
      }
    });
  }
});

// DELETE /api/admin/stray-reports/:id - Delete stray report
router.delete('/stray-reports/:id', async (req, res) => {
  const { pool } = require('../config/database');
  const { id } = req.params;

  try {
    const [result] = await pool.query(
      'DELETE FROM stray_reports WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Reporte no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Reporte eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error al eliminar reporte:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar reporte',
      error: error.message
    });
  }
});

// DELETE /api/admin/pets/:id - Delete pet
router.delete('/pets/:id', async (req, res) => {
  const { pool } = require('../config/database');
  const { id } = req.params;

  try {
    const [result] = await pool.query(
      'DELETE FROM pets WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Mascota no encontrada'
      });
    }

    res.json({
      success: true,
      message: 'Mascota eliminada exitosamente'
    });

  } catch (error) {
    console.error('Error al eliminar mascota:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar mascota',
      error: error.message
    });
  }
});

// DELETE /api/admin/users/:id - Delete user (adopter)
router.delete('/users/:id', async (req, res) => {
  const pool = req.app.get('pool');
  const { id } = req.params;

  try {
    // Los adopters se eliminan en cascada con sus mascotas
    const [result] = await pool.execute(
      'DELETE FROM adopters WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Usuario eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar usuario',
      error: error.message
    });
  }
});

// GET /api/admin/stats - Get statistics
router.get('/stats', async (req, res) => {
  const pool = req.app.get('pool');
  
  try {
    const [petCount] = await pool.execute('SELECT COUNT(*) as count FROM pets');
    const [userCount] = await pool.execute('SELECT COUNT(*) as count FROM adopters');
    const [reportCount] = await pool.execute('SELECT COUNT(*) as count FROM stray_reports WHERE status = "active"');
    const [printedCount] = await pool.execute('SELECT COUNT(*) as count FROM pets WHERE card_printed = TRUE');
    const [pendingCount] = await pool.execute('SELECT COUNT(*) as count FROM pets WHERE card_printed = FALSE');

    res.json({
      success: true,
      stats: {
        totalPets: petCount[0].count,
        totalUsers: userCount[0].count,
        activeReports: reportCount[0].count,
        cardsPrinted: printedCount[0].count,
        cardsPending: pendingCount[0].count
      }
    });

  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas',
      error: error.message
    });
  }
});

// GET /api/admin/pets/dangerous - Get dangerous pets with payment info
router.get('/pets/dangerous', async (req, res) => {
  console.log('🔧 ENDPOINT /api/admin/pets/dangerous LLAMADO');
  
  const { pool } = require('../config/database');
  
  try {
    // Obtener mascotas de razas potencialmente peligrosas con información de pago
    const [dangerousPets] = await pool.query(`
      SELECT 
        p.id,
        p.cui,
        p.pet_name,
        p.age,
        p.created_at,
        b.name as breed,
        a.first_name as owner_first_name,
        a.last_name as owner_last_name,
        a.dni as owner_dni,
        pp.receipt_number,
        pp.receipt_amount,
        pp.voucher_photo_path,
        pp.voucher_viewed,
        pp.created_at as payment_date
      FROM pets p
      JOIN breeds b ON p.breed_id = b.id
      JOIN adopters a ON p.adopter_id = a.id
      LEFT JOIN pet_payments pp ON p.id = pp.pet_id
      WHERE b.description LIKE '%potencialmente peligrosa%' 
         OR b.description LIKE '%Requiere pago%'
      ORDER BY p.created_at DESC
    `);

    console.log('🔧 Mascotas peligrosas encontradas:', dangerousPets.length);

    res.json({
      success: true,
      data: dangerousPets,
      total: dangerousPets.length
    });
  } catch (error) {
    console.error('🔧 ERROR en /api/admin/pets/dangerous:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener mascotas potencialmente peligrosas',
      error: error.message
    });
  }
});

// PUT /api/admin/pets/dangerous/:petId/voucher-viewed - Mark voucher as viewed
router.put('/pets/dangerous/:petId/voucher-viewed', async (req, res) => {
  console.log('🔧 ENDPOINT /api/admin/pets/dangerous/:petId/voucher-viewed LLAMADO');
  
  const { pool } = require('../config/database');
  const { petId } = req.params;
  
  try {
    // Actualizar el campo voucher_viewed en pet_payments
    await pool.query(`
      UPDATE pet_payments 
      SET voucher_viewed = 1 
      WHERE pet_id = ?
    `, [petId]);

    console.log(`✅ Voucher marcado como visto para pet_id: ${petId}`);

    res.json({
      success: true,
      message: 'Voucher marcado como visto'
    });
  } catch (error) {
    console.error('🔧 ERROR al marcar voucher como visto:', error);
    res.status(500).json({
      success: false,
      message: 'Error al marcar voucher como visto',
      error: error.message
    });
  }
});

module.exports = router;
