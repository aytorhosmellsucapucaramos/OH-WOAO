/**
 * Script para crear usuario administrador
 * Ejecutar: node scripts/create-admin.js
 */

const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');

async function createAdmin() {
  console.log('🔧 Creando usuario administrador...\n');
  
  try {
    // Agregar columna role si no existe
    console.log('1️⃣ Verificando columna role en tabla adopters...');
    
    // Verificar si la columna existe
    const [columns] = await pool.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'pets_db' 
        AND TABLE_NAME = 'adopters' 
        AND COLUMN_NAME = 'role'
    `);
    
    if (columns.length === 0) {
      // Agregar columna si no existe
      await pool.query(`
        ALTER TABLE adopters 
        ADD COLUMN role ENUM('user', 'admin') DEFAULT 'user' AFTER password
      `);
      console.log('✅ Columna role agregada\n');
    } else {
      console.log('✅ Columna role ya existe\n');
    }

    // Eliminar admin anterior si existe
    console.log('2️⃣ Eliminando usuario admin anterior (si existe)...');
    await pool.query('DELETE FROM adopters WHERE email = ?', ['admin@municipio.gob.pe']);
    console.log('✅ Usuario anterior eliminado\n');

    // Hash de la contraseña
    console.log('3️⃣ Generando hash de contraseña...');
    const password = 'Admin@2024';
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('✅ Hash generado\n');

    // Insertar nuevo admin
    console.log('4️⃣ Insertando usuario administrador...');
    const [result] = await pool.query(
      `INSERT INTO adopters (
        first_name, last_name, dni, email, password, phone, address, role
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        'Administrador',
        'Sistema',
        '00000000',
        'admin@municipio.gob.pe',
        hashedPassword,
        '999999999',
        'Municipalidad Provincial de Puno',
        'admin'
      ]
    );
    console.log('✅ Usuario administrador creado con ID:', result.insertId, '\n');

    // Verificar
    console.log('5️⃣ Verificando usuario creado...');
    const [users] = await pool.query(
      'SELECT id, first_name, last_name, email, role, created_at FROM adopters WHERE email = ?',
      ['admin@municipio.gob.pe']
    );
    
    if (users.length > 0) {
      console.log('✅ Usuario administrador verificado:\n');
      console.log('   📧 Email:', users[0].email);
      console.log('   👤 Nombre:', users[0].first_name, users[0].last_name);
      console.log('   🔑 Rol:', users[0].role);
      console.log('   📅 Creado:', users[0].created_at);
      console.log('\n✨ ¡Usuario administrador creado exitosamente!');
      console.log('\n🔐 Credenciales de acceso:');
      console.log('   Email: admin@municipio.gob.pe');
      console.log('   Password: Admin@2024\n');
    } else {
      console.log('❌ Error: No se pudo verificar el usuario');
    }

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al crear usuario administrador:', error.message);
    console.error(error);
    await pool.end();
    process.exit(1);
  }
}

createAdmin();
