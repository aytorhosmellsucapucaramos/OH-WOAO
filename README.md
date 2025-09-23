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
- SQLite3
- Multer (subida de archivos)
- QRCode generation

## Instalación

1. **Instalar todas las dependencias:**
   ```bash
   npm run install-all
   ```

2. **Ejecutar en modo desarrollo:**
   ```bash
   npm run dev
   ```

3. **Acceder a la aplicación:**
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
│   ├── uploads/            # Archivos subidos
│   ├── pets.db            # Base de datos SQLite
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

## Base de Datos

### Tabla `adopters`
- Información completa del adoptante
- DNI único como identificador
- Datos de contacto y ubicación

### Tabla `pets`
- Información de la mascota
- CUI único con formato VARCHAR(15)
- Relación con adoptante
- Rutas de foto y código QR

## API Endpoints

- `POST /api/register` - Registrar nueva mascota
- `GET /api/search?q={dni|cui}` - Buscar mascotas
- `GET /api/pet/{cui}` - Obtener información específica
- `GET /api/uploads/{filename}` - Servir archivos subidos

## Comandos Útiles

```bash
# Desarrollo completo
npm run dev

# Solo frontend
npm run client

# Solo backend
npm run server

# Build para producción
npm run build
```

## Notas Técnicas

- El CUI se genera automáticamente con 8 dígitos + dígito verificador
- Las fotos se almacenan en `server/uploads/`
- Los códigos QR contienen toda la información en formato JSON
- El sistema es completamente responsivo para móviles y PC
- Todas las animaciones están optimizadas para rendimiento
