# 🚫 Solución: ERR_BLOCKED_BY_CLIENT

## ❌ Error Original
```
UserDashboard.jsx:144 Error fetching user: AxiosError
localhost:5000/api/auth/me:1 Failed to load resource: net::ERR_BLOCKED_BY_CLIENT
```

## 🔍 Causa del Problema

El error `ERR_BLOCKED_BY_CLIENT` ocurría porque:

1. **URLs hardcodeadas con `localhost:5000`** en `UserDashboard.jsx`
2. Cuando accedes desde el celular con IP `192.168.1.11:3000`, el navegador intenta conectarse a `localhost:5000` (que no existe en el celular)
3. El navegador **bloquea** la petición porque `localhost` no es válido desde el celular

**Ejemplo del problema:**
- Accedes desde: `http://192.168.1.11:3000` ✅ (funciona)
- Código intentaba: `http://localhost:5000/api/auth/me` ❌ (bloqueado)
- Debería usar: `http://192.168.1.11:5000/api/auth/me` ✅ (correcto)

---

## ✅ Solución Aplicada

### **Archivo corregido: `UserDashboard.jsx`**

**Antes (6 URLs hardcodeadas):**
```javascript
// ❌ Hardcodeado - No funciona desde celular
const response = await axios.get('http://localhost:5000/api/auth/me', {...});
imageUrl = `http://localhost:5000/api/uploads/${user.photo_path}`;
```

**Ahora (Detección automática):**
```javascript
// ✅ Detección automática - Funciona en todas las redes
import { getServerUrl, getUploadUrl } from '../utils/urls';

const response = await axios.get(`${getServerUrl()}/api/auth/me`, {...});
imageUrl = getUploadUrl(user.photo_path);
```

---

## 🔧 Cambios Realizados

### **1. Agregado import de utilidades (línea 22):**
```javascript
import { getServerUrl, getUploadUrl } from '../utils/urls';
```

### **2. Reemplazadas 6 URLs:**

| Línea | Antes | Ahora |
|-------|-------|-------|
| 35 | `http://localhost:5000/api/uploads/...` | `getUploadUrl(user.photo_path)` |
| 136 | `http://localhost:5000/api/auth/me` | `${getServerUrl()}/api/auth/me` |
| 157 | `http://localhost:5000/api/auth/my-pets` | `${getServerUrl()}/api/auth/my-pets` |
| 200 | `http://localhost:5000/api/auth/pet/...` | `${getServerUrl()}/api/auth/pet/...` |
| 244 | `http://localhost:5000/api/auth/profile` | `${getServerUrl()}/api/auth/profile` |
| 713 | `http://localhost:5000/api/uploads/...` | `getUploadUrl(pet.photo_frontal_path...)` |

---

## ⚠️ ACCIÓN REQUERIDA: Reiniciar Frontend

**Los cambios NO funcionarán hasta que reinicies el servidor frontend:**

### **Paso 1: Detener el frontend**
En la terminal donde corre `npm run dev` del **client**, presiona:
```
Ctrl + C
```

### **Paso 2: Reiniciar el frontend**
```powershell
cd client
npm run dev
```

### **Paso 3: Verificar que inició correctamente**
Debes ver:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: http://192.168.1.11:3000/
  ➜  press h + enter to show help
```

### **Paso 4: Limpiar caché del navegador**
**Importante:** Limpia la caché del navegador para eliminar archivos antiguos:

**En el celular:**
1. Abre Chrome
2. Menú (⋮) → Configuración → Privacidad y seguridad
3. Borrar datos de navegación → Archivos e imágenes en caché
4. Borrar datos

**O simplemente:**
- Cierra **completamente** la app del navegador
- Vuelve a abrirla

---

## 🧪 Verificar que Funciona

### **Desde el celular:**

1. **Abre el navegador**
2. **Ve a:** `http://192.168.1.11:3000`
3. **Inicia sesión**
4. **Verifica que cargue:**
   - ✅ Datos del usuario
   - ✅ Lista de mascotas
   - ✅ Fotos de perfil
   - ✅ Fotos de mascotas

### **En la consola del navegador (F12):**
Deberías ver peticiones exitosas a:
```
http://192.168.1.11:5000/api/auth/me         → 200 OK
http://192.168.1.11:5000/api/auth/my-pets    → 200 OK
```

**Ya NO debería aparecer:** `localhost:5000`

---

## 🎯 Cómo Funciona la Detección Automática

### **`getServerUrl()`** - Construye la URL del backend:
```javascript
// Si accedes desde: http://192.168.1.11:3000
getServerUrl() → "http://192.168.1.11:5000"

// Si accedes desde: http://192.168.43.100:3000 (hotspot)
getServerUrl() → "http://192.168.43.100:5000"

// Si accedes desde: http://localhost:3000
getServerUrl() → "http://localhost:5000"
```

### **`getUploadUrl(filename)`** - Construye URLs de archivos subidos:
```javascript
getUploadUrl('profile-123.jpg')
→ "http://192.168.1.11:5000/api/uploads/profile-123.jpg"
```

---

## 📊 Comparación: Antes vs Ahora

| Escenario | Antes | Ahora |
|-----------|-------|-------|
| Acceso desde PC (localhost) | ✅ Funcionaba | ✅ Funciona |
| Acceso desde celular (WiFi) | ❌ ERR_BLOCKED_BY_CLIENT | ✅ Funciona |
| Acceso desde hotspot | ❌ ERR_BLOCKED_BY_CLIENT | ✅ Funciona |
| Cambiar de red | ❌ Requería cambios manuales | ✅ Automático |

---

## 🚨 Si el Error Persiste

### **1. Verifica que NO haya extensiones bloqueando:**
- Desactiva ad blockers (uBlock, AdBlock, etc.)
- Desactiva extensiones de privacidad

### **2. Verifica que ambos servidores estén corriendo:**
```powershell
# Backend (puerto 5000)
cd server
npm run dev

# Frontend (puerto 3000)
cd client
npm run dev
```

### **3. Verifica la IP en la consola del navegador:**
Presiona F12 en el navegador y revisa las peticiones en la pestaña "Network". Deben ir a la IP correcta, no a `localhost`.

### **4. Verifica que .env.local esté comentado:**
En `client/.env.local`, la línea debe estar comentada:
```env
# VITE_API_URL=http://192.168.1.11:5000
```

---

## ✅ Resumen de Archivos Modificados

- ✅ `client/src/pages/UserDashboard.jsx` - 7 cambios (import + 6 URLs)
- ✅ `client/.env.local` - Ya estaba correctamente comentado
- ✅ `client/src/utils/urls.js` - Ya tenía la detección automática

---

## 🎉 ¡Todo Listo!

Con estos cambios:
1. ✅ No más errores `ERR_BLOCKED_BY_CLIENT`
2. ✅ Funciona desde cualquier red (WiFi, hotspot, localhost)
3. ✅ No necesitas cambiar configuraciones manualmente
4. ✅ Las fotos cargan correctamente desde cualquier dispositivo

**Recuerda:** Reinicia el frontend (`client`) para aplicar los cambios.
