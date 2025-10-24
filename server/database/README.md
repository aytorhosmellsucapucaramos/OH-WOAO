# 📁 Base de Datos - WebPerritos

Esta carpeta contiene todos los scripts SQL para el sistema de registro de mascotas.

---

## 📂 Archivos Disponibles

### 🔧 Scripts de Instalación

| Archivo | Propósito | Cuándo Usar |
|---------|-----------|-------------|
| **`init_database_complete.sql`** | Base de datos completa optimizada | ✅ **RECOMENDADO** - Nueva instalación o reset completo |
| `init_database_v2.sql` | Base de datos básica (tu versión actual) | Instalación básica sin optimizaciones |
| `init_database.sql` | Versión antigua (legacy) | ⚠️ No usar - obsoleta |

### 📊 Scripts de Mantenimiento

| Archivo | Propósito |
|---------|-----------|
| **`verify_database.sql`** | Verificar estado actual de la BD |
| **`migration_add_missing_fields.sql`** | Agregar campos sin perder datos |
| `add_photo_path_column.sql` | Migración específica (ya incluida en complete) |

### 📖 Documentación

| Archivo | Contenido |
|---------|-----------|
| **`DATABASE_ANALYSIS.md`** | Análisis completo y buenas prácticas |
| `README.md` | Este archivo |

---

## 🚀 Inicio Rápido

### Opción 1: Nueva Instalación (Recomendada)

Si estás empezando desde cero o quieres resetear todo:

```bash
# Abrir MySQL
mysql -u root -p

# Ejecutar script completo
source C:/Users/USUARIO/Downloads/webperritos/webperritos/server/database/init_database_complete.sql
```

O desde línea de comandos:

```bash
mysql -u root -p < init_database_complete.sql
```

### Opción 2: Migración desde V2

Si ya tienes datos y NO quieres perderlos:

```bash
# 1. Hacer backup primero
mysqldump -u root -p pets_db > backup_$(date +%Y%m%d).sql

# 2. Ejecutar migración
mysql -u root -p < migration_add_missing_fields.sql
```

### Opción 3: Verificar Estado Actual

Para ver qué tienes instalado:

```bash
mysql -u root -p < verify_database.sql
```

---

## 📋 Comparación de Versiones

### `init_database_v2.sql` (Tu versión actual)

```
✅ Tablas básicas: adopters, pets, stray_reports, breeds, colors
✅ Relaciones (Foreign Keys)
✅ Índices básicos
✅ Catálogos de datos
⚠️ Falta: Campos completos en stray_reports
⚠️ Falta: Vistas, procedimientos, triggers
⚠️ Falta: Validaciones y constraints
```

### `init_database_complete.sql` (Versión mejorada)

```
✅ TODO lo anterior +
✅ Tabla stray_reports completa (18 campos vs 8)
✅ 18 índices optimizados (vs 6 básicos)
✅ 3 vistas para consultas frecuentes
✅ 4 procedimientos almacenados
✅ 2 triggers automáticos
✅ 2 funciones útiles
✅ Constraints de validación (DNI, email, edad)
✅ Tabla de sesiones JWT
✅ 48 razas (vs 31)
✅ 28 colores (vs 22)
✅ Mejor documentación
```

---

## 🎯 Estructura de la Base de Datos

```
pets_db
│
├── 👥 adopters (Usuarios/Propietarios)
│   ├── Datos personales (nombre, DNI, email)
│   ├── Contacto (teléfono, dirección)
│   ├── Archivos (foto perfil, foto DNI)
│   └── Autenticación (password hash)
│
├── 🐕 pets (Mascotas Registradas)
│   ├── Identificación (CUI único, nombre)
│   ├── Características (raza, edad, color)
│   ├── Salud (vacunas, historial médico)
│   ├── Archivos (foto, QR, carnets)
│   └── Estado (card_printed)
│
├── 📍 stray_reports (Reportes de Callejeros)
│   ├── Reportante (info contacto)
│   ├── Ubicación (GPS, dirección, zona)
│   ├── Perro (raza, tamaño, temperamento)
│   ├── Urgencia (nivel, condición)
│   └── Estado (pending/in_progress/resolved)
│
├── 📚 breeds (Catálogo de Razas)
├── 🎨 colors (Catálogo de Colores)
├── 📝 status_updates (Historial de Cambios)
└── 🔐 user_sessions (Sesiones JWT - opcional)
```

---

## 💡 Buenas Prácticas Implementadas

### ✅ Normalización
- **3FN (Tercera Forma Normal)**
- Sin redundancia de datos
- Tablas de catálogo separadas

### ✅ Integridad de Datos
- Claves primarias AUTO_INCREMENT
- Claves foráneas con ON DELETE/UPDATE
- Constraints de validación:
  ```sql
  CHECK (LENGTH(dni) = 8)
  CHECK (age >= 0 AND age <= 30)
  CHECK (email REGEXP '...')
  ```

### ✅ Optimización de Consultas
- Índices en columnas de búsqueda frecuente
- Índices compuestos para filtros
- Vistas para queries complejos

### ✅ Tipos de Datos Correctos
- `VARCHAR` con límites apropiados
- `TEXT` para contenido largo
- `BOOLEAN` para flags
- `ENUM` para valores predefinidos
- `DECIMAL(10,8)` para GPS

### ✅ Charset Internacional
```sql
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
```
- Soporta emojis 🐕
- Acentos correctos (español)

### ✅ Timestamps Automáticos
```sql
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
```

### ✅ Motor InnoDB
- Transacciones ACID
- Soporte de claves foráneas
- Mejor rendimiento

---

## 🔍 Procedimientos Almacenados Disponibles

### `sp_get_system_stats()`
Obtiene estadísticas generales del sistema.

```sql
CALL sp_get_system_stats();
```

**Retorna:**
- Total de mascotas
- Total de usuarios
- Carnets impresos/pendientes
- Reportes activos
- Registros del mes

### `sp_get_analytics()`
Obtiene analíticas detalladas.

```sql
CALL sp_get_analytics();
```

**Retorna:**
- Top 10 razas más comunes
- Top 10 colores más comunes
- Distribución por edad
- Registros mensuales (últimos 6 meses)
- Estado de reportes

### `sp_find_pet_by_cui(cui)`
Busca una mascota por su CUI.

```sql
CALL sp_find_pet_by_cui('CUI-2024-001');
```

---

## 📊 Vistas Disponibles

### `v_pets_complete`
Mascotas con toda la información del propietario.

```sql
SELECT * FROM v_pets_complete WHERE cui = 'CUI-2024-001';
```

### `v_stray_reports_complete`
Reportes con información completa del reportante.

```sql
SELECT * FROM v_stray_reports_complete WHERE status = 'pending';
```

### `v_user_statistics`
Estadísticas por usuario (mascotas, reportes, carnets).

```sql
SELECT * FROM v_user_statistics WHERE id = 1;
```

---

## 🛠️ Comandos Útiles

### Verificar Conexión
```sql
USE pets_db;
SHOW TABLES;
```

### Ver Estadísticas
```sql
CALL sp_get_system_stats();
```

### Backup
```bash
# Backup completo
mysqldump -u root -p pets_db > backup.sql

# Backup solo estructura
mysqldump -u root -p --no-data pets_db > estructura.sql

# Backup solo datos
mysqldump -u root -p --no-create-info pets_db > datos.sql
```

### Restaurar
```bash
mysql -u root -p pets_db < backup.sql
```

### Ver Tamaño de BD
```sql
SELECT 
    table_name AS tabla,
    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS tamaño_mb
FROM information_schema.tables
WHERE table_schema = 'pets_db'
ORDER BY (data_length + index_length) DESC;
```

---

## ⚠️ Notas Importantes

### Antes de Producción

1. **Cambiar credenciales de admin**
   ```sql
   -- Los datos de prueba están comentados en el script
   ```

2. **Crear usuario específico**
   ```sql
   CREATE USER 'pets_app'@'localhost' IDENTIFIED BY 'password_seguro';
   GRANT SELECT, INSERT, UPDATE, DELETE ON pets_db.* TO 'pets_app'@'localhost';
   FLUSH PRIVILEGES;
   ```

3. **Configurar backups automáticos**
   ```bash
   # Crear cron job diario
   0 2 * * * mysqldump -u root -p'password' pets_db > /backups/pets_$(date +\%Y\%m\%d).sql
   ```

4. **Habilitar SSL/TLS**
   - Conexiones cifradas a la BD

5. **Logs de consultas lentas**
   ```sql
   SET GLOBAL slow_query_log = 'ON';
   SET GLOBAL long_query_time = 2;
   ```

---

## 🔄 Flujo de Actualización Recomendado

```
1. Base de Datos Actual (init_database_v2.sql)
   │
   ↓
2. Hacer BACKUP
   mysqldump -u root -p pets_db > backup.sql
   │
   ↓
3. Verificar Estado
   mysql -u root -p < verify_database.sql
   │
   ↓
4a. SI NO HAY DATOS → init_database_complete.sql
4b. SI HAY DATOS → migration_add_missing_fields.sql
   │
   ↓
5. Verificar Nuevamente
   mysql -u root -p < verify_database.sql
   │
   ↓
6. Actualizar archivo .env del servidor
   DB_NAME=pets_db
   │
   ↓
7. ✅ LISTO
```

---

## 📚 Recursos Adicionales

- **DATABASE_ANALYSIS.md** - Análisis detallado de buenas prácticas
- **verify_database.sql** - Script de verificación completo
- **Documentación MySQL**: https://dev.mysql.com/doc/

---

## 🆘 Solución de Problemas

### Error: "Table already exists"
```bash
# Opción 1: Eliminar y recrear
DROP DATABASE pets_db;
source init_database_complete.sql

# Opción 2: Usar migración
source migration_add_missing_fields.sql
```

### Error: "Can't connect to MySQL"
```bash
# Verificar servicio
# Windows
net start MySQL80

# Verificar puerto
netstat -an | findstr 3306
```

### Error: "Access denied"
```bash
# Resetear password de root
mysql -u root
ALTER USER 'root'@'localhost' IDENTIFIED BY 'nuevo_password';
```

---

## ✅ Checklist Final

Antes de desplegar a producción:

- [ ] Base de datos creada correctamente
- [ ] Todas las tablas existen
- [ ] Índices creados
- [ ] Vistas funcionando
- [ ] Procedimientos probados
- [ ] Backup configurado
- [ ] Usuario de app creado (no usar root)
- [ ] Conexión desde servidor funciona
- [ ] Datos de prueba eliminados
- [ ] SSL/TLS habilitado (recomendado)

---

**Última actualización:** 2025-10-08  
**Versión de BD:** 3.0  
**Autor:** Sistema WebPerritos
