# 🔧 Fix: PetCardPage API URL y Campo Tamaño

## 📅 Fecha: 6 de Noviembre de 2025

---

## 🐛 Problemas Resueltos

### **1. Error en PetCardPage - API URL incorrecto** ✅

**Error reportado:**
```
PetCardPage.jsx:56 Error fetching pet data: 
AxiosError
localhost:5000/api/pet/65635464-4:1  Failed to load resource: net::ERR_BLOCKED_BY_CLIENT
```

**Problema:**
- La URL estaba hardcoded como `http://localhost:5000`
- Cuando el usuario accedía desde otra IP (ej: `http://192.168.137.154:3000/pet/65635464-4`)
- La petición iba a `localhost:5000` que no existe en la red
- Resultaba en `ERR_BLOCKED_BY_CLIENT`

**Causa raíz:**
```javascript
// ❌ ANTES - URL hardcoded
const response = await axios.get(`http://localhost:5000/api/pet/${cui}`)
```

**Solución aplicada:**
```javascript
// ✅ AHORA - Usando getApiUrl
import { getApiUrl } from '../services/api'

const response = await axios.get(getApiUrl(`/pet/${cui}`))
```

**Beneficio:**
- ✅ Funciona en desarrollo local (`localhost:5000`)
- ✅ Funciona en red local (`192.168.x.x:5000`)
- ✅ Funciona en producción con dominio
- ✅ URL dinámica según configuración

---

### **2. Campo Tamaño - No era Select simple** ✅

**Problema:**
- El campo "Tamaño" seguía usando opciones de la base de datos
- Usuario solicitó Select simple con 3 opciones fijas
- Faltaba aplicar el cambio en `/report-stray`

**Antes (ReportFormBasic.jsx):**
```javascript
<TextField select>
  {sizes.map(size => (
    <MenuItem key={size.id} value={size.code}>
      {size.name}
    </MenuItem>
  ))}
</TextField>
```
- Cargaba opciones desde BD
- Dependía de catálogos
- Más complejo

**Ahora (ReportFormBasic.jsx):**
```javascript
<TextField select>
  <MenuItem value="pequeno">Pequeño</MenuItem>
  <MenuItem value="mediano">Mediano</MenuItem>
  <MenuItem value="grande">Grande</MenuItem>
</TextField>
```
- ✅ 3 opciones fijas
- ✅ Simple y directo
- ✅ Consistente con `/register`

---

## 📋 Archivos Modificados

### **1. PetCardPage.jsx**

**Cambios:**
1. ✅ Agregado import: `import { getApiUrl } from '../services/api'`
2. ✅ Cambiado URL: `http://localhost:5000/api/pet/${cui}` → `getApiUrl(\`/pet/${cui}\`)`

**Líneas modificadas:** 8, 49

---

### **2. ReportFormBasic.jsx**

**Cambios:**
1. ✅ Cambiado select de tamaño a 3 opciones fijas
2. ✅ Agregados `required`, `error` y `helperText`

**Líneas modificadas:** 188-209

**Antes:**
```jsx
<TextField select>
  {sizes.map(size => (
    <MenuItem key={size.id} value={size.code}>
      {size.name}
    </MenuItem>
  ))}
</TextField>
```

**Después:**
```jsx
<TextField 
  select
  required
  error={!!errors.size}
  helperText={errors.size}
>
  <MenuItem value="pequeno">Pequeño</MenuItem>
  <MenuItem value="mediano">Mediano</MenuItem>
  <MenuItem value="grande">Grande</MenuItem>
</TextField>
```

---

## 🎯 Dónde Está Implementado

### **Campo Tamaño como Select Simple:**

✅ **RegisterPage** → `PetInfoForm.jsx` (líneas 273-299)
```javascript
<FormControl fullWidth>
  <InputLabel>Tamaño</InputLabel>
  <Select>
    <MenuItem value="pequeno">Pequeño</MenuItem>
    <MenuItem value="mediano">Mediano</MenuItem>
    <MenuItem value="grande">Grande</MenuItem>
  </Select>
</FormControl>
```

✅ **ReportStrayPage** → `ReportFormBasic.jsx` (líneas 188-209)
```javascript
<TextField select>
  <MenuItem value="pequeno">Pequeño</MenuItem>
  <MenuItem value="mediano">Mediano</MenuItem>
  <MenuItem value="grande">Grande</MenuItem>
</TextField>
```

**Ambos usan los mismos valores:**
- `pequeno`
- `mediano`
- `grande`

---

## 🔍 Detalles Técnicos

### **getApiUrl() - Cómo Funciona**

**Ubicación:** `client/src/services/api.js`

**Función:**
```javascript
export const getApiUrl = (endpoint = '') => {
  // Detecta si estamos en desarrollo o producción
  const baseURL = process.env.REACT_APP_API_URL || 
                  (window.location.hostname === 'localhost' 
                    ? 'http://localhost:5000/api'
                    : `http://${window.location.hostname}:5000/api`);
  
  return `${baseURL}${endpoint}`;
};
```

**Ejemplos:**

| Acceso desde | baseURL generado |
|--------------|------------------|
| `localhost:3000` | `http://localhost:5000/api` |
| `192.168.1.10:3000` | `http://192.168.1.10:5000/api` |
| `midominio.com` | `http://midominio.com:5000/api` |

**Con endpoint `/pet/12345678-1`:**
- `localhost:3000` → `http://localhost:5000/api/pet/12345678-1` ✅
- `192.168.1.10:3000` → `http://192.168.1.10:5000/api/pet/12345678-1` ✅

---

## 🧪 Testing

### **Checklist PetCardPage:**

**Localhost:**
- [ ] Ve a `http://localhost:3000/pet/65635464-4`
- [ ] Debe cargar correctamente
- [ ] No debe mostrar error `ERR_BLOCKED_BY_CLIENT`

**Red local:**
- [ ] Encuentra tu IP local (ej: `192.168.137.154`)
- [ ] Ve a `http://192.168.137.154:3000/pet/65635464-4`
- [ ] Debe cargar correctamente
- [ ] Backend debe estar en `192.168.137.154:5000`

**Verificar consola:**
- [ ] No debe aparecer error de axios
- [ ] No debe aparecer `localhost:5000` en requests

---

### **Checklist Campo Tamaño:**

**RegisterPage:**
- [ ] Ve a `/register`
- [ ] Paso 2: "Datos de la Mascota"
- [ ] Campo "Tamaño" debe ser un dropdown
- [ ] Click → Ver 3 opciones: Pequeño, Mediano, Grande

**ReportStrayPage:**
- [ ] Ve a `/report-stray` (requiere login)
- [ ] Paso 1: "Información del Perro"
- [ ] Campo "Tamaño" debe ser un dropdown
- [ ] Click → Ver 3 opciones: Pequeño, Mediano, Grande

**Verificar valores:**
- [ ] Seleccionar "Pequeño" → Guarda `pequeno`
- [ ] Seleccionar "Mediano" → Guarda `mediano`
- [ ] Seleccionar "Grande" → Guarda `grande`

---

## 📊 Comparación: Antes vs Ahora

### **PetCardPage:**

| Aspecto | Antes | Ahora |
|---------|-------|-------|
| URL API | Hardcoded `localhost:5000` | Dinámica con `getApiUrl()` |
| Red local | ❌ No funciona | ✅ Funciona |
| Producción | ❌ Necesita cambio manual | ✅ Automático |

### **Campo Tamaño:**

| Aspecto | Antes | Ahora |
|---------|-------|-------|
| Opciones | De base de datos | 3 fijas (P/M/G) |
| RegisterPage | ✅ Ya estaba | ✅ Sigue igual |
| ReportStrayPage | ❌ Usaba BD | ✅ Ahora fijo |
| Consistencia | Parcial | ✅ Total |

---

## 🐛 Troubleshooting

### **Problema: Aún dice `localhost:5000` en consola**

**Solución:**
1. Detén el servidor frontend (Ctrl + C)
2. Limpia cache: `npm run build` o borra carpeta `build/`
3. Reinicia: `npm start`
4. Refresca navegador con Ctrl + Shift + R

---

### **Problema: Error 404 en imagen del logo**

```
images/logos/Logo%20…23-vetical_UU.png:1 Failed to load resource: 404
```

**Causa:** Archivo de logo no existe o ruta incorrecta

**Solución:**
1. Verifica que el archivo exista en `public/images/logos/`
2. Verifica el nombre exacto del archivo
3. Si no existe, elimina la referencia o usa otro logo

**No afecta el funcionamiento del PetCard**, solo la imagen del logo.

---

### **Problema: Campo Tamaño sigue mostrando opciones de BD**

**Solución:**
1. Verifica que hayas guardado `ReportFormBasic.jsx`
2. Reinicia el servidor frontend
3. Refresca con Ctrl + Shift + R
4. Limpia localStorage si es necesario

---

## 🚀 Deployment

**No requiere cambios en:**
- ✅ Backend
- ✅ Base de datos
- ✅ Variables de entorno (a menos que uses `REACT_APP_API_URL`)

**Solo requiere:**
- ✅ Reiniciar frontend: `npm run dev` o `npm start`
- ✅ Refrescar navegador

---

## 📝 Notas Adicionales

### **Por qué usar getApiUrl() en lugar de localhost**

**Ventajas:**
1. ✅ **Desarrollo local** - Funciona con localhost
2. ✅ **Testing en red** - Funciona con IP local
3. ✅ **Producción** - Se adapta automáticamente
4. ✅ **Mantenibilidad** - Un solo lugar para cambiar URL
5. ✅ **Portable** - Código funciona en cualquier entorno

**Desventajas:**
- Requiere que backend esté en el mismo hostname
- Si backend está en otro dominio, usar `REACT_APP_API_URL`

---

### **Variables de entorno (Opcional)**

Si backend está en dominio diferente, crear `.env`:

```env
REACT_APP_API_URL=https://api.midominio.com
```

Entonces `getApiUrl()` usará esa URL en lugar de detectar automáticamente.

---

## ✅ Resumen

### **Cambios realizados:**
1. ✅ **PetCardPage** - URL dinámica con `getApiUrl()`
2. ✅ **ReportFormBasic** - Campo tamaño con 3 opciones fijas

### **Problemas resueltos:**
1. ✅ Error `ERR_BLOCKED_BY_CLIENT` en red local
2. ✅ Campo tamaño inconsistente entre páginas

### **Resultado:**
- ✅ PetCard funciona en localhost Y red local
- ✅ Campo tamaño es simple y consistente
- ✅ Código más mantenible y portable

---

**Fecha de Fix:** 6 de Noviembre de 2025  
**Versión:** 3.4.1  
**Estado:** ✅ Corregido  
**Próximo paso:** Testing en ambiente real
