#!/usr/bin/env node

/**
 * Script para organizar y limpiar la estructura del proyecto
 * 
 * Acciones:
 * 1. Mover scripts sueltos a /scripts
 * 2. Identificar archivos duplicados o obsoletos
 * 3. Limpiar console.log temporales del código
 */

const fs = require('fs');
const path = require('path');

console.log('\n🧹 Organizando Estructura del Proyecto\n');
console.log('━'.repeat(60));

const rootDir = path.join(__dirname, '..');
const scriptsDir = __dirname;

// Archivos a mover a /scripts
const filesToMove = [
  'cleanup_orphaned_files.js',
  'fix_view.js', 
  'update_views.js'
];

console.log('\n📦 Moviendo scripts a /scripts:\n');

let movedCount = 0;
filesToMove.forEach(file => {
  const sourcePath = path.join(rootDir, file);
  const destPath = path.join(scriptsDir, file);
  
  if (fs.existsSync(sourcePath)) {
    try {
      // Si ya existe en destino, hacer backup
      if (fs.existsSync(destPath)) {
        fs.renameSync(destPath, destPath + '.backup');
        console.log(`  ⚠️  Backup creado: ${file}.backup`);
      }
      
      fs.renameSync(sourcePath, destPath);
      console.log(`  ✅ Movido: ${file} → scripts/`);
      movedCount++;
    } catch (error) {
      console.log(`  ❌ Error moviendo ${file}: ${error.message}`);
    }
  } else {
    console.log(`  ⏭️  Omitido: ${file} (no existe)`);
  }
});

console.log(`\n📊 Archivos movidos: ${movedCount}`);

// Buscar console.log temporales en index.js
console.log('\n🔍 Buscando console.log temporales en código:\n');

const indexPath = path.join(rootDir, 'index.js');
if (fs.existsSync(indexPath)) {
  const content = fs.readFileSync(indexPath, 'utf8');
  const lines = content.split('\n');
  
  const debugLogs = [];
  lines.forEach((line, index) => {
    if (line.includes('console.log') && 
        (line.includes('===') || 
         line.includes('🔍') || 
         line.includes('📍') ||
         line.includes('Datos del endpoint'))) {
      debugLogs.push({
        lineNumber: index + 1,
        content: line.trim()
      });
    }
  });
  
  if (debugLogs.length > 0) {
    console.log(`  ⚠️  Encontrados ${debugLogs.length} console.log temporales en index.js:\n`);
    debugLogs.forEach(log => {
      console.log(`     Línea ${log.lineNumber}: ${log.content}`);
    });
    console.log('\n  💡 Considera reemplazarlos con logger.info() o eliminarlos\n');
  } else {
    console.log('  ✅ No se encontraron console.log temporales\n');
  }
}

// Listar archivos en uploads
const uploadsDir = path.join(rootDir, 'uploads');
if (fs.existsSync(uploadsDir)) {
  const files = fs.readdirSync(uploadsDir);
  const fileCount = files.filter(f => {
    const filePath = path.join(uploadsDir, f);
    return fs.statSync(filePath).isFile();
  }).length;
  
  console.log(`📂 Archivos en /uploads: ${fileCount}`);
  console.log(`   💡 Ejecuta 'npm run cleanup:dry-run' para ver archivos huérfanos\n`);
}

console.log('━'.repeat(60));
console.log('\n✅ Organización completada\n');
