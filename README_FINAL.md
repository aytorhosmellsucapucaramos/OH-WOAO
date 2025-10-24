# 🐕 WebPerritos - Sistema Municipal de Registro de Mascotas

Sistema web responsive para el registro y gestión de mascotas en la Municipalidad Provincial de Puno.

---

## ✅ CARACTERÍSTICAS PRINCIPALES

### **🎨 Diseño Responsive**
- ✅ **Navbar tipo WhatsApp** con menú lateral deslizable en móviles
- ✅ **Adaptable** a todos los tamaños de pantalla (móvil, tablet, desktop)
- ✅ **Colores institucionales** Puno Renace (`rgb(0, 167, 229)` y `rgb(45, 186, 236)`)

### **📱 Funcionalidades**
1. **Registro de Mascotas** con código QR único
2. **Búsqueda** por DNI del propietario o CUI de mascota
3. **Reportar Perros Callejeros** con geolocalización
4. **Mapa Interactivo** de reportes con filtros
5. **Panel de Usuario** para gestionar mascotas
6. **Panel de Admin** para gestión municipal
7. **Login Unificado** con redirección automática por rol

---

## 🚀 INSTALACIÓN

### **1. Requisitos Previos**
```bash
Node.js >= 14.x
MySQL >= 8.0
npm o yarn
```

### **2. Clonar e Instalar Dependencias**
```bash
# Instalar dependencias del servidor
cd server
npm install

# Instalar dependencias del cliente
cd ../client
npm install
```

### **3. Configurar Base de Datos**
```sql
-- En MySQL Workbench:
source C:/ruta/al/proyecto/server/database/init_database_v3.sql;
```

### **4. Configurar Variables de Entorno**
```bash
# En server/.env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=pets_db
JWT_SECRET=tu_secreto_jwt
```

### **5. Iniciar el Proyecto**
```bash
# Terminal 1 - Servidor (puerto 5000)
cd server
npm run dev

# Terminal 2 - Cliente (puerto 3000)
cd client
npm run dev
```

### **6. Acceder**
```
🌐 Frontend: http://localhost:3000
🔧 Backend: http://localhost:5000
```

---

## 📱 DISEÑO RESPONSIVE

### **Desktop (>= 960px)**
```
┌─────────────────────────────────────────────┐
│ [Logo] Inicio Registrar Buscar... [Login]  │
└─────────────────────────────────────────────┘
```

### **Móvil (< 960px)**
```
┌───────────────────────────┐
│ ☰  WebPerritos   [Avatar] │ ← Menú hamburguesa
└───────────────────────────┘

Al tocar ☰:
┌──────────────┐
│ WebPerritos  │ ← Drawer lateral
│ ─────────────│
│ 🏠 Inicio    │
│ ✏️ Registrar │
│ 🔍 Buscar    │
│ 📍 Reportar  │
│ 🗺️ Mapa     │
└──────────────┘
```

---

## 👤 USUARIOS

### **Usuario Normal**
```
Email: cualquier email registrado
Password: la que configuraste
```

### **Usuario Admin**
```
Email: admin@municipio.gob.pe
Password: (configurada en setup)
```

---

## 🗂️ ESTRUCTURA DEL PROYECTO

```
webperritos/
├── client/                 # Frontend React + Vite
│   ├── src/
│   │   ├── components/     # Navbar, AdminRoute, etc.
│   │   ├── pages/          # Páginas principales
│   │   └── App.jsx         # Configuración de rutas
│   └── package.json
│
├── server/                 # Backend Express + MySQL
│   ├── config/             # Configuración BD
│   ├── database/           
│   │   └── init_database_v3.sql # ✅ ÚNICA BD necesaria
│   ├── routes/             # Rutas de API
│   │   ├── auth.js         # Autenticación
│   │   └── admin.js        # Panel admin
│   ├── uploads/            # Archivos subidos
│   └── index.js            # ✅ Servidor principal
│
└── README_FINAL.md         # Esta documentación
```

---

## 🔑 ENDPOINTS PRINCIPALES

### **Autenticación**
```
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

### **Mascotas**
```
POST /api/register         # Registrar mascota
GET  /api/search           # Buscar por DNI/CUI
GET  /api/pet/:cui         # Detalles de mascota
```

### **Reportes Callejeros**
```
GET  /api/stray-reports            # Todos los reportes
GET  /api/stray-reports/my-reports # Mis reportes
POST /api/stray-reports            # Crear reporte
```

### **Admin**
```
GET /api/admin/pets
GET /api/admin/users
GET /api/admin/stats
GET /api/admin/analytics
GET /api/admin/stray-reports
```

---

## 🎨 COLORES INSTITUCIONALES

```css
Primario:   rgb(0, 167, 229)    /* Azul celeste Puno Renace */
Secundario: rgb(45, 186, 236)   /* Azul celeste claro */
Acento:     rgb(135, 206, 250)  /* Celeste suave */
```

---

## 📦 TECNOLOGÍAS

### **Frontend**
- React 18
- Material-UI (MUI)
- React Router
- Framer Motion
- Leaflet (mapas)
- Axios

### **Backend**
- Node.js + Express
- MySQL2
- JWT (autenticación)
- Bcrypt (passwords)
- Multer (uploads)
- QRCode

---

## 🐛 SOLUCIÓN DE PROBLEMAS

### **No aparecen reportes en el mapa**
```sql
-- Verificar status de reportes
SELECT id, status FROM stray_reports;

-- Cambiar a 'active' si están en otro estado
UPDATE stray_reports SET status = 'active';
```

### **"Mis Reportes" está vacío**
```sql
-- Verificar reporter_id
SELECT id, reporter_id FROM stray_reports;

-- Vincular a tu usuario (cambia 4 por tu ID)
UPDATE stray_reports SET reporter_id = 4 WHERE reporter_id IS NULL;
```

### **Error de autenticación**
- Verificar que el token JWT está en localStorage
- Reiniciar sesión (logout + login)

---

## 🔒 SEGURIDAD

✅ Passwords hasheados con bcrypt  
✅ Autenticación JWT  
✅ Protección de rutas en frontend y backend  
✅ Validación de datos en servidor  
✅ Roles de usuario (user/admin)  

---

## 📄 LICENCIA

Proyecto desarrollado para la Municipalidad Provincial de Puno.

---

## 👨‍💻 SOPORTE

Para problemas o consultas:
1. Revisar esta documentación
2. Verificar logs del servidor
3. Revisar consola del navegador (F12)

---

**¡Sistema listo para producción!** 🎉
