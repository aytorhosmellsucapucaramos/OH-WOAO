-- Crear tabla de catálogo de antecedentes médicos comunes
CREATE TABLE IF NOT EXISTS medical_histories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar antecedentes médicos comunes en canes
INSERT INTO medical_histories (name, code, description) VALUES
('Ninguno', 'none', 'Sin antecedentes médicos'),
('Alergias alimentarias', 'food_allergies', 'Sensibilidad o reacciones adversas a ciertos alimentos'),
('Alergias dermatológicas', 'skin_allergies', 'Reacciones alérgicas en la piel'),
('Displasia de cadera', 'hip_dysplasia', 'Condición de las articulaciones de la cadera'),
('Problemas cardíacos', 'heart_problems', 'Condiciones relacionadas con el corazón'),
('Epilepsia', 'epilepsy', 'Trastorno convulsivo'),
('Artritis', 'arthritis', 'Inflamación de las articulaciones'),
('Diabetes', 'diabetes', 'Trastorno del metabolismo de la glucosa'),
('Problemas renales', 'kidney_problems', 'Condiciones relacionadas con los riñones'),
('Problemas hepáticos', 'liver_problems', 'Condiciones relacionadas con el hígado'),
('Problemas dentales', 'dental_problems', 'Condiciones de salud dental'),
('Problemas oculares', 'eye_problems', 'Condiciones relacionadas con la vista'),
('Obesidad', 'obesity', 'Exceso de peso'),
('Cirugías previas', 'previous_surgeries', 'Ha tenido intervenciones quirúrgicas'),
('Otros', 'other', 'Otros antecedentes no listados');

-- Agregar columna para referenciar el catálogo en pet_health_records
ALTER TABLE pet_health_records 
ADD COLUMN medical_history_id INT NULL AFTER medical_history,
ADD COLUMN medical_history_details TEXT NULL COMMENT 'Detalles adicionales cuando medical_history_id es "other"',
ADD FOREIGN KEY (medical_history_id) REFERENCES medical_histories(id);

-- Comentario para la columna existente
ALTER TABLE pet_health_records 
MODIFY COLUMN medical_history TEXT NULL COMMENT 'Campo legacy - usar medical_history_id para nuevos registros';
