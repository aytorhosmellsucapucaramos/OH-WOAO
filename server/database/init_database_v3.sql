-- =====================================================
-- SCRIPT DE CREACIÓN DE BASE DE DATOS - SISTEMA DE REGISTRO DE MASCOTAS
-- Versión 3.0 - Estructura Completamente Normalizada
-- =====================================================

-- Crear base de datos solo si no existe (SAFE MODE - NO BORRA DATOS)
CREATE DATABASE IF NOT EXISTS pets_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE pets_db;

-- =====================================================
-- TABLAS DE CATÁLOGOS (Datos maestros del sistema)
-- =====================================================

-- Tabla de razas de perros
CREATE TABLE IF NOT EXISTS breeds (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla de colores
CREATE TABLE IF NOT EXISTS colors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    hex_code VARCHAR(7),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla de tamaños de mascotas
CREATE TABLE IF NOT EXISTS sizes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(50) NOT NULL,
    description VARCHAR(255),
    display_order INT DEFAULT 0,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla de temperamentos
CREATE TABLE IF NOT EXISTS temperaments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(50) NOT NULL,
    description VARCHAR(255),
    color VARCHAR(7) DEFAULT '#4CAF50',
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla de condiciones de reporte (callejero, perdido, abandonado)
CREATE TABLE IF NOT EXISTS report_conditions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(50) NOT NULL,
    description VARCHAR(255),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla de niveles de urgencia
CREATE TABLE IF NOT EXISTS urgency_levels (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(50) NOT NULL,
    description VARCHAR(255),
    color VARCHAR(7) DEFAULT '#4CAF50',
    priority INT DEFAULT 0,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_code (code),
    INDEX idx_priority (priority)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- TABLAS PRINCIPALES
-- =====================================================

-- Tabla de propietarios (adopters)
CREATE TABLE IF NOT EXISTS adopters (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    dni VARCHAR(8) UNIQUE NOT NULL,
    dni_photo_path VARCHAR(255),
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    photo_path VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_dni (dni),
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- TABLA PRINCIPAL DE MASCOTAS - REFACTORIZADA (Solo datos básicos)
-- =====================================================
CREATE TABLE IF NOT EXISTS pets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cui VARCHAR(20) UNIQUE NOT NULL,
    pet_name VARCHAR(100) NOT NULL,
    sex ENUM('male', 'female') NOT NULL,
    breed_id INT NOT NULL,
    birth_date DATE COMMENT 'Fecha de nacimiento del can',
    age INT NOT NULL COMMENT 'Edad en meses',
    size_id INT NOT NULL,
    additional_features TEXT COMMENT 'Características físicas especiales',
    adopter_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (adopter_id) REFERENCES adopters(id) ON DELETE CASCADE,
    FOREIGN KEY (breed_id) REFERENCES breeds(id),
    FOREIGN KEY (size_id) REFERENCES sizes(id),
    INDEX idx_cui (cui),
    INDEX idx_adopter (adopter_id),
    INDEX idx_breed (breed_id),
    INDEX idx_size (size_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- TABLAS ESPECIALIZADAS DE MASCOTAS - FASE 1
-- =====================================================

-- Tabla de registros de salud de mascotas
CREATE TABLE IF NOT EXISTS pet_health_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pet_id INT NOT NULL,
    has_vaccination_card BOOLEAN DEFAULT FALSE COMMENT '¿Tiene carnet de vacunación?',
    vaccination_card_path VARCHAR(255) COMMENT 'Ruta del archivo del carnet',
    has_rabies_vaccine BOOLEAN DEFAULT FALSE COMMENT '¿Tiene vacuna antirrábica?',
    rabies_vaccine_path VARCHAR(255) COMMENT 'Ruta del certificado antirrábico',
    medical_history TEXT COMMENT 'Historial médico general',
    aggression_history ENUM('yes', 'no') DEFAULT 'no' COMMENT 'Antecedentes de agresividad',
    aggression_details TEXT COMMENT 'Detalles de incidentes de agresividad',
    last_checkup_date DATE COMMENT 'Última revisión veterinaria',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE,
    UNIQUE KEY unique_pet_health (pet_id),
    INDEX idx_pet (pet_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla de documentos y archivos de mascotas
CREATE TABLE IF NOT EXISTS pet_documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pet_id INT NOT NULL,
    photo_frontal_path VARCHAR(255) COMMENT 'Foto frontal para el carnet',
    photo_posterior_path VARCHAR(255) COMMENT 'Foto posterior para el carnet',
    qr_code_path VARCHAR(255) COMMENT 'Ruta del código QR generado',
    card_printed BOOLEAN DEFAULT FALSE COMMENT '¿Se imprimió el carnet físico?',
    print_date TIMESTAMP NULL COMMENT 'Fecha de impresión del carnet',
    print_count INT DEFAULT 0 COMMENT 'Número de veces que se imprimió',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE,
    UNIQUE KEY unique_pet_document (pet_id),
    INDEX idx_pet (pet_id),
    INDEX idx_card_printed (card_printed)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla de pagos para razas potencialmente peligrosas
CREATE TABLE IF NOT EXISTS pet_payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pet_id INT NOT NULL,
    receipt_number VARCHAR(100) NOT NULL COMMENT 'Número de recibo de caja',
    receipt_issue_date DATE NOT NULL COMMENT 'Fecha de emisión del recibo',
    receipt_payer VARCHAR(255) NOT NULL COMMENT 'Nombre o razón social del pagador',
    receipt_amount DECIMAL(10, 2) NOT NULL COMMENT 'Monto del pago',
    payment_type ENUM('registration', 'renewal', 'penalty') DEFAULT 'registration' COMMENT 'Tipo de pago',
    status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending' COMMENT 'Estado de verificación',
    verified_by INT NULL COMMENT 'ID del admin que verificó',
    verified_at TIMESTAMP NULL COMMENT 'Fecha de verificación',
    notes TEXT COMMENT 'Notas administrativas',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE,
    INDEX idx_pet (pet_id),
    INDEX idx_status (status),
    INDEX idx_receipt (receipt_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla de historial de vacunaciones (múltiples vacunas por mascota)
CREATE TABLE IF NOT EXISTS pet_vaccinations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pet_id INT NOT NULL,
    vaccine_name VARCHAR(100) NOT NULL COMMENT 'Nombre de la vacuna (ej: Rabia, Parvovirus)',
    vaccine_date DATE NOT NULL COMMENT 'Fecha de aplicación',
    next_dose_date DATE COMMENT 'Fecha de próxima dosis',
    veterinarian VARCHAR(255) COMMENT 'Veterinario que aplicó',
    clinic VARCHAR(255) COMMENT 'Clínica veterinaria',
    batch_number VARCHAR(100) COMMENT 'Número de lote de la vacuna',
    notes TEXT COMMENT 'Observaciones',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE,
    INDEX idx_pet (pet_id),
    INDEX idx_vaccine_date (vaccine_date),
    INDEX idx_next_dose (next_dose_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla pivote para colores de mascotas (relación muchos-a-muchos)
CREATE TABLE IF NOT EXISTS pet_colors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pet_id INT NOT NULL,
    color_id INT NOT NULL,
    display_order INT DEFAULT 0 COMMENT 'Orden de visualización (primario, secundario, etc)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE,
    FOREIGN KEY (color_id) REFERENCES colors(id) ON DELETE CASCADE,
    UNIQUE KEY unique_pet_color (pet_id, color_id),
    INDEX idx_pet (pet_id),
    INDEX idx_color (color_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla de reportes de perros callejeros - NORMALIZADA
CREATE TABLE IF NOT EXISTS stray_reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reporter_id INT,
    reporter_name VARCHAR(255),
    reporter_phone VARCHAR(20),
    reporter_email VARCHAR(255),
    
    -- Ubicación
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    address VARCHAR(255),
    zone VARCHAR(100),
    
    -- Información del perro
    breed_id INT,
    size_id INT,
    temperament_id INT,
    condition_id INT NOT NULL,
    urgency_level_id INT NOT NULL,
    
    -- Descripción y evidencia
    description TEXT NOT NULL,
    photo_path VARCHAR(255),
    
    -- Estado
    status ENUM('active', 'in_progress', 'resolved', 'closed') DEFAULT 'active',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (reporter_id) REFERENCES adopters(id) ON DELETE SET NULL,
    FOREIGN KEY (breed_id) REFERENCES breeds(id) ON DELETE SET NULL,
    FOREIGN KEY (size_id) REFERENCES sizes(id) ON DELETE SET NULL,
    FOREIGN KEY (temperament_id) REFERENCES temperaments(id) ON DELETE SET NULL,
    FOREIGN KEY (condition_id) REFERENCES report_conditions(id),
    FOREIGN KEY (urgency_level_id) REFERENCES urgency_levels(id),
    
    INDEX idx_reporter (reporter_id),
    INDEX idx_status (status),
    INDEX idx_location (latitude, longitude),
    INDEX idx_urgency (urgency_level_id),
    INDEX idx_condition (condition_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla pivote para colores de reportes de callejeros (relación muchos-a-muchos)
CREATE TABLE IF NOT EXISTS stray_report_colors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    stray_report_id INT NOT NULL,
    color_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (stray_report_id) REFERENCES stray_reports(id) ON DELETE CASCADE,
    FOREIGN KEY (color_id) REFERENCES colors(id) ON DELETE CASCADE,
    UNIQUE KEY unique_report_color (stray_report_id, color_id),
    INDEX idx_report (stray_report_id),
    INDEX idx_color (color_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- DATOS INICIALES DE CATÁLOGOS
-- =====================================================

-- Insertar razas comunes
INSERT IGNORE INTO breeds (name, description) VALUES
('Mestizo', 'Perro de raza mixta'),
('Labrador', 'Labrador Retriever'),
('Pastor Alemán', 'Pastor Alemán'),
('Golden Retriever', 'Golden Retriever'),
('Bulldog', 'Bulldog Inglés o Francés'),
('Chihuahua', 'Chihuahua'),
('Poodle', 'Poodle o Caniche'),
('Beagle', 'Beagle'),
('Yorkshire Terrier', 'Yorkshire Terrier'),
('Rottweiler', 'Rottweiler'),
('Dálmata', 'Dálmata'),
('Boxer', 'Boxer'),
('Husky Siberiano', 'Husky Siberiano'),
('Pug', 'Pug o Carlino'),
('Shih Tzu', 'Shih Tzu'),
('Schnauzer', 'Schnauzer'),
('Cocker Spaniel', 'Cocker Spaniel'),
('Border Collie', 'Border Collie'),
('San Bernardo', 'San Bernardo'),
('Pitbull', 'American Pit Bull Terrier');

-- Insertar colores con código hexadecimal
INSERT IGNORE INTO colors (name, hex_code) VALUES
('Negro', '#000000'),
('Blanco', '#FFFFFF'),
('Marrón', '#8B4513'),
('Dorado', '#FFD700'),
('Gris', '#808080'),
('Beige', '#F5F5DC'),
('Crema', '#FFFDD0'),
('Canela', '#D2691E'),
('Chocolate', '#7B3F00'),
('Atigrado', '#8B7355'),
('Tricolor', '#A52A2A'),
('Manchado', '#D3D3D3'),
('Rubio', '#F0E68C'),
('Rojizo', '#CD5C5C');

-- Insertar tamaños
INSERT IGNORE INTO sizes (code, name, description, display_order) VALUES
('small', 'Pequeño', 'Perros de menos de 10 kg', 1),
('medium', 'Mediano', 'Perros entre 10 y 25 kg', 2),
('large', 'Grande', 'Perros de más de 25 kg', 3);

-- Insertar temperamentos con colores
INSERT IGNORE INTO temperaments (code, name, description, color) VALUES
('friendly', 'Amigable', 'Perro sociable y amistoso', '#4CAF50'),
('shy', 'Tímido', 'Perro reservado y cauteloso', '#FF9800'),
('aggressive', 'Agresivo', 'Perro que muestra agresividad', '#F44336'),
('scared', 'Asustado', 'Perro temeroso', '#9C27B0'),
('playful', 'Juguetón', 'Perro energético y juguetón', '#2196F3'),
('calm', 'Tranquilo', 'Perro calmado y pacífico', '#009688');

-- Insertar condiciones de reporte
INSERT IGNORE INTO report_conditions (code, name, description) VALUES
('stray', 'Callejero', 'Perro sin hogar aparente'),
('lost', 'Perdido', 'Perro que parece estar perdido'),
('abandoned', 'Abandonado', 'Perro abandonado recientemente');

-- Insertar niveles de urgencia con prioridad
INSERT IGNORE INTO urgency_levels (code, name, description, color, priority) VALUES
('low', 'Baja', 'Situación no urgente', '#4CAF50', 1),
('normal', 'Normal', 'Situación que requiere atención', '#FF9800', 2),
('high', 'Alta', 'Situación urgente', '#F44336', 3),
('emergency', 'Emergencia', 'Situación crítica que requiere atención inmediata', '#9C27B0', 4);

-- =====================================================
-- VISTAS PARA FACILITAR CONSULTAS
-- =====================================================

-- =====================================================
-- VISTA ACTUALIZADA - REFACTORIZACIÓN FASE 1
-- =====================================================
-- Vista completa de mascotas con información de tablas especializadas
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
    
    -- Verificar si tiene pagos registrados
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

-- Vista completa de reportes con información relacionada
DROP VIEW IF EXISTS view_stray_reports_complete;
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
    ul.priority as urgency_priority
FROM stray_reports sr
LEFT JOIN breeds b ON sr.breed_id = b.id
LEFT JOIN sizes s ON sr.size_id = s.id
LEFT JOIN temperaments t ON sr.temperament_id = t.id
LEFT JOIN report_conditions rc ON sr.condition_id = rc.id
LEFT JOIN urgency_levels ul ON sr.urgency_level_id = ul.id;

-- =====================================================
-- TRIGGERS Y PROCEDIMIENTOS ALMACENADOS
-- =====================================================

-- Trigger para generar CUI automáticamente si no se proporciona
DELIMITER $$

CREATE TRIGGER before_pet_insert 
BEFORE INSERT ON pets
FOR EACH ROW
BEGIN
    IF NEW.cui IS NULL OR NEW.cui = '' THEN
        SET NEW.cui = CONCAT(
            LPAD(NEW.adopter_id, 8, '0'),
            '-',
            FLOOR(1 + RAND() * 9)
        );
    END IF;
END$$

DELIMITER ;

-- =====================================================
-- ÍNDICES ADICIONALES PARA OPTIMIZACIÓN
-- =====================================================

-- Índice de texto completo para búsqueda
ALTER TABLE breeds ADD FULLTEXT INDEX idx_breed_search (name, description);
ALTER TABLE pets ADD FULLTEXT INDEX idx_pet_search (pet_name, additional_features, medical_history);

-- =====================================================
-- COMENTARIOS DE LA BASE DE DATOS
-- =====================================================

ALTER TABLE pets COMMENT = 'Tabla principal de mascotas registradas - V3.0 Normalizada';
ALTER TABLE stray_reports COMMENT = 'Reportes de perros callejeros con datos normalizados';
ALTER TABLE breeds COMMENT = 'Catálogo de razas de perros';
ALTER TABLE colors COMMENT = 'Catálogo de colores con códigos hex';
ALTER TABLE sizes COMMENT = 'Catálogo de tamaños (pequeño, mediano, grande)';
ALTER TABLE temperaments COMMENT = 'Catálogo de temperamentos con colores asociados';
ALTER TABLE report_conditions COMMENT = 'Catálogo de condiciones (callejero, perdido, abandonado)';
ALTER TABLE urgency_levels COMMENT = 'Catálogo de niveles de urgencia con prioridad';

-- =====================================================
-- FIN DEL SCRIPT
-- =====================================================
