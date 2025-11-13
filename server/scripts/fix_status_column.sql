-- Script para arreglar la columna status en stray_reports
-- Este script debe ejecutarse en MySQL

USE webperritos;

-- Ver la estructura actual de la tabla
DESCRIBE stray_reports;

-- Verificar tipo actual de la columna status
SHOW COLUMNS FROM stray_reports LIKE 'status';

-- Modificar la columna status para que acepte VARCHAR de 10 caracteres
ALTER TABLE stray_reports MODIFY COLUMN status VARCHAR(10) DEFAULT 'n';

-- Actualizar todos los registros existentes que tengan status NULL o inválido
UPDATE stray_reports SET status = 'n' WHERE status IS NULL OR status = '';

-- Verificar la estructura después del cambio
SHOW COLUMNS FROM stray_reports LIKE 'status';

-- Ver algunos registros para verificar
SELECT id, status, assigned_to FROM stray_reports LIMIT 10;
