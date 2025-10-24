# 📋 INSTRUCCIONES PARA MIGRACIÓN A BASE DE DATOS V3.0

## 🎯 Cambios Principales

### **Base de Datos:**
- ✅ **Estructura completamente normalizada** con tablas de catálogo
- ✅ **Sin apellido para mascotas** - Ahora solo `pet_name` + `sex`
- ✅ **Nuevo campo `size_id`** para tamaño de la mascota
- ✅ **Fotos separadas**: `photo_frontal_path` y `photo_posterior_path`
- ✅ **Edad en meses** (no años)
- ✅ **Referencias normalizadas** con Foreign Keys

### **Tablas de Catálogo Nuevas:**
- `breeds` - Razas de perros
- `colors` - Colores con código hexadecimal
- `sizes` - Tamaños (pequeño, mediano, grande)
- `temperaments` - Temperamentos con colores
- `report_conditions` - Condiciones de reporte
- `urgency_levels` - Niveles de urgencia

---

## 📝 PASO 1: Ejecutar en MySQL Workbench

### Opción A: Nueva Instalación (Recomendado para Desarrollo)

```sql
-- 1. Ejecutar el archivo completo
source C:/Users/USUARIO/Downloads/webperritos/webperritos/server/database/init_database_v3.sql;

-- 2. Verificar que se crearon todas las tablas
SHOW TABLES;

-- 3. Verificar datos de catálogos
SELECT * FROM breeds;
SELECT * FROM colors;
SELECT * FROM sizes;
SELECT * FROM temperaments;
SELECT * FROM report_conditions;
SELECT * FROM urgency_levels;
```

### Opción B: Migración con Datos Existentes

```sql
-- 1. Hacer backup de la base de datos actual
CREATE DATABASE pets_db_backup_20241015;
USE pets_db_backup_20241015;

-- Copiar datos existentes
CREATE TABLE adopters_backup AS SELECT * FROM pets_db.adopters;
CREATE TABLE pets_backup AS SELECT * FROM pets_db.pets;
CREATE TABLE stray_reports_backup AS SELECT * FROM pets_db.stray_reports;

-- 2. Ejecutar script de nueva base de datos
source C:/Users/USUARIO/Downloads/webperritos/webperritos/server/database/init_database_v3.sql;

-- 3. Migrar datos de adopters (sin cambios)
INSERT INTO pets_db.adopters 
SELECT * FROM pets_db_backup_20241015.adopters_backup;

-- 4. Migrar datos de pets (con transformaciones)
-- NOTA: Este script asume que existen las razas y colores en los catálogos
INSERT INTO pets_db.pets (
    cui, pet_name, sex, breed_id, age, color_id, size_id,
    additional_features, has_vaccination_card, vaccination_card_path,
    has_rabies_vaccine, rabies_vaccine_path, medical_history,
    photo_frontal_path, qr_code_path, adopter_id, card_printed,
    created_at, updated_at
)
SELECT 
    pb.cui,
    pb.pet_name,
    'male' as sex, -- AJUSTAR MANUALMENTE O DESDE DATOS
    (SELECT id FROM breeds WHERE name = pb.breed LIMIT 1) as breed_id,
    pb.age, -- Convertir de años a meses si es necesario: pb.age * 12
    (SELECT id FROM colors WHERE name = pb.color LIMIT 1) as color_id,
    2 as size_id, -- Default: mediano (ajustar según sea necesario)
    pb.additional_features,
    pb.has_vaccination_card,
    pb.vaccination_card_path,
    pb.has_rabies_vaccine,
    pb.rabies_vaccine_path,
    pb.medical_history,
    pb.photo_path as photo_frontal_path, -- La foto antigua se usa como frontal
    pb.qr_code_path,
    pb.adopter_id,
    pb.card_printed,
    pb.created_at,
    pb.updated_at
FROM pets_db_backup_20241015.pets_backup pb;
```

---

## 🔧 PASO 2: Actualizar Backend (Node.js)

### **Endpoints a Actualizar:**

#### **1. GET /api/admin/pets**
```javascript
// Antes
const query = 'SELECT * FROM pets p JOIN adopters a ON p.adopter_id = a.id';

// Después (usando la vista)
const query = 'SELECT * FROM view_pets_complete ORDER BY created_at DESC';
```

#### **2. GET /api/stray-reports**
```javascript
// Antes
const query = 'SELECT * FROM stray_reports';

// Después (usando la vista)
const query = 'SELECT * FROM view_stray_reports_complete WHERE status = "active"';
```

#### **3. POST /api/register (Registro de Mascota)**
```javascript
// Actualizar para usar IDs en lugar de nombres directos
const insertPet = `
  INSERT INTO pets (
    cui, pet_name, sex, breed_id, age, color_id, size_id,
    additional_features, has_vaccination_card, vaccination_card_path,
    has_rabies_vaccine, rabies_vaccine_path, medical_history,
    photo_frontal_path, photo_posterior_path, qr_code_path,
    adopter_id, card_printed
  ) VALUES (?, ?, ?, 
    (SELECT id FROM breeds WHERE name = ?),
    ?, 
    (SELECT id FROM colors WHERE name = ?),
    (SELECT id FROM sizes WHERE code = ?),
    ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
  )
`;
```

#### **4. Nuevos Endpoints de Catálogos**

**Archivo: `server/routes/catalog.js`**

```javascript
const express = require('express');
const router = express.Router();
const db = require('../config/database');

// GET /api/catalog/breeds
router.get('/breeds', async (req, res) => {
  try {
    const [breeds] = await db.query('SELECT * FROM breeds WHERE active = TRUE ORDER BY name');
    res.json({ success: true, data: breeds });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/catalog/colors
router.get('/colors', async (req, res) => {
  try {
    const [colors] = await db.query('SELECT * FROM colors WHERE active = TRUE ORDER BY name');
    res.json({ success: true, data: colors });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/catalog/sizes
router.get('/sizes', async (req, res) => {
  try {
    const [sizes] = await db.query('SELECT * FROM sizes WHERE active = TRUE ORDER BY display_order');
    res.json({ success: true, data: sizes });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/catalog/temperaments
router.get('/temperaments', async (req, res) => {
  try {
    const [temperaments] = await db.query('SELECT * FROM temperaments WHERE active = TRUE ORDER BY name');
    res.json({ success: true, data: temperaments });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/catalog/conditions
router.get('/conditions', async (req, res) => {
  try {
    const [conditions] = await db.query('SELECT * FROM report_conditions WHERE active = TRUE ORDER BY name');
    res.json({ success: true, data: conditions });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/catalog/urgency-levels
router.get('/urgency-levels', async (req, res) => {
  try {
    const [levels] = await db.query('SELECT * FROM urgency_levels WHERE active = TRUE ORDER BY priority');
    res.json({ success: true, data: levels });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
```

**Registrar en `server/index.js`:**
```javascript
const catalogRoutes = require('./routes/catalog');
app.use('/api/catalog', catalogRoutes);
```

---

## 🎨 PASO 3: Actualizar Frontend (React)

### **1. Crear Hook para Catálogos**

**Archivo: `client/src/hooks/useCatalogs.js`**

```javascript
import { useState, useEffect } from 'react';
import axios from 'axios';

export const useCatalogs = () => {
  const [catalogs, setCatalogs] = useState({
    breeds: [],
    colors: [],
    sizes: [],
    temperaments: [],
    conditions: [],
    urgencyLevels: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCatalogs = async () => {
      try {
        const [breeds, colors, sizes, temperaments, conditions, urgencyLevels] = await Promise.all([
          axios.get('http://localhost:5000/api/catalog/breeds'),
          axios.get('http://localhost:5000/api/catalog/colors'),
          axios.get('http://localhost:5000/api/catalog/sizes'),
          axios.get('http://localhost:5000/api/catalog/temperaments'),
          axios.get('http://localhost:5000/api/catalog/conditions'),
          axios.get('http://localhost:5000/api/catalog/urgency-levels')
        ]);

        setCatalogs({
          breeds: breeds.data.data || [],
          colors: colors.data.data || [],
          sizes: sizes.data.data || [],
          temperaments: temperaments.data.data || [],
          conditions: conditions.data.data || [],
          urgencyLevels: urgencyLevels.data.data || []
        });
      } catch (error) {
        console.error('Error loading catalogs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCatalogs();
  }, []);

  return { catalogs, loading };
};
```

### **2. Usar en MapPageLeaflet**

```javascript
import { useCatalogs } from '../hooks/useCatalogs';

const MapPageLeaflet = () => {
  const { catalogs, loading: catalogsLoading } = useCatalogs();
  
  // Convertir catálogos a objetos para mapeo rápido
  const sizeLabels = catalogs.sizes.reduce((acc, size) => {
    acc[size.code] = size.name;
    return acc;
  }, {});

  const temperamentLabels = catalogs.temperaments.reduce((acc, temp) => {
    acc[temp.code] = temp.name;
    return acc;
  }, {});

  const temperamentColors = catalogs.temperaments.reduce((acc, temp) => {
    acc[temp.code] = temp.color;
    return acc;
  }, {});

  const conditionLabels = catalogs.conditions.reduce((acc, cond) => {
    acc[cond.code] = cond.name;
    return acc;
  }, {});

  const urgencyLabels = catalogs.urgencyLevels.reduce((acc, level) => {
    acc[level.code] = level.name;
    return acc;
  }, {});

  const urgencyColors = catalogs.urgencyLevels.reduce((acc, level) => {
    acc[level.code] = level.color;
    return acc;
  }, {});

  // ... resto del código
};
```

---

## ✅ VERIFICACIÓN

### Checklist de Cambios:

- [ ] Base de datos v3.0 creada correctamente
- [ ] Datos de catálogos insertados
- [ ] Vistas creadas correctamente
- [ ] Backend actualizado con nuevos endpoints
- [ ] Frontend usando `photo_frontal_path` en lugar de `photo_path`
- [ ] Frontend eliminó referencias a `pet_last_name`
- [ ] Frontend muestra `sex` (♂️ o ♀️)
- [ ] Frontend muestra `size` (Pequeño, Mediano, Grande)
- [ ] MapPageLeaflet usa datos de catálogos
- [ ] Formularios actualizados para incluir sexo y tamaño

---

## 🚀 Comandos Rápidos

```bash
# Ejecutar en MySQL
mysql -u root -p < server/database/init_database_v3.sql

# Reiniciar servidor Node.js
cd server
npm run dev

# Reiniciar cliente React
cd client
npm start
```

---

## 📊 Estructura Final de Tablas

```
pets_db (V3.0 Normalizada)
├── Catálogos
│   ├── breeds (razas)
│   ├── colors (colores con hex)
│   ├── sizes (tamaños)
│   ├── temperaments (temperamentos)
│   ├── report_conditions (condiciones)
│   └── urgency_levels (urgencias)
├── Principales
│   ├── adopters (propietarios)
│   ├── pets (mascotas - SIN apellido)
│   └── stray_reports (reportes normalizados)
└── Vistas
    ├── view_pets_complete
    └── view_stray_reports_complete
```

---

## 🔍 Consultas Útiles

```sql
-- Ver todas las mascotas con información completa
SELECT * FROM view_pets_complete;

-- Ver reportes activos con información completa
SELECT * FROM view_stray_reports_complete WHERE status = 'active';

-- Buscar mascotas por raza
SELECT * FROM view_pets_complete WHERE breed_name = 'Mestizo';

-- Estadísticas por tamaño
SELECT size_name, COUNT(*) as total 
FROM view_pets_complete 
GROUP BY size_name;
```
