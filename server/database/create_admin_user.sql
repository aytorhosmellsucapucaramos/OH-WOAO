-- =====================================================
-- CREAR USUARIO ADMINISTRADOR
-- =====================================================
-- Este script crea el usuario administrador por defecto
-- Email: admin@municipio.gob.pe
-- Password: Admin@2024

USE pets_db;

-- Primero, agregar columna 'role' a la tabla adopters si no existe
ALTER TABLE adopters 
ADD COLUMN IF NOT EXISTS role ENUM('user', 'admin') DEFAULT 'user' AFTER password;

-- Eliminar usuario admin si ya existe (para actualizar)
DELETE FROM adopters WHERE email = 'admin@municipio.gob.pe';

-- Insertar usuario administrador
-- Password hash para: Admin@2024
INSERT INTO adopters (
    first_name, 
    last_name, 
    dni, 
    email, 
    password, 
    phone, 
    address,
    role
) VALUES (
    'Administrador',
    'Sistema',
    '00000000',
    'admin@municipio.gob.pe',
    '$2a$10$YQh5qZPYwJKvXGvXZ3K9VOUxqHvP0qFGkqEPJZJKJKJKJKJKJKJK.', -- Hash de 'Admin@2024'
    '999999999',
    'Municipalidad Provincial de Puno',
    'admin'
);

-- Verificar que se creó correctamente
SELECT id, first_name, last_name, email, role, created_at 
FROM adopters 
WHERE email = 'admin@municipio.gob.pe';
