/**
 * Script para verificar usuarios municipales en la base de datos
 */

const { pool } = require('../config/database');

async function checkMunicipalUsers() {
  try {
    console.log('🔍 Verificando usuarios en la base de datos...\n');

    // Verificar todos los usuarios
    const [allUsers] = await pool.query(`
      SELECT
        a.id,
        a.first_name,
        a.last_name,
        a.email,
        a.role_id,
        a.employee_code,
        a.is_active,
        r.code as role_code,
        r.name as role_name
      FROM adopters a
      LEFT JOIN roles r ON a.role_id = r.id
      ORDER BY a.created_at DESC
    `);

    console.log(`📊 Total de usuarios en adopters: ${allUsers.length}`);
    console.log('👥 Lista de usuarios:');

    allUsers.forEach(user => {
      console.log(`   ${user.id}: ${user.first_name} ${user.last_name} (${user.email}) - Role: ${user.role_code || 'none'} - Employee: ${user.employee_code || 'none'} - Active: ${user.is_active}`);
    });

    // Verificar usuarios municipales específicamente
    const [municipalUsers] = await pool.query(`
      SELECT
        a.id,
        a.first_name,
        a.last_name,
        a.email,
        a.role_id,
        a.employee_code,
        r.code as role_code,
        r.name as role_name
      FROM adopters a
      LEFT JOIN roles r ON a.role_id = r.id
      WHERE a.role_id > 1 OR a.employee_code IS NOT NULL
      ORDER BY a.created_at DESC
    `);

    console.log(`\n🏛️ Usuarios municipales encontrados: ${municipalUsers.length}`);
    if (municipalUsers.length > 0) {
      console.log('🏛️ Lista de usuarios municipales:');
      municipalUsers.forEach(user => {
        console.log(`   ${user.first_name} ${user.last_name} (${user.email}) - Role: ${user.role_code} - Employee: ${user.employee_code}`);
      });
    }

    // Verificar roles disponibles
    const [roles] = await pool.query('SELECT id, code, name FROM roles ORDER BY id');
    console.log(`\n🔑 Roles disponibles: ${roles.length}`);
    roles.forEach(role => {
      console.log(`   ${role.id}: ${role.code} - ${role.name}`);
    });

    await pool.end();

  } catch (error) {
    console.error('❌ Error:', error.message);
    await pool.end();
    process.exit(1);
  }
}

checkMunicipalUsers();
