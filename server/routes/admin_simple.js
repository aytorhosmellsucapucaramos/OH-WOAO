const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// GET /api/admin/pets - Get all pets with owner information
router.get('/pets', async (req, res) => {
  try {
    const [pets] = await pool.execute(`
      SELECT 
        p.*,
        a.first_name as owner_first_name,
        a.last_name as owner_last_name,
        a.dni as owner_dni,
        a.email as owner_email,
        a.phone as owner_phone,
        a.address as owner_address
      FROM pets p
      LEFT JOIN adopters a ON p.adopter_id = a.id
      ORDER BY p.created_at DESC
    `);

    res.json({
      success: true,
      data: pets,
      total: pets.length
    });
  } catch (error) {
    console.error('Error fetching pets:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener mascotas',
      error: error.message
    });
  }
});

// GET /api/admin/users - Get all users
router.get('/users', async (req, res) => {
  try {
    const [users] = await pool.execute(`
      SELECT 
        a.id,
        a.first_name,
        a.last_name,
        a.dni,
        a.email,
        a.phone,
        a.address,
        a.photo_path,
        a.created_at,
        COUNT(DISTINCT p.id) as total_pets,
        COUNT(DISTINCT sr.id) as total_reports
      FROM adopters a
      LEFT JOIN pets p ON a.id = p.adopter_id
      LEFT JOIN stray_reports sr ON a.id = sr.reporter_id
      GROUP BY a.id
      ORDER BY a.created_at DESC
    `);

    res.json({
      success: true,
      data: users,
      total: users.length
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuarios',
      error: error.message
    });
  }
});

// GET /api/admin/stray-reports - Get all stray reports
router.get('/stray-reports', async (req, res) => {
  try {
    const [reports] = await pool.execute(`
      SELECT 
        sr.*,
        a.first_name as reporter_first_name,
        a.last_name as reporter_last_name,
        a.phone as reporter_phone,
        a.email as reporter_email
      FROM stray_reports sr
      LEFT JOIN adopters a ON sr.reporter_id = a.id
      ORDER BY sr.created_at DESC
    `);

    res.json({
      success: true,
      data: reports,
      total: reports.length
    });
  } catch (error) {
    console.error('Error fetching stray reports:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener reportes',
      error: error.message
    });
  }
});

// PUT /api/admin/stray-reports/:id/status - Update report status
router.put('/stray-reports/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const [result] = await pool.execute(
      'UPDATE stray_reports SET status = ?, updated_at = NOW() WHERE id = ?',
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Reporte no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Estado actualizado correctamente'
    });
  } catch (error) {
    console.error('Error updating report status:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar estado',
      error: error.message
    });
  }
});

// DELETE /api/admin/pets/:id - Delete pet
router.delete('/pets/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.execute(
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
    console.error('Error deleting pet:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar mascota',
      error: error.message
    });
  }
});

// DELETE /api/admin/users/:id - Delete user
router.delete('/users/:id', async (req, res) => {
  const { id } = req.params;

  try {
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
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar usuario',
      error: error.message
    });
  }
});

// DELETE /api/admin/stray-reports/:id - Delete stray report
router.delete('/stray-reports/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.execute(
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
    console.error('Error deleting report:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar reporte',
      error: error.message
    });
  }
});

// PUT /api/admin/pets/:id/card-status - Update card printed status
router.put('/pets/:id/card-status', async (req, res) => {
  const { id } = req.params;
  const { card_printed } = req.body;

  try {
    const [result] = await pool.execute(
      'UPDATE pets SET card_printed = ?, updated_at = NOW() WHERE id = ?',
      [card_printed, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Mascota no encontrada'
      });
    }

    res.json({
      success: true,
      message: 'Estado de carnet actualizado correctamente'
    });
  } catch (error) {
    console.error('Error updating card status:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar estado del carnet',
      error: error.message
    });
  }
});

// GET /api/admin/stats - Get system statistics  
router.get('/stats', async (req, res) => {
  try {
    // Get total pets
    const [petCount] = await pool.execute('SELECT COUNT(*) as count FROM pets');
    
    // Get total users
    const [userCount] = await pool.execute('SELECT COUNT(*) as count FROM adopters');
    
    // Get active stray reports
    const [activeReportsCount] = await pool.execute(
      "SELECT COUNT(*) as count FROM stray_reports WHERE status = 'pending'"
    );
    
    // Get cards printed
    const [cardsPrintedCount] = await pool.execute(
      'SELECT COUNT(*) as count FROM pets WHERE card_printed = TRUE'
    );
    
    // Get cards pending
    const [cardsPendingCount] = await pool.execute(
      'SELECT COUNT(*) as count FROM pets WHERE card_printed = FALSE'
    );

    // Get new registrations this month
    const [newPetsThisMonth] = await pool.execute(`
      SELECT COUNT(*) as count FROM pets 
      WHERE YEAR(created_at) = YEAR(CURRENT_DATE()) 
      AND MONTH(created_at) = MONTH(CURRENT_DATE())
    `);

    // Get new users this month
    const [newUsersThisMonth] = await pool.execute(`
      SELECT COUNT(*) as count FROM adopters 
      WHERE YEAR(created_at) = YEAR(CURRENT_DATE()) 
      AND MONTH(created_at) = MONTH(CURRENT_DATE())
    `);

    // Get pets with vaccination card
    const [vaccinatedPets] = await pool.execute(
      'SELECT COUNT(*) as count FROM pets WHERE has_vaccination_card = TRUE'
    );

    // Get pets with rabies vaccine
    const [rabiesVaccinatedPets] = await pool.execute(
      'SELECT COUNT(*) as count FROM pets WHERE has_rabies_vaccine = TRUE'
    );

    res.json({
      success: true,
      stats: {
        totalPets: petCount[0].count,
        totalUsers: userCount[0].count,
        activeReports: activeReportsCount[0].count,
        cardsPrinted: cardsPrintedCount[0].count,
        cardsPending: cardsPendingCount[0].count,
        newPetsThisMonth: newPetsThisMonth[0].count,
        newUsersThisMonth: newUsersThisMonth[0].count,
        vaccinatedPets: vaccinatedPets[0].count,
        rabiesVaccinatedPets: rabiesVaccinatedPets[0].count
      }
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas',
      error: error.message
    });
  }
});

// GET /api/admin/analytics - Get detailed analytics
router.get('/analytics', async (req, res) => {
  try {
    // Monthly registrations
    const [monthlyRegistrations] = await pool.execute(`
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month,
        COUNT(*) as count
      FROM pets
      WHERE created_at >= DATE_SUB(CURRENT_DATE(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY month ASC
    `);

    // Breed distribution
    const [breedDistribution] = await pool.execute(`
      SELECT 
        breed,
        COUNT(*) as count
      FROM pets
      GROUP BY breed
      ORDER BY count DESC
      LIMIT 10
    `);

    // Color distribution
    const [colorDistribution] = await pool.execute(`
      SELECT 
        color,
        COUNT(*) as count
      FROM pets
      GROUP BY color
      ORDER BY count DESC
      LIMIT 10
    `);

    // Age distribution
    const [ageDistribution] = await pool.execute(`
      SELECT 
        CASE 
          WHEN age < 1 THEN 'Cachorro (<1 año)'
          WHEN age BETWEEN 1 AND 3 THEN 'Joven (1-3 años)'
          WHEN age BETWEEN 4 AND 7 THEN 'Adulto (4-7 años)'
          ELSE 'Senior (8+ años)'
        END as age_group,
        COUNT(*) as count
      FROM pets
      GROUP BY age_group
      ORDER BY 
        CASE age_group
          WHEN 'Cachorro (<1 año)' THEN 1
          WHEN 'Joven (1-3 años)' THEN 2
          WHEN 'Adulto (4-7 años)' THEN 3
          ELSE 4
        END
    `);

    // Report status distribution
    const [reportStatusDistribution] = await pool.execute(`
      SELECT 
        status,
        COUNT(*) as count
      FROM stray_reports
      GROUP BY status
    `);

    res.json({
      success: true,
      analytics: {
        monthlyRegistrations,
        breedDistribution,
        colorDistribution,
        ageDistribution,
        reportStatusDistribution
      }
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener analíticas',
      error: error.message
    });
  }
});

module.exports = router;
