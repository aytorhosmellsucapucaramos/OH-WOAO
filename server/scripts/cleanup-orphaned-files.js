#!/usr/bin/env node

/**
 * Script para limpiar archivos huérfanos en /uploads
 * 
 * Archivos huérfanos = archivos que existen en disco pero no están
 * referenciados en la base de datos
 * 
 * Uso:
 *   node scripts/cleanup-orphaned-files.js [--dry-run] [--older-than-days=7]
 * 
 * Opciones:
 *   --dry-run: Muestra qué archivos se eliminarían sin eliminarlos
 *   --older-than-days=N: Solo elimina archivos más antiguos que N días (default: 7)
 */

const fs = require('fs');
const path = require('path');
const { pool } = require('../config/database');

// Parsear argumentos
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const olderThanMatch = args.find(arg => arg.startsWith('--older-than-days='));
const olderThanDays = olderThanMatch ? parseInt(olderThanMatch.split('=')[1]) : 7;

console.log('\n🧹 Limpieza de Archivos Huérfanos\n');
console.log('━'.repeat(60));

if (dryRun) {
  console.log('⚠️  MODO DRY-RUN: No se eliminarán archivos\n');
}

async function getReferencedFiles() {
  const connection = await pool.getConnection();
  
  try {
    // Obtener todos los archivos referenciados en la BD
    
    // Tabla pet_documents - fotos y QR del carnet
    const [petDocs] = await connection.query(`
      SELECT 
        photo_frontal_path,
        photo_posterior_path,
        qr_code_path
      FROM pet_documents
    `);
    
    // Tabla adopters - fotos de perfil y DNI
    const [adopters] = await connection.query(`
      SELECT 
        dni_photo_path,
        photo_path
      FROM adopters
    `);
    
    // Tabla pet_health_records - documentos médicos
    const [health] = await connection.query(`
      SELECT 
        vaccination_card_path,
        rabies_vaccine_path
      FROM pet_health_records
    `);
    
    // Tabla stray_reports - fotos de reportes de callejeros
    const [strayReports] = await connection.query(`
      SELECT photo_path
      FROM stray_reports
    `);
    
    // Extraer nombres de archivo
    const referencedFiles = new Set();
    
    const addFile = (filePath) => {
      if (filePath) {
        const fileName = path.basename(filePath);
        referencedFiles.add(fileName);
      }
    };
    
    // Documentos de mascotas (carnets)
    petDocs.forEach(doc => {
      addFile(doc.photo_frontal_path);
      addFile(doc.photo_posterior_path);
      addFile(doc.qr_code_path);
    });
    
    // Documentos de adoptantes
    adopters.forEach(adopter => {
      addFile(adopter.dni_photo_path);
      addFile(adopter.photo_path);
    });
    
    // Documentos médicos
    health.forEach(h => {
      addFile(h.vaccination_card_path);
      addFile(h.rabies_vaccine_path);
    });
    
    // Fotos de reportes
    strayReports.forEach(report => {
      addFile(report.photo_path);
    });
    
    return referencedFiles;
    
  } finally {
    connection.release();
  }
}

function getFileAgeInDays(filePath) {
  const stats = fs.statSync(filePath);
  const now = Date.now();
  const fileTime = stats.mtimeMs;
  const ageInMs = now - fileTime;
  return ageInMs / (1000 * 60 * 60 * 24);
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

async function cleanupOrphanedFiles() {
  const uploadsDir = path.join(__dirname, '../uploads');
  
  if (!fs.existsSync(uploadsDir)) {
    console.log('❌ Directorio uploads no existe');
    return;
  }
  
  console.log(`📂 Escaneando directorio: ${uploadsDir}\n`);
  
  // Obtener archivos referenciados en BD
  const referencedFiles = await getReferencedFiles();
  console.log(`✅ Archivos referenciados en BD: ${referencedFiles.size}\n`);
  
  // Leer archivos en disco
  const filesOnDisk = fs.readdirSync(uploadsDir);
  
  // Filtrar solo archivos (no subdirectorios)
  const actualFiles = filesOnDisk.filter(file => {
    const filePath = path.join(uploadsDir, file);
    return fs.statSync(filePath).isFile();
  });
  
  console.log(`📁 Archivos en disco: ${actualFiles.length}\n`);
  
  // Encontrar huérfanos
  const orphanedFiles = actualFiles.filter(file => !referencedFiles.has(file));
  
  if (orphanedFiles.length === 0) {
    console.log('✅ No se encontraron archivos huérfanos\n');
    await pool.end();
    return;
  }
  
  console.log(`🗑️  Archivos huérfanos encontrados: ${orphanedFiles.length}\n`);
  console.log('━'.repeat(60));
  
  let totalSize = 0;
  let deletedCount = 0;
  let skippedCount = 0;
  
  orphanedFiles.forEach(file => {
    const filePath = path.join(uploadsDir, file);
    const stats = fs.statSync(filePath);
    const ageInDays = getFileAgeInDays(filePath);
    const size = stats.size;
    totalSize += size;
    
    // Solo procesar archivos más antiguos que el umbral
    if (ageInDays < olderThanDays) {
      skippedCount++;
      return;
    }
    
    console.log(`  📄 ${file}`);
    console.log(`     Tamaño: ${formatBytes(size)} | Antigüedad: ${Math.round(ageInDays)} días`);
    
    if (!dryRun) {
      try {
        fs.unlinkSync(filePath);
        console.log(`     ✅ Eliminado`);
        deletedCount++;
      } catch (error) {
        console.log(`     ❌ Error al eliminar: ${error.message}`);
      }
    } else {
      console.log(`     🔍 Se eliminaría (dry-run)`);
      deletedCount++;
    }
    
    console.log('');
  });
  
  console.log('━'.repeat(60));
  console.log('\n📊 Resumen:');
  console.log(`   Archivos huérfanos: ${orphanedFiles.length}`);
  console.log(`   Más antiguos que ${olderThanDays} días: ${deletedCount + (dryRun ? 0 : 0)}`);
  console.log(`   Omitidos (muy recientes): ${skippedCount}`);
  
  if (dryRun) {
    console.log(`   Se eliminarían: ${deletedCount}`);
    console.log(`   Espacio a liberar: ${formatBytes(totalSize)}`);
  } else {
    console.log(`   Eliminados: ${deletedCount}`);
    console.log(`   Espacio liberado: ${formatBytes(totalSize)}`);
  }
  
  console.log('\n✅ Limpieza completada\n');
  
  await pool.end();
}

// Ejecutar
cleanupOrphanedFiles().catch(error => {
  console.error('\n❌ Error durante la limpieza:', error);
  pool.end();
  process.exit(1);
});
