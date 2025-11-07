# 📱 Guía de Acceso desde Dispositivos Móviles

## 🎯 Requisitos Previos

1. **PC y Celular en la misma red WiFi**
2. **Servidor backend corriendo en puerto 5000**
3. **Servidor frontend corriendo en puerto 3000**

---

## 🚀 Paso 1: Obtener la IP de tu PC

### Windows (PowerShell o CMD):
```bash
ipconfig
```

Busca la línea que dice `IPv4 Address` o `Dirección IPv4`. Ejemplo:
```
Dirección IPv4. . . . . . . . . . . : 192.168.1.100
```

### Linux/Mac (Terminal):
```bash
ifconfig
# o
ip addr show
```

---

## 🚀 Paso 2: Iniciar los Servidores

### Terminal 1 - Backend:
```bash
cd server
npm start
```

**Debe mostrar:**
```
✅ Server running on port 5000
✅ Connected to database
```

### Terminal 2 - Frontend:
```bash
cd client
npm run dev
```

**Debe mostrar:**
```
  ➜  Local:   http://localhost:3000/
  ➜  Network: http://192.168.1.100:3000/    <-- Esta es tu URL móvil
```

---

## 📱 Paso 3: Acceder desde el Celular

### Opción A: Usar la URL de Network (Recomendado)
```
http://192.168.1.100:3000
```
*(Usa la IP que apareció en tu terminal)*

### Opción B: Encontrar la IP manualmente
Si no apareció la URL de Network, construye la URL manualmente:
```
http://[TU_IP]:3000
```

**Ejemplo:**
```
http://192.168.1.100:3000
```

---

## ✅ Verificar que Funciona

1. **Abre el navegador en tu celular**
2. **Ingresa la URL:** `http://192.168.1.100:3000`
3. **Deberías ver la página de inicio de WebPerritos**

### Si ves "Servidor no disponible":

#### Verifica el Backend:
1. Abre en tu celular: `http://192.168.1.100:5000/api/health`
2. Deberías ver:
```json
{
  "status": "OK",
  "timestamp": "2025-11-05T07:00:00.000Z"
}
```

#### Si el backend no responde:
```bash
# Detén el servidor (Ctrl+C)
# Reinicia con:
npm start
```

---

## 🔥 Configuración del Firewall (Si no conecta)

### Windows Firewall:
1. Buscar **"Firewall de Windows Defender"**
2. Click **"Configuración avanzada"**
3. **Reglas de entrada** → **Nueva regla**
4. Tipo: **Puerto**
5. Puerto TCP específico: **3000, 5000**
6. Permitir la conexión
7. Aplicar a todos los perfiles

### Comando rápido (Administrador):
```powershell
netsh advfirewall firewall add rule name="Vite Dev Server" dir=in action=allow protocol=TCP localport=3000
netsh advfirewall firewall add rule name="Node Backend" dir=in action=allow protocol=TCP localport=5000
```

---

## 🐛 Solución de Problemas

### Problema 1: "Cannot GET /"
✅ **Solución:** El frontend no está corriendo. Ejecuta `npm run dev` en `client/`

### Problema 2: "Network error" o "Failed to fetch"
✅ **Solución:** 
1. Verifica que el backend esté corriendo
2. Verifica que ambos dispositivos estén en la misma WiFi
3. Verifica el firewall (ver sección anterior)

### Problema 3: "ERR_CONNECTION_REFUSED"
✅ **Solución:**
1. Verifica la IP correcta con `ipconfig`
2. Asegúrate de incluir el puerto `:3000`
3. No uses `https://`, usa `http://`

### Problema 4: El mapa no carga o no hay datos
✅ **Solución:** 
- Las imágenes y APIs usan rutas relativas
- Si ves "localhost" en alguna URL, reporta el bug

---

## 📊 URLs Importantes

### Desde el Celular:
```
Página Principal:     http://192.168.1.100:3000/
Login:                http://192.168.1.100:3000/login
Mapa:                 http://192.168.1.100:3000/map
Backend Health:       http://192.168.1.100:5000/api/health
```

### Desde la PC:
```
Frontend:   http://localhost:3000
Backend:    http://localhost:5000
```

---

## 🎉 ¡Listo!

Ahora puedes usar WebPerritos desde tu celular estando en la misma WiFi que tu PC.

### Funcionalidades disponibles en móvil:
- ✅ Ver mascotas registradas
- ✅ Buscar mascotas
- ✅ Ver mapa de perros callejeros
- ✅ Iniciar sesión
- ✅ Registrar mascota
- ✅ Reportar perro callejero
- ✅ Ver perfil de usuario
- ✅ Dashboards de admin/seguimiento

---

## 📝 Notas Importantes

1. **WiFi obligatorio:** PC y celular deben estar en la misma red
2. **IP dinámica:** La IP puede cambiar si reinicias el router
3. **Solo desarrollo:** Esto es para pruebas locales, no para producción
4. **Proxy de Vite:** El frontend usa proxy para las peticiones API

---

## 🆘 ¿Necesitas Ayuda?

Si tienes problemas, revisa:
1. Los logs del backend (Terminal 1)
2. Los logs del frontend (Terminal 2)
3. La consola del navegador móvil (Chrome DevTools vía USB)
