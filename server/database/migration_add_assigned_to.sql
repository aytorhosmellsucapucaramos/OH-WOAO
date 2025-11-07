-- =====================================================
-- MIGRACIÓN: Agregar columna assigned_to a stray_reports
-- =====================================================
-- Fecha: 2025-11-05
-- Descripción: Agrega columna assigned_to para asignar reportes a personal
-- =====================================================

USE pets_db;

-- Verificar si la columna ya existe, si no, agregarla
SET @dbname = DATABASE();
SET @tablename = 'stray_reports';
SET @columnname = 'assigned_to';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (TABLE_SCHEMA = @dbname)
      AND (TABLE_NAME = @tablename)
      AND (COLUMN_NAME = @columnname)
  ) > 0,
  "SELECT 'Column assigned_to already exists in stray_reports table' AS msg;",
  "ALTER TABLE stray_reports 
   ADD COLUMN assigned_to INT NULL COMMENT 'ID del usuario asignado (personal de seguimiento)',
   ADD CONSTRAINT fk_stray_reports_assigned FOREIGN KEY (assigned_to) REFERENCES adopters(id) ON DELETE SET NULL,
   ADD INDEX idx_assigned_to (assigned_to);"
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- =====================================================
-- FIN DE LA MIGRACIÓN
-- =====================================================

-- VERIFICACIÓN:
SELECT 'Columna assigned_to agregada a stray_reports' AS info;
DESCRIBE stray_reports;
