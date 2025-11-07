/**
 * Script para agregar razas peligrosas faltantes a la BD
 * Ejecutar: node scripts/add-dangerous-breeds.js
 */

const { pool } = require('../config/database');

const DANGEROUS_BREEDS_TO_ADD = [
  {
    name: 'Dogo Argentino',
    description: 'Raza potencialmente peligrosa - Requiere pago adicional en municipalidad'
  },
  {
    name: 'Fila Brasilero',
    description: 'Raza potencialmente peligrosa - Requiere pago adicional en municipalidad'
  },
  {
    name: 'Tosa Japonesa',
    description: 'Raza potencialmente peligrosa - Requiere pago adicional en municipalidad'
  },
  {
    name: 'Bull Mastiff',
    description: 'Raza potencialmente peligrosa - Requiere pago adicional en municipalidad'
  },
  {
    name: 'Doberman',
    description: 'Raza potencialmente peligrosa - Requiere pago adicional en municipalidad'
  }
];

async function addDangerousBreeds() {
  console.log('🐕 Agregando razas peligrosas faltantes...\n');
  
  try {
    let added = 0;
    let existing = 0;

    for (const breed of DANGEROUS_BREEDS_TO_ADD) {
      // Verificar si ya existe
      const [existingBreeds] = await pool.query(
        'SELECT id FROM breeds WHERE name = ?',
        [breed.name]
      );

      if (existingBreeds.length > 0) {
        console.log(`⏭️  "${breed.name}" ya existe (ID: ${existingBreeds[0].id})`);
        existing++;
      } else {
        // Insertar nueva raza
        const [result] = await pool.query(
          'INSERT INTO breeds (name, description, active) VALUES (?, ?, ?)',
          [breed.name, breed.description, 1]
        );
        console.log(`✅ "${breed.name}" agregada (ID: ${result.insertId})`);
        added++;
      }
    }

    console.log('\n📊 Resumen:');
    console.log(`   ✅ Razas agregadas: ${added}`);
    console.log(`   ⏭️  Razas existentes: ${existing}`);

    // Actualizar descripción de razas peligrosas existentes
    console.log('\n🔄 Actualizando descripción de razas peligrosas existentes...');
    
    const existingDangerous = ['Pitbull', 'American Pit Bull Terrier', 'Rottweiler'];
    for (const breedName of existingDangerous) {
      const [breeds] = await pool.query(
        'SELECT id, description FROM breeds WHERE name = ?',
        [breedName]
      );

      if (breeds.length > 0) {
        const currentDesc = breeds[0].description || '';
        if (!currentDesc.includes('potencialmente peligrosa')) {
          const newDesc = currentDesc 
            ? `${currentDesc} - Raza potencialmente peligrosa - Requiere pago adicional`
            : 'Raza potencialmente peligrosa - Requiere pago adicional en municipalidad';
          
          await pool.query(
            'UPDATE breeds SET description = ? WHERE id = ?',
            [newDesc, breeds[0].id]
          );
          console.log(`   ✅ "${breedName}" actualizada`);
        }
      }
    }

    // Mostrar todas las razas peligrosas
    console.log('\n🔴 Lista completa de razas peligrosas en la BD:');
    const [dangerousBreeds] = await pool.query(`
      SELECT id, name, description, active 
      FROM breeds 
      WHERE name IN (
        'Pitbull',
        'American Pit Bull Terrier',
        'Dogo Argentino',
        'Fila Brasilero',
        'Tosa Japonesa',
        'Bull Mastiff',
        'Doberman',
        'Rottweiler'
      )
      ORDER BY name
    `);

    dangerousBreeds.forEach(breed => {
      console.log(`   🐕 ${breed.name} (ID: ${breed.id})`);
    });

    console.log('\n✨ ¡Proceso completado!\n');

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    await pool.end();
    process.exit(1);
  }
}

addDangerousBreeds();
