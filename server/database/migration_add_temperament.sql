-- =====================================================
-- MIGRACIÓN: Agregar campo de temperamento a la tabla pets
-- =====================================================
-- Fecha: 2025-11-04
-- Descripción: Agrega columna temperament_id a pets y datos de temperamentos
-- NOTA: La tabla temperaments YA EXISTE (usada por stray_reports)
--       Solo agregamos la columna a pets y los datos si no existen
-- =====================================================

USE pets_db;

-- 1. Verificar si la columna ya existe, si no, agregarla
-- MySQL no tiene IF NOT EXISTS para columnas, así que usamos un procedimiento seguro
SET @dbname = DATABASE();
SET @tablename = 'pets';
SET @columnname = 'temperament_id';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (TABLE_SCHEMA = @dbname)
      AND (TABLE_NAME = @tablename)
      AND (COLUMN_NAME = @columnname)
  ) > 0,
  "SELECT 'Column temperament_id already exists in pets table' AS msg;",
  "ALTER TABLE pets 
   ADD COLUMN temperament_id INT DEFAULT NULL COMMENT 'Relación con tabla de temperamentos',
   ADD CONSTRAINT fk_pets_temperament FOREIGN KEY (temperament_id) REFERENCES temperaments(id),
   ADD INDEX idx_temperament (temperament_id);"
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- 2. Insertar datos de temperamentos (IGNORAR si ya existen)
INSERT IGNORE INTO temperaments (code, name, description, color) VALUES
('muy_sociable', 'Muy Sociable', 'Amigable con todos, muy juguetón y sociable', '#4CAF50'),
('sociable', 'Sociable', 'Amigable en general, se lleva bien con otros', '#8BC34A'),
('reservado', 'Reservado/Tímido', 'Prefiere observar antes de interactuar', '#FFC107'),
('territorial', 'Territorial', 'Protector de su espacio y familia', '#FF9800'),
('requiere_atencion', 'Requiere Atención Especial', 'Necesita manejo cuidadoso', '#FF5722');

-- 4. Actualizar mascotas existentes (opcional - asignar temperamento por defecto)
-- UPDATE pets SET temperament_id = 2 WHERE temperament_id IS NULL;

-- =====================================================
-- FIN DE LA MIGRACIÓN
-- =====================================================

-- VERIFICACIÓN:
-- SELECT * FROM temperaments;
-- SELECT p.*, t.name as temperamento FROM pets p LEFT JOIN temperaments t ON p.temperament_id = t.id LIMIT 5;
