-- =====================================================
-- MIGRACIÓN: Agregar asignación de reportes
-- =====================================================
-- Fecha: 2025-11-12
-- Descripción: Agrega columna assigned_to a stray_reports
-- para asignar reportes a personal de seguimiento
-- =====================================================

USE pets_db;

-- =====================================================
-- 1. AGREGAR COLUMNA assigned_to A stray_reports
-- =====================================================

-- Verificar y agregar assigned_to
SET @dbname = DATABASE();
SET @tablename = 'stray_reports';
SET @columnname = 'assigned_to';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = @columnname
  ) > 0,
  "SELECT 'Column assigned_to already exists' AS msg;",
  "ALTER TABLE stray_reports
   ADD COLUMN assigned_to INT NULL COMMENT 'ID del usuario municipal asignado para seguimiento',
   ADD CONSTRAINT fk_stray_reports_assigned FOREIGN KEY (assigned_to) REFERENCES adopters(id) ON DELETE SET NULL,
   ADD INDEX idx_assigned_to (assigned_to);"
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- =====================================================
-- 2. AGREGAR COLUMNA assigned_at PARA RASTREO
-- =====================================================

SET @columnname = 'assigned_at';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = @columnname
  ) > 0,
  "SELECT 'Column assigned_at already exists' AS msg;",
  "ALTER TABLE stray_reports
   ADD COLUMN assigned_at TIMESTAMP NULL COMMENT 'Fecha y hora de asignación del reporte';"
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- =====================================================
-- 3. AGREGAR COLUMNA assigned_by PARA AUDITORÍA
-- =====================================================

SET @columnname = 'assigned_by';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = @columnname
  ) > 0,
  "SELECT 'Column assigned_by already exists' AS msg;",
  "ALTER TABLE stray_reports
   ADD COLUMN assigned_by INT NULL COMMENT 'ID del usuario que asignó el reporte',
   ADD CONSTRAINT fk_stray_reports_assigned_by FOREIGN KEY (assigned_by) REFERENCES adopters(id) ON DELETE SET NULL,
   ADD INDEX idx_assigned_by (assigned_by);"
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- =====================================================
-- 4. ACTUALIZAR VISTA view_stray_reports_complete
-- =====================================================

-- Eliminar vista existente
DROP VIEW IF EXISTS view_stray_reports_complete;

-- Crear vista actualizada con información de asignación
CREATE VIEW view_stray_reports_complete AS
SELECT
    sr.*,
    b.name as breed_name,
    s.name as size_name,
    s.code as size_code,
    t.name as temperament_name,
    t.code as temperament_code,
    t.color as temperament_color,
    rc.name as condition_name,
    rc.code as condition_code,
    ul.name as urgency_name,
    ul.code as urgency_code,
    ul.color as urgency_color,
    ul.priority as urgency_priority,
    a.first_name as reporter_first_name,
    a.last_name as reporter_last_name,
    a.phone as reporter_phone_from_user,
    a.email as reporter_email_from_user,
    -- Información del usuario asignado
    assigned_user.first_name as assigned_first_name,
    assigned_user.last_name as assigned_last_name,
    assigned_user.email as assigned_email,
    assigned_user.phone as assigned_phone,
    assigned_user.employee_code as assigned_employee_code,
    assigned_role.name as assigned_role_name,
    assigned_role.code as assigned_role_code,
    GROUP_CONCAT(c.name SEPARATOR ', ') as colors
FROM stray_reports sr
LEFT JOIN breeds b ON sr.breed_id = b.id
LEFT JOIN sizes s ON sr.size_id = s.id
LEFT JOIN temperaments t ON sr.temperament_id = t.id
LEFT JOIN report_conditions rc ON sr.condition_id = rc.id
LEFT JOIN urgency_levels ul ON sr.urgency_level_id = ul.id
LEFT JOIN adopters a ON sr.reporter_id = a.id
-- Joins para información del usuario asignado
LEFT JOIN adopters assigned_user ON sr.assigned_to = assigned_user.id
LEFT JOIN roles assigned_role ON assigned_user.role_id = assigned_role.id
LEFT JOIN stray_report_colors src ON sr.id = src.stray_report_id
LEFT JOIN colors c ON src.color_id = c.id
GROUP BY sr.id;

-- =====================================================
-- VERIFICACIÓN
-- =====================================================

SELECT 'Estructura de stray_reports actualizada:' AS info;
DESCRIBE stray_reports;

SELECT 'Vista view_stray_reports_complete actualizada:' AS info;
SHOW CREATE VIEW view_stray_reports_complete;

-- Ver algunos reportes con información de asignación
SELECT
    sr.id,
    sr.status,
    sr.assigned_to,
    CONCAT(assigned_user.first_name, ' ', assigned_user.last_name) as assigned_user_name,
    assigned_role.name as assigned_role,
    sr.assigned_at
FROM stray_reports sr
LEFT JOIN adopters assigned_user ON sr.assigned_to = assigned_user.id
LEFT JOIN roles assigned_role ON assigned_user.role_id = assigned_role.id
ORDER BY sr.created_at DESC
LIMIT 5;
