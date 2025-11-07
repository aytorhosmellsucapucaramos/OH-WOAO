# 🔧 Solución: Error 403 en Rutas de Admin

## ❌ Error:
```
Failed to load resource: the server responded with a status of 403 (Forbidden)
/api/admin/users/catalog/roles
```

---

## 🎯 Causa Probable:

El error 403 significa que **no tienes el rol 'admin'** en tu usuario. Esto pasa cuando:

1. ❌ No ejecutaste la migración `migration_roles_system.sql`
2. ❌ Tu usuario no tiene `role_id = 2` (admin)
3. ❌ La tabla `roles` no existe

---

## ✅ Solución (3 pasos):

### **Paso 1: Ejecutar Migración SQL**

```sql
-- En phpMyAdmin o MySQL Workbench:
-- 1. Selecciona la base de datos 'pets_db'
-- 2. Ejecuta este archivo:
```

Abre y ejecuta: `server/database/migration_roles_system.sql`

Esto creará:
- ✅ Tabla `roles` (user, admin, seguimiento)
- ✅ Tabla `zones` (zonas geográficas)
- ✅ Columnas nuevas en `adopters` (role_id, employee_code, etc.)

---

### **Paso 2: Convertir tu Usuario en Admin**

```sql
-- Opción A: Si ya tienes un usuario
UPDATE adopters 
SET 
  role_id = 2,                    -- Rol admin
  employee_code = 'ADMIN-001',    -- Código de empleado
  is_active = TRUE                -- Usuario activo
WHERE email = 'tu_email@test.com';  -- TU EMAIL AQUÍ

-- Opción B: Crear un nuevo admin
INSERT INTO adopters (
  first_name, last_name, dni, email, password,
  phone, address, role_id, employee_code, is_active
) VALUES (
  'Admin', 'Sistema', '12345678', 'admin@test.com',
  '$2a$10$YourHashedPassword',  -- Genera un hash de contraseña
  '987654321', 'Municipalidad', 2, 'ADMIN-001', TRUE
);
```

**Generar hash de contraseña:**
```bash
# En Node.js (terminal del server):
node
> const bcrypt = require('bcrypt');
> bcrypt.hash('tu_password', 10).then(hash => console.log(hash));
```

---

### **Paso 3: Reiniciar y Volver a Loguearse**

```bash
# 1. Para el servidor (Ctrl+C)
# 2. Inicia de nuevo
cd server
npm start

# 3. En el navegador
# - Logout si estás logueado
# - Login de nuevo con tu usuario admin
# - Ve a /admin/users/create
```

---

## 🔍 Verificar que Todo Está Bien

### **1. Verificar que la tabla existe:**
```sql
-- Esto debe retornar 3 filas
SELECT * FROM roles;

-- Resultado esperado:
-- id | code        | name                        | active
-- 1  | user        | Usuario                     | 1
-- 2  | admin       | Administrador               | 1
-- 3  | seguimiento | Personal de Seguimiento     | 1
```

### **2. Verificar tu usuario:**
```sql
-- Reemplaza con tu email
SELECT 
  a.id, a.email, a.first_name, a.last_name,
  a.role_id, r.code as role_code, r.name as role_name,
  a.employee_code, a.is_active
FROM adopters a
LEFT JOIN roles r ON a.role_id = r.id
WHERE a.email = 'tu_email@test.com';

-- Resultado esperado:
-- role_id: 2
-- role_code: admin
-- role_name: Administrador
-- is_active: 1
```

### **3. Ver logs del servidor:**
```
Cuando intentes acceder a /admin/users/create, verás en los logs:

✅ Usuario autenticado: { 
  id: 1, 
  email: 'admin@test.com',
  role_code: 'admin',    <-- Debe decir 'admin'
  role_id: 2 
}

🔐 Verificando autorización: {
  required_roles: ['admin'],
  user_role_code: 'admin',  <-- Debe decir 'admin'
  user_role_id: 2
}

✅ Autorización exitosa
```

---

## 🐛 Si Sigue Fallando:

### **Error: "role_code: null"**
```
Causa: La tabla roles no existe o no tiene datos
Solución: Ejecuta migration_roles_system.sql
```

### **Error: "role_code: undefined"**
```
Causa: Tu usuario no tiene role_id asignado
Solución: UPDATE adopters SET role_id = 2 WHERE email = 'tu_email';
```

### **Error: "required_role: ['admin'], your_role: 'user'"**
```
Causa: Tu usuario tiene role_id = 1 (usuario normal)
Solución: UPDATE adopters SET role_id = 2 WHERE email = 'tu_email';
```

### **Error: "Usuario no encontrado o inactivo"**
```
Causa: is_active = FALSE
Solución: UPDATE adopters SET is_active = TRUE WHERE email = 'tu_email';
```

---

## 📋 Checklist Rápido:

```
✅ 1. Migración ejecutada (migration_roles_system.sql)
✅ 2. Tabla 'roles' existe con 3 filas
✅ 3. Tabla 'zones' existe
✅ 4. Tu usuario tiene role_id = 2
✅ 5. Tu usuario tiene is_active = TRUE
✅ 6. Hiciste logout y login de nuevo
✅ 7. Servidor reiniciado
✅ 8. Los logs muestran role_code: 'admin'
```

---

## 🎯 Resultado Final:

Después de estos pasos, deberías poder:
- ✅ Acceder a `/admin/users/create`
- ✅ Ver el formulario de crear usuario
- ✅ Los catálogos de roles y zonas cargan correctamente
- ✅ Puedes crear usuarios municipales

---

## 📝 Notas:

- **Los logs de debug** te ayudarán a identificar exactamente qué está fallando
- **Ejecuta las migraciones** ANTES de intentar usar el sistema
- **No uses un usuario normal** para acceder a rutas de admin
- **Siempre reinicia el servidor** después de cambios en la BD

---

¿Sigue sin funcionar? Copia y pega los logs del servidor aquí y te ayudaré a identificar el problema específico.
