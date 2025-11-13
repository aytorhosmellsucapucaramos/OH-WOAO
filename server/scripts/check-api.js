/**
 * Script para verificar la API de usuarios municipales
 */

async function checkAPI() {
  try {
    console.log('🔍 Verificando API de usuarios municipales...\n');

    // Hacer petición a la API sin token (debería fallar)
    console.log('1️⃣ Probando petición sin autenticación...');
    try {
      const response = await fetch('http://localhost:5000/api/admin/users');
      if (response.ok) {
        console.log('❌ La API no requiere autenticación (esto es malo)');
      } else {
        console.log(`✅ La API requiere autenticación (status: ${response.status})`);
      }
    } catch (error) {
      console.log('❌ Error de conexión:', error.message);
    }

    // Verificar si el servidor está corriendo
    console.log('\n2️⃣ Verificando si el servidor responde...');
    try {
      const response = await fetch('http://localhost:5000/health');
      if (response.ok) {
        console.log('✅ Servidor responde correctamente');
      } else {
        console.log(`❌ Servidor responde con error: ${response.status}`);
      }
    } catch (error) {
      console.log('❌ Servidor no responde:', error.message);
      return;
    }

    console.log('\n📝 Para probar la API completamente necesitas:');
    console.log('   1. Iniciar sesión en el frontend');
    console.log('   2. Obtener el token de localStorage');
    console.log('   3. Hacer la petición con Authorization header');

  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

checkAPI();
