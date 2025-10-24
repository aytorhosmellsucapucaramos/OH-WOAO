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
    // Usar vista view_stray_reports_complete para obtener datos con catálogos
    const [reports] = await pool.query(`
      SELECT * FROM view_stray_reports_complete
      ORDER BY created_at DESC
    `);

    res.json({
      success: true,
      data: reports,
      total: reports.length
    });
  } catch (error) {
    console.error('Error al obtener reportes:', error);
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
    const [reportsStats] = await pool.query('SELECT COUNT(*) as total_reports FROM stray_reports');
    
    const stats = {
      totalPets: petsStats[0].total_pets,
      totalUsers: usersStats[0].total_users,
      totalReports: reportsStats[0].total_reports,
      printedCards: 0, // Por ahora
      lastUpdate: new Date().toISOString()
    };

    res.json({
      success: true,
      data: stats
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
    // Estadísticas básicas para el dashboard
    const analytics = {
      registrations: {
        daily: 0,
        weekly: 0,
        monthly: 0
      },
      growth: {
        percentage: 0,
        trend: 'up'
      },
      topBreeds: [],
      recentActivity: []
    };

    res.json({
      success: true,
      data: analytics
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

  try {
    await pool.query(
      'UPDATE pets SET card_printed = ? WHERE id = ?',
      [card_printed, id]
    );

    res.json({
      success: true,
      message: 'Estado del carnet actualizado exitosamente'
    });

  } catch (error) {
    console.error('Error al actualizar carnet:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar estado del carnet',
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
