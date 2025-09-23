# 🔧 Configuración de MySQL en Laragon

## Pasos para configurar la base de datos:

### 1. Iniciar Laragon
- Abre Laragon
- Asegúrate de que **MySQL** esté iniciado (botón "Start All" o solo MySQL)

### 2. Crear la base de datos

#### Opción A: Usando HeidiSQL (incluido en Laragon)
1. Click en **Database** en Laragon → **HeidiSQL**
2. Conectar con:
   - Host: `localhost`
   - Usuario: `root`
   - Contraseña: (vacío)
3. Ejecutar el siguiente SQL:
```sql
CREATE DATABASE IF NOT EXISTS pets_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```
4. Seleccionar la base de datos `pets_db`
5. Abrir el archivo `database/init_database.sql` y ejecutarlo

#### Opción B: Usando phpMyAdmin
1. Abrir navegador: `http://localhost/phpmyadmin`
2. Usuario: `root`, Contraseña: (vacío)
3. Click en "Nueva base de datos"
4. Nombre: `pets_db`, Cotejamiento: `utf8mb4_unicode_ci`
5. Click en "Crear"
6. Seleccionar `pets_db` → Importar → Seleccionar archivo `database/init_database.sql`
7. Click en "Continuar"

### 3. Verificar configuración del servidor

El archivo `.env` en la carpeta `server` debe tener:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=pets_db
```

### 4. Iniciar el servidor

```bash
cd server
npm run dev
```

## 📝 Solución de Problemas

### Error: ECONNREFUSED
- MySQL no está ejecutándose en Laragon
- Solución: Iniciar MySQL desde Laragon

### Error: Unknown database 'pets_db'
- La base de datos no existe
- Solución: Crear la base de datos siguiendo el paso 2

### Error: Access denied for user 'root'
- Contraseña incorrecta
- Solución: Verificar que la contraseña esté vacía en el archivo `.env`

## 🚀 Iniciar el Sistema Completo

1. **MySQL en Laragon** → Start
2. **Backend**:
   ```bash
   cd server
   npm run dev
   ```
3. **Frontend**:
   ```bash
   cd client
   npm run dev
   ```

## 📊 Estructura de la Base de Datos

- **users**: Usuarios del sistema (email + contraseña)
- **pets**: Mascotas registradas
- **carnets**: Carnets digitales/físicos
- **stray_reports**: Reportes de perros callejeros
- **status_updates**: Historial de cambios
- **sessions**: Sesiones de usuario

---

¡Listo para usar! 🎉
