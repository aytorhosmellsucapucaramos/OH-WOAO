-- Migración: Agregar campo voucher_photo_path a la tabla pet_payments
-- Fecha: 2025-11-19
-- Descripción: Agrega el campo para almacenar la foto del voucher de pago para mascotas peligrosas

ALTER TABLE `pet_payments` 
ADD COLUMN `voucher_photo_path` VARCHAR(255) NULL COMMENT 'Ruta del archivo de la foto del voucher de pago' 
AFTER `receipt_amount`;

-- Verificar la estructura actualizada
DESCRIBE `pet_payments`;
