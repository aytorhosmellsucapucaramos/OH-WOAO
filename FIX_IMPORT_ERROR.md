# 🔧 Fix: Import Error getApiUrl

## 📅 Fecha: 6 de Noviembre de 2025

---

## 🐛 Error Resuelto

### **Error:**
```
Uncaught SyntaxError: The requested module '/src/services/api.js' 
does not provide an export named 'getApiUrl' (at PetCardPage.jsx:8:10)
```

---

## ✅ Solución

**Problema:** 
`PetCardPage.jsx` intentaba importar `getApiUrl` desde `services/api.js`, pero esa función no existe ahí.

**La función correcta está en:** `utils/urls.js`

---

## 📝 Cambio Realizado

### **PetCardPage.jsx** (línea 8)

**Antes:**
```javascript
import { getApiUrl } from '../services/api'
```

**Ahora:**
```javascript
import { getApiUrl } from '../utils/urls'
```

---

## 📁 Estructura de Archivos

### **`utils/urls.js`** ✅
```javascript
// Funciones para URLs dinámicas
export const getServerUrl = () => { ... }
export const getUploadUrl = (filename) => { ... }
export const getApiUrl = (endpoint) => { ... }
```

**Características:**
- ✅ Detecta automáticamente la IP
- ✅ Funciona en localhost y red local
- ✅ Usado por todo el proyecto

### **`services/api.js`**
```javascript
// Cliente axios con interceptores
const api = axios.create({ ... })
export default api;
```

**Características:**
- ✅ Instancia de axios configurada
- ✅ Interceptores para auth y errores
- ❌ NO tiene getApiUrl (no lo necesita)

---

## 🎯 Uso Correcto

### **Para URLs de API:**
```javascript
import { getApiUrl } from '../utils/urls'

// Luego usar:
const url = getApiUrl('/pet/12345678-1')
// → http://192.168.137.154:5000/api/pet/12345678-1
```

### **Para URLs de archivos subidos:**
```javascript
import { getUploadUrl } from '../utils/urls'

// Luego usar:
const imageUrl = getUploadUrl('photo_123.jpg')
// → http://192.168.137.154:5000/api/uploads/photo_123.jpg
```

### **Para llamadas con axios configurado:**
```javascript
import api from '../services/api'

// Luego usar:
const response = await api.get('/pets') // Ya incluye baseURL
```

---

## ✅ Resultado

- ✅ Error de import resuelto
- ✅ PetCardPage funciona correctamente
- ✅ URLs dinámicas en localhost Y red local
- ✅ Código consistente con el resto del proyecto

---

**Estado:** ✅ Corregido  
**Requiere restart:** Sí (el servidor ya se reinició con HMR)
