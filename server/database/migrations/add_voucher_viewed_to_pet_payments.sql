-- Migración: Agregar campo voucher_viewed a la tabla pet_payments
-- Fecha: 2025-11-25
-- Descripción: Agrega el campo para rastrear si el admin ya vio el voucher de pago

ALTER TABLE `pet_payments` 
ADD COLUMN `voucher_viewed` TINYINT(1) DEFAULT 0 COMMENT 'Si el administrador ya vio el voucher' 
AFTER `voucher_photo_path`;

-- Verificar la estructura actualizada
DESCRIBE `pet_payments`;
