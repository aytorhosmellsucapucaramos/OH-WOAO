-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: localhost:3306
-- Tiempo de generación: 13-11-2025 a las 03:24:13
-- Versión del servidor: 8.0.30
-- Versión de PHP: 8.3.8

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `pets_db`
--

DELIMITER $$
--
-- Funciones
--
CREATE DEFINER=`root`@`localhost` FUNCTION `generate_employee_code` (`p_role_code` VARCHAR(20)) RETURNS VARCHAR(50) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci DETERMINISTIC BEGIN
  DECLARE v_year INT;
  DECLARE v_next_number INT;
  DECLARE v_code_prefix VARCHAR(10);
  DECLARE v_employee_code VARCHAR(50);
  
  -- Obtener año actual
  SET v_year = YEAR(CURDATE());
  
  -- Determinar prefijo según rol (con COLLATE para evitar error)
  SET v_code_prefix = CASE p_role_code COLLATE utf8mb4_unicode_ci
    WHEN 'super_admin' THEN 'SADM'
    WHEN 'admin' THEN 'ADMIN'
    WHEN 'seguimiento' THEN 'SEG'
    ELSE 'EMP'
  END;
  
  -- Obtener y actualizar el contador
  INSERT INTO employee_code_counters (role_code, year, last_number)
  VALUES (p_role_code COLLATE utf8mb4_unicode_ci, v_year, 1)
  ON DUPLICATE KEY UPDATE last_number = last_number + 1;
  
  -- Obtener el número actualizado
  SELECT last_number INTO v_next_number
  FROM employee_code_counters
  WHERE role_code = p_role_code COLLATE utf8mb4_unicode_ci 
    AND year = v_year;
  
  -- Generar código: ADMIN-2024-001
  SET v_employee_code = CONCAT(
    v_code_prefix, '-',
    v_year, '-',
    LPAD(v_next_number, 3, '0')
  );
  
  RETURN v_employee_code;
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `adopters`
--

CREATE TABLE `adopters` (
  `id` int NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `dni` varchar(8) NOT NULL,
  `dni_photo_path` varchar(255) DEFAULT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `address` text NOT NULL,
  `photo_path` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `role_id` int DEFAULT '1' COMMENT 'Relación con tabla roles (1=user por defecto)',
  `assigned_zone` varchar(100) DEFAULT NULL COMMENT 'Zona asignada (solo para personal de seguimiento)',
  `employee_code` varchar(20) DEFAULT NULL COMMENT 'Código de empleado municipal',
  `is_active` tinyint(1) DEFAULT '1' COMMENT 'Usuario activo en el sistema'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Tabla de propietarios/adoptantes de mascotas';

--
-- Volcado de datos para la tabla `adopters`
--

INSERT INTO `adopters` (`id`, `first_name`, `last_name`, `dni`, `dni_photo_path`, `email`, `password`, `phone`, `address`, `photo_path`, `created_at`, `updated_at`, `role_id`, `assigned_zone`, `employee_code`, `is_active`) VALUES
(1, 'Administrador', 'Sistema', '00000000', NULL, 'admin@municipio.gob.pe', '$2b$10$ErKvWtfHhQy5JIZFSAdav.JItye7lQcV2WXzTyI2PNlAJt/ywI9Xm', '999999999', 'Municipalidad Provincial de Puno', NULL, '2025-10-31 05:00:18', '2025-11-05 06:32:46', 5, NULL, 'SADM-2024-001', 1),
(2, 'TONY', 'gambino', '75345345', '1761887129288-393937765.png', 'gopahes197@lovleo.com', '$2b$10$bGdzAAjYS..bW4lL3iLMP.pGkTu1qgROADuOLeAGxk38/LquMkOVi', '973837357', 'jr lambayeque', '1761890976382-98573009.png', '2025-10-31 05:05:29', '2025-10-31 06:09:36', 1, NULL, NULL, 1),
(3, 'aytor', 'ramos', '72859110', '1762315699254-194990772.png', 'vegad51485@nyfhk.com', '$2b$10$bINxWF/RRVIIPuomJUwUieAGjQp/MyO.3DbPLSoS1pMyGHziWjgwO', '946543132', 'jr arequipa', NULL, '2025-11-05 04:08:19', '2025-11-05 04:08:19', 1, NULL, NULL, 1),
(4, 'Super', 'Admin', '99999999', NULL, 'superadmin@test.com', '$2a$10$rZ8qH5YGKxPnPYZ5Y3QqXeKhZxJ5XJ5J5J5J5J5J5J5J5J5J5J5J5', '999999999', 'Municipalidad', NULL, '2025-11-05 06:37:56', '2025-11-05 06:37:56', 5, NULL, 'SADM-2024-002', 1),
(5, 'adminjaja', 'jajjaj', '74513213', NULL, 'hosmellhahaha@gmail.com', '$2b$10$qBW1bDQ.73zloQQzPdvX3OkzvqQDrihfYGRR2xp9dEuC.QzTMSVEe', '945612387', 'jr andhasdkn', NULL, '2025-11-05 06:48:32', '2025-11-05 06:48:32', 2, NULL, 'ADMIN-2025-004', 1),
(6, 'sereno', '69', '75453435', NULL, 'sereno@gmail.com', '$2b$10$8Mov4dUtZGPFur5zIRa3S.tClcTVTZhtQO5l/oywfv5B/RFLavuWi', '945612576', 'jr asfdassfgfgd', NULL, '2025-11-05 06:57:32', '2025-11-05 06:57:32', 3, 'Zona Centro', 'SEG-2025-004', 1),
(7, 'asdhasjbdnjbs', 'hdvabskjdbasijbd', '75146132', '1762375517076-340655357.png', 'poyex31596@nyfhk.com', '$2b$10$bb7hkBVr4CyVVuvXvCE7D.So1GTHROI4QnAu09OWuUy.OhKUCM2L6', '987634532', 'av estudiante', NULL, '2025-11-05 20:45:17', '2025-11-05 20:45:17', 1, NULL, NULL, 1),
(8, 'Tomura', 'Shigaraki', '74154377', '1762376215204-742616493.jpg', 'roger4mango@gmail.com', '$2b$10$xxp7uzA1EhFA7ubszGpcx.snlZ8DiOv4xD7WTCTIgFtnNpDHmrYRC', '945382350', 'Av.costanera norte', '1762376325476-718012251.jpg', '2025-11-05 20:56:55', '2025-11-05 20:58:45', 1, NULL, NULL, 1),
(9, 'Juan', 'Pérez', '12345678', NULL, 'juan.perez@municipio.gob.pe', '$2b$10$TL50P6M2eWJBrfX6G7xx0e//nrtUmyF7G2cLSeIMbJ3Xz2m8lQ6M2', '987654321', 'Jr. Lima 123, Puno', NULL, '2025-11-12 16:17:51', '2025-11-12 16:17:51', 2, NULL, 'ADMIN-2025-005', 1),
(10, 'María', 'González', '87654321', NULL, 'maria.gonzalez@municipio.gob.pe', '$2b$10$l30S5j5EvL/T5wpsodkWc.Lbsek6C.O0ZO4Uu4Razpr7XPNSGiXpi', '987654322', 'Av. Titicaca 456, Puno', NULL, '2025-11-12 16:17:51', '2025-11-12 16:17:51', 3, 'Centro', 'SEG-2025-005', 1),
(11, 'Carlos', 'Rodríguez', '11223344', NULL, 'carlos.rodriguez@municipio.gob.pe', '$2b$10$uGkjwC9yVfJiocx/TP1Gn.v6u7UC3M3ScSaF.tmbBYNZv/biu00WK', '987654323', 'Plaza Mayor 789, Puno', NULL, '2025-11-12 16:17:51', '2025-11-12 16:17:51', 3, 'Norte', 'SEG-2025-006', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `breeds`
--

CREATE TABLE `breeds` (
  `id` int NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text,
  `active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Catálogo de razas de perros';

--
-- Volcado de datos para la tabla `breeds`
--

INSERT INTO `breeds` (`id`, `name`, `description`, `active`, `created_at`) VALUES
(1, 'Mestizo', 'Perro de raza mixta', 1, '2025-10-31 04:48:55'),
(2, 'Labrador', 'Labrador Retriever', 1, '2025-10-31 04:48:55'),
(3, 'Pastor Alemán', 'Pastor Alemán', 1, '2025-10-31 04:48:55'),
(4, 'Golden Retriever', 'Golden Retriever', 1, '2025-10-31 04:48:55'),
(5, 'Bulldog', 'Bulldog Inglés o Francés', 1, '2025-10-31 04:48:55'),
(6, 'Chihuahua', 'Chihuahua', 1, '2025-10-31 04:48:55'),
(7, 'Poodle', 'Poodle o Caniche', 1, '2025-10-31 04:48:55'),
(8, 'Beagle', 'Beagle', 1, '2025-10-31 04:48:55'),
(9, 'Yorkshire Terrier', 'Yorkshire Terrier', 1, '2025-10-31 04:48:55'),
(10, 'Dálmata', 'Dálmata', 1, '2025-10-31 04:48:55'),
(11, 'Boxer', 'Boxer', 1, '2025-10-31 04:48:55'),
(12, 'Husky Siberiano', 'Husky Siberiano', 1, '2025-10-31 04:48:55'),
(13, 'Pug', 'Pug o Carlino', 1, '2025-10-31 04:48:55'),
(14, 'Shih Tzu', 'Shih Tzu', 1, '2025-10-31 04:48:55'),
(15, 'Schnauzer', 'Schnauzer', 1, '2025-10-31 04:48:55'),
(16, 'Cocker Spaniel', 'Cocker Spaniel', 1, '2025-10-31 04:48:55'),
(17, 'Border Collie', 'Border Collie', 1, '2025-10-31 04:48:55'),
(18, 'San Bernardo', 'San Bernardo', 1, '2025-10-31 04:48:55'),
(19, 'Pit Bull Terrier', 'Raza potencialmente peligrosa - Requiere pago de S/.52.20', 1, '2025-10-31 04:48:55'),
(20, 'Pitbull', 'Raza potencialmente peligrosa - Requiere pago de S/.52.20', 1, '2025-10-31 04:48:55'),
(21, 'American Pit Bull Terrier', 'Raza potencialmente peligrosa - Requiere pago de S/.52.20', 1, '2025-10-31 04:48:55'),
(22, 'Dogo Argentino', 'Raza potencialmente peligrosa - Requiere pago de S/.52.20', 1, '2025-10-31 04:48:55'),
(23, 'Fila Brasilero', 'Raza potencialmente peligrosa - Requiere pago de S/.52.20', 1, '2025-10-31 04:48:55'),
(24, 'Fila Brasileiro', 'Raza potencialmente peligrosa - Requiere pago de S/.52.20', 1, '2025-10-31 04:48:55'),
(25, 'Tosa Japonesa', 'Raza potencialmente peligrosa - Requiere pago de S/.52.20', 1, '2025-10-31 04:48:55'),
(26, 'Tosa Inu', 'Raza potencialmente peligrosa - Requiere pago de S/.52.20', 1, '2025-10-31 04:48:55'),
(27, 'Bul Mastiff', 'Raza potencialmente peligrosa - Requiere pago de S/.52.20', 1, '2025-10-31 04:48:55'),
(28, 'Bull Mastiff', 'Raza potencialmente peligrosa - Requiere pago de S/.52.20', 1, '2025-10-31 04:48:55'),
(29, 'Bullmastiff', 'Raza potencialmente peligrosa - Requiere pago de S/.52.20', 1, '2025-10-31 04:48:55'),
(30, 'Doberman', 'Raza potencialmente peligrosa - Requiere pago de S/.52.20', 1, '2025-10-31 04:48:55'),
(31, 'Dobermann', 'Raza potencialmente peligrosa - Requiere pago de S/.52.20', 1, '2025-10-31 04:48:55'),
(32, 'Doberman Pinscher', 'Raza potencialmente peligrosa - Requiere pago de S/.52.20', 1, '2025-10-31 04:48:55'),
(33, 'Rottweiler', 'Raza potencialmente peligrosa - Requiere pago de S/.52.20', 1, '2025-10-31 04:48:55'),
(34, 'Rotweller', 'Raza potencialmente peligrosa - Requiere pago de S/.52.20', 1, '2025-10-31 04:48:55'),
(2077, 'Ejecutivo', NULL, 1, '2025-11-05 20:56:55'),
(2318, 'can', NULL, 1, '2025-11-07 14:04:35');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `colors`
--

CREATE TABLE `colors` (
  `id` int NOT NULL,
  `name` varchar(50) NOT NULL,
  `hex_code` varchar(7) DEFAULT NULL,
  `active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Catálogo de colores con códigos hex';

--
-- Volcado de datos para la tabla `colors`
--

INSERT INTO `colors` (`id`, `name`, `hex_code`, `active`, `created_at`) VALUES
(1, 'Negro', '#000000', 1, '2025-10-31 04:48:55'),
(2, 'Blanco', '#FFFFFF', 1, '2025-10-31 04:48:55'),
(3, 'Marrón', '#8B4513', 1, '2025-10-31 04:48:55'),
(4, 'Dorado', '#FFD700', 1, '2025-10-31 04:48:55'),
(5, 'Gris', '#808080', 1, '2025-10-31 04:48:55'),
(6, 'Beige', '#F5F5DC', 1, '2025-10-31 04:48:55'),
(7, 'Crema', '#FFFDD0', 1, '2025-10-31 04:48:55'),
(8, 'Canela', '#D2691E', 1, '2025-10-31 04:48:55'),
(9, 'Chocolate', '#7B3F00', 1, '2025-10-31 04:48:55'),
(10, 'Atigrado', '#8B7355', 1, '2025-10-31 04:48:55'),
(11, 'Tricolor', '#A52A2A', 1, '2025-10-31 04:48:55'),
(12, 'Manchado', '#D3D3D3', 1, '2025-10-31 04:48:55'),
(13, 'Rubio', '#F0E68C', 1, '2025-10-31 04:48:55'),
(14, 'Rojizo', '#CD5C5C', 1, '2025-10-31 04:48:55');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `employee_code_counters`
--

CREATE TABLE `employee_code_counters` (
  `id` int NOT NULL,
  `role_code` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `year` int NOT NULL,
  `last_number` int DEFAULT '0',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `employee_code_counters`
--

INSERT INTO `employee_code_counters` (`id`, `role_code`, `year`, `last_number`, `updated_at`) VALUES
(1, 'super_admin', 2025, 3, '2025-11-05 06:19:26'),
(2, 'admin', 2025, 6, '2025-11-12 16:20:20'),
(3, 'seguimiento', 2025, 6, '2025-11-12 16:17:51');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `medical_histories`
--

CREATE TABLE `medical_histories` (
  `id` int NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `medical_histories`
--

INSERT INTO `medical_histories` (`id`, `name`, `code`, `description`, `created_at`, `updated_at`) VALUES
(1, 'Ninguno', 'none', 'Sin antecedentes médicos', '2025-11-07 15:02:35', '2025-11-07 15:02:35'),
(2, 'Alergias alimentarias', 'food_allergies', 'Sensibilidad o reacciones adversas a ciertos alimentos', '2025-11-07 15:02:35', '2025-11-07 15:02:35'),
(3, 'Alergias dermatológicas', 'skin_allergies', 'Reacciones alérgicas en la piel', '2025-11-07 15:02:35', '2025-11-07 15:02:35'),
(4, 'Displasia de cadera', 'hip_dysplasia', 'Condición de las articulaciones de la cadera', '2025-11-07 15:02:35', '2025-11-07 15:02:35'),
(5, 'Problemas cardíacos', 'heart_problems', 'Condiciones relacionadas con el corazón', '2025-11-07 15:02:35', '2025-11-07 15:02:35'),
(6, 'Epilepsia', 'epilepsy', 'Trastorno convulsivo', '2025-11-07 15:02:35', '2025-11-07 15:02:35'),
(7, 'Artritis', 'arthritis', 'Inflamación de las articulaciones', '2025-11-07 15:02:35', '2025-11-07 15:02:35'),
(8, 'Diabetes', 'diabetes', 'Trastorno del metabolismo de la glucosa', '2025-11-07 15:02:35', '2025-11-07 15:02:35'),
(9, 'Problemas renales', 'kidney_problems', 'Condiciones relacionadas con los riñones', '2025-11-07 15:02:35', '2025-11-07 15:02:35'),
(10, 'Problemas hepáticos', 'liver_problems', 'Condiciones relacionadas con el hígado', '2025-11-07 15:02:35', '2025-11-07 15:02:35'),
(11, 'Problemas dentales', 'dental_problems', 'Condiciones de salud dental', '2025-11-07 15:02:35', '2025-11-07 15:02:35'),
(12, 'Problemas oculares', 'eye_problems', 'Condiciones relacionadas con la vista', '2025-11-07 15:02:35', '2025-11-07 15:02:35'),
(13, 'Obesidad', 'obesity', 'Exceso de peso', '2025-11-07 15:02:35', '2025-11-07 15:02:35'),
(14, 'Cirugías previas', 'previous_surgeries', 'Ha tenido intervenciones quirúrgicas', '2025-11-07 15:02:35', '2025-11-07 15:02:35'),
(15, 'Otros', 'other', 'Otros antecedentes no listados', '2025-11-07 15:02:35', '2025-11-07 15:02:35');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pets`
--

CREATE TABLE `pets` (
  `id` int NOT NULL,
  `cui` varchar(20) NOT NULL COMMENT 'Código Único de Identificación',
  `pet_name` varchar(100) NOT NULL,
  `sex` enum('male','female') NOT NULL,
  `breed_id` int NOT NULL,
  `birth_date` date DEFAULT NULL COMMENT 'Fecha de nacimiento del can',
  `age` int NOT NULL COMMENT 'Edad en meses',
  `size_id` int NOT NULL,
  `additional_features` text COMMENT 'Características físicas especiales',
  `adopter_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `temperament_id` int DEFAULT NULL COMMENT 'Relación con tabla de temperamentos'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Tabla principal de mascotas registradas';

--
-- Volcado de datos para la tabla `pets`
--

INSERT INTO `pets` (`id`, `cui`, `pet_name`, `sex`, `breed_id`, `birth_date`, `age`, `size_id`, `additional_features`, `adopter_id`, `created_at`, `updated_at`, `temperament_id`) VALUES
(1, '19885299-9', 'roki', 'female', 1, '2025-08-26', 2, 2, '', 2, '2025-10-31 05:05:29', '2025-11-05 04:02:44', 1),
(2, '63900414-4', 'bobi', 'male', 1, '2025-09-20', 1, 2, '', 2, '2025-10-31 05:52:19', '2025-11-05 04:02:52', 6),
(3, '77325297-7', 'firulais', 'female', 1, '2025-03-18', 7, 2, '', 2, '2025-10-31 22:25:35', '2025-11-05 04:02:56', 6),
(4, '91812091-1', 'chimuelo', 'male', 1, '2025-08-09', 3, 2, 'Le encanta jugar con niños y otros perros. Es muy activo, disfruta salir a pasear y correr en el parque. Le gusta perseguir pelotas y dormir cerca de la familia. A veces ladra cuando está emocionado, pero es muy cariñoso y obediente.', 2, '2025-11-05 04:05:29', '2025-11-05 04:05:29', NULL),
(5, '82048407-7', 'chibi', 'female', 1, '2025-01-24', 10, 3, 'Fue rescatado de la calle, por lo que al inicio puede mostrarse temeroso con personas desconocidas. Con el tiempo demuestra mucho cariño y fidelidad. No le gustan los movimientos bruscos ni los gritos. Está en proceso de adaptación y entrenamiento básico.', 3, '2025-11-05 04:08:19', '2025-11-05 04:08:19', NULL),
(7, '12325747-7', 'Rover', 'male', 2077, '2025-04-13', 7, 3, 'Un perro grande de 10 metros', 8, '2025-11-05 20:56:55', '2025-11-05 20:56:55', NULL),
(8, '59150767-7', 'pelusa', 'male', 1, '2025-01-09', 10, 2, 'muy amigable', 2, '2025-11-07 14:04:35', '2025-11-07 14:51:27', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pet_colors`
--

CREATE TABLE `pet_colors` (
  `id` int NOT NULL,
  `pet_id` int NOT NULL,
  `color_id` int NOT NULL,
  `display_order` int DEFAULT '0' COMMENT 'Orden de visualización (primario, secundario, etc)',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Relación mascotas-colores';

--
-- Volcado de datos para la tabla `pet_colors`
--

INSERT INTO `pet_colors` (`id`, `pet_id`, `color_id`, `display_order`, `created_at`) VALUES
(1, 1, 6, 0, '2025-10-31 05:05:29'),
(2, 2, 8, 0, '2025-10-31 05:52:19'),
(3, 3, 1, 0, '2025-10-31 22:25:35'),
(4, 4, 8, 0, '2025-11-05 04:05:29'),
(5, 5, 1, 0, '2025-11-05 04:08:19'),
(7, 7, 1, 0, '2025-11-05 20:56:55'),
(10, 8, 2, 0, '2025-11-07 16:08:24');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pet_documents`
--

CREATE TABLE `pet_documents` (
  `id` int NOT NULL,
  `pet_id` int NOT NULL,
  `photo_frontal_path` varchar(255) DEFAULT NULL COMMENT 'Foto frontal para el carnet',
  `photo_posterior_path` varchar(255) DEFAULT NULL COMMENT 'Foto posterior para el carnet',
  `qr_code_path` varchar(255) DEFAULT NULL COMMENT 'Ruta del código QR generado',
  `card_printed` tinyint(1) DEFAULT '0' COMMENT '¿Se imprimió el carnet físico?',
  `print_date` timestamp NULL DEFAULT NULL COMMENT 'Fecha de impresión del carnet',
  `print_count` int DEFAULT '0' COMMENT 'Número de veces que se imprimió',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Documentos y archivos de mascotas';

--
-- Volcado de datos para la tabla `pet_documents`
--

INSERT INTO `pet_documents` (`id`, `pet_id`, `photo_frontal_path`, `photo_posterior_path`, `qr_code_path`, `card_printed`, `print_date`, `print_count`, `created_at`, `updated_at`) VALUES
(1, 1, '1761887129303-385284656.jpg', '1761887129306-770398589.jpg', 'qr_19885299_9.png', 0, NULL, 0, '2025-10-31 05:05:29', '2025-10-31 05:05:29'),
(2, 2, '1761889939410-406545573.jpg', '1761889939418-204703310.png', 'qr_63900414_4.png', 0, NULL, 0, '2025-10-31 05:52:19', '2025-10-31 05:52:19'),
(3, 3, '1761949534995-708269956.jpg', '1761949534998-548560768.jpg', 'qr_77325297_7.png', 0, NULL, 0, '2025-10-31 22:25:35', '2025-10-31 22:25:35'),
(4, 4, '1762315528952-554189868.png', '1762315528956-987748599.png', 'qr_91812091_1.png', 0, NULL, 0, '2025-11-05 04:05:29', '2025-11-05 04:05:29'),
(5, 5, '1762315699255-72977638.png', '1762315699256-615009396.png', 'qr_82048407_7.png', 0, NULL, 0, '2025-11-05 04:08:19', '2025-11-05 04:08:19'),
(7, 7, '1762376215417-511974491.jpg', '1762376215539-876008137.jpg', 'qr_12325747_7.png', 0, NULL, 0, '2025-11-05 20:56:55', '2025-11-05 20:56:55'),
(8, 8, '1762524275428-619557838.png', '1762524275429-572427847.png', 'qr_59150767_7.png', 0, NULL, 0, '2025-11-07 14:04:35', '2025-11-12 15:58:32');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pet_health_records`
--

CREATE TABLE `pet_health_records` (
  `id` int NOT NULL,
  `pet_id` int NOT NULL,
  `has_vaccination_card` tinyint(1) DEFAULT '0' COMMENT '¿Tiene carnet de vacunación?',
  `vaccination_card_path` varchar(255) DEFAULT NULL COMMENT 'Ruta del archivo del carnet',
  `has_rabies_vaccine` tinyint(1) DEFAULT '0' COMMENT '¿Tiene vacuna antirrábica?',
  `rabies_vaccine_path` varchar(255) DEFAULT NULL COMMENT 'Ruta del certificado antirrábico',
  `medical_history` text COMMENT 'Campo legacy - usar medical_history_id para nuevos registros',
  `medical_history_id` int DEFAULT NULL,
  `aggression_history` enum('yes','no') DEFAULT 'no' COMMENT 'Antecedentes de agresividad',
  `aggression_details` text COMMENT 'Detalles de incidentes de agresividad',
  `last_checkup_date` date DEFAULT NULL COMMENT 'Última revisión veterinaria',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `medical_history_details` text COMMENT 'Detalles adicionales cuando medical_history_id es "other"'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Registros de salud de mascotas';

--
-- Volcado de datos para la tabla `pet_health_records`
--

INSERT INTO `pet_health_records` (`id`, `pet_id`, `has_vaccination_card`, `vaccination_card_path`, `has_rabies_vaccine`, `rabies_vaccine_path`, `medical_history`, `medical_history_id`, `aggression_history`, `aggression_details`, `last_checkup_date`, `created_at`, `updated_at`, `medical_history_details`) VALUES
(1, 1, 0, NULL, 0, NULL, NULL, NULL, 'no', NULL, NULL, '2025-10-31 05:05:29', '2025-10-31 05:05:29', NULL),
(4, 2, 0, NULL, 0, NULL, NULL, NULL, 'no', NULL, NULL, '2025-10-31 05:52:19', '2025-10-31 05:52:19', NULL),
(12, 3, 0, NULL, 0, NULL, NULL, NULL, 'no', NULL, NULL, '2025-10-31 22:25:35', '2025-10-31 22:25:35', NULL),
(17, 4, 0, NULL, 0, NULL, NULL, 4, 'no', NULL, NULL, '2025-11-05 04:05:29', '2025-11-07 15:45:09', ''),
(18, 5, 0, NULL, 0, NULL, NULL, NULL, 'no', NULL, NULL, '2025-11-05 04:08:19', '2025-11-05 04:08:19', NULL),
(67, 7, 0, NULL, 0, NULL, NULL, NULL, 'no', NULL, NULL, '2025-11-05 20:56:55', '2025-11-05 20:56:55', NULL),
(75, 8, 1, NULL, 1, NULL, '', 4, 'no', NULL, NULL, '2025-11-07 14:04:35', '2025-11-07 16:08:24', '');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pet_payments`
--

CREATE TABLE `pet_payments` (
  `id` int NOT NULL,
  `pet_id` int NOT NULL,
  `receipt_number` varchar(100) NOT NULL COMMENT 'Número de recibo de caja',
  `receipt_issue_date` date NOT NULL COMMENT 'Fecha de emisión del recibo',
  `receipt_payer` varchar(255) NOT NULL COMMENT 'Nombre o razón social del pagador',
  `receipt_amount` decimal(10,2) NOT NULL COMMENT 'Monto del pago (S/.52.20 para razas peligrosas)',
  `payment_type` enum('registration','renewal','penalty') DEFAULT 'registration' COMMENT 'Tipo de pago',
  `status` enum('pending','verified','rejected') DEFAULT 'pending' COMMENT 'Estado de verificación',
  `verified_by` int DEFAULT NULL COMMENT 'ID del admin que verificó',
  `verified_at` timestamp NULL DEFAULT NULL COMMENT 'Fecha de verificación',
  `notes` text COMMENT 'Notas administrativas',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Pagos para razas potencialmente peligrosas';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pet_vaccinations`
--

CREATE TABLE `pet_vaccinations` (
  `id` int NOT NULL,
  `pet_id` int NOT NULL,
  `vaccine_name` varchar(100) NOT NULL COMMENT 'Nombre de la vacuna (ej: Rabia, Parvovirus)',
  `vaccine_date` date NOT NULL COMMENT 'Fecha de aplicación',
  `next_dose_date` date DEFAULT NULL COMMENT 'Fecha de próxima dosis',
  `veterinarian` varchar(255) DEFAULT NULL COMMENT 'Veterinario que aplicó',
  `clinic` varchar(255) DEFAULT NULL COMMENT 'Clínica veterinaria',
  `batch_number` varchar(100) DEFAULT NULL COMMENT 'Número de lote de la vacuna',
  `notes` text COMMENT 'Observaciones',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Historial de vacunaciones';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `report_conditions`
--

CREATE TABLE `report_conditions` (
  `id` int NOT NULL,
  `code` varchar(20) NOT NULL,
  `name` varchar(50) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Catálogo de condiciones (callejero, perdido, abandonado)';

--
-- Volcado de datos para la tabla `report_conditions`
--

INSERT INTO `report_conditions` (`id`, `code`, `name`, `description`, `active`, `created_at`) VALUES
(1, 'stray', 'Callejero', 'Perro sin hogar aparente', 1, '2025-10-31 04:48:55'),
(2, 'lost', 'Perdido', 'Perro que parece estar perdido', 1, '2025-10-31 04:48:55'),
(3, 'abandoned', 'Abandonado', 'Perro abandonado recientemente', 1, '2025-10-31 04:48:55');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `roles`
--

CREATE TABLE `roles` (
  `id` int NOT NULL,
  `code` varchar(20) NOT NULL,
  `name` varchar(50) NOT NULL,
  `description` text,
  `permissions` json DEFAULT NULL COMMENT 'Permisos específicos del rol en formato JSON',
  `active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Catálogo de roles del sistema';

--
-- Volcado de datos para la tabla `roles`
--

INSERT INTO `roles` (`id`, `code`, `name`, `description`, `permissions`, `active`, `created_at`, `updated_at`) VALUES
(1, 'user', 'Usuario', 'Usuario regular que registra mascotas y reporta callejeros', '{\"can_register_pet\": true, \"can_report_stray\": true, \"can_view_own_pets\": true, \"can_view_own_reports\": true}', 1, '2025-11-05 05:35:15', '2025-11-05 05:35:15'),
(2, 'admin', 'Administrador', 'Personal de oficina - verifica reportes y asigna casos', '{\"can_assign_cases\": true, \"can_manage_roles\": true, \"can_manage_users\": true, \"can_view_all_pets\": true, \"can_verify_reports\": true, \"can_manage_payments\": true, \"can_generate_reports\": true, \"can_view_all_reports\": true}', 1, '2025-11-05 05:35:15', '2025-11-05 05:35:15'),
(3, 'seguimiento', 'Personal de Seguimiento', 'Personal de campo - atiende casos asignados', '{\"can_close_cases\": true, \"can_add_field_notes\": true, \"can_upload_evidence\": true, \"can_update_case_status\": true, \"can_view_assigned_cases\": true}', 1, '2025-11-05 05:35:15', '2025-11-05 05:35:15'),
(5, 'super_admin', 'Super Administrador', 'Administrador con acceso total al sistema', '[\"all\"]', 1, '2025-11-05 06:14:18', '2025-11-05 06:14:18');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sizes`
--

CREATE TABLE `sizes` (
  `id` int NOT NULL,
  `code` varchar(20) NOT NULL,
  `name` varchar(50) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `display_order` int DEFAULT '0',
  `active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Catálogo de tamaños (pequeño, mediano, grande)';

--
-- Volcado de datos para la tabla `sizes`
--

INSERT INTO `sizes` (`id`, `code`, `name`, `description`, `display_order`, `active`, `created_at`) VALUES
(1, 'small', 'Pequeño', 'Perros de menos de 10 kg', 1, 1, '2025-10-31 04:48:55'),
(2, 'medium', 'Mediano', 'Perros entre 10 y 25 kg', 2, 1, '2025-10-31 04:48:55'),
(3, 'large', 'Grande', 'Perros de más de 25 kg', 3, 1, '2025-10-31 04:48:55');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `stray_reports`
--

CREATE TABLE `stray_reports` (
  `id` int NOT NULL,
  `reporter_id` int DEFAULT NULL,
  `reporter_name` varchar(255) DEFAULT NULL,
  `reporter_phone` varchar(20) DEFAULT NULL,
  `reporter_email` varchar(255) DEFAULT NULL,
  `latitude` decimal(10,8) NOT NULL,
  `longitude` decimal(11,8) NOT NULL,
  `address` varchar(255) DEFAULT NULL,
  `zone` varchar(100) DEFAULT NULL,
  `breed_id` int DEFAULT NULL,
  `size_id` int DEFAULT NULL,
  `temperament_id` int DEFAULT NULL,
  `condition_id` int NOT NULL,
  `urgency_level_id` int NOT NULL,
  `description` text NOT NULL,
  `photo_path` varchar(255) DEFAULT NULL,
  `status` enum('active','pending','in_progress','resolved','closed') DEFAULT 'active' COMMENT 'Estado del reporte: active=activo, pending=pendiente, in_progress=en progreso, resolved=resuelto, closed=cerrado',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `assigned_to` int DEFAULT NULL COMMENT 'ID del usuario asignado (personal de seguimiento)',
  `assigned_at` timestamp NULL DEFAULT NULL COMMENT 'Fecha y hora de asignación del reporte',
  `assigned_by` int DEFAULT NULL COMMENT 'ID del usuario que asignó el reporte',
  `status_notes` text COMMENT 'Notas adicionales sobre el estado del reporte',
  `status_updated_at` timestamp NULL DEFAULT NULL COMMENT 'Fecha y hora de la última actualización de estado',
  `status_type_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Reportes de perros callejeros';

--
-- Volcado de datos para la tabla `stray_reports`
--

INSERT INTO `stray_reports` (`id`, `reporter_id`, `reporter_name`, `reporter_phone`, `reporter_email`, `latitude`, `longitude`, `address`, `zone`, `breed_id`, `size_id`, `temperament_id`, `condition_id`, `urgency_level_id`, `description`, `photo_path`, `status`, `created_at`, `updated_at`, `assigned_to`, `assigned_at`, `assigned_by`, `status_notes`, `status_updated_at`, `status_type_id`) VALUES
(2, 2, 'TONY gambino', NULL, NULL, -15.83772970, -70.03210080, 'av estudiamte', NULL, 5, 2, 5, 1, 3, 'ayuda', '1761888493106-388268421.jpg', 'active', '2025-10-31 05:28:13', '2025-11-12 22:07:40', NULL, NULL, NULL, NULL, NULL, 1),
(3, 2, 'TONY gambino', NULL, NULL, -15.83679277, -70.02937381, 'jr deza', NULL, 27, 2, 4, 1, 2, 'peli', '1761889810115-324089980.jpg', 'in_progress', '2025-10-31 05:50:10', '2025-11-12 22:10:41', 6, '2025-11-12 20:47:00', 1, 'completadisimo', '2025-11-12 22:10:41', 4),
(4, 2, 'TONY gambino', NULL, NULL, -15.83807609, -70.02184426, 'av titicaca', NULL, 8, 2, 3, 2, 2, 'terrible', '1761890917298-595692104.jpg', 'active', '2025-10-31 06:08:37', '2025-11-12 22:07:40', NULL, NULL, NULL, NULL, NULL, 1),
(5, 2, 'TONY gambino', NULL, NULL, -15.83916380, -70.02846479, 'jr libertad', NULL, 6, 3, 5, 3, 2, 'ayuda peligro andante', '1761949804468-145122062.jpg', 'active', '2025-10-31 22:30:04', '2025-11-12 22:07:40', NULL, NULL, NULL, NULL, NULL, 1),
(7, 8, 'Tomura Shigaraki', NULL, NULL, -15.84477363, -70.02545493, 'Av. Costanera ', NULL, 8, 3, 3, 3, 1, 'Es un perro 🐕..', '1762380748363-48759213.jpg', 'in_progress', '2025-11-05 22:12:28', '2025-11-12 22:19:30', 6, '2025-11-12 22:19:30', 1, NULL, '2025-11-12 17:29:12', 2),
(8, 8, 'Tomura Shigaraki', NULL, NULL, -15.84002476, -70.02849267, 'Jirón Ayacucho, Laykakota, Puno, Puno', NULL, 17, 1, 6, 1, 3, 'Es una perr....', '1762381590411-87722692.jpg', 'in_progress', '2025-11-05 22:26:30', '2025-11-12 22:20:42', 6, '2025-11-12 22:20:42', 1, 'arreglasdo\n', '2025-11-12 21:27:03', 2),
(9, 2, 'TONY gambino', NULL, NULL, -15.83810442, -70.02405791, 'Jirón Melgar, Laykakota, Puno, Puno', NULL, 1, 2, 2, 2, 2, 'esta muy peligroso', '1762532288343-341687879.jpg', 'in_progress', '2025-11-07 16:18:08', '2025-11-12 22:20:34', 6, '2025-11-12 22:20:34', 1, NULL, '2025-11-12 17:29:30', 2),
(10, 2, 'TONY gambino', NULL, NULL, -15.83804959, -70.02186150, 'Titicaca, Laykakota, Puno, Puno', NULL, 8, 2, 5, 1, 1, 'en peligro', '1762998715656-901338098.jpg', 'active', '2025-11-13 01:51:55', '2025-11-13 01:51:55', NULL, NULL, NULL, NULL, NULL, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `stray_report_colors`
--

CREATE TABLE `stray_report_colors` (
  `id` int NOT NULL,
  `stray_report_id` int NOT NULL,
  `color_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Relación reportes-colores';

--
-- Volcado de datos para la tabla `stray_report_colors`
--

INSERT INTO `stray_report_colors` (`id`, `stray_report_id`, `color_id`, `created_at`) VALUES
(3, 2, 7, '2025-10-31 05:28:13'),
(4, 2, 2, '2025-10-31 05:28:13'),
(5, 3, 6, '2025-10-31 05:50:10'),
(6, 4, 6, '2025-10-31 06:08:37'),
(7, 5, 1, '2025-10-31 22:30:04'),
(8, 5, 2, '2025-10-31 22:30:04'),
(10, 7, 2, '2025-11-05 22:12:28'),
(11, 8, 6, '2025-11-05 22:26:30'),
(12, 9, 2, '2025-11-07 16:18:08'),
(13, 9, 1, '2025-11-07 16:18:08'),
(14, 9, 8, '2025-11-07 16:18:08'),
(15, 10, 2, '2025-11-13 01:51:55');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `stray_report_status_types`
--

CREATE TABLE `stray_report_status_types` (
  `id` int NOT NULL,
  `code` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Código corto del estado (n, a, p, d, r, c)',
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nombre descriptivo del estado',
  `description` text COLLATE utf8mb4_unicode_ci COMMENT 'Descripción detallada del estado',
  `color` varchar(7) COLLATE utf8mb4_unicode_ci DEFAULT '#6b7280' COMMENT 'Color hexadecimal para UI',
  `requires_notes` tinyint(1) DEFAULT '0' COMMENT 'Si requiere notas obligatorias',
  `is_final` tinyint(1) DEFAULT '0' COMMENT 'Si es un estado final',
  `display_order` int DEFAULT '0' COMMENT 'Orden de visualización',
  `is_active` tinyint(1) DEFAULT '1' COMMENT 'Estado activo',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Catálogo de estados para reportes de perros callejeros';

--
-- Volcado de datos para la tabla `stray_report_status_types`
--

INSERT INTO `stray_report_status_types` (`id`, `code`, `name`, `description`, `color`, `requires_notes`, `is_final`, `display_order`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'n', 'Nuevo', 'Reporte recién creado, pendiente de asignación', '#ef4444', 0, 0, 1, 1, '2025-11-12 22:07:40', '2025-11-12 22:07:40'),
(2, 'a', 'Asignado', 'Reporte asignado a personal de seguimiento', '#3b82f6', 0, 0, 2, 1, '2025-11-12 22:07:40', '2025-11-12 22:07:40'),
(3, 'p', 'En Progreso', 'Personal trabajando activamente en el caso', '#8b5cf6', 0, 0, 3, 1, '2025-11-12 22:07:40', '2025-11-12 22:07:40'),
(4, 'd', 'Completado', 'Caso resuelto satisfactoriamente por seguimiento', '#10b981', 1, 0, 4, 1, '2025-11-12 22:07:40', '2025-11-12 22:07:40'),
(5, 'r', 'En Revisión', 'Requiere revisión administrativa', '#f59e0b', 1, 0, 5, 1, '2025-11-12 22:07:40', '2025-11-12 22:07:40'),
(6, 'c', 'Cerrado', 'Caso oficialmente cerrado', '#6b7280', 0, 1, 6, 1, '2025-11-12 22:07:40', '2025-11-12 22:07:40');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `temperaments`
--

CREATE TABLE `temperaments` (
  `id` int NOT NULL,
  `code` varchar(20) NOT NULL,
  `name` varchar(50) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `color` varchar(7) DEFAULT '#4CAF50',
  `active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Catálogo de temperamentos con colores asociados';

--
-- Volcado de datos para la tabla `temperaments`
--

INSERT INTO `temperaments` (`id`, `code`, `name`, `description`, `color`, `active`, `created_at`) VALUES
(1, 'friendly', 'Amigable', 'Perro sociable y amistoso', '#4CAF50', 1, '2025-10-31 04:48:55'),
(2, 'shy', 'Tímido', 'Perro reservado y cauteloso', '#FF9800', 1, '2025-10-31 04:48:55'),
(3, 'aggressive', 'Agresivo', 'Perro que muestra agresividad', '#F44336', 1, '2025-10-31 04:48:55'),
(4, 'scared', 'Asustado', 'Perro temeroso', '#9C27B0', 1, '2025-10-31 04:48:55'),
(5, 'playful', 'Juguetón', 'Perro energético y juguetón', '#2196F3', 1, '2025-10-31 04:48:55'),
(6, 'calm', 'Tranquilo', 'Perro calmado y pacífico', '#009688', 1, '2025-10-31 04:48:55'),
(92, 'muy_sociable', 'Muy Sociable', 'Amigable con todos, muy juguetón y sociable', '#4CAF50', 1, '2025-11-05 04:02:23'),
(93, 'sociable', 'Sociable', 'Amigable en general, se lleva bien con otros', '#8BC34A', 1, '2025-11-05 04:02:23'),
(94, 'reservado', 'Reservado/Tímido', 'Prefiere observar antes de interactuar', '#FFC107', 1, '2025-11-05 04:02:23'),
(95, 'territorial', 'Territorial', 'Protector de su espacio y familia', '#FF9800', 1, '2025-11-05 04:02:23'),
(96, 'requiere_atencion', 'Requiere Atención Especial', 'Necesita manejo cuidadoso', '#FF5722', 1, '2025-11-05 04:02:23');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `urgency_levels`
--

CREATE TABLE `urgency_levels` (
  `id` int NOT NULL,
  `code` varchar(20) NOT NULL,
  `name` varchar(50) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `color` varchar(7) DEFAULT '#4CAF50',
  `priority` int DEFAULT '0',
  `active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Catálogo de niveles de urgencia con prioridad';

--
-- Volcado de datos para la tabla `urgency_levels`
--

INSERT INTO `urgency_levels` (`id`, `code`, `name`, `description`, `color`, `priority`, `active`, `created_at`) VALUES
(1, 'low', 'Baja', 'Situación no urgente', '#4CAF50', 1, 1, '2025-10-31 04:48:55'),
(2, 'normal', 'Normal', 'Situación que requiere atención', '#FF9800', 2, 1, '2025-10-31 04:48:55'),
(3, 'high', 'Alta', 'Situación urgente', '#F44336', 3, 1, '2025-10-31 04:48:55'),
(4, 'emergency', 'Emergencia', 'Situación crítica que requiere atención inmediata', '#9C27B0', 4, 1, '2025-10-31 04:48:55');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `user_audit_log`
--

CREATE TABLE `user_audit_log` (
  `id` int NOT NULL,
  `action` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `target_user_id` int NOT NULL,
  `performed_by_user_id` int NOT NULL,
  `old_values` json DEFAULT NULL,
  `new_values` json DEFAULT NULL,
  `ip_address` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `user_audit_log`
--

INSERT INTO `user_audit_log` (`id`, `action`, `target_user_id`, `performed_by_user_id`, `old_values`, `new_values`, `ip_address`, `user_agent`, `notes`, `created_at`) VALUES
(1, 'create', 5, 1, NULL, '{\"email\": \"hosmellhahaha@gmail.com\", \"role_id\": 2, \"employee_code\": \"ADMIN-2025-004\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', 'Usuario municipal creado con código ADMIN-2025-004', '2025-11-05 06:48:32'),
(2, 'create', 6, 5, NULL, '{\"email\": \"sereno@gmail.com\", \"role_id\": 3, \"employee_code\": \"SEG-2025-004\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', 'Usuario municipal creado con código SEG-2025-004', '2025-11-05 06:57:32');

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `view_pets_complete`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `view_pets_complete` (
`id` int
,`cui` varchar(20)
,`pet_name` varchar(100)
,`sex` enum('male','female')
,`breed_id` int
,`birth_date` date
,`age` int
,`size_id` int
,`additional_features` text
,`adopter_id` int
,`created_at` timestamp
,`updated_at` timestamp
,`breed_name` varchar(100)
,`size_name` varchar(50)
,`size_code` varchar(20)
,`color_name` text
,`color_hex` text
,`owner_first_name` varchar(100)
,`owner_last_name` varchar(100)
,`owner_dni` varchar(8)
,`owner_email` varchar(100)
,`owner_phone` varchar(20)
,`owner_address` text
,`owner_photo_path` varchar(255)
,`has_vaccination_card` tinyint(1)
,`vaccination_card_path` varchar(255)
,`has_rabies_vaccine` tinyint(1)
,`rabies_vaccine_path` varchar(255)
,`medical_history` text
,`aggression_history` enum('yes','no')
,`aggression_details` text
,`last_checkup_date` date
,`photo_frontal_path` varchar(255)
,`photo_posterior_path` varchar(255)
,`qr_code_path` varchar(255)
,`card_printed` tinyint(1)
,`print_date` timestamp
,`print_count` int
,`has_payments` int
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `view_stray_reports_complete`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `view_stray_reports_complete` (
`id` int
,`reporter_id` int
,`reporter_name` varchar(255)
,`reporter_phone` varchar(20)
,`reporter_email` varchar(255)
,`latitude` decimal(10,8)
,`longitude` decimal(11,8)
,`address` varchar(255)
,`zone` varchar(100)
,`breed_id` int
,`size_id` int
,`temperament_id` int
,`condition_id` int
,`urgency_level_id` int
,`description` text
,`photo_path` varchar(255)
,`status` enum('active','pending','in_progress','resolved','closed')
,`created_at` timestamp
,`updated_at` timestamp
,`assigned_to` int
,`assigned_at` timestamp
,`assigned_by` int
,`status_notes` text
,`status_updated_at` timestamp
,`status_type_id` int
,`breed_name` varchar(100)
,`size_name` varchar(50)
,`size_code` varchar(20)
,`temperament_name` varchar(50)
,`temperament_code` varchar(20)
,`temperament_color` varchar(7)
,`condition_name` varchar(50)
,`condition_code` varchar(20)
,`urgency_name` varchar(50)
,`urgency_code` varchar(20)
,`urgency_color` varchar(7)
,`urgency_priority` int
,`reporter_first_name` varchar(100)
,`reporter_last_name` varchar(100)
,`reporter_phone_from_user` varchar(20)
,`reporter_email_from_user` varchar(100)
,`colors` text
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `v_user_audit_log`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `v_user_audit_log` (
`id` int
,`action` varchar(50)
,`created_at` timestamp
,`target_user_name` varchar(201)
,`target_user_email` varchar(100)
,`performed_by_name` varchar(201)
,`performed_by_email` varchar(100)
,`old_values` json
,`new_values` json
,`ip_address` varchar(45)
,`notes` text
);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `zones`
--

CREATE TABLE `zones` (
  `id` int NOT NULL,
  `code` varchar(20) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text,
  `active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Catálogo de zonas para asignación de personal';

--
-- Volcado de datos para la tabla `zones`
--

INSERT INTO `zones` (`id`, `code`, `name`, `description`, `active`, `created_at`) VALUES
(1, 'centro', 'Zona Centro', 'Centro de la ciudad de Puno', 1, '2025-11-05 05:35:16'),
(2, 'norte', 'Zona Norte', 'Sector norte de Puno', 1, '2025-11-05 05:35:16'),
(3, 'sur', 'Zona Sur', 'Sector sur de Puno', 1, '2025-11-05 05:35:16'),
(4, 'este', 'Zona Este', 'Sector este de Puno', 1, '2025-11-05 05:35:16'),
(5, 'oeste', 'Zona Oeste', 'Sector oeste de Puno', 1, '2025-11-05 05:35:16');

-- --------------------------------------------------------

--
-- Estructura para la vista `view_pets_complete`
--
DROP TABLE IF EXISTS `view_pets_complete`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `view_pets_complete`  AS SELECT `p`.`id` AS `id`, `p`.`cui` AS `cui`, `p`.`pet_name` AS `pet_name`, `p`.`sex` AS `sex`, `p`.`breed_id` AS `breed_id`, `p`.`birth_date` AS `birth_date`, `p`.`age` AS `age`, `p`.`size_id` AS `size_id`, `p`.`additional_features` AS `additional_features`, `p`.`adopter_id` AS `adopter_id`, `p`.`created_at` AS `created_at`, `p`.`updated_at` AS `updated_at`, `b`.`name` AS `breed_name`, `s`.`name` AS `size_name`, `s`.`code` AS `size_code`, group_concat(distinct `c`.`name` order by `pc`.`display_order` ASC separator ', ') AS `color_name`, group_concat(distinct `c`.`hex_code` order by `pc`.`display_order` ASC separator ',') AS `color_hex`, `a`.`first_name` AS `owner_first_name`, `a`.`last_name` AS `owner_last_name`, `a`.`dni` AS `owner_dni`, `a`.`email` AS `owner_email`, `a`.`phone` AS `owner_phone`, `a`.`address` AS `owner_address`, `a`.`photo_path` AS `owner_photo_path`, `h`.`has_vaccination_card` AS `has_vaccination_card`, `h`.`vaccination_card_path` AS `vaccination_card_path`, `h`.`has_rabies_vaccine` AS `has_rabies_vaccine`, `h`.`rabies_vaccine_path` AS `rabies_vaccine_path`, `h`.`medical_history` AS `medical_history`, `h`.`aggression_history` AS `aggression_history`, `h`.`aggression_details` AS `aggression_details`, `h`.`last_checkup_date` AS `last_checkup_date`, `d`.`photo_frontal_path` AS `photo_frontal_path`, `d`.`photo_posterior_path` AS `photo_posterior_path`, `d`.`qr_code_path` AS `qr_code_path`, `d`.`card_printed` AS `card_printed`, `d`.`print_date` AS `print_date`, `d`.`print_count` AS `print_count`, (case when (max(`pay`.`id`) is not null) then 1 else 0 end) AS `has_payments` FROM ((((((((`pets` `p` left join `breeds` `b` on((`p`.`breed_id` = `b`.`id`))) left join `sizes` `s` on((`p`.`size_id` = `s`.`id`))) left join `adopters` `a` on((`p`.`adopter_id` = `a`.`id`))) left join `pet_health_records` `h` on((`p`.`id` = `h`.`pet_id`))) left join `pet_documents` `d` on((`p`.`id` = `d`.`pet_id`))) left join `pet_colors` `pc` on((`p`.`id` = `pc`.`pet_id`))) left join `colors` `c` on((`pc`.`color_id` = `c`.`id`))) left join `pet_payments` `pay` on((`p`.`id` = `pay`.`pet_id`))) GROUP BY `p`.`id` ;

-- --------------------------------------------------------

--
-- Estructura para la vista `view_stray_reports_complete`
--
DROP TABLE IF EXISTS `view_stray_reports_complete`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `view_stray_reports_complete`  AS SELECT `sr`.`id` AS `id`, `sr`.`reporter_id` AS `reporter_id`, `sr`.`reporter_name` AS `reporter_name`, `sr`.`reporter_phone` AS `reporter_phone`, `sr`.`reporter_email` AS `reporter_email`, `sr`.`latitude` AS `latitude`, `sr`.`longitude` AS `longitude`, `sr`.`address` AS `address`, `sr`.`zone` AS `zone`, `sr`.`breed_id` AS `breed_id`, `sr`.`size_id` AS `size_id`, `sr`.`temperament_id` AS `temperament_id`, `sr`.`condition_id` AS `condition_id`, `sr`.`urgency_level_id` AS `urgency_level_id`, `sr`.`description` AS `description`, `sr`.`photo_path` AS `photo_path`, `sr`.`status` AS `status`, `sr`.`created_at` AS `created_at`, `sr`.`updated_at` AS `updated_at`, `sr`.`assigned_to` AS `assigned_to`, `sr`.`assigned_at` AS `assigned_at`, `sr`.`assigned_by` AS `assigned_by`, `sr`.`status_notes` AS `status_notes`, `sr`.`status_updated_at` AS `status_updated_at`, `sr`.`status_type_id` AS `status_type_id`, `b`.`name` AS `breed_name`, `s`.`name` AS `size_name`, `s`.`code` AS `size_code`, `t`.`name` AS `temperament_name`, `t`.`code` AS `temperament_code`, `t`.`color` AS `temperament_color`, `rc`.`name` AS `condition_name`, `rc`.`code` AS `condition_code`, `ul`.`name` AS `urgency_name`, `ul`.`code` AS `urgency_code`, `ul`.`color` AS `urgency_color`, `ul`.`priority` AS `urgency_priority`, `a`.`first_name` AS `reporter_first_name`, `a`.`last_name` AS `reporter_last_name`, `a`.`phone` AS `reporter_phone_from_user`, `a`.`email` AS `reporter_email_from_user`, group_concat(`c`.`name` separator ', ') AS `colors` FROM ((((((((`stray_reports` `sr` left join `breeds` `b` on((`sr`.`breed_id` = `b`.`id`))) left join `sizes` `s` on((`sr`.`size_id` = `s`.`id`))) left join `temperaments` `t` on((`sr`.`temperament_id` = `t`.`id`))) left join `report_conditions` `rc` on((`sr`.`condition_id` = `rc`.`id`))) left join `urgency_levels` `ul` on((`sr`.`urgency_level_id` = `ul`.`id`))) left join `adopters` `a` on((`sr`.`reporter_id` = `a`.`id`))) left join `stray_report_colors` `src` on((`sr`.`id` = `src`.`stray_report_id`))) left join `colors` `c` on((`src`.`color_id` = `c`.`id`))) GROUP BY `sr`.`id` ;

-- --------------------------------------------------------

--
-- Estructura para la vista `v_user_audit_log`
--
DROP TABLE IF EXISTS `v_user_audit_log`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_user_audit_log`  AS SELECT `ual`.`id` AS `id`, `ual`.`action` AS `action`, `ual`.`created_at` AS `created_at`, concat(`target`.`first_name`,' ',`target`.`last_name`) AS `target_user_name`, `target`.`email` AS `target_user_email`, concat(`performer`.`first_name`,' ',`performer`.`last_name`) AS `performed_by_name`, `performer`.`email` AS `performed_by_email`, `ual`.`old_values` AS `old_values`, `ual`.`new_values` AS `new_values`, `ual`.`ip_address` AS `ip_address`, `ual`.`notes` AS `notes` FROM ((`user_audit_log` `ual` left join `adopters` `target` on((`ual`.`target_user_id` = `target`.`id`))) left join `adopters` `performer` on((`ual`.`performed_by_user_id` = `performer`.`id`))) ORDER BY `ual`.`created_at` DESC ;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `adopters`
--
ALTER TABLE `adopters`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `dni` (`dni`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_dni` (`dni`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_role` (`role_id`);

--
-- Indices de la tabla `breeds`
--
ALTER TABLE `breeds`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD KEY `idx_name` (`name`);

--
-- Indices de la tabla `colors`
--
ALTER TABLE `colors`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD KEY `idx_name` (`name`);

--
-- Indices de la tabla `employee_code_counters`
--
ALTER TABLE `employee_code_counters`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_role_year` (`role_code`,`year`);

--
-- Indices de la tabla `medical_histories`
--
ALTER TABLE `medical_histories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`);

--
-- Indices de la tabla `pets`
--
ALTER TABLE `pets`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `cui` (`cui`),
  ADD KEY `idx_cui` (`cui`),
  ADD KEY `idx_adopter` (`adopter_id`),
  ADD KEY `idx_breed` (`breed_id`),
  ADD KEY `idx_size` (`size_id`),
  ADD KEY `idx_temperament` (`temperament_id`);

--
-- Indices de la tabla `pet_colors`
--
ALTER TABLE `pet_colors`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_pet_color` (`pet_id`,`color_id`),
  ADD KEY `idx_pet` (`pet_id`),
  ADD KEY `idx_color` (`color_id`);

--
-- Indices de la tabla `pet_documents`
--
ALTER TABLE `pet_documents`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_pet_document` (`pet_id`),
  ADD KEY `idx_pet` (`pet_id`),
  ADD KEY `idx_card_printed` (`card_printed`);

--
-- Indices de la tabla `pet_health_records`
--
ALTER TABLE `pet_health_records`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_pet_health` (`pet_id`),
  ADD KEY `idx_pet` (`pet_id`),
  ADD KEY `medical_history_id` (`medical_history_id`);

--
-- Indices de la tabla `pet_payments`
--
ALTER TABLE `pet_payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_pet` (`pet_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_receipt` (`receipt_number`);

--
-- Indices de la tabla `pet_vaccinations`
--
ALTER TABLE `pet_vaccinations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_pet` (`pet_id`),
  ADD KEY `idx_vaccine_date` (`vaccine_date`),
  ADD KEY `idx_next_dose` (`next_dose_date`);

--
-- Indices de la tabla `report_conditions`
--
ALTER TABLE `report_conditions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD KEY `idx_code` (`code`);

--
-- Indices de la tabla `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD KEY `idx_code` (`code`);

--
-- Indices de la tabla `sizes`
--
ALTER TABLE `sizes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD KEY `idx_code` (`code`);

--
-- Indices de la tabla `stray_reports`
--
ALTER TABLE `stray_reports`
  ADD PRIMARY KEY (`id`),
  ADD KEY `breed_id` (`breed_id`),
  ADD KEY `size_id` (`size_id`),
  ADD KEY `temperament_id` (`temperament_id`),
  ADD KEY `idx_reporter` (`reporter_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_location` (`latitude`,`longitude`),
  ADD KEY `idx_urgency` (`urgency_level_id`),
  ADD KEY `idx_condition` (`condition_id`),
  ADD KEY `idx_assigned_to` (`assigned_to`),
  ADD KEY `idx_assigned_by` (`assigned_by`),
  ADD KEY `idx_stray_reports_status_type` (`status_type_id`),
  ADD KEY `idx_stray_reports_assigned_status` (`assigned_to`,`status_type_id`);

--
-- Indices de la tabla `stray_report_colors`
--
ALTER TABLE `stray_report_colors`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_report_color` (`stray_report_id`,`color_id`),
  ADD KEY `idx_report` (`stray_report_id`),
  ADD KEY `idx_color` (`color_id`);

--
-- Indices de la tabla `stray_report_status_types`
--
ALTER TABLE `stray_report_status_types`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_status_code` (`code`),
  ADD UNIQUE KEY `uk_status_name` (`name`);

--
-- Indices de la tabla `temperaments`
--
ALTER TABLE `temperaments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD KEY `idx_code` (`code`);

--
-- Indices de la tabla `urgency_levels`
--
ALTER TABLE `urgency_levels`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD KEY `idx_code` (`code`),
  ADD KEY `idx_priority` (`priority`);

--
-- Indices de la tabla `user_audit_log`
--
ALTER TABLE `user_audit_log`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_target_user` (`target_user_id`),
  ADD KEY `idx_performed_by` (`performed_by_user_id`),
  ADD KEY `idx_action` (`action`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indices de la tabla `zones`
--
ALTER TABLE `zones`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD KEY `idx_code` (`code`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `adopters`
--
ALTER TABLE `adopters`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT de la tabla `breeds`
--
ALTER TABLE `breeds`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6572;

--
-- AUTO_INCREMENT de la tabla `colors`
--
ALTER TABLE `colors`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2697;

--
-- AUTO_INCREMENT de la tabla `employee_code_counters`
--
ALTER TABLE `employee_code_counters`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT de la tabla `medical_histories`
--
ALTER TABLE `medical_histories`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT de la tabla `pets`
--
ALTER TABLE `pets`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `pet_colors`
--
ALTER TABLE `pet_colors`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de la tabla `pet_documents`
--
ALTER TABLE `pet_documents`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `pet_health_records`
--
ALTER TABLE `pet_health_records`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=202;

--
-- AUTO_INCREMENT de la tabla `pet_payments`
--
ALTER TABLE `pet_payments`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `pet_vaccinations`
--
ALTER TABLE `pet_vaccinations`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `report_conditions`
--
ALTER TABLE `report_conditions`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=584;

--
-- AUTO_INCREMENT de la tabla `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `sizes`
--
ALTER TABLE `sizes`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=584;

--
-- AUTO_INCREMENT de la tabla `stray_reports`
--
ALTER TABLE `stray_reports`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de la tabla `stray_report_colors`
--
ALTER TABLE `stray_report_colors`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT de la tabla `stray_report_status_types`
--
ALTER TABLE `stray_report_status_types`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `temperaments`
--
ALTER TABLE `temperaments`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1165;

--
-- AUTO_INCREMENT de la tabla `urgency_levels`
--
ALTER TABLE `urgency_levels`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=776;

--
-- AUTO_INCREMENT de la tabla `user_audit_log`
--
ALTER TABLE `user_audit_log`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `zones`
--
ALTER TABLE `zones`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `adopters`
--
ALTER TABLE `adopters`
  ADD CONSTRAINT `fk_adopters_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`);

--
-- Filtros para la tabla `pets`
--
ALTER TABLE `pets`
  ADD CONSTRAINT `fk_pets_temperament` FOREIGN KEY (`temperament_id`) REFERENCES `temperaments` (`id`),
  ADD CONSTRAINT `pets_ibfk_1` FOREIGN KEY (`adopter_id`) REFERENCES `adopters` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `pets_ibfk_2` FOREIGN KEY (`breed_id`) REFERENCES `breeds` (`id`),
  ADD CONSTRAINT `pets_ibfk_3` FOREIGN KEY (`size_id`) REFERENCES `sizes` (`id`);

--
-- Filtros para la tabla `pet_colors`
--
ALTER TABLE `pet_colors`
  ADD CONSTRAINT `pet_colors_ibfk_1` FOREIGN KEY (`pet_id`) REFERENCES `pets` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `pet_colors_ibfk_2` FOREIGN KEY (`color_id`) REFERENCES `colors` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `pet_documents`
--
ALTER TABLE `pet_documents`
  ADD CONSTRAINT `pet_documents_ibfk_1` FOREIGN KEY (`pet_id`) REFERENCES `pets` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `pet_health_records`
--
ALTER TABLE `pet_health_records`
  ADD CONSTRAINT `pet_health_records_ibfk_1` FOREIGN KEY (`pet_id`) REFERENCES `pets` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `pet_health_records_ibfk_2` FOREIGN KEY (`medical_history_id`) REFERENCES `medical_histories` (`id`);

--
-- Filtros para la tabla `pet_payments`
--
ALTER TABLE `pet_payments`
  ADD CONSTRAINT `pet_payments_ibfk_1` FOREIGN KEY (`pet_id`) REFERENCES `pets` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `pet_vaccinations`
--
ALTER TABLE `pet_vaccinations`
  ADD CONSTRAINT `pet_vaccinations_ibfk_1` FOREIGN KEY (`pet_id`) REFERENCES `pets` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `stray_reports`
--
ALTER TABLE `stray_reports`
  ADD CONSTRAINT `fk_stray_reports_assigned` FOREIGN KEY (`assigned_to`) REFERENCES `adopters` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_stray_reports_assigned_by` FOREIGN KEY (`assigned_by`) REFERENCES `adopters` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_stray_reports_status_type` FOREIGN KEY (`status_type_id`) REFERENCES `stray_report_status_types` (`id`),
  ADD CONSTRAINT `stray_reports_ibfk_1` FOREIGN KEY (`reporter_id`) REFERENCES `adopters` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `stray_reports_ibfk_2` FOREIGN KEY (`breed_id`) REFERENCES `breeds` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `stray_reports_ibfk_3` FOREIGN KEY (`size_id`) REFERENCES `sizes` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `stray_reports_ibfk_4` FOREIGN KEY (`temperament_id`) REFERENCES `temperaments` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `stray_reports_ibfk_5` FOREIGN KEY (`condition_id`) REFERENCES `report_conditions` (`id`),
  ADD CONSTRAINT `stray_reports_ibfk_6` FOREIGN KEY (`urgency_level_id`) REFERENCES `urgency_levels` (`id`);

--
-- Filtros para la tabla `stray_report_colors`
--
ALTER TABLE `stray_report_colors`
  ADD CONSTRAINT `stray_report_colors_ibfk_1` FOREIGN KEY (`stray_report_id`) REFERENCES `stray_reports` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `stray_report_colors_ibfk_2` FOREIGN KEY (`color_id`) REFERENCES `colors` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
