# 🧪 CÓMO EJECUTAR LOS TESTS

## ⚠️ PREPARACIÓN (Primera vez)

### 1. Detener el Servidor de Desarrollo
```bash
# Si tienes el servidor corriendo, deténlo primero (Ctrl+C)
# Los tests necesitan usar el mismo puerto
```

### 2. Opción A: Usar la Misma Base de Datos (Más Simple)
**Recomendado para desarrollo**

Los tests usarán tu base de datos actual `pets_db` y limpiarán los datos de prueba automáticamente.

```bash
# No necesitas hacer nada, los tests funcionarán con la BD actual
npm test
```

### 2. Opción B: Crear Base de Datos Separada para Tests
**Recomendado para producción**

```sql
-- En MySQL Workbench o terminal:
CREATE DATABASE pets_db_test;
USE pets_db_test;

-- Copiar estructura desde pets_db
-- (Exporta e importa el schema, o ejecuta el script de creación)
```

Luego actualiza `.env` (o crea `.env.test`):
```env
DB_NAME=pets_db_test
```

---

## 🚀 EJECUTAR TESTS

### Todos los Tests
```bash
cd server
npm test
```

**Salida esperada:**
```
Test Suites: 6 passed, 6 total
Tests:       59 passed, 59 total
Time:        15-20s
```

### Tests Específicos
```bash
# Solo autenticación (15 tests)
npm test -- auth.test.js

# Solo mascotas (12 tests)
npm test -- pets.test.js

# Solo reportes (13 tests)
npm test -- strayReports.test.js

# Solo unitarios (19 tests)
npm test -- unit/

# Solo integración (40 tests)
npm test -- integration/
```

### Coverage Report
```bash
npm run test:coverage

# Ver el report en el navegador
# open coverage/lcov-report/index.html  # Mac
# start coverage/lcov-report/index.html # Windows
```

---

## 🔧 TROUBLESHOOTING

### ❌ Error: "EADDRINUSE: address already in use :::5000"

**Causa:** El servidor de desarrollo está corriendo.

**Solución:**
```bash
# Detén el servidor dev (Ctrl+C en la terminal del servidor)
# Luego ejecuta los tests
npm test
```

### ❌ Error: "Unknown database 'pets_db_test'"

**Causa:** Base de datos de tests no existe.

**Solución:**
1. Usar la misma BD (más fácil):
   ```bash
   # Los tests usarán pets_db automáticamente
   npm test
   ```

2. O crear BD separada:
   ```sql
   CREATE DATABASE pets_db_test;
   ```

### ❌ Error: "Cannot find module '../../index'"

**Causa:** index.js no exporta el app.

**Solución:** Ya está arreglado. Verifica que al final de `index.js` esté:
```javascript
module.exports = app;
```

### ❌ Tests timeout después de 5 segundos

**Causa:** Base de datos lenta o no responde.

**Solución:**
1. Verifica que MySQL esté corriendo
2. Verifica credenciales en `.env`
3. Aumenta timeout si es necesario:
   ```javascript
   test('Mi test', async () => {
     // ...
   }, 10000); // 10 segundos
   ```

### ❌ "jest: command not found"

**Causa:** Jest no está instalado.

**Solución:**
```bash
npm install
```

---

## 📊 INTERPRETANDO RESULTADOS

### ✅ Test Pasó
```
✓ Login exitoso con credenciales válidas (125 ms)
```
Todo bien, el test funciona correctamente.

### ❌ Test Falló
```
✕ Login exitoso con credenciales válidas (125 ms)

  Expected: 200
  Received: 401
```
Hay un problema en el código que necesita ser arreglado.

### ⏭ Test Saltado
```
○ skipped Test no implementado
```
El test está marcado con `.skip()` o `.todo()`.

---

## 🎯 EJEMPLOS DE USO

### Ver solo errores
```bash
npm test -- --silent
```

### Modo watch (re-ejecuta al cambiar archivos)
```bash
npm run test:watch
```

### Ejecutar un test específico
```bash
npm test -- -t "Login exitoso"
```

### Actualizar snapshots
```bash
npm test -- -u
```

---

## 💡 TIPS

### Durante Desarrollo
```bash
# Usa watch mode para desarrollo rápido
npm run test:watch

# Solo ejecuta tests relacionados a cambios
npm test -- --onlyChanged
```

### Antes de Commit
```bash
# Ejecuta todos los tests
npm test

# Verifica coverage
npm run test:coverage

# Debe estar > 70%
```

### En CI/CD
```bash
# Ejecuta con coverage y genera report
npm run test:coverage -- --ci --reporters=default --reporters=jest-junit
```

---

## ✅ CHECKLIST

Antes de ejecutar tests, verifica:

- [ ] Servidor dev detenido (Ctrl+C)
- [ ] MySQL corriendo
- [ ] Archivo `.env` configurado
- [ ] Dependencias instaladas (`npm install`)
- [ ] Base de datos existe (pets_db o pets_db_test)

---

## 🎉 RESULTADOS ESPERADOS

Si todo está bien configurado:

```
PASS  __tests__/integration/auth.test.js (8.2s)
PASS  __tests__/integration/pets.test.js (12.5s)
PASS  __tests__/integration/strayReports.test.js (10.3s)
PASS  __tests__/unit/services/cuiGenerator.test.js (2.1s)
PASS  __tests__/unit/services/qrService.test.js (3.8s)
PASS  __tests__/smoke.test.js (1.5s)

Test Suites: 6 passed, 6 total
Tests:       59 passed, 59 total
Snapshots:   0 total
Time:        38.4s

Coverage: 68.5% Statements
          71.2% Branches
          65.8% Functions
          69.1% Lines
```

**¡Éxito!** 🎉 Todos los tests pasaron.

---

## 📝 NOTA IMPORTANTE

**Los tests limpian automáticamente los datos de prueba** después de ejecutarse. No afectarán tus datos reales si usas `pets_db`.

**Datos creados durante tests:**
- Usuarios de prueba con DNI específicos (12345678, 55555555, etc.)
- Mascotas de prueba
- Reportes de prueba

**Todos son eliminados automáticamente** al finalizar cada test.
