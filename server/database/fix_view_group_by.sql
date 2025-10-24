-- =====================================================
-- FIX: Corregir error de GROUP BY en view_pets_complete
-- Error: Expression #39 not in GROUP BY clause
-- =====================================================

USE pets_db;

-- Eliminar vista existente
DROP VIEW IF EXISTS view_pets_complete;

-- Recrear vista con corrección en pay.id
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
    b.name as breed_name,
    s.name as size_name,
    s.code as size_code,
    
    -- Colores (concatenados de la tabla pivote)
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
    
    -- Verificar si tiene pagos registrados (CORREGIDO: MAX agregado)
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

-- =====================================================
-- VERIFICACIÓN
-- =====================================================
SELECT 'Vista recreada exitosamente' as status;
