-- =====================================================
-- MIGRACIÓN: Actualizar vista view_pets_complete
-- =====================================================
-- Fecha: 2025-11-07
-- Descripción: Agregar medical_history_id y medical_history_details a la vista
-- =====================================================

USE pets_db;

-- Eliminar vista existente y recrearla con los nuevos campos
DROP VIEW IF EXISTS view_pets_complete;

CREATE VIEW view_pets_complete AS
SELECT 
    -- Datos básicos de la mascota
    p.id,
    p.cui,
    p.pet_name,
    p.sex,
    p.breed_id,
    p.birth_date,
    p.age,
    p.size_id,
    p.additional_features,
    p.adopter_id,
    p.created_at,
    p.updated_at,
    
    -- Catálogos
    b.name as breed,
    b.name as breed_name,
    s.name as size_name,
    s.code as size_code,
    
    -- Colores (concatenados)
    GROUP_CONCAT(DISTINCT c.name ORDER BY pc.display_order SEPARATOR ', ') as color,
    GROUP_CONCAT(DISTINCT c.name ORDER BY pc.display_order SEPARATOR ', ') as color_name,
    GROUP_CONCAT(DISTINCT c.hex_code ORDER BY pc.display_order SEPARATOR ',') as color_hex,
    
    -- Datos del propietario
    a.first_name as owner_first_name,
    a.last_name as owner_last_name,
    a.dni as owner_dni,
    a.email as owner_email,
    a.phone as owner_phone,
    a.address as owner_address,
    a.photo_path as owner_photo_path,
    
    -- Datos de salud
    h.has_vaccination_card,
    h.vaccination_card_path,
    h.has_rabies_vaccine,
    h.rabies_vaccine_path,
    h.medical_history,
    h.medical_history_id,
    h.medical_history_details,
    h.aggression_history,
    h.aggression_details,
    h.last_checkup_date,
    
    -- Datos de documentos
    d.photo_frontal_path,
    d.photo_posterior_path,
    d.qr_code_path,
    d.card_printed,
    d.print_date,
    d.print_count,
    
    -- Datos de pago (para razas peligrosas) - Usando MAX para compatibilidad con GROUP BY
    MAX(pay.id) as payment_id,
    MAX(pay.receipt_number) as receipt_number,
    MAX(pay.receipt_issue_date) as receipt_issue_date,
    MAX(pay.receipt_payer) as receipt_payer,
    MAX(pay.receipt_amount) as receipt_amount,
    MAX(pay.payment_type) as payment_type,
    MAX(pay.status) as payment_status,
    MAX(pay.verified_by) as verified_by,
    MAX(pay.verified_at) as verified_at,
    MAX(pay.notes) as payment_notes,
    CASE WHEN MAX(pay.id) IS NOT NULL THEN 1 ELSE 0 END as has_payments
    
FROM pets p
LEFT JOIN breeds b ON p.breed_id = b.id
LEFT JOIN sizes s ON p.size_id = s.id
LEFT JOIN adopters a ON p.adopter_id = a.id
LEFT JOIN pet_health_records h ON p.id = h.pet_id
LEFT JOIN pet_documents d ON p.id = d.pet_id
LEFT JOIN pet_colors pc ON p.id = pc.pet_id
LEFT JOIN colors c ON pc.color_id = c.id
LEFT JOIN pet_payments pay ON p.id = pay.pet_id
GROUP BY p.id;

-- Verificar que la vista se creó correctamente
SELECT 'Vista view_pets_complete actualizada correctamente' as status;
