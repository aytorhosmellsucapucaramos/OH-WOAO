/**
 * SCRIPT DE LIMPIEZA DE ARCHIVOS HUÉRFANOS
 * 
 * Este script identifica y opcionalmente elimina archivos en /uploads
 * que ya no tienen referencias en la base de datos.
 * 
 * Uso:
 *   node cleanup_orphaned_files.js --dry-run   (solo listar, no eliminar)
 *   node cleanup_orphaned_files.js --delete    (eliminar archivos huérfanos)
 */

const fs = require('fs');
const path = require('path');
const { pool } = require('./config/database');

const UPLOADS_DIR = path.join(__dirname, 'uploads');

async function getAllFilesFromDB() {
  const connection = await pool.getConnection();
  
  try {
    const allFiles = new Set();
    
    // 1. Archivos de mascotas (documentos)
    const [petDocs] = await connection.query(`
      SELECT photo_frontal_path, photo_posterior_path, qr_code_path
      FROM pet_documents
    `);
    
    petDocs.forEach(doc => {
      if (doc.photo_frontal_path) allFiles.add(doc.photo_frontal_path);
      if (doc.photo_posterior_path) allFiles.add(doc.photo_posterior_path);
      if (doc.qr_code_path) allFiles.add(doc.qr_code_path);
    });
    
    // 2. Archivos de salud (vacunas)
    const [healthRecords] = await connection.query(`
      SELECT vaccination_card_path, rabies_vaccine_path
      FROM pet_health_records
    `);
    
    healthRecords.forEach(record => {
      if (record.vaccination_card_path) allFiles.add(record.vaccination_card_path);
      if (record.rabies_vaccine_path) allFiles.add(record.rabies_vaccine_path);
    });
    
    // 3. DNI de adoptantes
    const [adopters] = await connection.query(`
      SELECT dni_photo_path, photo_path
      FROM adopters
    `);
    
    adopters.forEach(adopter => {
      if (adopter.dni_photo_path) allFiles.add(adopter.dni_photo_path);
      if (adopter.photo_path) allFiles.add(adopter.photo_path);
    });
    
    // 4. Fotos de reportes de callejeros
    const [strayReports] = await connection.query(`
      SELECT photo_path
      FROM stray_reports
    `);
    
    strayReports.forEach(report => {
      if (report.photo_path) allFiles.add(report.photo_path);
    });
    
    console.log(`📊 Total de archivos referenciados en BD: ${allFiles.size}`);
    return allFiles;
    
  } finally {
    connection.release();
  }
}

function getAllFilesFromDisk() {
  if (!fs.existsSync(UPLOADS_DIR)) {
    console.log('⚠️  Carpeta uploads no existe');
    return [];
  }
  
  const files = fs.readdirSync(UPLOADS_DIR);
  console.log(`📂 Total de archivos en disco: ${files.length}`);
  return files;
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

async function cleanupOrphanedFiles(deleteFiles = false) {
  console.log('\n🧹 INICIANDO LIMPIEZA DE ARCHIVOS HUÉRFANOS\n');
  console.log('=' .repeat(60));
  
  try {
    // Obtener archivos de BD
    const filesInDB = await getAllFilesFromDB();
    
    // Obtener archivos de disco
    const filesOnDisk = getAllFilesFromDisk();
    
    // Encontrar archivos huérfanos (en disco pero no en BD)
    const orphanedFiles = [];
    let totalOrphanedSize = 0;
    
    for (const file of filesOnDisk) {
      if (!filesInDB.has(file)) {
        const filePath = path.join(UPLOADS_DIR, file);
        const stats = fs.statSync(filePath);
        
        orphanedFiles.push({
          name: file,
          size: stats.size,
          path: filePath
        });
        
        totalOrphanedSize += stats.size;
      }
    }
    
    console.log('\n📋 RESUMEN:\n');
    console.log(`✅ Archivos válidos (en BD): ${filesInDB.size}`);
    console.log(`❌ Archivos huérfanos (sin referencia): ${orphanedFiles.length}`);
    console.log(`💾 Espacio ocupado por huérfanos: ${formatBytes(totalOrphanedSize)}\n`);
    
    if (orphanedFiles.length === 0) {
      console.log('🎉 ¡No hay archivos huérfanos! Todo limpio.\n');
      return;
    }
    
    // Mostrar archivos huérfanos
    console.log('🗑️  ARCHIVOS HUÉRFANOS ENCONTRADOS:\n');
    orphanedFiles.forEach((file, index) => {
      console.log(`${index + 1}. ${file.name} (${formatBytes(file.size)})`);
    });
    
    // Eliminar si se solicita
    if (deleteFiles) {
      console.log('\n⚠️  ELIMINANDO ARCHIVOS HUÉRFANOS...\n');
      
      let deletedCount = 0;
      let deletedSize = 0;
      
      for (const file of orphanedFiles) {
        try {
          fs.unlinkSync(file.path);
          deletedCount++;
          deletedSize += file.size;
          console.log(`✅ Eliminado: ${file.name}`);
        } catch (err) {
          console.error(`❌ Error al eliminar ${file.name}:`, err.message);
        }
      }
      
      console.log(`\n🎉 LIMPIEZA COMPLETADA:`);
      console.log(`   - Archivos eliminados: ${deletedCount}/${orphanedFiles.length}`);
      console.log(`   - Espacio liberado: ${formatBytes(deletedSize)}\n`);
    } else {
      console.log('\n💡 Para eliminar estos archivos, ejecuta:');
      console.log('   node cleanup_orphaned_files.js --delete\n');
    }
    
  } catch (error) {
    console.error('❌ Error durante la limpieza:', error.message);
  } finally {
    process.exit(0);
  }
}

// Ejecutar
const args = process.argv.slice(2);
const shouldDelete = args.includes('--delete');

if (args.includes('--help')) {
  console.log(`
Uso: node cleanup_orphaned_files.js [opción]

Opciones:
  --dry-run    Listar archivos huérfanos sin eliminar (por defecto)
  --delete     Eliminar archivos huérfanos
  --help       Mostrar esta ayuda

Ejemplos:
  node cleanup_orphaned_files.js
  node cleanup_orphaned_files.js --delete
  `);
  process.exit(0);
}

cleanupOrphanedFiles(shouldDelete);
