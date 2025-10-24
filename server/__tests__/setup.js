/**
 * Test Setup Configuration
 * Configuración global para todos los tests
 */

// Configurar variables de entorno para testing
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_jwt_secret_for_testing_only_do_not_use_in_production';
process.env.DB_HOST = 'localhost';
process.env.DB_USER = 'root';
process.env.DB_PASSWORD = process.env.DB_PASSWORD || '';
process.env.DB_NAME = 'pets_db_test'; // Base de datos separada para tests

// Timeout global para tests (importante para operaciones de BD)
jest.setTimeout(10000); // 10 segundos

// Mock del logger para no llenar la consola durante tests
jest.mock('../config/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  logAuth: jest.fn(),
  logActivity: jest.fn(),
  logUpload: jest.fn()
}));

console.log('🧪 Test environment configured');
