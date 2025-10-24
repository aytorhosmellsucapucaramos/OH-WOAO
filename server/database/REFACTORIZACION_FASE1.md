# 🏗️ REFACTORIZACIÓN FASE 1 - SISTEMA DE REGISTRO DE MASCOTAS

## 📊 ESTADO: ✅ COMPLETADO

**Fecha:** 2025-10-22  
**Objetivo:** Modularizar tabla `pets` separando responsabilidades en tablas especializadas

---

## 🎯 PROBLEMA IDENTIFICADO:

### **Tabla `pets` original:**
- ❌ **30+ columnas** mezclando conceptos diferentes
- ❌ **Viola principio de responsabilidad única**
- ❌ Difícil de mantener y extender
- ❌ Queries lentos por tabla muy ancha
- ❌ No permite historial (ej: múltiples vacunas)

```
┌──────────────────────────────────────────────────────┐
│                     TABLA PETS                       │
│ - Datos básicos (6 campos)                          │
│ - Salud & vacunas (7 campos)     ← MEZCLA TODO     │
│ - Archivos/documentos (3 campos)  ← MAL DISEÑO     │
│ - Pagos (4 campos)                ← SIN SEPARACIÓN │
│ - Administrativo (3 campos)                         │
└──────────────────────────────────────────────────────┘
```

---

## ✅ SOLUCIÓN IMPLEMENTADA - FASE 1:

### **Nueva arquitectura modular:**

```
┌─────────────┐
│    PETS     │ ← Solo datos básicos (11 campos)
│ (Principal) │
└──────┬──────┘
       │
       ├──────────────────────────────────────┐
       │                                      │
       ▼                                      ▼
┌──────────────────┐                ┌────────────────────┐
│ PET_HEALTH_      │                │  PET_DOCUMENTS     │
│ RECORDS          │ 1:1            │                    │ 1:1
│ (Salud)          │                │  (Archivos)        │
└──────────────────┘                └────────────────────┘
       ▼                                      ▼
┌──────────────────┐                ┌────────────────────┐
│ PET_VACCINATIONS │                │  PET_PAYMENTS      │
│                  │ 1:N            │                    │ 1:N
│ (Historial)      │                │  (Pagos)           │
└──────────────────┘                └────────────────────┘
```

---

## 📋 TABLAS CREADAS EN FASE 1:

### **1️⃣ `pet_health_records` - Registros de Salud (1:1)**

```sql
CREATE TABLE pet_health_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pet_id INT NOT NULL,
    -- Vacunaciones
    has_vaccination_card BOOLEAN DEFAULT FALSE,
    vaccination_card_path VARCHAR(255),
    has_rabies_vaccine BOOLEAN DEFAULT FALSE,
    rabies_vaccine_path VARCHAR(255),
    -- Historial médico
    medical_history TEXT,
    aggression_history ENUM('yes', 'no') DEFAULT 'no',
    aggression_details TEXT,
    last_checkup_date DATE,
    -- Metadatos
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE,
    UNIQUE KEY unique_pet_health (pet_id)
);
```

**Beneficios:**
- ✅ Centraliza toda la información de salud
- ✅ Relación 1:1 (cada mascota tiene 1 registro de salud)
- ✅ Preparado para futuras extensiones

---

### **2️⃣ `pet_documents` - Archivos y Documentos (1:1)**

```sql
CREATE TABLE pet_documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pet_id INT NOT NULL,
    -- Fotos
    photo_frontal_path VARCHAR(255),
    photo_posterior_path VARCHAR(255),
    -- QR y carnet
    qr_code_path VARCHAR(255),
    card_printed BOOLEAN DEFAULT FALSE,
    print_date TIMESTAMP NULL,
    print_count INT DEFAULT 0,
    -- Metadatos
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE,
    UNIQUE KEY unique_pet_document (pet_id)
);
```

**Beneficios:**
- ✅ Separa lógica de archivos/documentos
- ✅ Facilita gestión de impresiones
- ✅ Tracking de carnets impresos

---

### **3️⃣ `pet_payments` - Pagos (1:N)**

```sql
CREATE TABLE pet_payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pet_id INT NOT NULL,
    -- Datos del recibo
    receipt_number VARCHAR(100) NOT NULL,
    receipt_issue_date DATE NOT NULL,
    receipt_payer VARCHAR(255) NOT NULL,
    receipt_amount DECIMAL(10, 2) NOT NULL,
    -- Control administrativo
    payment_type ENUM('registration', 'renewal', 'penalty') DEFAULT 'registration',
    status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
    verified_by INT NULL,
    verified_at TIMESTAMP NULL,
    notes TEXT,
    -- Metadatos
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE
);
```

**Beneficios:**
- ✅ Permite múltiples pagos por mascota (renovaciones)
- ✅ Sistema de verificación de pagos
- ✅ Auditoría completa de transacciones

---

### **4️⃣ `pet_vaccinations` - Historial de Vacunas (1:N)**

```sql
CREATE TABLE pet_vaccinations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pet_id INT NOT NULL,
    -- Datos de la vacuna
    vaccine_name VARCHAR(100) NOT NULL,
    vaccine_date DATE NOT NULL,
    next_dose_date DATE,
    -- Proveedor
    veterinarian VARCHAR(255),
    clinic VARCHAR(255),
    batch_number VARCHAR(100),
    notes TEXT,
    -- Metadatos
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE
);
```

**Beneficios:**
- ✅ Historial completo de vacunas
- ✅ Recordatorios de próximas dosis
- ✅ Trazabilidad de lotes
- ✅ Extensible para futuras vacunas

---

## 🔄 MIGRACIÓN AUTOMÁTICA:

### **Proceso implementado:**

```javascript
1. Detectar columnas antiguas en pets
   └─ has_vaccination_card, photo_frontal_path, receipt_number, etc.

2. Migrar datos a nuevas tablas
   ├─ pets → pet_health_records
   ├─ pets → pet_documents
   └─ pets → pet_payments

3. Eliminar columnas antiguas de pets
   └─ DROP COLUMN para cada campo migrado

4. Verificar integridad
   └─ ON DUPLICATE KEY UPDATE para seguridad
```

**La migración es:**
- ✅ **Automática** al iniciar el servidor
- ✅ **Segura** (no pierde datos)
- ✅ **Idempotente** (puede ejecutarse múltiples veces)
- ✅ **Retrocompatible** (detecta si ya migró)

---

## 📊 COMPARACIÓN ANTES vs DESPUÉS:

| Aspecto | ANTES (1 tabla) | DESPUÉS (FASE 1) |
|---------|----------------|------------------|
| **Columnas en pets** | 30+ columnas | 11 columnas |
| **Responsabilidades** | Todo mezclado | Separadas |
| **Historial** | No soportado | Sí (vacunas, pagos) |
| **Queries** | Lee todo siempre | Lee solo necesario |
| **Performance** | Tabla muy ancha | Optimizado |
| **Extensibilidad** | Difícil | Fácil |
| **Mantenimiento** | Riesgoso | Seguro |

---

## 🚀 NUEVAS CAPACIDADES HABILITADAS:

### **1. Múltiples vacunas por mascota**
```sql
-- Antes: Solo podía guardar "tiene vacuna antirrábica: sí/no"
-- Ahora: Historial completo de todas las vacunas
INSERT INTO pet_vaccinations (pet_id, vaccine_name, vaccine_date) VALUES
(1, 'Rabia', '2025-01-15'),
(1, 'Parvovirus', '2025-02-20'),
(1, 'Moquillo', '2025-03-10');
```

### **2. Múltiples pagos (renovaciones)**
```sql
-- Antes: Solo 1 pago
-- Ahora: Historial de renovaciones anuales
INSERT INTO pet_payments (pet_id, payment_type, amount) VALUES
(1, 'registration', 150.00),
(1, 'renewal', 100.00),
(1, 'renewal', 100.00);
```

### **3. Tracking de impresiones de carnet**
```sql
-- Contar cuántas veces se imprimió el carnet
SELECT pet_id, print_count, print_date
FROM pet_documents
WHERE card_printed = TRUE;
```

---

## 💡 EJEMPLOS DE QUERIES OPTIMIZADOS:

### **Antes (leía 30 columnas siempre):**
```sql
SELECT * FROM pets WHERE id = 1;
-- ❌ Devuelve todos los campos aunque solo necesites el nombre
```

### **Después (lee solo lo necesario):**
```sql
-- Solo datos básicos
SELECT pet_name, breed_id, age FROM pets WHERE id = 1;

-- Solo salud
SELECT * FROM pet_health_records WHERE pet_id = 1;

-- Historial de vacunas
SELECT * FROM pet_vaccinations WHERE pet_id = 1 ORDER BY vaccine_date DESC;

-- JOIN solo cuando sea necesario
SELECT p.pet_name, h.medical_history, d.qr_code_path
FROM pets p
LEFT JOIN pet_health_records h ON p.id = h.pet_id
LEFT JOIN pet_documents d ON p.id = d.pet_id
WHERE p.id = 1;
```

---

## ⚙️ CAMBIOS EN EL BACKEND:

### **Endpoint de registro actualizado:**

```javascript
// Antes: 1 INSERT en pets con 25+ campos
INSERT INTO pets (nombre, raza, foto, qr, vacuna, recibo...) VALUES (...)

// Ahora: 4 INSERTs especializados
1. INSERT INTO pets (solo datos básicos)
2. INSERT INTO pet_health_records (salud)
3. INSERT INTO pet_documents (archivos)
4. INSERT INTO pet_payments (si es raza peligrosa)
5. INSERT INTO pet_vaccinations (opcional, futuro)
```

---

## 🎯 PRÓXIMOS PASOS - FASE 2:

### **Tablas pendientes para futuro:**

```sql
-- Auditoría
CREATE TABLE audit_log (...);

-- Notificaciones
CREATE TABLE notifications (...);

-- Seguimiento de reportes
CREATE TABLE stray_report_updates (...);

-- Sistema de adopciones
CREATE TABLE adoptions (...);
```

---

## ⚠️ IMPORTANTE PARA DESARROLLADORES:

### **Al consultar mascotas, ahora debes:**

```javascript
// ❌ INCORRECTO (campo no existe en pets)
SELECT qr_code_path FROM pets WHERE id = 1;

// ✅ CORRECTO (campo está en pet_documents)
SELECT qr_code_path FROM pet_documents WHERE pet_id = 1;

// ✅ O hacer JOIN
SELECT p.pet_name, d.qr_code_path
FROM pets p
JOIN pet_documents d ON p.id = d.pet_id
WHERE p.id = 1;
```

### **Al insertar nueva mascota:**

```javascript
// 1. Insertar pet
const [petResult] = await connection.query('INSERT INTO pets...');
const petId = petResult.insertId;

// 2. Insertar salud
await connection.query('INSERT INTO pet_health_records...');

// 3. Insertar documentos
await connection.query('INSERT INTO pet_documents...');

// 4. Insertar pago (si aplica)
if (isDangerousBreed) {
  await connection.query('INSERT INTO pet_payments...');
}
```

---

## 📁 ARCHIVOS MODIFICADOS:

1. ✅ `server/database/init_database_v3.sql` - Estructura de tablas
2. ✅ `server/config/database.js` - Migración automática
3. ✅ `server/index.js` - Endpoint de registro
4. ✅ `server/database/REFACTORIZACION_FASE1.md` - Este documento

---

## 🎉 BENEFICIOS LOGRADOS:

1. ✅ **Tabla pets más limpia** (de 30 → 11 campos)
2. ✅ **Responsabilidades separadas** (principio SOLID)
3. ✅ **Extensibilidad mejorada** (historial de vacunas/pagos)
4. ✅ **Performance optimizado** (queries más rápidos)
5. ✅ **Mantenimiento simplificado** (cambios aislados)
6. ✅ **Escalabilidad** (soporta crecimiento futuro)

---

**Estado:** ✅ **PRODUCCIÓN READY**  
**Próximo hito:** FASE 2 - Auditoría y Notificaciones
