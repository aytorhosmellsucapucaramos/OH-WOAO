/**
 * INTEGRATION TESTS - Autenticación
 * 
 * Tests para endpoints de autenticación:
 * - Login
 * - Registro de usuario
 * - Obtener perfil
 * - Rate limiting
 */

const request = require('supertest');
const { pool } = require('../../config/database');
const bcrypt = require('bcryptjs');
const app = require('../../index');

describe('🔐 Auth API - Integration Tests', () => {
  let testUserId;
  let testUserToken;
  
  // Limpiar y preparar datos de prueba
  beforeAll(async () => {
    // Esperar a que la BD esté lista
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Crear usuario de prueba
    const hashedPassword = await bcrypt.hash('test123456', 10);
    const [result] = await pool.query(
      `INSERT INTO adopters (
        first_name, last_name, dni, phone, email, 
        address, password
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        'Test', 'User', '12345678', '987654321', 'test@example.com',
        'Av. Test 123, Puno', hashedPassword
      ]
    );
    testUserId = result.insertId;
  });

  afterAll(async () => {
    // Limpiar datos de prueba
    if (testUserId) {
      await pool.query('DELETE FROM adopters WHERE id = ?', [testUserId]);
    }
    
    // Cerrar conexiones
    await pool.end();
  });

  describe('POST /api/auth/login', () => {
    test('✅ Login exitoso con credenciales válidas', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          dni: '12345678',
          password: 'test123456'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
      expect(response.body.user).toBeDefined();
      expect(response.body.user.dni).toBe('12345678');
      expect(response.body.user.email).toBe('test@example.com');
      
      // Guardar token para otros tests
      testUserToken = response.body.token;
    });

    test('❌ Login fallido con credenciales inválidas', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          dni: '12345678',
          password: 'wrong_password'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toMatch(/credenciales inválidas|incorrectas/i);
    });

    test('❌ Login fallido con DNI inexistente', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          dni: '99999999',
          password: 'test123456'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    test('❌ Validación de campos requeridos', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          dni: '12345678'
          // Falta password
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('❌ DNI debe tener 8 dígitos', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          dni: '123', // DNI inválido
          password: 'test123456'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/me', () => {
    test('✅ Obtener perfil con token válido', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${testUserToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.user).toBeDefined();
      expect(response.body.user.dni).toBe('12345678');
      expect(response.body.user.first_name).toBe('Test');
    });

    test('❌ Sin token de autenticación', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('token');
    });

    test('❌ Token inválido', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid_token_here')
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toMatch(/token.*inválido|expirado/i);
    });
  });

  describe('GET /api/auth/my-pets', () => {
    test('✅ Obtener mascotas del usuario autenticado', async () => {
      const response = await request(app)
        .get('/api/auth/my-pets')
        .set('Authorization', `Bearer ${testUserToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      // Usuario de prueba no tiene mascotas
      expect(response.body.data.length).toBe(0);
    });

    test('❌ Sin autenticación', async () => {
      const response = await request(app)
        .get('/api/auth/my-pets')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/auth/profile', () => {
    test('✅ Actualizar perfil con datos válidos', async () => {
      const response = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({
          first_name: 'Test Updated',
          last_name: 'User Updated',
          phone: '999888777',
          email: 'testupdated@example.com'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toMatch(/actualizado/i);
    });

    test('❌ Actualizar sin autenticación', async () => {
      const response = await request(app)
        .put('/api/auth/profile')
        .send({
          first_name: 'Hacker'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    test('❌ Email inválido', async () => {
      const response = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({
          email: 'invalid-email'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('🛡️ Rate Limiting', () => {
    test('⏱️ Rate limiting después de múltiples intentos fallidos', async () => {
      // Hacer 5 intentos de login fallidos
      for (let i = 0; i < 5; i++) {
        await request(app)
          .post('/api/auth/login')
          .send({
            dni: '99999999',
            password: 'wrong'
          });
      }

      // El 6to intento debe ser bloqueado por rate limiting
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          dni: '99999999',
          password: 'wrong'
        })
        .expect(429);

      expect(response.body.success).toBe(false);
    }, 15000); // 15 segundos timeout para este test
  });
});
