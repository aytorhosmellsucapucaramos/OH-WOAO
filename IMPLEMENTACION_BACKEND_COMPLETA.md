# ✅ Implementación Backend Completa - Sistema de Roles

## 🎯 Implementación Realizada

Se ha implementado el sistema completo de roles y gestión de usuarios en el backend.

---

## 📁 Archivos Creados/Modificados

### ✅ **1. Middleware de Autenticación** (`server/middleware/auth.js`)

**Cambios:**
- ✅ Agregado `role_id` al token JWT
- ✅ `verifyToken` ahora obtiene información completa del usuario incluyendo rol
- ✅ Verifica que el usuario esté activo (`is_active`)
- ✅ Nuevo middleware `authorize(...allowedRoles)` para validar permisos por rol

**Uso:**
```javascript
const { verifyToken, authorize } = require('../middleware/auth');

// Ruta protegida solo para admin
router.get('/admin-only',
  verifyToken,              // Verifica autenticación
  authorize('admin'),       // Verifica rol
  (req, res) => {
    // Solo admins pueden acceder
  }
);

// Ruta para múltiples roles
router.get('/staff-only',
  verifyToken,
  authorize('admin', 'seguimiento'),
  (req, res) => {
    // Admin y seguimiento pueden acceder
  }
);
```

---

### ✅ **2. Rutas de Gestión de Usuarios** (`server/routes/adminUsers.js` - NUEVO)

**Endpoints creados:**

#### **GET /api/admin/users**
- Obtiene todos los usuarios con sus roles
- Solo admin

#### **GET /api/admin/users/:id**
- Obtiene un usuario específico
- Solo admin

#### **POST /api/admin/users/create** 
- Crea usuario municipal (admin o seguimiento)
- Validaciones:
  - ✅ Solo roles 2 (admin) o 3 (seguimiento)
  - ✅ Email único
  - ✅ DNI único (para personal municipal)
  - ✅ Código de empleado único
- Solo admin

#### **PUT /api/admin/users/:id**
- Actualiza datos de un usuario
- Campos editables: nombre, teléfono, dirección, zona, código
- No permite editar: email, DNI, rol
- Solo admin

#### **PUT /api/admin/users/:id/role**
- Cambia el rol de un usuario
- Solo admin

#### **DELETE /api/admin/users/:id**
- Desactiva un usuario (no elimina)
- No permite desactivarse a sí mismo
- Solo admin

#### **PUT /api/admin/users/:id/activate**
- Reactiva un usuario desactivado
- Solo admin

#### **GET /api/admin/users/catalog/roles**
- Obtiene lista de roles
- Query param `?exclude=user` para excluir rol user
- Solo admin

#### **GET /api/admin/users/catalog/zones**
- Obtiene lista de zonas
- Solo admin

---

### ✅ **3. Rutas de Perfil de Usuario** (`server/routes/userProfile.js` - NUEVO)

**Endpoints creados:**

#### **GET /api/profile**
- Obtiene perfil del usuario autenticado
- Todos los roles

#### **PUT /api/profile**
- Actualiza perfil del usuario
- Campos editables: nombre, teléfono, dirección
- Todos los roles

#### **PUT /api/profile/change-password**
- Cambia contraseña del usuario
- Requiere:
  - `current_password` (contraseña actual)
  - `new_password` (nueva contraseña)
  - `confirm_password` (confirmación)
- Validaciones:
  - ✅ Contraseña actual correcta
  - ✅ Nueva contraseña mínimo 6 caracteres
  - ✅ Confirmación coincide
- **Todos los roles pueden cambiar su propia contraseña**

#### **PUT /api/profile/reset-password/:userId**
- Admin puede resetear contraseña de cualquier usuario
- Solo admin

---

### ✅ **4. Controlador de Autenticación** (`server/controllers/authController.js`)

**Cambios en el login:**
- ✅ Query actualizada para obtener rol del usuario
- ✅ Verifica que el usuario esté activo
- ✅ Token incluye `role_id` y `role_code`
- ✅ Respuesta incluye información completa del rol

**Respuesta del login:**
```json
{
  "success": true,
  "message": "Login exitoso",
  "token": "eyJhbGciOiJIUzI1...",
  "user": {
    "id": 5,
    "dni": "12345678",
    "email": "juan@gmail.com",
    "first_name": "Juan",
    "last_name": "Pérez",
    "phone": "987654321",
    "address": "Jr. Lima #234",
    "role_id": 3,
    "role_code": "seguimiento",
    "role_name": "Personal de Seguimiento",
    "assigned_zone": "Zona Centro",
    "employee_code": "SEG-001"
  }
}
```

---

### ✅ **5. Servidor Principal** (`server/index.js`)

**Rutas agregadas:**
```javascript
app.use('/api/admin/users', adminUsersRoutes);    // Gestión de usuarios
app.use('/api/profile', userProfileRoutes);       // Perfil de usuario
```

---

## 🔒 Sistema de Seguridad

### **Validaciones en creación de usuarios:**

```javascript
POST /api/admin/users/create

1. Solo admin puede crear usuarios
2. Solo roles 2 (admin) o 3 (seguimiento)
3. Email único en todo el sistema
4. DNI único para personal municipal (role 2 y 3)
5. Código de empleado único
6. Campos requeridos: first_name, last_name, dni, email, password
```

### **Validaciones en cambio de contraseña:**

```javascript
PUT /api/profile/change-password

1. Usuario debe estar autenticado
2. Contraseña actual debe ser correcta
3. Nueva contraseña mínimo 6 caracteres
4. Confirmación debe coincidir
5. No puede ser igual a la contraseña actual
```

---

## 📊 Flujo Completo: Crear Usuario Municipal

```
1. Admin se loguea
   POST /api/auth/login
   Body: { email, password }
   → Recibe token con role_code: "admin"

2. Admin solicita catálogos
   GET /api/admin/users/catalog/roles?exclude=user
   → [{id: 2, code: "admin", name: "Administrador"}, ...]
   
   GET /api/admin/users/catalog/zones
   → [{id: 1, code: "centro", name: "Zona Centro"}, ...]

3. Admin crea usuario
   POST /api/admin/users/create
   Headers: { Authorization: "Bearer <token>" }
   Body: {
     first_name: "Juan",
     last_name: "Pérez",
     dni: "12345678",
     email: "juan@gmail.com",      // ✅ Cualquier email
     password: "generated123",
     phone: "987654321",
     address: "Jr. Lima #234",
     role_id: 3,                    // seguimiento
     assigned_zone: "Zona Centro",
     employee_code: "SEG-001"
   }
   → Usuario creado ✅

4. Empleado se loguea
   POST /api/auth/login
   Body: { email: "juan@gmail.com", password: "generated123" }
   → Recibe token con role_code: "seguimiento"

5. Empleado cambia su contraseña
   PUT /api/profile/change-password
   Headers: { Authorization: "Bearer <token>" }
   Body: {
     current_password: "generated123",
     new_password: "MiNuevaPassword123",
     confirm_password: "MiNuevaPassword123"
   }
   → Contraseña cambiada ✅
```

---

## 🎯 Endpoints por Rol

### **Todos los Usuarios (autenticados):**
```
GET  /api/profile                  - Ver mi perfil
PUT  /api/profile                  - Actualizar mi perfil
PUT  /api/profile/change-password  - Cambiar mi contraseña
```

### **Solo Admin:**
```
GET    /api/admin/users                    - Listar usuarios
GET    /api/admin/users/:id                - Ver usuario
POST   /api/admin/users/create             - Crear usuario
PUT    /api/admin/users/:id                - Editar usuario
PUT    /api/admin/users/:id/role           - Cambiar rol
DELETE /api/admin/users/:id                - Desactivar usuario
PUT    /api/admin/users/:id/activate       - Reactivar usuario
PUT    /api/profile/reset-password/:userId - Resetear contraseña
GET    /api/admin/users/catalog/roles      - Listar roles
GET    /api/admin/users/catalog/zones      - Listar zonas
```

---

## 🧪 Pruebas con Postman/Thunder Client

### **1. Login como Admin:**
```
POST http://localhost:5000/api/auth/login
Body (JSON):
{
  "email": "admin@munipuno.gob.pe",
  "password": "tu_password"
}

Guardar el token recibido
```

### **2. Obtener Catálogos:**
```
GET http://localhost:5000/api/admin/users/catalog/roles?exclude=user
Headers:
  Authorization: Bearer <token>

GET http://localhost:5000/api/admin/users/catalog/zones
Headers:
  Authorization: Bearer <token>
```

### **3. Crear Usuario:**
```
POST http://localhost:5000/api/admin/users/create
Headers:
  Authorization: Bearer <token>
Body (JSON):
{
  "first_name": "Carlos",
  "last_name": "Díaz",
  "dni": "87654321",
  "email": "carlos@gmail.com",
  "password": "temp123",
  "phone": "987654321",
  "address": "Av. El Sol #123",
  "role_id": 3,
  "assigned_zone": "Zona Norte",
  "employee_code": "SEG-002"
}
```

### **4. Cambiar Contraseña (como usuario):**
```
POST http://localhost:5000/api/auth/login
Body:
{
  "email": "carlos@gmail.com",
  "password": "temp123"
}

Guardar el nuevo token

PUT http://localhost:5000/api/profile/change-password
Headers:
  Authorization: Bearer <nuevo_token>
Body:
{
  "current_password": "temp123",
  "new_password": "MiPassword456",
  "confirm_password": "MiPassword456"
}
```

---

## ✅ Checklist de Implementación

### **Backend: ✅ COMPLETADO**
- [x] Middleware de autorización por roles
- [x] Endpoint POST /admin/users/create
- [x] Endpoint GET /admin/users (listar)
- [x] Endpoint PUT /admin/users/:id (editar)
- [x] Endpoint PUT /admin/users/:id/role (cambiar rol)
- [x] Endpoint DELETE /admin/users/:id (desactivar)
- [x] Endpoint PUT /profile/change-password
- [x] Actualizar login para incluir rol
- [x] Catálogos de roles y zonas

### **Pendiente (Frontend):**
- [ ] Componente CreateUserForm
- [ ] Componente UserManagement
- [ ] Componente ChangePassword
- [ ] Panel de admin
- [ ] Panel de seguimiento
- [ ] Redirección según rol en login

---

## 🚀 Próximos Pasos

1. **Ejecutar migración SQL** (`migration_roles_system.sql`)
2. **Crear primer admin manualmente** (UPDATE en BD)
3. **Probar endpoints con Postman**
4. **Implementar frontend**

---

## 📝 Notas Importantes

- ✅ **Email puede ser cualquier dominio** (Gmail, Hotmail, etc.)
- ✅ **Validación por DNI** (único para personal municipal)
- ✅ **Código de empleado** (único)
- ✅ **Contraseña generada puede cambiarse** inmediatamente
- ✅ **Usuarios desactivados** no pueden hacer login
- ✅ **Tokens válidos por 7 días**
- ✅ **Logs completos** de todas las operaciones

---

¡El backend está 100% completo y listo para usar! 🎉
