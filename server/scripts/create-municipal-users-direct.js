/**
 * Script para crear usuarios municipales de prueba directamente en la base de datos
 * Ejecutar: node scripts/create-municipal-users-direct.js
 */

const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function createMunicipalUsersDirect() {
  console.log('🔧 Creando usuarios municipales directamente en la base de datos...\n');

  // Configuración de conexión directa a MySQL
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'pets_db',
    port: process.env.DB_PORT || 3306
  });

  try {
    console.log('✅ Conectado a la base de datos');

    // Verificar usuarios existentes
    const [existingUsers] = await connection.query(`
      SELECT
        a.id, a.first_name, a.last_name, a.email, a.employee_code,
        r.code as role_code, r.name as role_name
      FROM adopters a
      LEFT JOIN roles r ON a.role_id = r.id
      WHERE a.role_id > 1 OR a.employee_code IS NOT NULL
    `);

    console.log(`📊 Usuarios municipales existentes: ${existingUsers.length}`);
    existingUsers.forEach(user => {
      console.log(`   ${user.first_name} ${user.last_name} - ${user.role_code} (${user.employee_code})`);
    });

    if (existingUsers.length > 0) {
      console.log('\n✨ Ya hay usuarios municipales. No es necesario crear más.');
      await connection.end();
      return;
    }

    // Crear usuarios de prueba
    const testUsers = [
      {
        first_name: 'María',
        last_name: 'González',
        dni: '12345678',
        email: 'maria.gonzalez@municipio.gob.pe',
        password: 'Test123!',
        phone: '987654321',
        address: 'Jr. Lima 123, Puno',
        role_id: 2, // admin
        assigned_zone: null,
      },
      {
        first_name: 'Carlos',
        last_name: 'Rodríguez',
        dni: '87654321',
        email: 'carlos.rodriguez@municipio.gob.pe',
        password: 'Test123!',
        phone: '987654322',
        address: 'Av. Titicaca 456, Puno',
        role_id: 3, // seguimiento
        assigned_zone: 'Centro',
      },
      {
        first_name: 'Ana',
        last_name: 'López',
        dni: '11223344',
        email: 'ana.lopez@municipio.gob.pe',
        password: 'Test123!',
        phone: '987654323',
        address: 'Plaza Mayor 789, Puno',
        role_id: 3, // seguimiento
        assigned_zone: 'Norte',
      }
    ];

    for (const user of testUsers) {
      // Generar employee_code usando la función de MySQL
      const [[{employee_code}]] = await connection.query(
        'SELECT generate_employee_code(?) as employee_code',
        [user.role_id === 2 ? 'admin' : 'seguimiento']
      );

      // Hash password
      const hashedPassword = await bcrypt.hash(user.password, 10);

      // Insert user
      const [result] = await connection.query(
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

    // Verificar que se crearon correctamente
    const [finalUsers] = await connection.query(`
      SELECT
        a.id, a.first_name, a.last_name, a.email, a.employee_code,
        r.code as role_code, r.name as role_name
      FROM adopters a
      LEFT JOIN roles r ON a.role_id = r.id
      WHERE a.role_id > 1 OR a.employee_code IS NOT NULL
      ORDER BY a.created_at DESC
      LIMIT 10
    `);

    console.log(`\n📋 Usuarios municipales finales: ${finalUsers.length}`);
    finalUsers.forEach(user => {
      console.log(`   ${user.first_name} ${user.last_name} - ${user.role_code} (${user.employee_code})`);
    });

    console.log('\n✨ ¡Usuarios municipales de prueba creados exitosamente!');
    console.log('\n🔐 Credenciales de prueba:');
    console.log('   Email: maria.gonzalez@municipio.gob.pe');
    console.log('   Password: Test123!');
    console.log('   (o cualquier otro usuario creado)');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await connection.end();
  }
}

createMunicipalUsersDirect();
