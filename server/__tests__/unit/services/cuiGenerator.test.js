/**
 * UNIT TESTS - Generador de CUI
 * 
 * Tests unitarios para la utilidad de generación de CUI
 * Formato actual: XXXXXXXX-Y (8 dígitos + check digit)
 */

const { generateCUI, checkCUIExists, generateUniqueCUI } = require('../../../utils/cuiGenerator');

describe('🔢 CUI Generator - Unit Tests', () => {
  
  describe('generateCUI()', () => {
    test('✅ Genera CUI con formato correcto (XXXXXXXX-Y)', () => {
      const cui = generateCUI();
      
      // Formato: 8 dígitos + guion + 1 dígito check
      expect(cui).toMatch(/^\d{8}-\d$/);
    });

    test('✅ CUI tiene 10 caracteres (8 dígitos + - + checkdigit)', () => {
      const cui = generateCUI();
      
      expect(cui).toHaveLength(10);
      expect(cui).toContain('-');
    });

    test('✅ Check digit es correcto (módulo 10)', () => {
      const cui = generateCUI();
      const [number, checkDigit] = cui.split('-');
      const calculatedCheck = parseInt(number) % 10;
      
      expect(parseInt(checkDigit)).toBe(calculatedCheck);
    });

    test('✅ CUIs generados son diferentes (aleatorios)', () => {
      const cuis = new Set();
      
      // Generar 100 CUIs
      for (let i = 0; i < 100; i++) {
        cuis.add(generateCUI());
      }
      
      // Todos deben ser únicos (probabilidad alta)
      expect(cuis.size).toBeGreaterThan(95); // Al menos 95 únicos
    });

    test('✅ Genera número de 8 dígitos', () => {
      const cui = generateCUI();
      const [number] = cui.split('-');
      
      expect(number).toMatch(/^\d{8}$/);
      expect(parseInt(number)).toBeGreaterThanOrEqual(10000000);
      expect(parseInt(number)).toBeLessThanOrEqual(99999999);
    });
  });

  describe('🔒 Casos Edge', () => {
    test('⚡ Performance - generar 1000 CUIs < 100ms', () => {
      const start = Date.now();
      
      for (let i = 0; i < 1000; i++) {
        generateCUI();
      }
      
      const end = Date.now();
      const duration = end - start;
      
      expect(duration).toBeLessThan(100); // Debe ser rápido
    });

    test('✅ CUI siempre tiene formato válido', () => {
      // Generar 50 CUIs y verificar todos
      for (let i = 0; i < 50; i++) {
        const cui = generateCUI();
        expect(cui).toMatch(/^\d{8}-\d$/);
      }
    });

    test('✅ Check digit nunca excede 9', () => {
      for (let i = 0; i < 50; i++) {
        const cui = generateCUI();
        const [_, checkDigit] = cui.split('-');
        expect(parseInt(checkDigit)).toBeLessThanOrEqual(9);
        expect(parseInt(checkDigit)).toBeGreaterThanOrEqual(0);
      }
    });
  });
});
