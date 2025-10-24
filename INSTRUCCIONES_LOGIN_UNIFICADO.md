# 🔐 SISTEMA DE LOGIN UNIFICADO

## ✅ CAMBIOS IMPLEMENTADOS

### **1. Backend - Devuelve Rol en Login**
- ✅ Endpoint `/api/auth/login` ahora devuelve `role` del usuario
- ✅ Valores posibles: `'user'` o `'admin'`

### **2. Frontend - LoginPage Mejorado**
- ✅ **Diseño visual mejorado** con logos municipales
- ✅ **Barra decorativa** superior con colores municipales
- ✅ **Redirección automática según rol:**
  - Si `role === 'admin'` → `/admin/dashboard`
  - Si `role === 'user'` → `/dashboard`

### **3. Rutas Simplificadas**
- ❌ **ELIMINADO:** `/admin/login` (ya no existe)
- ✅ **UN SOLO LOGIN:** `/login` para todos
- ✅ **Shortcut:** `/admin` → Redirige a `/admin/dashboard`
- ✅ **Alias:** `/dashboard` = `/user/dashboard`

### **4. Protección de Rutas**
- ✅ `AdminRoute` actualizado para verificar `role === 'admin'`
- ✅ Si no es admin, redirige a `/dashboard`
- ✅ Si no hay token, redirige a `/login`

---

## 🚀 INSTRUCCIONES DE INSTALACIÓN

### **PASO 1: Agregar Columna `role` en Base de Datos**

Ejecuta en MySQL Workbench:
```sql
source C:/Users/USUARIO/Downloads/webperritos/webperritos/AGREGAR_COLUMNA_ROLE.sql;
```

Esto hará:
- ✅ Agregar columna `role` a tabla `adopters`
- ✅ Crear usuario admin de prueba
- ✅ Actualizar tu usuario actual para hacerlo admin (opcional)

---

### **PASO 2: Reiniciar Servidor**

```bash
npm run dev
```

---

### **PASO 3: Probar el Flujo**

#### **Para Usuarios Normales:**
1. Ve a `http://localhost:3000/login`
2. Ingresa credenciales de usuario normal
3. Serás redirigido a `/dashboard`

#### **Para Administradores:**
1. Ve a `http://localhost:3000/login`
2. Ingresa credenciales de admin:
   - Email: `admin@municipio.gob.pe`
   - Password: `admin123`
3. Serás redirigido a `/admin/dashboard`

#### **Shortcut de Admin:**
1. Ve directamente a `http://localhost:3000/admin`
2. Si ya estás logeado como admin → Dashboard
3. Si no estás logeado → Login

---

## 📊 URLS FINALES

### **Públicas (Sin Login):**
```
http://localhost:3000/              ← Inicio
http://localhost:3000/login         ← Login ÚNICO
http://localhost:3000/register      ← Registro de mascota
http://localhost:3000/search        ← Búsqueda
http://localhost:3000/map           ← Mapa de callejeros
```

### **Protegidas (Requieren Login):**
```
http://localhost:3000/dashboard          ← Usuario normal
http://localhost:3000/admin              ← Shortcut admin
http://localhost:3000/admin/dashboard    ← Panel admin
http://localhost:3000/report-stray       ← Reportar callejero
```

---

## 🔑 USUARIOS DE PRUEBA

### **Usuario Normal:**
```
Email: tikaho2773@besaies.com
Password: (tu contraseña registrada)
```

### **Usuario Admin:**
```
Email: admin@municipio.gob.pe
Password: admin123
```

---

## ⚙️ CREAR MÁS USUARIOS ADMIN

### **Opción 1: Actualizar Usuario Existente**
```sql
UPDATE adopters 
SET role = 'admin' 
WHERE email = 'tu_email@example.com';
```

### **Opción 2: Crear Nuevo Admin desde SQL**
```sql
-- Password: password123
INSERT INTO adopters (
  first_name, last_name, dni, email, password, phone, address, role
) VALUES (
  'Admin',
  'Nuevo',
  '12345678',
  'nuevo@admin.com',
  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  '999888777',
  'Dirección Admin',
  'admin'
);
```

---

## 🎯 FLUJO COMPLETO

```
┌──────────────────────────────────────┐
│  Usuario va a /login                 │
└─────────────┬────────────────────────┘
              │
              ▼
┌──────────────────────────────────────┐
│  Ingresa email y contraseña          │
└─────────────┬────────────────────────┘
              │
              ▼
┌──────────────────────────────────────┐
│  Backend verifica y devuelve:        │
│  - Token JWT                         │
│  - Datos del usuario                 │
│  - ROL (user o admin)                │
└─────────────┬────────────────────────┘
              │
    ┌─────────┴─────────┐
    ▼                   ▼
role='admin'      role='user'
    │                   │
    ▼                   ▼
/admin/dashboard   /dashboard
```

---

## ✅ CHECKLIST DE VERIFICACIÓN

Antes de usar en producción, verifica:

- [ ] Columna `role` existe en tabla `adopters`
- [ ] Al menos un usuario tiene `role = 'admin'`
- [ ] Login con usuario normal → Redirige a `/dashboard`
- [ ] Login con admin → Redirige a `/admin/dashboard`
- [ ] `/admin` sin login → Redirige a `/login`
- [ ] `/admin` con usuario normal → Redirige a `/dashboard`
- [ ] Panel de admin muestra datos correctamente

---

## 🔒 SEGURIDAD

El sistema actual tiene:
- ✅ Autenticación con JWT
- ✅ Verificación de rol en frontend
- ✅ Protección de rutas con AdminRoute
- ✅ Passwords hasheados con bcrypt

**Para producción, considera agregar:**
- 🔐 Verificación de rol en TODOS los endpoints del backend
- 🔐 IP whitelist para panel de admin
- 🔐 Logs de auditoría (quién accede al admin)
- 🔐 Rate limiting en login
- 🔐 HTTPS obligatorio

---

## 📞 SOPORTE

Si algo no funciona:
1. Verifica que ejecutaste el SQL
2. Reinicia el servidor
3. Limpia localStorage del navegador
4. Verifica logs del servidor

---

**¡Sistema de Login Unificado Listo!** 🎉
