-- Database: pets_db
-- MySQL database schema for pets registration system

-- Create database
CREATE DATABASE IF NOT EXISTS pets_db;
USE pets_db;

-- Create adopters table
CREATE TABLE IF NOT EXISTS adopters (
    id INT PRIMARY KEY AUTO_INCREMENT,
    full_name VARCHAR(255) NOT NULL,
    dni VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address VARCHAR(255) NOT NULL,
    district VARCHAR(100) NOT NULL,
    province VARCHAR(100) NOT NULL,
    department VARCHAR(100) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create pets table
CREATE TABLE IF NOT EXISTS pets (
    id INT PRIMARY KEY AUTO_INCREMENT,
    cui VARCHAR(15) UNIQUE NOT NULL,
    pet_name VARCHAR(100) NOT NULL,
    pet_last_name VARCHAR(100),
    species VARCHAR(50) NOT NULL,
    breed VARCHAR(100) NOT NULL,
    adoption_date DATE NOT NULL,
    photo_path VARCHAR(255),
    qr_code_path VARCHAR(255),
    adopter_id INT,
    card_printed BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (adopter_id) REFERENCES adopters(id) ON DELETE CASCADE
);

-- Create stray_reports table  
CREATE TABLE IF NOT EXISTS stray_reports (
    id INT PRIMARY KEY AUTO_INCREMENT,
    report_id VARCHAR(100) UNIQUE NOT NULL,
    
    -- Información del reportante (FK a pets table)
    reporter_cui VARCHAR(15) NOT NULL,
    reporter_name VARCHAR(100) NOT NULL,
    reporter_phone VARCHAR(20) NOT NULL,
    reporter_email VARCHAR(255),
    
    -- Ubicación del reporte
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    address VARCHAR(255),
    zone VARCHAR(100),
    
    -- Información del perro
    breed VARCHAR(100) DEFAULT 'Mestizo',
    size ENUM('small', 'medium', 'large') DEFAULT 'medium',
    colors TEXT, -- JSON array de colores
    temperament ENUM('friendly', 'shy', 'aggressive', 'scared') DEFAULT 'friendly',
    condition_type ENUM('stray', 'lost', 'abandoned') DEFAULT 'stray',
    gender ENUM('male', 'female', 'unknown') DEFAULT 'unknown',
    estimated_age VARCHAR(50),
    health_status VARCHAR(255),
    
    -- Estado del reporte
    urgency_level ENUM('low', 'normal', 'high', 'emergency') DEFAULT 'normal',
    status ENUM('active', 'rescued', 'adopted', 'transferred', 'deceased') DEFAULT 'active',
    
    -- Detalles adicionales
    description TEXT,
    has_collar BOOLEAN DEFAULT 0,
    is_injured BOOLEAN DEFAULT 0,
    needs_rescue BOOLEAN DEFAULT 1,
    
    -- Archivos y fechas
    photo_path VARCHAR(255),
    report_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Relación con tabla pets
    FOREIGN KEY (reporter_cui) REFERENCES pets(cui) ON DELETE CASCADE
);

-- Create status_updates table para historial de cambios
CREATE TABLE IF NOT EXISTS status_updates (
    id INT PRIMARY KEY AUTO_INCREMENT,
    report_id VARCHAR(100) NOT NULL,
    old_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    updated_by VARCHAR(15), -- CUI del usuario que actualizó
    update_reason TEXT,
    update_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (report_id) REFERENCES stray_reports(report_id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_adopters_dni ON adopters(dni);
CREATE INDEX idx_adopters_email ON adopters(email);
CREATE INDEX idx_pets_cui ON pets(cui);
CREATE INDEX idx_pets_adopter ON pets(adopter_id);
CREATE INDEX idx_stray_reports_reporter ON stray_reports(reporter_cui);
CREATE INDEX idx_stray_reports_status ON stray_reports(status);
CREATE INDEX idx_status_updates_report ON status_updates(report_id);
