#!/usr/bin/env node

/**
 * Script para eliminar console.log temporales del código
 * 
 * Elimina logs de debug como:
 * - console.log('=== ...')
 * - console.log('📍 ...')
 * - console.log('🔍 ...')
 * 
 * Uso:
 *   node scripts/remove-debug-logs.js [--dry-run]
 */

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');

console.log('\n🧹 Eliminando console.log temporales\n');
console.log('━'.repeat(60));

if (dryRun) {
  console.log('⚠️  MODO DRY-RUN: No se modificarán archivos\n');
}

function removeDebugLogs(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  const debugPatterns = [
    /^\s*console\.log\('===.*?\);?\s*$/,
    /^\s*console\.log\('📍.*?\);?\s*$/,
    /^\s*console\.log\('🔍.*?\);?\s*$/,
    /^\s*console\.log\("===.*?\);?\s*$/,
    /^\s*console\.log\("📍.*?\);?\s*$/,
    /^\s*console\.log\("🔍.*?\);?\s*$/,
    /^\s*\/\/ LOG TEMPORAL.*$/
  ];
  
  let removedCount = 0;
  const newLines = [];
  let skipNext = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (skipNext) {
      skipNext = false;
      continue;
    }
    
    let isDebugLog = false;
    for (const pattern of debugPatterns) {
      if (pattern.test(line)) {
        isDebugLog = true;
        removedCount++;
        
        // Si la línea empieza con console.log y tiene múltiples líneas
        if (line.includes('console.log') && !line.includes(');')) {
          skipNext = true;
        }
        
        console.log(`  🗑️  Línea ${i + 1}: ${line.trim()}`);
        break;
      }
    }
    
    if (!isDebugLog) {
      newLines.push(line);
    }
  }
  
  if (removedCount > 0) {
    const newContent = newLines.join('\n');
    
    if (!dryRun) {
      // Crear backup
      fs.writeFileSync(filePath + '.backup', content);
      fs.writeFileSync(filePath, newContent);
      console.log(`\n  ✅ Eliminados ${removedCount} console.log`);
      console.log(`  💾 Backup creado: ${path.basename(filePath)}.backup`);
    } else {
      console.log(`\n  🔍 Se eliminarían ${removedCount} console.log`);
    }
  } else {
    console.log(`  ✅ No se encontraron console.log temporales`);
  }
  
  return removedCount;
}

// Procesar index.js
const indexPath = path.join(__dirname, '../index.js');
console.log('\n📄 Procesando index.js:\n');
const indexRemoved = removeDebugLogs(indexPath);

// Procesar otros archivos si es necesario
const routesDir = path.join(__dirname, '../routes');
if (fs.existsSync(routesDir)) {
  const routeFiles = fs.readdirSync(routesDir).filter(f => f.endsWith('.js'));
  
  let totalRemoved = indexRemoved;
  
  routeFiles.forEach(file => {
    const filePath = path.join(routesDir, file);
    console.log(`\n📄 Procesando routes/${file}:\n`);
    totalRemoved += removeDebugLogs(filePath);
  });
  
  console.log('\n━'.repeat(60));
  console.log(`\n📊 Total console.log eliminados: ${totalRemoved}\n`);
  
  if (!dryRun && totalRemoved > 0) {
    console.log('💡 Los archivos originales se guardaron con extensión .backup');
    console.log('💡 Si algo sale mal, puedes restaurarlos');
  }
}

console.log('\n✅ Proceso completado\n');
