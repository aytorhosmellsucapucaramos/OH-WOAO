const express = require('express');
const router = express.Router();

// Temporary admin routes - simplified for now
// You can add authentication middleware later

// GET /api/admin/pets - Get all pets
router.get('/pets', async (req, res) => {
  try {
    const [pets] = await pool.execute(`
      SELECT 
        p.*, 
        u.full_name as owner_name,
        u.dni as owner_dni,
        u.email as owner_email,
        u.phone as owner_phone,
        c.carnet_number,
        c.status as carnet_status,
        c.is_printed,
        c.is_delivered
      FROM pets p
      LEFT JOIN users u ON p.user_id = u.id
      LEFT JOIN carnets c ON p.id = c.pet_id
      ORDER BY p.created_at DESC
    `);

    res.json({
      success: true,
      pets,
      total: pets.length
    });
  } catch (error) {
    console.error('Error al obtener mascotas:', error);
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
        id, dni, full_name, email, phone, 
        address, district, province, department,
        is_admin, created_at
      FROM users
      ORDER BY created_at DESC
    `);

    res.json({
      success: true,
      users,
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
  try {
    const [reports] = await pool.execute(`
      SELECT * FROM stray_reports
      ORDER BY report_date DESC
    `);

    res.json({
      success: true,
      reports,
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

// PUT /api/admin/pets/:id/carnet-status - Update carnet status
router.put('/pets/:id/carnet-status', async (req, res) => {
  const { id } = req.params;
  const { status, isPrinted, isDelivered } = req.body;

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Actualizar estado del carnet en tabla pets
    if (status) {
      await connection.execute(
        'UPDATE pets SET carnet_status = ? WHERE id = ?',
        [status, id]
      );
    }

    // Actualizar estado de impresión/entrega en tabla carnets
    const updates = [];
    const params = [];

    if (isPrinted !== undefined) {
      updates.push('is_printed = ?');
      params.push(isPrinted);
      if (isPrinted) {
        updates.push('printed_at = NOW()');
      }
    }

    if (isDelivered !== undefined) {
      updates.push('is_delivered = ?');
      params.push(isDelivered);
      if (isDelivered) {
        updates.push('delivered_at = NOW()');
        // También actualizar el estado del carnet en pets
        await connection.execute(
          'UPDATE pets SET carnet_status = "delivered", carnet_delivered_at = NOW() WHERE id = ?',
          [id]
        );
      }
    }

    if (updates.length > 0) {
      params.push(id);
      await connection.execute(
        `UPDATE carnets SET ${updates.join(', ')} WHERE pet_id = ?`,
        params
      );
    }

    await connection.commit();

    res.json({
      success: true,
      message: 'Estado del carnet actualizado exitosamente'
    });

  } catch (error) {
    await connection.rollback();
    console.error('Error al actualizar carnet:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar estado del carnet',
      error: error.message
    });
  } finally {
    connection.release();
  }
});

// DELETE /api/admin/pets/:id - Delete pet
router.delete('/pets/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Las mascotas se eliminan en cascada con sus carnets
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
    console.error('Error al eliminar mascota:', error);
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
    // Los usuarios se eliminan en cascada con sus mascotas y carnets
    const [result] = await pool.execute(
      'DELETE FROM users WHERE id = ? AND is_admin = FALSE',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado o es administrador'
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
  try {
    const [petCount] = await pool.execute('SELECT COUNT(*) as count FROM pets');
    const [userCount] = await pool.execute('SELECT COUNT(*) as count FROM users WHERE is_admin = FALSE');
    const [reportCount] = await pool.execute('SELECT COUNT(*) as count FROM stray_reports WHERE status = "active"');
    const [deliveredCount] = await pool.execute('SELECT COUNT(*) as count FROM carnets WHERE is_delivered = TRUE');
    const [printedCount] = await pool.execute('SELECT COUNT(*) as count FROM carnets WHERE is_printed = TRUE AND is_delivered = FALSE');

    res.json({
      success: true,
      stats: {
        totalPets: petCount[0].count,
        totalUsers: userCount[0].count,
        activeReports: reportCount[0].count,
        carnetsDelivered: deliveredCount[0].count,
        carnetsPending: printedCount[0].count
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
