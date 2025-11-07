-- =====================================================
-- MIGRACIÓN: Sistema de Roles y Permisos
-- =====================================================
-- Fecha: 2025-11-04
-- Descripción: Implementa tabla de roles y actualiza adopters
-- Sistema de roles para: Usuario, Admin, Personal de Seguimiento
-- =====================================================

USE pets_db;

-- =====================================================
-- 1. CREAR TABLA DE ROLES
-- =====================================================
CREATE TABLE IF NOT EXISTS roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    permissions JSON COMMENT 'Permisos específicos del rol en formato JSON',
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Catálogo de roles del sistema';

-- =====================================================
-- 2. INSERTAR ROLES INICIALES
-- =====================================================
INSERT INTO roles (code, name, description, permissions) VALUES
('user', 'Usuario', 'Usuario regular que registra mascotas y reporta callejeros', 
 JSON_OBJECT(
   'can_register_pet', true, 
   'can_report_stray', true,
   'can_view_own_pets', true,
   'can_view_own_reports', true
 )),
 
('admin', 'Administrador', 'Personal de oficina - verifica reportes y asigna casos', 
 JSON_OBJECT(
   'can_verify_reports', true, 
   'can_assign_cases', true, 
   'can_manage_users', true,
   'can_manage_roles', true,
   'can_view_all_reports', true,
   'can_view_all_pets', true,
   'can_generate_reports', true,
   'can_manage_payments', true
 )),
 
('seguimiento', 'Personal de Seguimiento', 'Personal de campo - atiende casos asignados', 
 JSON_OBJECT(
   'can_view_assigned_cases', true, 
   'can_update_case_status', true, 
   'can_upload_evidence', true,
   'can_add_field_notes', true,
   'can_close_cases', true
 ));

-- =====================================================
-- 3. AGREGAR COLUMNAS A TABLA ADOPTERS
-- =====================================================

-- Verificar y agregar role_id
SET @dbname = DATABASE();
SET @tablename = 'adopters';
SET @columnname = 'role_id';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = @columnname
  ) > 0,
  "SELECT 'Column role_id already exists' AS msg;",
  "ALTER TABLE adopters 
   ADD COLUMN role_id INT DEFAULT 1 COMMENT 'Relación con tabla roles (1=user por defecto)',
   ADD CONSTRAINT fk_adopters_role FOREIGN KEY (role_id) REFERENCES roles(id),
   ADD INDEX idx_role (role_id);"
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Verificar y agregar assigned_zone
SET @columnname = 'assigned_zone';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = @columnname
  ) > 0,
  "SELECT 'Column assigned_zone already exists' AS msg;",
  "ALTER TABLE adopters 
   ADD COLUMN assigned_zone VARCHAR(100) NULL COMMENT 'Zona asignada (solo para personal de seguimiento)';"
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Verificar y agregar employee_code
SET @columnname = 'employee_code';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = @columnname
  ) > 0,
  "SELECT 'Column employee_code already exists' AS msg;",
  "ALTER TABLE adopters 
   ADD COLUMN employee_code VARCHAR(20) NULL COMMENT 'Código de empleado municipal';"
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Verificar y agregar is_active
SET @columnname = 'is_active';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = @columnname
  ) > 0,
  "SELECT 'Column is_active already exists' AS msg;",
  "ALTER TABLE adopters 
   ADD COLUMN is_active BOOLEAN DEFAULT TRUE COMMENT 'Usuario activo en el sistema';"
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- =====================================================
-- 4. ACTUALIZAR USUARIOS EXISTENTES
-- =====================================================
-- Todos los usuarios existentes se convierten en rol "user"
UPDATE adopters SET role_id = 1 WHERE role_id IS NULL OR role_id = 0;

-- =====================================================
-- 5. AGREGAR CONSTRAINT DE SEGURIDAD (OPCIONAL)
-- =====================================================
-- Esto asegura que:
-- - Los usuarios normales (role_id = 1) DEBEN tener mascotas
-- - Los usuarios admin/seguimiento NO necesitan mascotas
-- Nota: Esto es opcional y se puede agregar después si se desea

-- COMENTARIO: Por ahora no agregamos este constraint para mantener flexibilidad
-- Se implementará a nivel de lógica de negocio en el backend

-- =====================================================
-- 5. CREAR TABLA DE ZONAS (OPCIONAL - para dropdown)
-- =====================================================
CREATE TABLE IF NOT EXISTS zones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Catálogo de zonas para asignación de personal';

-- Insertar zonas de ejemplo (ajustar según las zonas reales de Puno)
INSERT INTO zones (code, name, description) VALUES
('centro', 'Zona Centro', 'Centro de la ciudad de Puno'),
('norte', 'Zona Norte', 'Sector norte de Puno'),
('sur', 'Zona Sur', 'Sector sur de Puno'),
('este', 'Zona Este', 'Sector este de Puno'),
('oeste', 'Zona Oeste', 'Sector oeste de Puno');

-- =====================================================
-- FIN DE LA MIGRACIÓN
-- =====================================================

-- VERIFICACIÓN:
SELECT 'Roles creados:' AS info;
SELECT * FROM roles;

SELECT 'Zonas creadas:' AS info;
SELECT * FROM zones;

SELECT 'Estructura de adopters actualizada:' AS info;
DESCRIBE adopters;

-- Ver usuarios con sus roles
SELECT 
    a.id,
    a.first_name,
    a.last_name,
    a.email,
    r.name as role_name,
    a.assigned_zone,
    a.employee_code,
    a.is_active
FROM adopters a
LEFT JOIN roles r ON a.role_id = r.id
LIMIT 5;
