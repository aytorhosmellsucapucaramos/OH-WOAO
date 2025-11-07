# 🔐 Validaciones de Seguridad - Sistema de Roles

## ❓ Pregunta Principal

**"¿Cómo validamos que el usuario sea realmente un empleado municipal si no tiene email @munipuno.gob.pe?"**

---

## ✅ Respuesta: Validación Multi-Factor

No dependemos del dominio del email. La validación se hace por **3 factores**:

### **1. Control de Acceso** 👤
Solo un **admin verificado** puede crear cuentas de personal municipal.

### **2. Validación por DNI** 🆔
El DNI del empleado debe ser **único** en el sistema para personal municipal.

### **3. Código de Empleado** 🏷️
Cada empleado recibe un código único asignado por la municipalidad.

---

## 🎯 Flujo de Creación Seguro

```
┌──────────────────────────────────────────────────┐
│  1. Empleado se presenta en oficina              │
│     - Trae DNI físico                            │
│     - Trae contrato/carta de nombramiento        │
└──────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────┐
│  2. Admin verifica documentos                    │
│     - Compara DNI con documento físico           │
│     - Verifica que esté en planilla              │
│     - Asigna código de empleado                  │
└──────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────┐
│  3. Admin crea cuenta en el sistema              │
│     - Email: Cualquiera que proporcione empleado │
│     - DNI: Del documento físico                  │
│     - Código: Asignado por municipalidad         │
└──────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────┐
│  4. Validaciones automáticas del sistema         │
│     ✓ DNI no duplicado (para role 2 y 3)        │
│     ✓ Código de empleado no duplicado           │
│     ✓ Email no duplicado                        │
└──────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────┐
│  5. Cuenta creada - Credenciales al empleado     │
│     - Email: El que proporcionó                  │
│     - Contraseña: Generada o elegida            │
└──────────────────────────────────────────────────┘
```

---

## 📋 Validaciones Implementadas

### **Backend (server/routes/adminRoutes.js)**

```javascript
POST /api/admin/users/create

Validaciones:
1. ✅ Solo role_id 2 o 3 (admin o seguimiento)
2. ✅ Email único en el sistema
3. ✅ DNI único para personal municipal (role 2 y 3)
4. ✅ Código de empleado único
5. ✅ Longitud de DNI (8 dígitos)
6. ✅ Formato de email válido
```

### **Frontend (CreateUserForm.jsx)**

```javascript
Validaciones en el cliente:
1. ✅ Todos los campos requeridos completos
2. ✅ Email con formato válido
3. ✅ DNI de 8 dígitos
4. ✅ Contraseña mínimo 6 caracteres
5. ✅ Código de empleado obligatorio
6. ✅ Zona asignada (si es rol seguimiento)
```

---

## 🔒 Niveles de Seguridad

### **Nivel 1: Físico** 👮
- Empleado se presenta en persona
- Muestra DNI original
- Tiene carta de nombramiento/contrato

### **Nivel 2: Administrativo** 📋
- Admin verifica documentos
- Cruza con base de datos de recursos humanos
- Asigna código oficial de empleado

### **Nivel 3: Técnico** 💻
- DNI único en sistema (por rol)
- Código de empleado único
- Email único
- Auditoría (quién creó la cuenta, cuándo)

---

## 📊 Comparación con Otros Métodos

| Método | Seguridad | Flexibilidad | Complejidad |
|--------|-----------|--------------|-------------|
| **Solo email @munipuno.gob.pe** | ⭐⭐ | ⭐ | ⭐ |
| **DNI + Código (nuestra solución)** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ |
| **Código de invitación** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Lista blanca de emails** | ⭐⭐ | ⭐⭐ | ⭐⭐⭐ |

---

## 🛡️ Ventajas de Nuestra Solución

### ✅ **Flexible**
- Acepta Gmail, Hotmail, Yahoo, etc.
- No requiere infraestructura de emails corporativos
- Personal temporal/contratado puede usar su email personal

### ✅ **Seguro**
- DNI verificado físicamente por admin
- Código de empleado único
- Registro de quién creó cada cuenta
- No pueden auto-registrarse como personal

### ✅ **Auditable**
```sql
-- Saber quién creó cada usuario
SELECT 
    a.first_name as empleado,
    a.employee_code,
    a.created_at,
    creator.first_name as creado_por
FROM adopters a
LEFT JOIN adopters creator ON a.created_by = creator.id
WHERE a.role_id IN (2, 3);
```

### ✅ **Simple**
- No requiere setup de emails corporativos
- No requiere dominio @munipuno.gob.pe
- Fácil de implementar
- Fácil de explicar al personal

---

## ⚠️ Casos Especiales

### **¿Qué pasa si un empleado ya no trabaja?**
```sql
-- Desactivar usuario (no eliminar, para mantener historial)
UPDATE adopters 
SET is_active = FALSE 
WHERE employee_code = 'SEG-001';
```

### **¿Qué pasa si un empleado cambia de email?**
```sql
-- Actualizar email
UPDATE adopters 
SET email = 'nuevo_email@gmail.com' 
WHERE employee_code = 'SEG-001';
```

### **¿Qué pasa si hay 2 empleados con el mismo nombre?**
✅ **No hay problema**: Se diferencian por DNI y código de empleado.

### **¿Qué pasa si alguien usa un DNI falso?**
🔐 **Prevención**:
1. Admin verifica DNI físico al crear cuenta
2. Opcionalmente, escanear/fotografiar el DNI
3. Guardar en tabla de documentos de respaldo

```sql
-- Opcional: Tabla de documentos de respaldo
CREATE TABLE employee_verification (
    id INT PRIMARY KEY AUTO_INCREMENT,
    adopter_id INT NOT NULL,
    dni_scan_path VARCHAR(255),
    contract_path VARCHAR(255),
    verified_by INT NOT NULL,
    verified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (adopter_id) REFERENCES adopters(id),
    FOREIGN KEY (verified_by) REFERENCES adopters(id)
);
```

---

## 🔍 Auditoría y Trazabilidad

### **Agregar campo `created_by` (opcional pero recomendado)**

```sql
ALTER TABLE adopters 
ADD COLUMN created_by INT NULL COMMENT 'ID del admin que creó esta cuenta',
ADD FOREIGN KEY (created_by) REFERENCES adopters(id);
```

### **Al crear usuario, registrar quién lo creó:**

```javascript
const [result] = await pool.query(
  `INSERT INTO adopters (
    first_name, last_name, dni, email, password, 
    phone, address, role_id, assigned_zone, employee_code,
    created_by
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  [
    first_name, last_name, dni, email, hashedPassword,
    phone, address, role_id, assigned_zone, employee_code,
    req.user.id  // ← ID del admin que está creando la cuenta
  ]
);
```

---

## 📈 Mejoras Futuras (Opcional)

### **Fase 2: Verificación en dos pasos**
```javascript
// 1. Admin crea cuenta
POST /admin/users/create
→ Estado: "pending_activation"

// 2. Empleado confirma su identidad
GET /verify-account/:token
→ Empleado confirma email y crea su propia contraseña
→ Estado: "active"
```

### **Fase 3: Sistema de códigos QR**
```
1. Admin genera código QR con datos encriptados
2. Imprime y da al empleado
3. Empleado escanea QR con app móvil
4. Se auto-registra con datos pre-validados
```

---

## ✅ Conclusión

### **No necesitamos @munipuno.gob.pe porque:**

1. 🔐 **Validación física del DNI** (el admin verifica en persona)
2. 🏷️ **Código de empleado único** (asignado por municipalidad)
3. 👤 **Solo admin puede crear** (no auto-registro)
4. 📋 **Auditoría completa** (sabemos quién creó cada cuenta)
5. 🎯 **Flexible** (acepta cualquier email)

### **Es más seguro porque:**

- Email corporativo se puede falsificar
- DNI es más difícil de falsificar
- Verificación física en oficina
- Trazabilidad completa
- No depende de infraestructura externa

---

## 🚀 Implementación Inmediata

1. **Ejecutar migración** (ya está lista)
2. **Crear primer admin** (SQL manual)
3. **Login como admin**
4. **Crear personal de seguimiento**:
   - Pedir DNI físico
   - Verificar identidad
   - Asignar código de empleado
   - Usar cualquier email que proporcione

**¡El sistema está listo para producción!** 🎉
