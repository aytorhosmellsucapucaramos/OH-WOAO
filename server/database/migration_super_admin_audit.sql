-- =====================================================
-- MIGRACIÓN: Super Admin + Sistema de Auditoría
-- =====================================================

USE pets_db;

-- 1. Agregar rol de Super Admin
INSERT INTO roles (code, name, description, permissions, active) 
VALUES ('super_admin', 'Super Administrador', 'Administrador con acceso total al sistema', '["all"]', TRUE)
ON DUPLICATE KEY UPDATE name = name;

-- 2. Tabla de auditoría de usuarios
CREATE TABLE IF NOT EXISTS user_audit_log (
  id INT PRIMARY KEY AUTO_INCREMENT,
  action VARCHAR(50) NOT NULL,                    -- 'create', 'update', 'delete', 'activate', 'change_role'
  target_user_id INT NOT NULL,                    -- Usuario afectado
  performed_by_user_id INT NOT NULL,              -- Quién realizó la acción
  old_values JSON,                                -- Valores anteriores (para updates)
  new_values JSON,                                -- Valores nuevos
  ip_address VARCHAR(45),                         -- IP desde donde se hizo
  user_agent TEXT,                                -- Navegador/dispositivo
  notes TEXT,                                     -- Notas adicionales
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_target_user (target_user_id),
  INDEX idx_performed_by (performed_by_user_id),
  INDEX idx_action (action),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Agregar columna para último código generado por tipo
CREATE TABLE IF NOT EXISTS employee_code_counters (
  id INT PRIMARY KEY AUTO_INCREMENT,
  role_code VARCHAR(20) NOT NULL UNIQUE,          -- 'admin', 'seguimiento', 'super_admin'
  year INT NOT NULL,                              -- Año actual
  last_number INT DEFAULT 0,                      -- Último número usado
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  UNIQUE KEY unique_role_year (role_code, year)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Inicializar contadores para el año actual
INSERT INTO employee_code_counters (role_code, year, last_number) VALUES
('super_admin', YEAR(CURDATE()), 0),
('admin', YEAR(CURDATE()), 0),
('seguimiento', YEAR(CURDATE()), 0)
ON DUPLICATE KEY UPDATE last_number = last_number;

-- 5. Procedimiento almacenado para generar códigos automáticos
DELIMITER $$

DROP FUNCTION IF EXISTS generate_employee_code$$

CREATE FUNCTION generate_employee_code(p_role_code VARCHAR(20))
RETURNS VARCHAR(50)
DETERMINISTIC
BEGIN
  DECLARE v_year INT;
  DECLARE v_next_number INT;
  DECLARE v_code_prefix VARCHAR(10);
  DECLARE v_employee_code VARCHAR(50);
  
  -- Obtener año actual
  SET v_year = YEAR(CURDATE());
  
  -- Determinar prefijo según rol
  SET v_code_prefix = CASE p_role_code
    WHEN 'super_admin' THEN 'SADM'
    WHEN 'admin' THEN 'ADMIN'
    WHEN 'seguimiento' THEN 'SEG'
    ELSE 'EMP'
  END;
  
  -- Obtener y actualizar el contador
  INSERT INTO employee_code_counters (role_code, year, last_number)
  VALUES (p_role_code, v_year, 1)
  ON DUPLICATE KEY UPDATE last_number = last_number + 1;
  
  -- Obtener el número actualizado
  SELECT last_number INTO v_next_number
  FROM employee_code_counters
  WHERE role_code = p_role_code AND year = v_year;
  
  -- Generar código: ADMIN-2024-001
  SET v_employee_code = CONCAT(
    v_code_prefix, '-',
    v_year, '-',
    LPAD(v_next_number, 3, '0')
  );
  
  RETURN v_employee_code;
END$$

DELIMITER ;

-- 6. Actualizar usuarios existentes con códigos automáticos (si no tienen)
UPDATE adopters a
JOIN roles r ON a.role_id = r.id
SET a.employee_code = CONCAT(
  CASE r.code
    WHEN 'admin' THEN 'ADMIN'
    WHEN 'seguimiento' THEN 'SEG'
    ELSE 'USER'
  END,
  '-2024-',
  LPAD(a.id, 3, '0')
)
WHERE a.role_id IN (2, 3) 
AND (a.employee_code IS NULL OR a.employee_code = '');

-- 7. Trigger para auditoría automática en cambios de usuarios
DELIMITER $$

DROP TRIGGER IF EXISTS audit_user_changes$$

CREATE TRIGGER audit_user_changes
AFTER UPDATE ON adopters
FOR EACH ROW
BEGIN
  -- Solo auditar si hay cambios significativos
  IF OLD.role_id != NEW.role_id 
     OR OLD.is_active != NEW.is_active 
     OR OLD.email != NEW.email THEN
    
    INSERT INTO user_audit_log (
      action,
      target_user_id,
      performed_by_user_id,
      old_values,
      new_values
    ) VALUES (
      'update',
      NEW.id,
      @current_user_id,  -- Debe ser seteado desde la aplicación
      JSON_OBJECT(
        'role_id', OLD.role_id,
        'is_active', OLD.is_active,
        'email', OLD.email
      ),
      JSON_OBJECT(
        'role_id', NEW.role_id,
        'is_active', NEW.is_active,
        'email', NEW.email
      )
    );
  END IF;
END$$

DELIMITER ;

-- 8. Vista para ver auditoría de forma legible
CREATE OR REPLACE VIEW v_user_audit_log AS
SELECT 
  ual.id,
  ual.action,
  ual.created_at,
  -- Usuario objetivo
  CONCAT(target.first_name, ' ', target.last_name) as target_user_name,
  target.email as target_user_email,
  -- Usuario que realizó la acción
  CONCAT(performer.first_name, ' ', performer.last_name) as performed_by_name,
  performer.email as performed_by_email,
  -- Valores
  ual.old_values,
  ual.new_values,
  ual.ip_address,
  ual.notes
FROM user_audit_log ual
LEFT JOIN adopters target ON ual.target_user_id = target.id
LEFT JOIN adopters performer ON ual.performed_by_user_id = performer.id
ORDER BY ual.created_at DESC;

-- =====================================================
-- VERIFICACIONES
-- =====================================================

-- Verificar roles
SELECT 'ROLES:' as check_type;
SELECT * FROM roles ORDER BY id;

-- Verificar contadores
SELECT 'CONTADORES:' as check_type;
SELECT * FROM employee_code_counters;

-- Verificar función
SELECT 'PRUEBA FUNCIÓN:' as check_type;
SELECT generate_employee_code('admin') as codigo_generado;

SELECT '✅ Migración completada exitosamente' as status;
