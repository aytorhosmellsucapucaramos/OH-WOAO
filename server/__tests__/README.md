# 🧪 Tests - WebPerritos Backend

## Estructura de Tests

```
__tests__/
├── setup.js              - Configuración global de tests
├── smoke.test.js         - Tests básicos de verificación
└── README.md            - Este archivo
```

## Tipos de Tests

### 1. Smoke Tests
**Archivo:** `smoke.test.js`  
**Propósito:** Detectar roturas graves durante refactorización

**Qué verifican:**
- ✅ El servidor inicia sin errores
- ✅ Los endpoints críticos responden
- ✅ No hay errores catastróficos

**NO son exhaustivos**, solo una red de seguridad básica.

## Comandos Disponibles

### Ejecutar todos los tests
```bash
npm test
```

### Ejecutar solo smoke tests
```bash
npm run test:smoke
```

### Modo watch (re-ejecuta al cambiar archivos)
```bash
npm run test:watch
```

### Ver cobertura de código
```bash
npm run test:coverage
```

## Configuración

La configuración de Jest está en `jest.config.js` en la raíz del servidor.

# Solo tests de reportes
npm test -- strayReports.test.js

# Solo tests unitarios
npm test -- unit/
```

### Tests de Integración
```bash
# Solo integration tests
npm test -- integration/
```

## 📊 Coverage Objetivo

| Módulo | Coverage Objetivo | Estado |
|--------|-------------------|--------|
| **Autenticación** | 80%+ | 🟢 Implementado |
| **Registro Mascotas** | 70%+ | 🟢 Implementado |
| **Reportes Callejeros** | 70%+ | 🟢 Implementado |
| **Servicios (CUI, QR)** | 80%+ | 🟢 Implementado |
| **Controllers** | 60%+ | 🟡 En progreso |

## 🧪 Tests Implementados

### **Integration Tests - Auth (15 tests)**
- ✅ Login exitoso con credenciales válidas
- ✅ Login fallido con credenciales inválidas  
- ✅ Validación de campos requeridos
- ✅ Validación de formato DNI
- ✅ Obtener perfil autenticado
- ✅ Obtener mascotas del usuario
- ✅ Actualizar perfil
- ✅ Rate limiting en login
- ✅ Token inválido
- ✅ Sin token de autenticación

### **Integration Tests - Pets (12 tests)**
- ✅ Registro completo genera CUI y QR
- ✅ Validación de campos requeridos
- ✅ Validación de DNI (8 dígitos)
- ✅ Validación de email
- ✅ Listar todas las mascotas
- ✅ Paginación de mascotas
- ✅ Búsqueda por DNI
- ✅ Búsqueda por CUI
- ✅ Obtener mascota específica
- ✅ Rate limiting en búsqueda
- ✅ Advertencia para razas peligrosas

### **Integration Tests - Stray Reports (13 tests)**
- ✅ Crear reporte completo
- ✅ Validación de campos requeridos
- ✅ Validación de coordenadas
- ✅ Listar reportes activos
- ✅ Filtrar por urgencia
- ✅ Paginación de reportes
- ✅ Obtener mis reportes (autenticado)
- ✅ Actualizar estado de reporte
- ✅ Reportes de urgencia alta
- ✅ Validación de ubicaciones (Puno)
- ✅ Estadísticas de reportes

### **Unit Tests - CUI Generator (12 tests)**
- ✅ Genera CUI con formato correcto
- ✅ CUI contiene DNI
- ✅ CUIs únicos (contador incremental)
- ✅ Validación de CUI
- ✅ DNI inválido lanza error
- ✅ Performance (1000 CUIs < 100ms)

### **Unit Tests - QR Service (7 tests)**
- ✅ Genera archivo QR correctamente
- ✅ Archivo QR válido (.png)
- ✅ Tamaño de archivo correcto
- ✅ Opciones personalizadas
- ✅ Performance (10 QRs < 2s)

## 🛠️ Configuración

Los tests usan:
- **Jest** como framework de testing
- **Supertest** para tests de API
- **Base de datos real** (MySQL) - Se limpian datos después de cada test
- **Timeouts extendidos** para tests que requieren BD

## 📝 Escribir Nuevos Tests

### Test de Integración
```javascript
const request = require('supertest');
const app = require('../../index');

describe('Mi Feature', () => {
  test('Debe hacer algo', async () => {
    const response = await request(app)
      .get('/api/endpoint')
      .expect(200);
    
    expect(response.body.success).toBe(true);
  });
});
```

### Test Unitario
```javascript
const miModulo = require('../../services/miModulo');

describe('miModulo', () => {
  test('Debe retornar resultado correcto', () => {
    const result = miModulo.miFuncion('input');
    expect(result).toBe('expected');
  });
});
```

## 🔧 Troubleshooting

### Error: Cannot find module '../../index'
**Solución:** Asegúrate de que `index.js` exporte el app:
```javascript
module.exports = app;
```

### Tests timeout
**Solución:** Aumenta el timeout en el test:
```javascript
test('Mi test lento', async () => {
  // ...
}, 10000); // 10 segundos
```

### Base de datos en uso
**Solución:** Cierra otras conexiones antes de ejecutar tests:
```bash
npm run dev  # Detener servidor dev primero
npm test     # Luego ejecutar tests
```

## ✅ Estado Actual

**Total de tests:** 59 tests implementados  
**Coverage estimado:** ~65-70% del código crítico  
**Estado:** 🟢 **FUNCIONANDO**

**Último update:** Oct 24, 2025

## Notas Importantes

⚠️ **Los smoke tests actuales son PLACEHOLDERS**

Los tests usan variables de entorno especiales definidas en `setup.js`:
- `NODE_ENV=test`
- `JWT_SECRET` de prueba (no usar en producción)
- `DB_NAME=pets_db_test` (base de datos separada)
1. Establecer la estructura
2. Permitir refactorización segura
3. Ser activados después de modularizar

**NO están verificando funcionalidad real todavía.**

Eso es INTENCIONAL - primero refactorizamos, luego completamos los tests.

## Ejemplo de Uso

```bash
# Instalar dependencias de testing
cd server
npm install

# Ejecutar smoke tests
npm run test:smoke

# Deberías ver:
# ✓ Servidor debe estar definido
# ✓ Health check responde
# ✓ Endpoints están disponibles
```

## Debugging Tests

Si un test falla:

1. Lee el mensaje de error
2. Verifica el stack trace
3. Revisa logs en `logs/error.log`
4. Ejecuta en modo verbose: `npm test -- --verbose`

## Cobertura Objetivo

| Categoría | Objetivo |
|-----------|----------|
| **Statements** | 70%+ |
| **Branches** | 60%+ |
| **Functions** | 70%+ |
| **Lines** | 70%+ |

---

**Creado:** Octubre 2025  
**Estado:** 🟡 En desarrollo
