# 🐛 DEBUG - Problemas de Navegación y Mapa

## 📅 Fecha: 6 de Noviembre de 2025

---

## 🔴 Problemas Reportados

1. **Perfil no va a Login:** Click en "Perfil" (sin login) se queda en "/"
2. **Buscar va a Login:** Click en "Buscar" va a login en lugar de /search
3. **Mapa no muestra reportes:** No se listan todos los reportes en el mapa

---

## 🔧 Acciones Realizadas

### **1. Agregado Console.log para Debug**

He agregado logs en `BottomNav.jsx` para identificar el problema:

**Al cargar el componente:**
```javascript
🔄 BottomNav - Cargando usuario: { hasUserData: false, hasToken: false }
❌ No hay usuario logueado
```

**Al hacer click en un botón:**
```javascript
🔵 Bottom Nav Click: { newValue: 2, user: false }
❌ Usuario NO logueado - Navegando según índice: 2
→ Buscar
```

---

## 🧪 Instrucciones para Testing

### **Paso 1: Abrir DevTools**
1. Presiona **F12** en el navegador
2. Ve a la pestaña **Console**
3. Limpia la consola (icono 🚫)

### **Paso 2: Prueba cada botón del Bottom Nav**

**SIN ESTAR LOGUEADO:**

1. Click en 🏠 **Inicio**
   - ✅ Debería ir a `/`
   - 📊 **Consola debe mostrar:** `newValue: 0`, `→ Inicio`

2. Click en 📍 **Mapa**
   - ✅ Debería ir a `/map`
   - 📊 **Consola debe mostrar:** `newValue: 1`, `→ Mapa`

3. Click en 🔍 **Buscar**
   - ✅ Debería ir a `/search`
   - 📊 **Consola debe mostrar:** `newValue: 2`, `→ Buscar`

4. Click en 👤 **Perfil**
   - ✅ Debería ir a `/login`
   - 📊 **Consola debe mostrar:** `newValue: 3`, `→ Login (desde Perfil)`

### **Paso 3: Copia los logs de la consola**

**Por favor, copia y pega TODOS los logs que aparezcan en la consola cuando:**
- Cargues la página
- Hagas click en "Buscar"
- Hagas click en "Perfil"

**Ejemplo de lo que necesito ver:**
```
🔄 BottomNav - Cargando usuario: { hasUserData: false, hasToken: false }
❌ No hay usuario logueado
🔵 Bottom Nav Click: { newValue: 2, user: false }
❌ Usuario NO logueado - Navegando según índice: 2
→ Buscar
```

---

## 🗺️ Problema del Mapa

### **Verificación del Backend**

El mapa carga reportes desde:
```
GET http://localhost:4000/api/stray-reports
```

**Para verificar que el backend funciona:**

1. Abre una nueva pestaña del navegador
2. Ve a: `http://localhost:4000/api/stray-reports`
3. **Debería mostrar algo así:**
   ```json
   {
     "success": true,
     "data": [
       {
         "id": 1,
         "breed": "Mestizo",
         "latitude": 14.0583,
         "longitude": -87.2068,
         ...
       }
     ]
   }
   ```

4. **Si NO muestra datos:**
   - Verifica que el backend esté corriendo
   - Verifica que haya reportes en la base de datos

### **Logs del Mapa**

Cuando abras `/map`, deberías ver en la consola:

**Si el backend funciona:**
```
🔄 Cargando reportes desde el servidor...
📦 Respuesta recibida: { success: true, data: [...] }
✅ X reportes reales cargados desde la base de datos
```

**Si el backend NO funciona:**
```
❌ No se pudo conectar con el servidor. Usando datos de demostración.
📊 Mostrando 3 reportes de demostración (servidor no disponible)
```

---

## 📋 Checklist de Verificación

Por favor, responde estas preguntas:

### **Navegación:**
- [ ] ¿Aparecen los logs en la consola cuando haces click?
- [ ] ¿Qué valor de `newValue` muestra cuando haces click en "Buscar"?
- [ ] ¿Qué valor de `newValue` muestra cuando haces click en "Perfil"?
- [ ] ¿El `user` es `false` en la consola?

### **Mapa:**
- [ ] ¿El backend está corriendo? (`npm run dev` en /server)
- [ ] ¿Puedes acceder a `http://localhost:4000/api/stray-reports`?
- [ ] ¿Qué logs aparecen en la consola al abrir `/map`?
- [ ] ¿Cuántos reportes dice que hay en la base de datos?

---

## 🤔 Posibles Causas

### **Problema de Navegación:**

**Hipótesis 1:** Los índices del BottomNavigation no coinciden
- **Causa:** MUI asigna índices según el ORDEN de renderizado
- **Solución:** Verificar con logs qué índice se está enviando

**Hipótesis 2:** El estado `user` no se está inicializando correctamente
- **Causa:** localStorage no se lee al inicio
- **Solución:** Verificar logs de carga de usuario

### **Problema del Mapa:**

**Hipótesis 1:** Backend no está corriendo o no es accesible
- **Solución:** Verificar que corra en `http://localhost:4000`

**Hipótesis 2:** No hay datos en la base de datos
- **Solución:** Crear al menos un reporte de prueba

**Hipótesis 3:** CORS o problema de red
- **Solución:** Verificar logs de red en DevTools > Network

---

## 💡 Próximos Pasos

**Una vez que me envíes los logs de la consola, podré:**
1. Identificar si el problema es con los índices
2. Ver si el estado `user` se está cargando bien
3. Verificar si los botones están enviando el índice correcto
4. Diagnosticar el problema del mapa

**Por favor envíame:**
1. ✅ Captura o copia de los logs de la consola
2. ✅ Confirma si `/map` muestra "datos de demostración" o "reportes reales"
3. ✅ Confirma cuántos botones ves en el Bottom Nav (4 o 5)

---

## 🔍 Comandos Útiles

**Ver estado del localStorage (en la consola del navegador):**
```javascript
console.log('User:', localStorage.getItem('user'));
console.log('Token:', localStorage.getItem('authToken'));
```

**Limpiar localStorage (si necesitas hacer pruebas limpias):**
```javascript
localStorage.clear();
location.reload();
```

**Verificar backend:**
```bash
# En otra terminal
cd server
npm run dev
```

---

**Esperando tu feedback con los logs de la consola...** 🔍
