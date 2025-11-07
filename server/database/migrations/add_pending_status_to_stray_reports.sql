-- Migración: Agregar estado 'pending' al ENUM de stray_reports
-- Fecha: 2025-11-07
-- Descripción: Agrega el valor 'pending' a la columna status de stray_reports

USE pets_db;

-- Modificar el ENUM para incluir 'pending'
ALTER TABLE `stray_reports` 
MODIFY COLUMN `status` ENUM('active', 'pending', 'in_progress', 'resolved', 'closed') 
DEFAULT 'active'
COMMENT 'Estado del reporte: active=activo, pending=pendiente, in_progress=en progreso, resolved=resuelto, closed=cerrado';

-- Verificar el cambio
DESCRIBE stray_reports;

SELECT 'Migración completada: Estado "pending" agregado exitosamente' AS mensaje;
