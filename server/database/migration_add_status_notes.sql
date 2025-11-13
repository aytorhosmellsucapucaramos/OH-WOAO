-- =====================================================
-- MIGRACIÓN: Agregar campos para notas de estado de reportes
-- =====================================================
-- Fecha: 2025-11-12
-- Descripción: Agrega campos status_notes y status_updated_at
-- para almacenar notas y fecha de actualización de estado
-- =====================================================

USE pets_db;

-- =====================================================
-- 1. AGREGAR COLUMNA status_notes
-- =====================================================

SET @dbname = DATABASE();
SET @tablename = 'stray_reports';
SET @columnname = 'status_notes';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = @columnname
  ) > 0,
  "SELECT 'Column status_notes already exists' AS msg;",
  "ALTER TABLE stray_reports
   ADD COLUMN status_notes TEXT NULL COMMENT 'Notas adicionales sobre el estado del reporte';"
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- =====================================================
-- 2. AGREGAR COLUMNA status_updated_at
-- =====================================================

SET @columnname = 'status_updated_at';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = @columnname
  ) > 0,
  "SELECT 'Column status_updated_at already exists' AS msg;",
  "ALTER TABLE stray_reports
   ADD COLUMN status_updated_at TIMESTAMP NULL COMMENT 'Fecha y hora de la última actualización de estado';"
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- =====================================================
-- 3. ACTUALIZAR VISTA view_stray_reports_complete
-- =====================================================

-- Eliminar vista existente
DROP VIEW IF EXISTS view_stray_reports_complete;

-- Crear vista actualizada con campos de estado
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

SELECT 'Campos de estado agregados:' AS info;
DESCRIBE stray_reports;

SELECT 'Vista actualizada:' AS info;
SHOW CREATE VIEW view_stray_reports_complete;
