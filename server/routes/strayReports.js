const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const sqlite3 = require("sqlite3").verbose();
const { v4: uuidv4 } = require("uuid");
const router = express.Router();

// Database connection
const db = new sqlite3.Database("./pets.db");

// Configuración de multer para subida de imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../uploads/stray-reports");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "stray-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB límite
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Solo se permiten imágenes (JPEG, JPG, PNG, GIF, WebP)"));
    }
  },
});

// Funciones de base de datos
const insertStrayReport = (reportData, callback) => {
  const sql = `INSERT INTO stray_reports (
    report_id, reporter_cui, reporter_name, reporter_phone, reporter_email,
    latitude, longitude, address, zone, breed, size, colors, temperament,
    condition_type, gender, estimated_age, health_status, urgency_level,
    status, description, has_collar, is_injured, needs_rescue, photo_path
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  db.run(
    sql,
    [
      reportData.reportId,
      reportData.reporterCui,
      reportData.reporterName,
      reportData.reporterPhone,
      reportData.reporterEmail,
      reportData.latitude,
      reportData.longitude,
      reportData.address,
      reportData.zone,
      reportData.breed,
      reportData.size,
      reportData.colors,
      reportData.temperament,
      reportData.condition,
      reportData.gender,
      reportData.estimatedAge,
      reportData.healthStatus,
      reportData.urgency,
      reportData.status,
      reportData.description,
      reportData.hasCollar,
      reportData.isInjured,
      reportData.needsRescue,
      reportData.photoPath,
    ],
    callback
  );
};

const getAllStrayReports = (filters, callback) => {
  let sql = `SELECT * FROM stray_reports WHERE 1=1`;
  const params = [];

  if (filters.urgency) {
    sql += ` AND urgency_level = ?`;
    params.push(filters.urgency);
  }

  if (filters.condition) {
    sql += ` AND condition_type = ?`;
    params.push(filters.condition);
  }

  if (filters.size) {
    sql += ` AND size = ?`;
    params.push(filters.size);
  }

  if (filters.temperament) {
    sql += ` AND temperament = ?`;
    params.push(filters.temperament);
  }

  if (filters.recent) {
    sql += ` AND report_date >= datetime('now', '-24 hours')`;
  }

  sql += ` ORDER BY report_date DESC`;

  db.all(sql, params, callback);
};

const getStrayReportById = (reportId, callback) => {
  const sql = `SELECT * FROM stray_reports WHERE report_id = ?`;
  db.get(sql, [reportId], callback);
};

const updateStrayReportStatus = (
  reportId,
  newStatus,
  updatedBy,
  reason,
  callback
) => {
  const updateSql = `UPDATE stray_reports SET status = ?, last_updated = CURRENT_TIMESTAMP WHERE report_id = ?`;
  const historySql = `INSERT INTO status_updates (report_id, old_status, new_status, updated_by, update_reason) 
                     SELECT report_id, status, ?, ?, ? FROM stray_reports WHERE report_id = ?`;

  db.serialize(() => {
    db.run(updateSql, [newStatus, reportId]);
    db.run(historySql, [newStatus, updatedBy, reason, reportId], callback);
  });
};

// GET /api/stray-reports - Obtener todos los reportes con filtros
router.get("/", (req, res) => {
  const { urgency, condition, size, temperament, recent, lat, lng, radius } =
    req.query;

  const filters = { urgency, condition, size, temperament, recent };

  getAllStrayReports(filters, (err, reports) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Error al obtener reportes",
        error: err.message,
      });
    }

    let filteredReports = reports;

    // Filtro por ubicación (radio en km) - se aplica después de la consulta SQL
    if (lat && lng && radius) {
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);
      const maxDistance = parseFloat(radius);

      filteredReports = reports.filter((report) => {
        const distance = calculateDistance(
          userLat,
          userLng,
          report.latitude,
          report.longitude
        );
        return distance <= maxDistance;
      });
    }

    // Parsear colors JSON
    filteredReports = filteredReports.map((report) => ({
      ...report,
      colors: report.colors ? JSON.parse(report.colors) : [],
    }));

    res.json({
      success: true,
      data: filteredReports,
      total: filteredReports.length,
    });
  });
});

// GET - Obtener reporte por ID
router.get("/:id", (req, res) => {
  const { id } = req.params;

  getStrayReportById(id, (err, report) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Error al obtener reporte",
        error: err.message,
      });
    }

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Reporte no encontrado",
      });
    }

    // Parsear colors JSON
    report.colors = report.colors ? JSON.parse(report.colors) : [];

    res.json({
      success: true,
      data: report,
    });
  });
});

// POST - Crear nuevo reporte
router.post("/", upload.single("photo"), async (req, res) => {
  try {
    const {
      reporterCui,
      reporterName,
      reporterPhone,
      reporterEmail,
      latitude,
      longitude,
      address,
      zone,
      breed,
      size,
      colors,
      temperament,
      condition,
      gender,
      estimatedAge,
      healthStatus,
      urgency,
      description,
      hasCollar,
      isInjured,
      needsRescue,
    } = req.body;

    // Validaciones básicas
    if (!reporterName || !reporterPhone || !latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: "Faltan campos obligatorios",
      });
    }

    // Generar ID único para el reporte
    const reportId = `SR-${new Date().getFullYear()}-${uuidv4()
      .substring(0, 8)
      .toUpperCase()}`;

    // Verificar que el CUI existe en la base de datos de mascotas
    if (!reporterCui || reporterCui === "GUEST") {
      return res.status(400).json({
        success: false,
        message: "CUI del reportante es requerido",
      });
    }

    // Verificar CUI en la base de datos
    const cuiCheck = await new Promise((resolve, reject) => {
      db.get(
        "SELECT cui FROM pets WHERE cui = ?",
        [reporterCui],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (!cuiCheck) {
      return res.status(400).json({
        success: false,
        message: "CUI no válido o no registrado en el sistema",
      });
    }

    const reportData = {
      reportId,
      reporterCui,
      reporterName,
      reporterPhone,
      reporterEmail: reporterEmail || "",
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      address: address || "",
      zone: zone || "",
      breed: breed || "Mestizo",
      size: size || "medium",
      colors: colors || "[]",
      temperament: temperament || "friendly",
      condition: condition || "stray",
      gender: gender || "unknown",
      estimatedAge: estimatedAge || "",
      healthStatus: healthStatus || "",
      urgency: urgency || "normal",
      status: "active",
      description: description || "",
      hasCollar: hasCollar === "true" ? 1 : 0,
      isInjured: isInjured === "true" ? 1 : 0,
      needsRescue: needsRescue !== "false" ? 1 : 0,
      photoPath: req.file ? `/api/uploads/${req.file.filename}` : null,
    };

    insertStrayReport(reportData, function (err) {
      if (err) {
        console.error("Error inserting stray report:", err);
        return res.status(500).json({
          success: false,
          message: "Error al crear reporte",
          error: err.message,
        });
      }

      res.status(201).json({
        success: true,
        message: "Reporte creado exitosamente",
        data: { ...reportData, id: this.lastID },
      });
    });
  } catch (error) {
    console.error("Error creating stray report:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: error.message,
    });
  }
});

// Función auxiliar para calcular distancia entre dos puntos
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Radio de la Tierra en km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

module.exports = router;
