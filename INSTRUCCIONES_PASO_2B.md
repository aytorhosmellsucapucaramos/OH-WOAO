# 📋 Instrucciones para implementar Paso 2B - Perfil de Comportamiento

## ✅ Cambios Implementados

Se ha agregado una nueva sección **"Perfil de Comportamiento"** al formulario de registro de mascotas con los siguientes campos:

1. **Temperamento** (Select dropdown)
   - Muy Sociable
   - Sociable
   - Reservado/Tímido
   - Territorial
   - Requiere Atención Especial

2. **Características Adicionales y Antecedentes** (Textarea)
   - Campo de texto libre (máx. 500 caracteres)
   - Para describir comportamientos, marcas físicas, miedos, etc.

---

## 🗄️ PASO 1: Ejecutar Migración de Base de Datos

### Opción A: phpMyAdmin (RECOMENDADO)

1. **Iniciar XAMPP** y arrancar MySQL
2. **Abrir phpMyAdmin**: http://localhost/phpmyadmin
3. **Seleccionar la base de datos** `pets_db` en el panel izquierdo
4. **Clic en la pestaña "SQL"** (arriba)
5. **Abrir el archivo**: `server/database/migration_add_temperament.sql`
6. **Copiar TODO el contenido** (Ctrl+A, Ctrl+C)
7. **Pegar en phpMyAdmin** (Ctrl+V)
8. **Clic en "Continuar"** o "Go"

### Opción B: Línea de comandos MySQL

```bash
# Navegar a la carpeta del proyecto
cd c:\Users\USUARIO\Downloads\webcanina1.2\webcanina\server\database

# Ejecutar la migración
mysql -u root -p pets_db < migration_add_temperament.sql

# O si no tienes contraseña:
mysql -u root pets_db < migration_add_temperament.sql
```

### ✅ Verificar que la migración fue exitosa

Ejecuta esta query en phpMyAdmin para verificar:

```sql
-- 1. Verificar que existe la columna temperament_id en pets
DESCRIBE pets;

-- 2. Ver los temperamentos insertados
SELECT * FROM temperaments;

-- 3. Debería mostrar 5 filas:
-- muy_sociable, sociable, reservado, territorial, requiere_atencion
```

---

## 🚀 PASO 2: Reiniciar el Servidor

```bash
# En la terminal del servidor (backend)
# Detener el servidor si está corriendo (Ctrl+C)
# Luego reiniciar:

cd server
npm start

# O si usas nodemon:
npm run dev
```

---

## 🎨 PASO 3: Verificar en el Frontend

No necesitas hacer nada especial en el frontend, los cambios ya están implementados.

1. **Abre el navegador** e ir a: http://localhost:3000/register
2. **Completa el formulario** hasta el paso de "Datos de la Mascota"
3. **Desplázate hacia abajo** después de los campos de vacunación
4. **Deberías ver la nueva sección**: 
   - 🐾 **Perfil de Comportamiento**
   - Campo de **Temperamento** (dropdown)
   - Campo de **Características Adicionales** (textarea grande)

---

## 📊 Estructura de la Base de Datos

### Nueva columna en `pets`:
```sql
temperament_id INT DEFAULT NULL COMMENT 'Relación con tabla de temperamentos'
```

### Tabla `temperaments` (YA EXISTE):
**NOTA:** La tabla `temperaments` ya existe en la base de datos (es usada por `stray_reports`). 
Solo agregamos la relación en la tabla `pets` para reutilizarla.

```sql
-- Tabla existente en database_complete.sql
CREATE TABLE temperaments (
    id INT PRIMARY KEY,
    code VARCHAR(20) UNIQUE,
    name VARCHAR(50),
    description VARCHAR(255),
    color VARCHAR(7) DEFAULT '#4CAF50',
    active BOOLEAN DEFAULT TRUE
)
```

### Datos insertados:
| code | name | description | color |
|------|------|-------------|-------|
| muy_sociable | Muy Sociable | Amigable con todos | #4CAF50 |
| sociable | Sociable | Se lleva bien | #8BC34A |
| reservado | Reservado/Tímido | Observador | #FFC107 |
| territorial | Territorial | Protector | #FF9800 |
| requiere_atencion | Requiere Atención Especial | Manejo cuidadoso | #FF5722 |

---

## 🧪 Pruebas

### Caso de prueba 1: Usuario nuevo sin autenticar
1. Ir a `/register` sin estar logueado
2. Completar Paso 0 (Datos Propietario)
3. Completar Paso 1 (Datos Mascota básicos)
4. **Ver y completar** sección de Perfil de Comportamiento
5. Completar Paso 2 (Documentos)
6. Registrar
7. **Verificar en BD** que se guardó `temperament_id` y `additional_features`

### Caso de prueba 2: Usuario autenticado
1. Iniciar sesión
2. Ir a `/register`
3. Debería empezar en Paso 1 (Datos Mascota)
4. **Ver y completar** sección de Perfil de Comportamiento
5. Completar Paso 2 (Documentos)
6. Registrar
7. **Verificar en BD**

### Caso de prueba 3: Temperamento "Requiere Atención Especial"
1. En el formulario, seleccionar temperamento "Requiere Atención Especial"
2. **Debería aparecer** un Alert azul informativo
3. El mensaje debe decir que describa los detalles en Características Adicionales

---

## 📝 Archivos Modificados

### Backend:
- ✅ `server/database/migration_add_temperament.sql` (NUEVO)
- ✅ `server/services/petService.js`

### Frontend:
- ✅ `client/src/hooks/useRegistrationForm.js`
- ✅ `client/src/components/features/pets/PetInfoForm.jsx`

---

## ⚠️ Notas Importantes

1. **Los campos son OPCIONALES** - No se requieren para completar el registro
2. **No rompe registros antiguos** - Las mascotas ya registradas simplemente tendrán `temperament_id = NULL`
3. **Reutiliza tabla existente** - La tabla `temperaments` ya existe (usada por `stray_reports`), solo agregamos la relación en `pets`
4. **La migración es segura** - Verifica si la columna existe antes de agregarla, puede ejecutarse múltiples veces sin problemas
5. **INSERT IGNORE** - Los datos de temperamentos se insertan con IGNORE, si ya existen no se duplican
6. **Compatible con todos los flujos** - Funciona igual para usuarios autenticados y no autenticados

---

## 🐛 Solución de Problemas

### Error: "Unknown column 'temperament_id'"
**Causa:** La migración no se ejecutó correctamente

**Solución:**
1. Verifica que ejecutaste `migration_add_temperament.sql`
2. Verifica con `DESCRIBE pets;` que existe la columna
3. Si no existe, ejecuta manualmente:
```sql
ALTER TABLE pets ADD COLUMN temperament_id INT DEFAULT NULL;
```

### Error: "Table 'temperaments' doesn't exist"
**Causa:** La base de datos no se creó correctamente o está usando una versión antigua

**Solución:**
La tabla `temperaments` debería existir si ejecutaste `database_complete.sql`. Verifica:
```sql
SHOW TABLES LIKE 'temperaments';
```
Si no existe, ejecuta desde `database_complete.sql` líneas 81-91:
```sql
CREATE TABLE IF NOT EXISTS temperaments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(50) NOT NULL,
    description VARCHAR(255),
    color VARCHAR(7) DEFAULT '#4CAF50',
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### Los datos no se guardan
**Causa:** El frontend no está enviando los campos correctamente

**Solución:**
1. Abre la consola del navegador (F12)
2. Ve a la pestaña "Network"
3. Registra una mascota y busca la petición a `/api/register`
4. Verifica que el payload incluya `temperament` y `additionalFeatures`

---

## ✅ Checklist Final

- [ ] Ejecutar migración SQL
- [ ] Verificar que se creó la columna `temperament_id` en `pets`
- [ ] Verificar que existen 5 registros en `temperaments`
- [ ] Reiniciar el servidor backend
- [ ] Probar registro sin autenticar
- [ ] Probar registro autenticado
- [ ] Verificar que los datos se guardan en la BD
- [ ] Probar seleccionar "Requiere Atención Especial" (debe mostrar Alert)

---

## 🎉 ¡Listo!

Si completaste todos los pasos, la funcionalidad del Paso 2B está completamente implementada y funcional.

**Beneficios:**
- ✅ Mejor identificación de mascotas
- ✅ Información útil para encontrar mascotas perdidas
- ✅ Datos de comportamiento para seguridad
- ✅ Enfoque positivo (no estigmatizante)
- ✅ Campos opcionales (no obligatorios)
