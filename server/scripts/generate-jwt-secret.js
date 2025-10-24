#!/usr/bin/env node

/**
 * Script para generar un JWT_SECRET seguro
 * 
 * Uso:
 *   node scripts/generate-jwt-secret.js
 * 
 * El script genera un JWT_SECRET de 64 bytes (128 caracteres hex)
 * y lo muestra en pantalla para que lo copies al archivo .env
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

console.log('\n🔐 Generador de JWT_SECRET Seguro\n');
console.log('━'.repeat(60));

// Generar JWT_SECRET
const jwtSecret = crypto.randomBytes(64).toString('hex');

console.log('\n✅ JWT_SECRET generado exitosamente:\n');
console.log(`JWT_SECRET=${jwtSecret}\n`);
console.log('━'.repeat(60));

// Verificar si existe archivo .env
const envPath = path.join(__dirname, '../.env');
const envExamplePath = path.join(__dirname, '../.env.example');

if (!fs.existsSync(envPath)) {
  console.log('\n⚠️  El archivo .env no existe.');
  
  if (fs.existsSync(envExamplePath)) {
    console.log('📋 Creando .env desde .env.example...\n');
    
    try {
      // Leer .env.example
      let envContent = fs.readFileSync(envExamplePath, 'utf8');
      
      // Reemplazar el JWT_SECRET placeholder
      envContent = envContent.replace(
        /JWT_SECRET=.*/,
        `JWT_SECRET=${jwtSecret}`
      );
      
      // Escribir .env
      fs.writeFileSync(envPath, envContent);
      
      console.log('✅ Archivo .env creado con JWT_SECRET configurado.');
      console.log('⚠️  IMPORTANTE: Revisa y actualiza las demás variables en .env\n');
    } catch (error) {
      console.error('❌ Error al crear .env:', error.message);
      console.log('\n📝 Copia manualmente el JWT_SECRET de arriba a tu archivo .env\n');
    }
  } else {
    console.log('📝 Copia el JWT_SECRET de arriba y créalo en tu archivo .env\n');
  }
} else {
  console.log('\n📝 Instrucciones:');
  console.log('1. Abre el archivo server/.env');
  console.log('2. Busca la línea JWT_SECRET=...');
  console.log('3. Reemplázala con el JWT_SECRET generado arriba');
  console.log('4. Guarda el archivo');
  console.log('5. Reinicia el servidor\n');
}

console.log('━'.repeat(60));
console.log('\n⚠️  IMPORTANTE: NUNCA compartas tu JWT_SECRET públicamente');
console.log('⚠️  IMPORTANTE: NO subas el archivo .env a Git\n');
