-- Script para normalizar el sistema de estados de reportes de perros callejeros
-- Ejecutar en la base de datos pets_db

USE pets_db;

-- =========================================
-- PASO 1: Crear tabla normalizada de estados
-- =========================================

CREATE TABLE IF NOT EXISTS `stray_report_status_types` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(10) NOT NULL COMMENT 'Código corto del estado (n, a, p, d, r, c)',
  `name` varchar(50) NOT NULL COMMENT 'Nombre descriptivo del estado',
  `description` text COMMENT 'Descripción detallada del estado',
  `color` varchar(7) DEFAULT '#6b7280' COMMENT 'Color hexadecimal para UI',
  `requires_notes` tinyint(1) DEFAULT 0 COMMENT 'Si requiere notas obligatorias',
  `is_final` tinyint(1) DEFAULT 0 COMMENT 'Si es un estado final',
  `display_order` int DEFAULT 0 COMMENT 'Orden de visualización',
  `is_active` tinyint(1) DEFAULT 1 COMMENT 'Estado activo',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_status_code` (`code`),
  UNIQUE KEY `uk_status_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Catálogo de estados para reportes de perros callejeros';

-- =========================================
-- PASO 2: Insertar estados predefinidos
-- =========================================

INSERT INTO `stray_report_status_types` (`code`, `name`, `description`, `color`, `requires_notes`, `is_final`, `display_order`) VALUES
('n', 'Nuevo', 'Reporte recién creado, pendiente de asignación', '#ef4444', 0, 0, 1),
('a', 'Asignado', 'Reporte asignado a personal de seguimiento', '#3b82f6', 0, 0, 2),
('p', 'En Progreso', 'Personal trabajando activamente en el caso', '#8b5cf6', 0, 0, 3),
('d', 'Completado', 'Caso resuelto satisfactoriamente por seguimiento', '#10b981', 1, 0, 4),
('r', 'En Revisión', 'Requiere revisión administrativa', '#f59e0b', 1, 0, 5),
('c', 'Cerrado', 'Caso oficialmente cerrado', '#6b7280', 0, 1, 6);

-- =========================================
-- PASO 3: Agregar nueva columna a stray_reports
-- =========================================

-- Agregar columna para el nuevo sistema
ALTER TABLE `stray_reports` 
ADD COLUMN `status_type_id` int DEFAULT NULL COMMENT 'FK a stray_report_status_types',
ADD CONSTRAINT `fk_stray_reports_status_type` 
  FOREIGN KEY (`status_type_id`) REFERENCES `stray_report_status_types`(`id`);

-- =========================================
-- PASO 4: Migrar datos existentes
-- =========================================

-- Mapear estados existentes a los nuevos IDs
UPDATE `stray_reports` sr 
SET `status_type_id` = (
  SELECT id FROM `stray_report_status_types` 
  WHERE code = CASE 
    WHEN sr.status IS NULL OR sr.status = '' THEN 'n'
    WHEN sr.status IN ('nuevo', 'new') THEN 'n'
    WHEN sr.status IN ('asignado', 'assigned', 'asg', 'as', 'a') THEN 'a'
    WHEN sr.status IN ('en_progreso', 'in_progress', 'prg', 'pr', 'p') THEN 'p'
    WHEN sr.status IN ('completado', 'completed', 'end', 'ok', 'd') THEN 'd'
    WHEN sr.status IN ('en_revision', 'under_review', 'rev', 'rv', 'r') THEN 'r'
    WHEN sr.status IN ('cerrado', 'closed', 'cls', 'cl', 'c') THEN 'c'
    ELSE 'n' -- Por defecto: nuevo
  END
);

-- Establecer estado por defecto para registros que no se pudieron mapear
UPDATE `stray_reports` 
SET `status_type_id` = (SELECT id FROM `stray_report_status_types` WHERE code = 'n')
WHERE `status_type_id` IS NULL;

-- =========================================
-- PASO 5: Hacer obligatoria la nueva columna
-- =========================================

-- Una vez migrados todos los datos, hacer la columna NOT NULL
ALTER TABLE `stray_reports` 
MODIFY COLUMN `status_type_id` int NOT NULL;

-- =========================================
-- PASO 6: Crear índices para rendimiento
-- =========================================

CREATE INDEX `idx_stray_reports_status_type` ON `stray_reports` (`status_type_id`);
CREATE INDEX `idx_stray_reports_assigned_status` ON `stray_reports` (`assigned_to`, `status_type_id`);

-- =========================================
-- OPCIONAL: Eliminar columna antigua (después de probar)
-- =========================================

-- NOTA: Ejecutar esto SOLO después de verificar que todo funciona correctamente
-- ALTER TABLE `stray_reports` DROP COLUMN `status`;

-- =========================================
-- VERIFICACIÓN
-- =========================================

-- Ver distribución de estados actuales
SELECT 
  st.code,
  st.name,
  COUNT(sr.id) as total_reports,
  st.color,
  st.requires_notes
FROM stray_report_status_types st
LEFT JOIN stray_reports sr ON sr.status_type_id = st.id
GROUP BY st.id, st.code, st.name, st.color, st.requires_notes
ORDER BY st.display_order;

-- Ver reportes con sus estados normalizados
SELECT 
  sr.id,
  sr.address,
  st.code as status_code,
  st.name as status_name,
  sr.assigned_to,
  DATE_FORMAT(sr.created_at, '%Y-%m-%d %H:%i') as created
FROM stray_reports sr
JOIN stray_report_status_types st ON sr.status_type_id = st.id
ORDER BY sr.created_at DESC
LIMIT 10;
