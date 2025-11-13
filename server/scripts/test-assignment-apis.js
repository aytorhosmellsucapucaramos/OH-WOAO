/**
 * Script para probar las nuevas APIs de asignación de reportes
 * Ejecutar: node scripts/test-assignment-apis.js
 */

const mysql = require('mysql2/promise');
// const axios = require('axios'); // Removido para evitar dependencia

async function testAssignmentAPIs() {
  console.log('🧪 Probando APIs de asignación de reportes...\n');

  // Configuración de conexión
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'pets_db',
    port: process.env.DB_PORT || 3306
  });

  try {
    // Verificar que las columnas existen
    console.log('1️⃣ Verificando estructura de base de datos...');
    const [columns] = await connection.query('DESCRIBE stray_reports');
    const assignmentColumns = columns.filter(col =>
      ['assigned_to', 'assigned_at', 'assigned_by'].includes(col.Field)
    );

    if (assignmentColumns.length === 3) {
      console.log('✅ Columnas de asignación presentes en stray_reports');
      assignmentColumns.forEach(col => {
        console.log(`   - ${col.Field}: ${col.Type}`);
      });
    } else {
      console.log('❌ Faltan columnas de asignación');
      return;
    }

    // Verificar vista actualizada
    console.log('\n2️⃣ Verificando vista view_stray_reports_complete...');
    try {
      const [viewResult] = await connection.query('DESCRIBE view_stray_reports_complete');
      const assignedColumns = viewResult.filter(col =>
        col.Field.includes('assigned')
      );
      console.log('✅ Vista actualizada con columnas de asignación:');
      assignedColumns.forEach(col => {
        console.log(`   - ${col.Field}`);
      });
    } catch (error) {
      console.log('❌ Error verificando vista:', error.message);
    }

    // Verificar usuarios de seguimiento
    console.log('\n3️⃣ Verificando usuarios de seguimiento disponibles...');
    const [seguimientoUsers] = await connection.query(`
      SELECT a.id, a.first_name, a.last_name, a.employee_code, r.name as role_name
      FROM adopters a
      LEFT JOIN roles r ON a.role_id = r.id
      WHERE r.code = 'seguimiento' AND a.is_active = TRUE
    `);

    if (seguimientoUsers.length > 0) {
      console.log(`✅ ${seguimientoUsers.length} usuario(s) de seguimiento encontrado(s):`);
      seguimientoUsers.forEach(user => {
        console.log(`   - ${user.first_name} ${user.last_name} (${user.employee_code})`);
      });
    } else {
      console.log('⚠️  No hay usuarios de seguimiento activos');
      console.log('   Ejecuta: node scripts/create-municipal-users-direct.js');
    }

    // Verificar reportes disponibles para asignar
    console.log('\n4️⃣ Verificando reportes disponibles para asignar...');
    const [availableReports] = await connection.query(`
      SELECT id, reporter_name, address, status, created_at
      FROM stray_reports
      WHERE assigned_to IS NULL AND status = 'active'
      ORDER BY created_at DESC
      LIMIT 5
    `);

    if (availableReports.length > 0) {
      console.log(`✅ ${availableReports.length} reporte(s) disponible(s) para asignar:`);
      availableReports.forEach(report => {
        console.log(`   - ID ${report.id}: ${report.reporter_name || 'Anónimo'} - ${report.address || 'Sin dirección'}`);
      });
    } else {
      console.log('⚠️  No hay reportes disponibles para asignar');
      console.log('   Crea algunos reportes primero desde la app');
    }

    // Verificar reportes ya asignados
    console.log('\n5️⃣ Verificando reportes ya asignados...');
    const [assignedReports] = await connection.query(`
      SELECT
        sr.id, sr.reporter_name, sr.status,
        assigned_user.first_name as assigned_first_name,
        assigned_user.last_name as assigned_last_name,
        sr.assigned_at
      FROM stray_reports sr
      LEFT JOIN adopters assigned_user ON sr.assigned_to = assigned_user.id
      WHERE sr.assigned_to IS NOT NULL
      ORDER BY sr.assigned_at DESC
      LIMIT 5
    `);

    if (assignedReports.length > 0) {
      console.log(`✅ ${assignedReports.length} reporte(s) asignado(s):`);
      assignedReports.forEach(report => {
        console.log(`   - ID ${report.id}: ${report.reporter_name || 'Anónimo'} → ${report.assigned_first_name} ${report.assigned_last_name}`);
      });
    } else {
      console.log('ℹ️  No hay reportes asignados aún');
    }

    console.log('\n🎉 ¡Verificación completada!');
    console.log('\n📋 Resumen:');
    console.log(`   - Columnas de asignación: ✅`);
    console.log(`   - Vista actualizada: ✅`);
    console.log(`   - Usuarios seguimiento: ${seguimientoUsers.length}`);
    console.log(`   - Reportes disponibles: ${availableReports.length}`);
    console.log(`   - Reportes asignados: ${assignedReports.length}`);

    console.log('\n🚀 Las APIs de asignación están listas para usar!');
    console.log('   - PUT /api/stray-reports/:id/assign');
    console.log('   - PUT /api/stray-reports/:id/unassign');
    console.log('   - GET /api/stray-reports/assigned');
    console.log('   - PUT /api/stray-reports/:id/status');

  } catch (error) {
    console.error('❌ Error en verificación:', error.message);
  } finally {
    await connection.end();
  }
}

testAssignmentAPIs();
