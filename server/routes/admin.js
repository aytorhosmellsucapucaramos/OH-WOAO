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
        id, dni, first_name, last_name, email, phone, 
        address, photo_path, created_at
      FROM adopters
      ORDER BY created_at DESC
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
    // Obtener reportes con información del usuario asignado
    const [reports] = await pool.query(`
      SELECT 
        sr.*,
        reporter.first_name as reporter_first_name,
        reporter.last_name as reporter_last_name,
        reporter.phone as reporter_phone,
        reporter.email as reporter_email,
        assigned_user.first_name as assigned_first_name,
        assigned_user.last_name as assigned_last_name,
        assigned_user.employee_code as assigned_employee_code,
        assigned_user.email as assigned_email,
        sizes.name as size_name,
        temperaments.name as temperament_name
      FROM stray_reports sr
      LEFT JOIN adopters reporter ON sr.reporter_id = reporter.id
      LEFT JOIN adopters assigned_user ON sr.assigned_to = assigned_user.id
      LEFT JOIN sizes sizes ON sr.size_id = sizes.id
      LEFT JOIN temperaments temperaments ON sr.temperament_id = temperaments.id
      ORDER BY sr.created_at DESC
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
      'UPDATE pets SET card_printed = ? WHERE id = ?',
      [card_printed ? 1 : 0, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Mascota no encontrada'
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

  try {
    let assigned_to = null;

    // Si el estado cambia a "in_progress", asignar automáticamente a personal de seguimiento
    if (status === 'in_progress') {
      // Buscar personal de seguimiento disponible (role_id = 3)
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
    }

    // Actualizar estado y asignación
    const updateQuery = assigned_to 
      ? 'UPDATE stray_reports SET status = ?, assigned_to = ? WHERE id = ?'
      : 'UPDATE stray_reports SET status = ? WHERE id = ?';
    
    const updateParams = assigned_to 
      ? [status, assigned_to, id]
      : [status, id];

    const [result] = await pool.query(updateQuery, updateParams);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Reporte no encontrado'
      });
    }

    // Obtener datos actualizados del reporte
    const [updatedReport] = await pool.query(
      `SELECT sr.*, 
              u.first_name as assigned_first_name, 
              u.last_name as assigned_last_name,
              u.employee_code as assigned_employee_code
       FROM stray_reports sr
       LEFT JOIN adopters u ON sr.assigned_to = u.id
       WHERE sr.id = ?`,
      [id]
    );

    res.json({
      success: true,
      message: assigned_to 
        ? 'Estado actualizado y reporte asignado automáticamente a personal de seguimiento'
        : 'Estado del reporte actualizado exitosamente',
      data: updatedReport[0]
    });

  } catch (error) {
    console.error('Error al actualizar estado del reporte:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar estado del reporte',
      error: error.message
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

module.exports = router;
