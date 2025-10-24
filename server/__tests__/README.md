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

### Variables de Entorno para Tests

Los tests usan variables de entorno especiales definidas en `setup.js`:
- `NODE_ENV=test`
- `JWT_SECRET` de prueba (no usar en producción)
- `DB_NAME=pets_db_test` (base de datos separada)

## Estado Actual

### ✅ Implementado
- Estructura básica de tests
- Configuración de Jest
- Setup global
- Smoke tests placeholders

### 🚧 Pendiente (después de refactorización)
- Tests reales de endpoints
- Tests de autenticación
- Tests de registro de mascotas
- Tests de búsqueda
- Tests de reportes de callejeros
- Tests de integración completos

## Próximos Pasos

1. **Refactorizar index.js** para que exporte `app`
2. **Activar smoke tests** reales
3. **Agregar tests de integración** completos
4. **Alcanzar 70%+ de cobertura**

## Notas Importantes

⚠️ **Los smoke tests actuales son PLACEHOLDERS**

Están diseñados para:
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
