# WebPerritos - Sistema de Registro de Mascotas

Sistema municipal de registro de mascotas con carnet digital y código QR único.

## Características

- 🐕 **Registro completo** de mascotas y adoptantes
- 📱 **Carnet digital** con código QR único
- 🔍 **Búsqueda rápida** por DNI o CUI
- 📸 **Subida de fotos** para identificación
- 🎨 **Diseño responsivo** con animaciones atractivas
- 🔒 **CUI único** con formato seguro (ej: 43451826-7)

## Tecnologías

### Frontend
- React 18 + Vite
- Material UI
- Framer Motion (animaciones)
- QRCode.react
- Axios

### Backend
- Node.js + Express
- MySQL (base de datos relacional)
- Multer (subida de archivos)
- QRCode generation
- Winston (logging)
- JWT (autenticación)
- Helmet + Rate Limiting (seguridad)

## Instalación

1. **Instalar todas las dependencias:**
   ```bash
   npm run install-all
   ```

2. **Configurar Base de Datos MySQL:**
   - Crear base de datos `pets_db`
   - Copiar `server/.env.example` a `server/.env`
   - Configurar credenciales de MySQL en `.env`
   - La base de datos se inicializará automáticamente al arrancar

3. **Generar JWT Secret (Obligatorio):**
   ```bash
   cd server && npm run generate-jwt
   ```

4. **Ejecutar en modo desarrollo:**
   ```bash
   npm run dev
   ```

5. **Acceder a la aplicación:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## Estructura del Proyecto

```
webperritos/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/     # Componentes reutilizables
│   │   ├── pages/          # Páginas principales
│   │   └── ...
├── server/                 # Backend Node.js
│   ├── config/             # Configuración (DB, seguridad, logger)
│   ├── controllers/        # Controladores de rutas
│   ├── middleware/         # Middleware (auth, validación)
│   ├── routes/             # Rutas de API
│   ├── services/           # Lógica de negocio
│   ├── uploads/            # Archivos subidos
│   ├── logs/               # Archivos de log (Winston)
│   └── index.js           # Servidor principal
└── package.json           # Scripts principales
```

## Funcionalidades

### 1. Página de Inicio
- Presentación del sistema con animaciones
- Navegación intuitiva
- Diseño atractivo y responsivo

### 2. Registro de Mascota
- Formulario completo para mascota y adoptante
- Subida de foto de la mascota
- Generación automática de CUI único
- Validación de campos requeridos

### 3. Búsqueda de Mascotas
- Búsqueda por DNI del adoptante o CUI
- Resultados con información resumida
- Acceso directo al carnet digital

### 4. Carnet Digital
- Información completa de mascota y adoptante
- Código QR con todos los datos
- Diseño profesional para impresión
- Formato optimizado para móviles

## Base de Datos MySQL

### Tablas Principales:
- **adopters** - Información del propietario (DNI, contacto)
- **pets** - Datos de la mascota (CUI único, nombre, edad)
- **pet_documents** - Fotos y QR del carnet
- **pet_health_records** - Historial médico y vacunas
- **stray_reports** - Reportes de perros callejeros
- **users** - Sistema de autenticación

### Catálogos:
- breeds, colors, sizes, temperaments
- report_conditions, urgency_levels

### Vista:
- **view_pets_complete** - Vista consolidada de toda la información

## API Endpoints

### Públicos:
- `POST /api/register` - Registrar nueva mascota
- `GET /api/search?q={dni|cui}` - Buscar mascotas
- `GET /api/pet/{cui}` - Obtener información específica
- `GET /api/stray-reports` - Listar reportes de callejeros
- `POST /api/stray-reports` - Crear reporte de callejero

### Autenticados (requieren JWT):
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar usuario
- `GET /api/stray-reports/my-reports` - Mis reportes
- `GET /api/admin/*` - Panel administrativo

### Estáticos:
- `GET /api/uploads/{filename}` - Servir archivos subidos

## Comandos Útiles

```bash
# Desde la raíz del proyecto
npm run dev              # Arranca cliente y servidor
npm run client           # Solo frontend
npm run server           # Solo backend
npm run build            # Build del cliente
npm run install-all      # Instalar todas las dependencias
```

## Seguridad

- 🔒 **JWT Authentication** - Tokens seguros para autenticación
- 🚪 **Rate Limiting** - Protección contra ataques de fuerza bruta
- 🛡️ **Helmet** - Headers de seguridad configurados
- 📝 **Winston Logger** - Sistema de logs profesional
- ✅ **Joi Validation** - Validación de inputs
- 🔐 **Bcrypt** - Hashing seguro de contraseñas

## Scripts Útiles

```bash
# Servidor
cd server
npm run dev              # Desarrollo con nodemon
npm run generate-jwt     # Generar JWT secret
npm run security-check   # Verificar configuración
npm run cleanup          # Limpiar archivos huérfanos
npm run logs:view        # Ver logs en tiempo real
npm test                 # Ejecutar tests

# Cliente
cd client
npm run dev              # Desarrollo con Vite
npm run build            # Build para producción
npm run preview          # Previsualizar build
```

## Notas Técnicas

- El CUI se genera automáticamente con 8 dígitos + dígito verificador
- Las fotos se almacenan en `server/uploads/`
- Los códigos QR contienen toda la información en formato JSON
- El sistema es completamente responsivo para móviles y PC
- Todas las animaciones están optimizadas para rendimiento
- Los logs se almacenan en `server/logs/` (combined.log, error.log)
