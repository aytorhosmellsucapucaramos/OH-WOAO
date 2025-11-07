# 🏗️ Arquitectura del Sistema de Roles y Seguimiento

## 📋 Tabla de Contenidos
1. [Roles del Sistema](#roles-del-sistema)
2. [Flujo de Autenticación](#flujo-de-autenticación)
3. [Estructura de Base de Datos](#estructura-de-base-de-datos)
4. [Permisos y Rutas](#permisos-y-rutas)
5. [Interfaces de Usuario](#interfaces-de-usuario)
6. [Implementación Backend](#implementación-backend)
7. [Implementación Frontend](#implementación-frontend)

---

## 🎭 Roles del Sistema

### 1. Usuario (user)
**Descripción:** Ciudadano común que usa el sistema

**Puede hacer:**
- ✅ Registrar sus mascotas
- ✅ Reportar perros callejeros
- ✅ Ver sus propias mascotas
- ✅ Ver sus propios reportes
- ✅ Actualizar su perfil

**No puede:**
- ❌ Ver datos de otros usuarios
- ❌ Aprobar/rechazar reportes
- ❌ Asignar casos
- ❌ Ver panel administrativo

**Panel:** `/dashboard`

---

### 2. Administrador (admin)
**Descripción:** Personal de oficina de la municipalidad

**Puede hacer:**
- ✅ Todo lo que puede el usuario +
- ✅ Ver todos los reportes
- ✅ Verificar/aprobar reportes
- ✅ Asignar casos al personal de seguimiento
- ✅ Ver todas las mascotas registradas
- ✅ Gestionar usuarios y roles
- ✅ Ver estadísticas y métricas
- ✅ Gestionar pagos

**No puede:**
- ❌ Actualizar estado de casos en campo (eso es del personal de seguimiento)

**Panel:** `/admin/dashboard`

---

### 3. Personal de Seguimiento (seguimiento)
**Descripción:** Personal municipal que atiende casos en campo

**Puede hacer:**
- ✅ Ver casos asignados a él/ella
- ✅ Actualizar estado de casos
- ✅ Subir evidencia fotográfica
- ✅ Agregar notas de campo
- ✅ Cerrar casos resueltos
- ✅ Ver su historial de casos

**No puede:**
- ❌ Ver casos de otros
- ❌ Asignar casos
- ❌ Gestionar usuarios
- ❌ Ver todos los reportes

**Panel:** `/seguimiento/dashboard`

---

## 🔐 Flujo de Creación de Cuentas

### **Importante: Dos formas de crear usuarios**

#### **Ciudadanos (auto-registro):**
Los ciudadanos se registran ellos mismos en `/register` y DEBEN registrar una mascota.

```
Ciudadano → Completa formulario → Registra CAN + Sus datos
                                        ↓
                            Cuenta creada automáticamente (role_id = 1)
```

#### **Personal Municipal (creado por admin):**
El admin crea las cuentas del personal desde su panel, SIN necesidad de mascotas.

```
Admin → /admin/users/create → Completa formulario
                                        ↓
                            Cuenta creada directamente (role_id = 2 o 3)
```

**Razón:** El personal de seguimiento NO tiene mascotas que registrar, son empleados municipales.

---

## 🔐 Flujo de Autenticación

### Todos usan el mismo login:

```
┌─────────────────────────────────────┐
│     /login                          │
│                                     │
│  Email:    [________________]      │
│  Password: [________________]      │
│                                     │
│  [Iniciar Sesión]                  │
└─────────────────────────────────────┘
              ↓
    POST /api/auth/login
              ↓
┌─────────────────────────────────────┐
│  Servidor valida credenciales      │
│  y obtiene el rol del usuario       │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│  Respuesta con token + datos        │
│  {                                   │
│    token: "jwt_token",              │
│    user: {                          │
│      role: { code: "seguimiento" }  │
│    }                                │
│  }                                   │
└─────────────────────────────────────┘
              ↓
    Frontend decide a dónde redirigir
              ↓
┌──────────────┬──────────────┬──────────────┐
│ role = user  │ role = admin │ role = seg.  │
│      ↓       │      ↓       │      ↓       │
│  /dashboard  │  /admin/...  │ /seguim...   │
└──────────────┴──────────────┴──────────────┘
```

---

## 🗄️ Estructura de Base de Datos

### Tabla: `roles`
```sql
CREATE TABLE roles (
    id INT PRIMARY KEY,
    code VARCHAR(20) UNIQUE,      -- 'user', 'admin', 'seguimiento'
    name VARCHAR(50),              -- 'Usuario', 'Administrador', etc.
    description TEXT,
    permissions JSON,              -- Permisos del rol
    active BOOLEAN DEFAULT TRUE
);
```

**Datos:**
| id | code | name | permissions |
|----|------|------|-------------|
| 1 | user | Usuario | {...} |
| 2 | admin | Administrador | {...} |
| 3 | seguimiento | Personal de Seguimiento | {...} |

---

### Tabla: `adopters` (actualizada)
```sql
ALTER TABLE adopters ADD:
- role_id INT               -- Relación con roles
- assigned_zone VARCHAR     -- Zona asignada (solo seguimiento)
- employee_code VARCHAR     -- Código de empleado
- is_active BOOLEAN         -- Usuario activo
```

**Ejemplo de datos:**
| id | first_name | email | role_id | assigned_zone | employee_code |
|----|-----------|-------|---------|---------------|---------------|
| 1 | Juan | juan@email.com | 1 | NULL | NULL |
| 2 | María | maria@munipuno.gob.pe | 2 | NULL | ADMIN-001 |
| 3 | Carlos | carlos@munipuno.gob.pe | 3 | Zona Centro | SEG-001 |

---

### Tabla: `zones` (catálogo)
```sql
CREATE TABLE zones (
    id INT PRIMARY KEY,
    code VARCHAR(20),
    name VARCHAR(100),
    description TEXT
);
```

**Datos de ejemplo:**
| id | code | name |
|----|------|------|
| 1 | centro | Zona Centro |
| 2 | norte | Zona Norte |
| 3 | sur | Zona Sur |
| 4 | este | Zona Este |
| 5 | oeste | Zona Oeste |

---

### Tabla: `report_assignments` (nueva)
```sql
CREATE TABLE report_assignments (
    id INT PRIMARY KEY,
    stray_report_id INT,          -- Reporte asignado
    assigned_by INT,               -- Admin que asigna
    assigned_to INT,               -- Personal de seguimiento
    assigned_at TIMESTAMP,
    priority ENUM(...),
    notes TEXT,                    -- Instrucciones
    field_notes TEXT,              -- Notas del personal en campo
    status VARCHAR(20),
    
    FOREIGN KEY (stray_report_id) REFERENCES stray_reports(id),
    FOREIGN KEY (assigned_by) REFERENCES adopters(id),
    FOREIGN KEY (assigned_to) REFERENCES adopters(id)
);
```

---

## 🛣️ Permisos y Rutas

### Rutas Públicas (sin autenticación):
```
GET  /                    - Landing page
GET  /login              - Página de login
POST /api/auth/login     - Autenticación
POST /api/auth/register  - Registro de usuario
GET  /pet/:cui           - Ver carnet público de mascota
```

### Rutas Usuario (role_id = 1):
```
GET  /dashboard                      - Panel del usuario
GET  /register                       - Registrar mascota
GET  /report-stray                   - Reportar callejero
GET  /my-pets                        - Mis mascotas
GET  /my-reports                     - Mis reportes
PUT  /api/profile                    - Actualizar perfil
```

### Rutas Admin (role_id = 2):
```
GET  /admin/dashboard                - Panel administrativo
GET  /admin/reports                  - Todos los reportes
GET  /admin/reports/pending          - Reportes pendientes
POST /admin/reports/:id/verify       - Verificar reporte
POST /admin/reports/:id/assign       - Asignar caso
GET  /admin/users                    - Gestión de usuarios
POST /admin/users/create             - Crear usuario (admin/seguimiento)
PUT  /admin/users/:id/role           - Cambiar rol de usuario
PUT  /admin/users/:id                - Editar usuario
DELETE /admin/users/:id              - Desactivar usuario
GET  /admin/pets                     - Todas las mascotas
GET  /admin/stats                    - Estadísticas
```

### Rutas Personal de Seguimiento (role_id = 3):
```
GET  /seguimiento/dashboard          - Panel de seguimiento
GET  /seguimiento/assigned           - Casos asignados a mí
GET  /seguimiento/case/:id           - Detalle de caso
PUT  /seguimiento/case/:id/status    - Actualizar estado
POST /seguimiento/case/:id/evidence  - Subir evidencia
POST /seguimiento/case/:id/notes     - Agregar notas de campo
PUT  /seguimiento/case/:id/close     - Cerrar caso
```

---

## 🎨 Interfaces de Usuario

### 1. Admin: Crear Usuario Municipal
**Ruta:** `/admin/users/create`

**Componente:** `CreateUserForm.jsx`

```jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CreateUserForm = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    dni: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    role_id: 2,  // Default: admin
    assigned_zone: '',
    employee_code: ''
  });
  
  const [roles, setRoles] = useState([]);
  const [zones, setZones] = useState([]);
  
  useEffect(() => {
    // Cargar roles (solo admin y seguimiento)
    axios.get('/api/admin/roles?exclude=user')
      .then(res => setRoles(res.data));
      
    // Cargar zonas
    axios.get('/api/admin/zones')
      .then(res => setZones(res.data));
  }, []);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await axios.post('/api/admin/users/create', formData);
      
      if (response.data.success) {
        alert('Usuario creado exitosamente');
        // Redirigir a lista de usuarios
        navigate('/admin/users');
      }
    } catch (error) {
      alert(error.response?.data?.error || 'Error al crear usuario');
    }
  };
  
  const generatePassword = () => {
    const password = Math.random().toString(36).slice(-8);
    setFormData(prev => ({ ...prev, password }));
  };
  
  return (
    <div className="create-user-form">
      <h2>➕ Crear Nuevo Usuario Municipal</h2>
      
      <form onSubmit={handleSubmit}>
        <section>
          <h3>👤 Datos Personales</h3>
          <input 
            placeholder="Nombre"
            value={formData.first_name}
            onChange={(e) => setFormData({...formData, first_name: e.target.value})}
            required
          />
          <input 
            placeholder="Apellido"
            value={formData.last_name}
            onChange={(e) => setFormData({...formData, last_name: e.target.value})}
            required
          />
          <input 
            placeholder="DNI"
            value={formData.dni}
            onChange={(e) => setFormData({...formData, dni: e.target.value})}
            required
          />
          <input 
            placeholder="Teléfono"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            required
          />
          <input 
            placeholder="Dirección"
            value={formData.address}
            onChange={(e) => setFormData({...formData, address: e.target.value})}
            required
          />
        </section>
        
        <section>
          <h3>📧 Credenciales de Acceso</h3>
          <input 
            type="email"
            placeholder="Email (cualquier dominio: Gmail, Hotmail, etc.)"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
          />
          <small style={{ color: '#666', fontSize: '0.85rem' }}>
            ℹ️ No es necesario que sea @munipuno.gob.pe
          </small>
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <input 
              type="text"
              placeholder="Contraseña"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />
            <button type="button" onClick={generatePassword}>
              🔀 Generar
            </button>
          </div>
        </section>
        
        <section>
          <h3>🔐 Rol y Permisos</h3>
          <select 
            value={formData.role_id}
            onChange={(e) => setFormData({...formData, role_id: e.target.value})}
          >
            {roles.map(role => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
        </section>
        
        {formData.role_id == 3 && (
          <section>
            <h3>📍 Asignación (Personal de Seguimiento)</h3>
            <select
              value={formData.assigned_zone}
              onChange={(e) => setFormData({...formData, assigned_zone: e.target.value})}
            >
              <option value="">Seleccionar zona...</option>
              {zones.map(zone => (
                <option key={zone.id} value={zone.name}>
                  {zone.name}
                </option>
              ))}
            </select>
            <input 
              placeholder="Código de empleado (ej: SEG-001)"
              value={formData.employee_code}
              onChange={(e) => setFormData({...formData, employee_code: e.target.value})}
            />
          </section>
        )}
        
        <button type="submit">✅ Crear Usuario</button>
      </form>
    </div>
  );
};

export default CreateUserForm;
```

---

### 2. Admin: Gestión de Usuarios
**Ruta:** `/admin/users`

**Componente:** `UserManagement.jsx`

```jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [zones, setZones] = useState([]);
  
  // Función para cambiar rol
  const handleRoleChange = async (userId, newRoleId) => {
    await axios.put(`/api/admin/users/${userId}/role`, {
      role_id: newRoleId
    });
    // Recargar usuarios
  };
  
  return (
    <div>
      <h2>Gestión de Usuarios</h2>
      <table>
        <thead>
          <tr>
            <th>Usuario</th>
            <th>Email</th>
            <th>Rol</th>
            <th>Zona</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.first_name} {user.last_name}</td>
              <td>{user.email}</td>
              <td>
                <select 
                  value={user.role_id}
                  onChange={(e) => handleRoleChange(user.id, e.target.value)}
                >
                  {roles.map(role => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </td>
              <td>
                {user.role_id === 3 && (
                  <select value={user.assigned_zone}>
                    {zones.map(zone => (
                      <option key={zone.id}>{zone.name}</option>
                    ))}
                  </select>
                )}
              </td>
              <td>
                <button>Editar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
```

---

### 2. Admin: Verificar y Asignar Reporte
**Ruta:** `/admin/reports/:id/assign`

```jsx
const AssignReport = ({ reportId }) => {
  const [followUpStaff, setFollowUpStaff] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState('');
  const [priority, setPriority] = useState('medium');
  const [notes, setNotes] = useState('');
  
  const handleAssign = async () => {
    await axios.post(`/api/admin/reports/${reportId}/assign`, {
      assigned_to: selectedStaff,
      priority: priority,
      notes: notes
    });
    // Navegar de vuelta o mostrar éxito
  };
  
  return (
    <div>
      <h3>Asignar Caso a Personal de Seguimiento</h3>
      
      <label>Personal:</label>
      <select onChange={(e) => setSelectedStaff(e.target.value)}>
        {followUpStaff.map(staff => (
          <option key={staff.id} value={staff.id}>
            {staff.first_name} {staff.last_name} - {staff.assigned_zone}
          </option>
        ))}
      </select>
      
      <label>Prioridad:</label>
      <select onChange={(e) => setPriority(e.target.value)}>
        <option value="low">Baja</option>
        <option value="medium">Media</option>
        <option value="high">Alta</option>
        <option value="urgent">Urgente</option>
      </select>
      
      <label>Instrucciones:</label>
      <textarea onChange={(e) => setNotes(e.target.value)} />
      
      <button onClick={handleAssign}>Asignar y Notificar</button>
    </div>
  );
};
```

---

### 3. Personal de Seguimiento: Panel
**Ruta:** `/seguimiento/dashboard`

```jsx
const SeguimientoDashboard = () => {
  const [assignedCases, setAssignedCases] = useState([]);
  
  useEffect(() => {
    // Cargar casos asignados a mí
    axios.get('/api/seguimiento/assigned')
      .then(res => setAssignedCases(res.data));
  }, []);
  
  return (
    <div>
      <h2>Mis Casos Asignados</h2>
      
      {assignedCases.map(caseItem => (
        <div key={caseItem.id} className="case-card">
          <h3>Caso #{caseItem.id}</h3>
          <p>📍 {caseItem.location}</p>
          <p>⚡ Prioridad: {caseItem.priority}</p>
          <p>📝 Instrucciones: {caseItem.notes}</p>
          <p>🕐 Asignado hace: {caseItem.assigned_time}</p>
          
          <button onClick={() => navigate(`/seguimiento/case/${caseItem.id}`)}>
            Ver Detalle
          </button>
          <button onClick={() => startCase(caseItem.id)}>
            Iniciar Atención
          </button>
        </div>
      ))}
    </div>
  );
};
```

---

## 🔧 Implementación Backend

### 1. Middleware de Autorización
**Archivo:** `server/middleware/authMiddleware.js`

```javascript
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

// Verificar autenticación
const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No autorizado' });
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Obtener usuario con su rol
    const [users] = await pool.query(`
      SELECT a.*, r.code as role_code, r.permissions
      FROM adopters a
      LEFT JOIN roles r ON a.role_id = r.id
      WHERE a.id = ?
    `, [decoded.userId]);
    
    if (users.length === 0) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }
    
    req.user = users[0];
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido' });
  }
};

// Verificar rol específico
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'No autenticado' });
    }
    
    if (!allowedRoles.includes(req.user.role_code)) {
      return res.status(403).json({ error: 'No tienes permisos' });
    }
    
    next();
  };
};

module.exports = { authenticate, authorize };
```

### 2. Uso en Rutas
**Archivo:** `server/routes/adminRoutes.js`

```javascript
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { pool } = require('../config/database');
const { authenticate, authorize } = require('../middleware/authMiddleware');

// Solo admin puede acceder
router.get('/reports', 
  authenticate, 
  authorize('admin'), 
  async (req, res) => {
    // Lógica para obtener todos los reportes
  }
);

router.post('/reports/:id/assign', 
  authenticate, 
  authorize('admin'), 
  async (req, res) => {
    // Lógica para asignar caso
  }
);

// NUEVO: Crear usuario (admin o seguimiento)
router.post('/users/create',
  authenticate,
  authorize('admin'),
  async (req, res) => {
    try {
      const {
        first_name, last_name, dni, email, password,
        phone, address, role_id, assigned_zone, employee_code
      } = req.body;

      // Validar que solo se puedan crear admin o seguimiento
      if (![2, 3].includes(parseInt(role_id))) {
        return res.status(400).json({ 
          error: 'Solo puedes crear usuarios Admin o Personal de Seguimiento' 
        });
      }

      // Validación 1: Verificar que el email no exista
      const [existingEmail] = await pool.query(
        'SELECT id FROM adopters WHERE email = ?',
        [email]
      );
      
      if (existingEmail.length > 0) {
        return res.status(400).json({ 
          error: 'El email ya está registrado' 
        });
      }

      // Validación 2: Verificar que el DNI no exista para personal municipal
      const [existingDNI] = await pool.query(
        'SELECT id FROM adopters WHERE dni = ? AND role_id IN (2, 3)',
        [dni]
      );
      
      if (existingDNI.length > 0) {
        return res.status(400).json({ 
          error: 'Ya existe un empleado municipal con ese DNI' 
        });
      }

      // Validación 3: Verificar que el código de empleado no exista
      if (employee_code) {
        const [existingCode] = await pool.query(
          'SELECT id FROM adopters WHERE employee_code = ?',
          [employee_code]
        );
        
        if (existingCode.length > 0) {
          return res.status(400).json({ 
            error: 'El código de empleado ya está en uso' 
          });
        }
      }

      // Hash de la contraseña
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insertar usuario
      const [result] = await pool.query(
        `INSERT INTO adopters (
          first_name, last_name, dni, email, password, 
          phone, address, role_id, assigned_zone, employee_code
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          first_name, last_name, dni, email, hashedPassword,
          phone, address, role_id, 
          role_id === 3 ? assigned_zone : null,
          employee_code
        ]
      );

      res.json({
        success: true,
        message: 'Usuario creado exitosamente',
        userId: result.insertId
      });

    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ error: 'Error al crear usuario' });
    }
  }
);

module.exports = router;
```

---

## 🎯 Flujo Completo: Asignar un Caso

```
1. Ciudadano reporta perro callejero
   POST /api/reports/stray
   → status: 'pending'

2. Admin ve en su panel
   GET /admin/reports/pending
   → Lista de reportes

3. Admin verifica y asigna
   POST /admin/reports/123/assign
   Body: {
     assigned_to: 5,  // ID del personal
     priority: 'high',
     notes: 'Perro agresivo, usar precaución'
   }
   → Crea registro en report_assignments
   → Cambia status a 'assigned'
   → Notifica al personal

4. Personal ve caso asignado
   GET /seguimiento/assigned
   → Ve el caso en su panel

5. Personal inicia atención
   PUT /seguimiento/case/123/status
   Body: { status: 'in_progress' }

6. Personal cierra caso
   PUT /seguimiento/case/123/close
   Body: {
     status: 'resolved',
     field_notes: 'Can capturado y llevado al albergue',
     evidence: [files...]
   }

7. Admin ve caso cerrado
   GET /admin/reports/resolved
```

---

## ✅ Checklist de Implementación

### Base de Datos:
- [ ] Ejecutar `migration_roles_system.sql`
- [ ] Verificar que se crearon 3 roles (user, admin, seguimiento)
- [ ] Verificar columnas en adopters (role_id, assigned_zone, employee_code)
- [ ] Verificar que se creó tabla `zones`
- [ ] Crear tabla report_assignments (siguiente fase)
- [ ] Convertir un usuario existente en admin (para poder crear más usuarios)

### Backend:
- [ ] Actualizar authService para incluir role en respuesta de login
- [ ] Crear middleware de autorización (authenticate, authorize)
- [ ] Crear endpoint POST /admin/users/create
- [ ] Crear endpoint GET /admin/users (listar usuarios)
- [ ] Crear endpoint PUT /admin/users/:id (editar usuario)
- [ ] Crear endpoint PUT /admin/users/:id/role (cambiar rol)
- [ ] Crear rutas de seguimiento
- [ ] Modificar POST /api/auth/register para asignar role_id = 1 fijo

### Frontend:
- [ ] Componente CreateUserForm (/admin/users/create)
- [ ] Componente UserManagement (/admin/users)
- [ ] Panel de admin (/admin/dashboard)
- [ ] Panel de seguimiento (/seguimiento/dashboard)
- [ ] Redirección según rol en login
- [ ] Guards de rutas (proteger por rol)
- [ ] Botón "Crear Usuario" en panel de admin

---

## 🚀 Orden de Implementación Recomendado

**Fase 1: Base (1-2 días)**
1. Migración de base de datos
2. Middleware de autenticación/autorización
3. Actualizar login para retornar rol
4. Redirección básica según rol

**Fase 2: Admin (2-3 días)**
5. Panel de admin básico
6. Gestión de usuarios
7. Ver y verificar reportes
8. Asignar casos

**Fase 3: Seguimiento (2-3 días)**
9. Panel de seguimiento
10. Ver casos asignados
11. Actualizar estado de casos
12. Subir evidencia

**Fase 4: Refinamiento (1-2 días)**
13. Notificaciones
14. Historial de acciones
15. Métricas y estadísticas

---

¿Quieres que empiece con la implementación de alguna fase específica?
