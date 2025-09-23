const express = require('express')
const router = express.Router()
const sqlite3 = require('sqlite3').verbose()
const path = require('path')

// Conectar a la base de datos
const dbPath = path.join(__dirname, '../pets.db')
const db = new sqlite3.Database(dbPath)

// Middleware de autenticación de administrador (simplificado)
const authenticateAdmin = (req, res, next) => {
  // En producción, esto debería validar un JWT o sesión real
  const authHeader = req.headers.authorization
  if (!authHeader || authHeader !== 'Bearer admin-token') {
    return res.status(401).json({
      success: false,
      message: 'No autorizado'
    })
  }
  next()
}

// GET /api/admin/stats - Estadísticas del dashboard
router.get('/stats', (req, res) => {
  const stats = {}
  
  // Contar mascotas registradas
  db.get('SELECT COUNT(*) as count FROM pets', (err, result) => {
    if (err) {
      console.error('Error counting pets:', err)
      return res.status(500).json({ success: false, message: 'Error interno' })
    }
    
    stats.totalPets = result.count
    
    // Contar reportes de perros callejeros
    db.get('SELECT COUNT(*) as count FROM stray_reports', (err, result) => {
      if (err) {
        console.error('Error counting stray reports:', err)
        return res.status(500).json({ success: false, message: 'Error interno' })
      }
      
      stats.totalReports = result.count
      
      // Contar reportes pendientes
      db.get('SELECT COUNT(*) as count FROM stray_reports WHERE status = "active"', (err, result) => {
        if (err) {
          console.error('Error counting pending reports:', err)
          return res.status(500).json({ success: false, message: 'Error interno' })
        }
        
        stats.pendingReports = result.count
        
        // Contar mascotas adoptadas (simulado)
        stats.adoptedPets = Math.floor(stats.totalPets * 0.6) // 60% adoptadas
        stats.activeUsers = Math.floor(stats.totalPets * 1.5) // Simulado
        
        res.json({
          success: true,
          data: stats
        })
      })
    })
  })
})

// GET /api/admin/pets - Obtener todas las mascotas con paginación
router.get('/pets', (req, res) => {
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 20
  const offset = (page - 1) * limit
  const search = req.query.search || ''
  
  let query = 'SELECT * FROM pets'
  let countQuery = 'SELECT COUNT(*) as total FROM pets'
  const params = []
  
  if (search) {
    query += ' WHERE name LIKE ? OR breed LIKE ? OR cui LIKE ?'
    countQuery += ' WHERE name LIKE ? OR breed LIKE ? OR cui LIKE ?'
    params.push(`%${search}%`, `%${search}%`, `%${search}%`)
  }
  
  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?'
  params.push(limit, offset)
  
  // Obtener total de registros
  db.get(countQuery, search ? [`%${search}%`, `%${search}%`, `%${search}%`] : [], (err, countResult) => {
    if (err) {
      console.error('Error counting pets:', err)
      return res.status(500).json({ success: false, message: 'Error interno' })
    }
    
    // Obtener mascotas
    db.all(query, params, (err, rows) => {
      if (err) {
        console.error('Error fetching pets:', err)
        return res.status(500).json({ success: false, message: 'Error interno' })
      }
      
      res.json({
        success: true,
        data: rows,
        pagination: {
          page,
          limit,
          total: countResult.total,
          pages: Math.ceil(countResult.total / limit)
        }
      })
    })
  })
})

// GET /api/admin/reports - Obtener todos los reportes con paginación
router.get('/reports', (req, res) => {
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 20
  const offset = (page - 1) * limit
  const status = req.query.status || ''
  const search = req.query.search || ''
  
  let query = 'SELECT * FROM stray_reports'
  let countQuery = 'SELECT COUNT(*) as total FROM stray_reports'
  const params = []
  const conditions = []
  
  if (status && status !== 'all') {
    conditions.push('status = ?')
    params.push(status)
  }
  
  if (search) {
    conditions.push('(reporter_name LIKE ? OR breed LIKE ? OR address LIKE ?)')
    params.push(`%${search}%`, `%${search}%`, `%${search}%`)
  }
  
  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ')
    countQuery += ' WHERE ' + conditions.join(' AND ')
  }
  
  query += ' ORDER BY report_date DESC LIMIT ? OFFSET ?'
  const queryParams = [...params, limit, offset]
  
  // Obtener total de registros
  db.get(countQuery, params, (err, countResult) => {
    if (err) {
      console.error('Error counting reports:', err)
      return res.status(500).json({ success: false, message: 'Error interno' })
    }
    
    // Obtener reportes
    db.all(query, queryParams, (err, rows) => {
      if (err) {
        console.error('Error fetching reports:', err)
        return res.status(500).json({ success: false, message: 'Error interno' })
      }
      
      // Parsear colors JSON para cada reporte
      const processedRows = rows.map(row => ({
        ...row,
        colors: row.colors ? JSON.parse(row.colors) : []
      }))
      
      res.json({
        success: true,
        data: processedRows,
        pagination: {
          page,
          limit,
          total: countResult.total,
          pages: Math.ceil(countResult.total / limit)
        }
      })
    })
  })
})

// PUT /api/admin/reports/:id/status - Actualizar estado de reporte
router.put('/reports/:id/status', (req, res) => {
  const reportId = req.params.id
  const { status, reason } = req.body
  
  if (!status) {
    return res.status(400).json({
      success: false,
      message: 'Estado requerido'
    })
  }
  
  const validStatuses = ['active', 'rescued', 'adopted', 'closed', 'false_report']
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Estado inválido'
    })
  }
  
  // Obtener estado actual
  db.get('SELECT status FROM stray_reports WHERE id = ?', [reportId], (err, currentReport) => {
    if (err) {
      console.error('Error fetching current report:', err)
      return res.status(500).json({ success: false, message: 'Error interno' })
    }
    
    if (!currentReport) {
      return res.status(404).json({
        success: false,
        message: 'Reporte no encontrado'
      })
    }
    
    const oldStatus = currentReport.status
    
    // Actualizar estado del reporte
    db.run(
      'UPDATE stray_reports SET status = ?, last_updated = CURRENT_TIMESTAMP WHERE id = ?',
      [status, reportId],
      function(err) {
        if (err) {
          console.error('Error updating report status:', err)
          return res.status(500).json({ success: false, message: 'Error interno' })
        }
        
        // Insertar en historial de actualizaciones
        db.run(
          `INSERT INTO status_updates (report_id, old_status, new_status, updated_by, update_reason)
           VALUES (?, ?, ?, ?, ?)`,
          [reportId, oldStatus, status, 'admin', reason || 'Actualización administrativa'],
          (err) => {
            if (err) {
              console.error('Error inserting status update:', err)
            }
            
            res.json({
              success: true,
              message: 'Estado actualizado correctamente',
              data: {
                id: reportId,
                oldStatus,
                newStatus: status
              }
            })
          }
        )
      }
    )
  })
})

// DELETE /api/admin/reports/:id - Eliminar reporte
router.delete('/reports/:id', (req, res) => {
  const reportId = req.params.id
  
  db.run('DELETE FROM stray_reports WHERE id = ?', [reportId], function(err) {
    if (err) {
      console.error('Error deleting report:', err)
      return res.status(500).json({ success: false, message: 'Error interno' })
    }
    
    if (this.changes === 0) {
      return res.status(404).json({
        success: false,
        message: 'Reporte no encontrado'
      })
    }
    
    res.json({
      success: true,
      message: 'Reporte eliminado correctamente'
    })
  })
})

// DELETE /api/admin/pets/:id - Eliminar mascota
router.delete('/pets/:id', (req, res) => {
  const petId = req.params.id
  
  // Primero obtener la información de la mascota para eliminar archivos
  db.get('SELECT photo_path, qr_code_path FROM pets WHERE id = ?', [petId], (err, pet) => {
    if (err) {
      console.error('Error fetching pet for deletion:', err)
      return res.status(500).json({ success: false, message: 'Error interno' })
    }
    
    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Mascota no encontrada'
      })
    }
    
    // Eliminar la mascota de la base de datos
    db.run('DELETE FROM pets WHERE id = ?', [petId], function(err) {
      if (err) {
        console.error('Error deleting pet:', err)
        return res.status(500).json({ success: false, message: 'Error interno' })
      }
      
      // Opcional: eliminar archivos de imagen y QR
      const fs = require('fs')
      const path = require('path')
      const uploadsDir = path.join(__dirname, '../uploads')
      
      if (pet.photo_path) {
        const photoPath = path.join(uploadsDir, pet.photo_path)
        fs.unlink(photoPath, (err) => {
          if (err) console.log('Could not delete photo file:', err)
        })
      }
      
      if (pet.qr_code_path) {
        const qrPath = path.join(uploadsDir, pet.qr_code_path)
        fs.unlink(qrPath, (err) => {
          if (err) console.log('Could not delete QR file:', err)
        })
      }
      
      res.json({
        success: true,
        message: 'Mascota eliminada correctamente'
      })
    })
  })
})

// GET /api/admin/analytics - Datos para gráficos y analíticas
router.get('/analytics', (req, res) => {
  const analytics = {}
  
  // Reportes por mes (últimos 6 meses)
  db.all(`
    SELECT 
      strftime('%Y-%m', report_date) as month,
      COUNT(*) as count
    FROM stray_reports 
    WHERE report_date >= date('now', '-6 months')
    GROUP BY strftime('%Y-%m', report_date)
    ORDER BY month
  `, (err, monthlyReports) => {
    if (err) {
      console.error('Error fetching monthly reports:', err)
      return res.status(500).json({ success: false, message: 'Error interno' })
    }
    
    analytics.monthlyReports = monthlyReports
    
    // Reportes por estado
    db.all(`
      SELECT status, COUNT(*) as count
      FROM stray_reports
      GROUP BY status
    `, (err, statusCounts) => {
      if (err) {
        console.error('Error fetching status counts:', err)
        return res.status(500).json({ success: false, message: 'Error interno' })
      }
      
      analytics.statusDistribution = statusCounts
      
      // Reportes por urgencia
      db.all(`
        SELECT urgency_level, COUNT(*) as count
        FROM stray_reports
        GROUP BY urgency_level
      `, (err, urgencyCounts) => {
        if (err) {
          console.error('Error fetching urgency counts:', err)
          return res.status(500).json({ success: false, message: 'Error interno' })
        }
        
        analytics.urgencyDistribution = urgencyCounts
        
        res.json({
          success: true,
          data: analytics
        })
      })
    })
  })
})

module.exports = router
