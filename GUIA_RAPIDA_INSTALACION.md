# ⚡ GUÍA RÁPIDA DE INSTALACIÓN

## 🚀 **5 Pasos para Tenerlo Funcionando**

---

## **PASO 1: Instalar Dependencias** (2 min)

```bash
# Terminal 1: Backend
cd server
npm install socket.io

# Terminal 2: Frontend
cd client
npm install socket.io-client
```

---

## **PASO 2: Ejecutar SQL** (3 min)

**En phpMyAdmin:**

1. Selecciona base de datos `pets_db`
2. Click en "SQL"
3. Abre el archivo: `server/database/migration_super_admin_audit.sql`
4. Copia TODO el contenido
5. Pega en phpMyAdmin
6. Click "Ejecutar"

**Debe aparecer:**
```
✅ Migración completada exitosamente
```

---

## **PASO 3: Crear Super Admin** (2 min)

**En phpMyAdmin → SQL:**

```sql
-- Reemplaza 'tu_email@test.com' con TU email
UPDATE adopters 
SET 
  role_id = 4,
  employee_code = 'SADM-2024-001',
  is_active = TRUE
WHERE email = 'tu_email@test.com';

-- Verifica que se actualizó
SELECT 
  email, 
  role_id, 
  employee_code, 
  is_active 
FROM adopters 
WHERE email = 'tu_email@test.com';
```

**Debe mostrar:**
```
email              | role_id | employee_code   | is_active
tu_email@test.com  | 4       | SADM-2024-001   | 1
```

---

## **PASO 4: Iniciar Servidores** (1 min)

```bash
# Terminal 1: Backend
cd server
npm start

# Terminal 2: Frontend  
cd client
npm run dev
```

**Busca en la consola del backend:**
```
✅ Server running on port 5000
⚡ WebSocket: Enabled
📱 Acceso desde celular:
   → http://192.168.1.100:5000   ← Anota esta IP
```

**Busca en la consola del frontend:**
```
➜  Local:   http://localhost:3000
➜  Network: http://192.168.1.100:3000   ← Anota esta IP
```

---

## **PASO 5: Probar** (2 min)

### **En tu PC:**

1. Abre: `http://localhost:3000/login`
2. Login con tu email y contraseña
3. Debe redirigir a: `/admin/dashboard`
4. Click tab: "Personal Municipal"
5. Click: "Crear Usuario"
6. Completa el formulario (NO hay campo de código)
7. Click: "Crear Usuario"

**Debe aparecer:**
```
✅ Usuario creado exitosamente!
📧 Email: ...
🔑 Contraseña: ...
🏷️ Código: ADMIN-2024-001   ← Generado automáticamente
```

### **En tu Celular:**

1. Conéctate a la misma red WiFi que tu PC
2. Abre el navegador
3. Ve a: `http://192.168.1.XXX:3000` (la IP que anotaste)
4. Login
5. ✅ Debe funcionar igual que en PC

---

## 🎯 **Verificaciones Rápidas**

### **1. ¿La función de códigos funciona?**

```sql
SELECT generate_employee_code('admin') as codigo;
-- Debe retornar: ADMIN-2024-001
```

### **2. ¿WebSocket está conectado?**

Abre consola del navegador (F12) y debe aparecer:
```
🔌 Conectado a WebSocket
```

### **3. ¿Los roles están correctos?**

```sql
SELECT * FROM roles;
-- Debe tener 4 filas
```

### **4. ¿La auditoría funciona?**

```sql
SELECT * FROM user_audit_log 
ORDER BY created_at DESC 
LIMIT 1;
-- Debe tener al menos 1 registro
```

---

## ❌ **Si Algo Falla**

### **Error: "Cannot find module 'socket.io'"**
```bash
cd server
npm install socket.io
npm start
```

### **Error: "function generate_employee_code does not exist"**
```
→ Ejecuta de nuevo el PASO 2 (SQL)
```

### **Error: "role_id = 4 does not exist"**
```sql
-- Verifica que el rol super_admin existe
SELECT * FROM roles WHERE code = 'super_admin';

-- Si no existe, ejecuta:
INSERT INTO roles (code, name, description, permissions, active) 
VALUES ('super_admin', 'Super Administrador', 'Administrador con acceso total', '["all"]', TRUE);
```

### **No puedo acceder desde el celular**
```
1. ✅ Misma red WiFi
2. ✅ Usa la IP de "Network" (no localhost)
3. ✅ Firewall de Windows: permitir puertos 3000 y 5000
```

---

## 📋 **Comandos Útiles**

### **Ver logs del backend:**
```bash
# En tiempo real
tail -f server/logs/combined.log
```

### **Ver auditoría:**
```sql
SELECT * FROM v_user_audit_log 
ORDER BY created_at DESC;
```

### **Ver contadores de códigos:**
```sql
SELECT * FROM employee_code_counters;
```

### **Ver tu IP local:**
```cmd
ipconfig
```

---

## ✅ **Checklist Final**

```
✅ socket.io instalado en backend
✅ socket.io-client instalado en frontend
✅ Migración SQL ejecutada
✅ Super admin creado (role_id = 4)
✅ Función generate_employee_code() funciona
✅ Backend muestra IP local al iniciar
✅ Frontend muestra "Network" IP al iniciar
✅ Puedo crear usuarios sin campo de código
✅ Los códigos se generan automáticamente
✅ WebSocket conecta (ver consola navegador)
✅ Notificaciones en tiempo real funcionan
✅ Puedo acceder desde mi celular
```

---

## 🎉 **¡Listo!**

**Tiempo total: ~10 minutos**

**Ahora tienes:**
- 👑 Super Admin con control total
- 🤖 Códigos automáticos (ADMIN-2024-001, etc.)
- 📊 Auditoría de todas las acciones
- ⚡ Actualizaciones en tiempo real
- 📱 Acceso desde cualquier dispositivo

**¡Disfruta!** 🚀

---

## 📞 **Ayuda Rápida**

**¿Dudas? Copia y pega los logs:**

```bash
# Backend
npm start > backend.log 2>&1

# Frontend (en navegador)
F12 → Console → Screenshot

# SQL
SELECT * FROM v_user_audit_log;
```

Y busca en:
- `IMPLEMENTACION_AVANZADA_COMPLETA.md` (documentación completa)
- `SOLUCION_ERROR_403.md` (errores de permisos)
- Logs del servidor: `server/logs/combined.log`
