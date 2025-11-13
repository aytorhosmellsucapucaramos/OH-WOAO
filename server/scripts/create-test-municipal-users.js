/**
 * Script para crear usuarios municipales de prueba
 * Ejecutar: node scripts/create-test-municipal-users.js
 */

const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');

async function createTestMunicipalUsers() {
  console.log('🔧 Creando usuarios municipales de prueba...\n');

  try {
    // Crear usuarios de prueba
    const testUsers = [
      {
        first_name: 'Juan',
        last_name: 'Pérez',
        dni: '12345678',
        email: 'juan.perez@municipio.gob.pe',
        password: 'Test123!',
        phone: '987654321',
        address: 'Jr. Lima 123, Puno',
        role_id: 2, // admin
        assigned_zone: null,
      },
      {
        first_name: 'María',
        last_name: 'González',
        dni: '87654321',
        email: 'maria.gonzalez@municipio.gob.pe',
        password: 'Test123!',
        phone: '987654322',
        address: 'Av. Titicaca 456, Puno',
        role_id: 3, // seguimiento
        assigned_zone: 'Centro',
      },
      {
        first_name: 'Carlos',
        last_name: 'Rodríguez',
        dni: '11223344',
        email: 'carlos.rodriguez@municipio.gob.pe',
        password: 'Test123!',
        phone: '987654323',
        address: 'Plaza Mayor 789, Puno',
        role_id: 3, // seguimiento
        assigned_zone: 'Norte',
      }
    ];

    for (const user of testUsers) {
      // Generar employee_code
      const [roleResult] = await pool.query('SELECT code FROM roles WHERE id = ?', [user.role_id]);
      const roleCode = roleResult[0].code;

      const [[{employee_code}]] = await pool.query(
        'SELECT generate_employee_code(?) as employee_code',
        [roleCode]
      );

      // Hash password
      const hashedPassword = await bcrypt.hash(user.password, 10);

      // Insert user
      const [result] = await pool.query(
        `INSERT INTO adopters (
          first_name, last_name, dni, email, password, phone, address,
          role_id, assigned_zone, employee_code, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE)`,
        [
          user.first_name,
          user.last_name,
          user.dni,
          user.email,
          hashedPassword,
          user.phone,
          user.address,
          user.role_id,
          user.assigned_zone,
          employee_code
        ]
      );

      console.log(`✅ Usuario creado: ${user.first_name} ${user.last_name} (${employee_code})`);
    }

    // Verificar usuarios creados
    const [users] = await pool.query(`
      SELECT
        a.first_name, a.last_name, a.email, a.employee_code,
        r.name as role_name
      FROM adopters a
      LEFT JOIN roles r ON a.role_id = r.id
      WHERE a.role_id > 1
      ORDER BY a.created_at DESC
      LIMIT 10
    `);

    console.log('\n📋 Usuarios municipales creados:');
    users.forEach(user => {
      console.log(`   👤 ${user.first_name} ${user.last_name} - ${user.role_name} (${user.employee_code})`);
    });

    console.log('\n✨ ¡Usuarios municipales de prueba creados exitosamente!');

    await pool.end();
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    await pool.end();
    process.exit(1);
  }
}

createTestMunicipalUsers();
