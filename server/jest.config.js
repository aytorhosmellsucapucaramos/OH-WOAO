/**
 * Jest Configuration for WebPerritos Backend
 */

module.exports = {
  // Entorno de ejecución
  testEnvironment: 'node',

  // Archivos de setup
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.js'],

  // Patrón de archivos de test
  testMatch: [
    '**/__tests__/**/*.test.js',
    '**/?(*.)+(spec|test).js'
  ],

  // Archivos a ignorar
  testPathIgnorePatterns: [
    '/node_modules/',
    '/uploads/',
    '/logs/'
  ],

  // Coverage (cobertura de código)
  collectCoverageFrom: [
    '**/*.js',
    '!**/node_modules/**',
    '!**/uploads/**',
    '!**/logs/**',
    '!**/__tests__/**',
    '!jest.config.js',
    '!coverage/**'
  ],

  // Directorio de coverage
  coverageDirectory: 'coverage',

  // Reportes de coverage
  coverageReporters: ['text', 'lcov', 'html'],

  // Timeout por defecto (10 segundos)
  testTimeout: 10000,

  // Verbose output
  verbose: true,

  // No limpiar mocks automáticamente
  clearMocks: true,

  // Forzar salida después de todos los tests
  forceExit: true,

  // Detectar file handles abiertos
  detectOpenHandles: true
};
