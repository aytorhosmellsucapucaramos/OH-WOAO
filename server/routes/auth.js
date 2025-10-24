/**
 * Auth Routes
 * Rutas de autenticación y gestión de usuarios
 */

const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");
const multer = require("multer");
const router = express.Router();
const { pool } = require("../config/database");
const logger = require("../config/logger");
const { verifyToken } = require("../middleware/auth");
const { authLimiter } = require("../config/security");
const { validate, loginSchema } = require("../middleware/validation");

// Helper para generar token JWT
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET || "your-secret-key", {
    expiresIn: "24h",
  });
};

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Solo se permiten imágenes (jpeg, jpg, png, gif)"));
    }
  },
});

// Register new user (when registering a pet)
router.post("/register", async (req, res) => {
  let connection;

  try {
    connection = await pool.getConnection();
    const {
      // Adopter info
      adopterName,
      adopterLastName,
      dni,
      email,
      password,
      phone,
      department,
      province,
      district,
      address,
    } = req.body;

    // Validate required fields
    if (!email || !password || !dni) {
      return res.status(400).json({
        success: false,
        error: "Email, contraseña y DNI son requeridos",
      });
    }

    // Check if user already exists
    const [existingUsers] = await connection.query(
      "SELECT id FROM adopters WHERE email = ? OR dni = ?",
      [email, dni]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        error: "El email o DNI ya está registrado",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new adopter
    const fullName = `${adopterName} ${adopterLastName}`;
    const [result] = await connection.query(
      `INSERT INTO adopters (full_name, dni, email, password, phone, address, district, province, department) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        fullName,
        dni,
        email,
        hashedPassword,
        phone,
        address,
        district,
        province,
        department,
      ]
    );

    // Generate token
    const token = generateToken({
      id: result.insertId,
      email,
      dni,
    });

    res.json({
      success: true,
      message: "Usuario registrado exitosamente",
      token,
      user: {
        id: result.insertId,
        fullName,
        email,
        dni,
      },
    });
  } catch (error) {
    console.error("❌ Error en registro:", error);
    res.status(500).json({
      success: false,
      error: "Error al registrar usuario",
    });
  } finally {
    if (connection) connection.release();
  }
});

// Login
router.post("/login", authLimiter, validate(loginSchema), async (req, res) => {
  let connection;

  try {
    connection = await pool.getConnection();
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Email y contraseña son requeridos",
      });
    }

    // Find user by email
    const [users] = await connection.query(
      "SELECT id, first_name, last_name, dni, email, password, phone, address, role FROM adopters WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      logger.logAuth("login_failed", email, false, req.ip);
      return res.status(401).json({
        success: false,
        error: "Credenciales inválidas",
      });
    }

    const user = users[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      logger.logAuth("login_failed", email, false, req.ip);
      return res.status(401).json({
        success: false,
        error: "Credenciales inválidas",
      });
    }

    // Get user's pets to check if they have any registered
    const [userPets] = await connection.query(
      "SELECT cui FROM pets WHERE adopter_id = ? ORDER BY created_at DESC LIMIT 1",
      [user.id]
    );

    // Generate token
    const token = generateToken({
      id: user.id,
      email: user.email,
      dni: user.dni,
    });

    const responseData = {
      success: true,
      message: "Inicio de sesión exitoso",
      token,
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        fullName: `${user.first_name} ${user.last_name}`,
        email: user.email,
        dni: user.dni,
        phone: user.phone,
        address: user.address,
        role: user.role || "user", // Incluir rol (default: user)
      },
    };

    // Add CUI if user has pets
    if (userPets.length > 0) {
      responseData.user.cui = userPets[0].cui;
    }

    logger.logAuth("login_success", email, true, req.ip);
    logger.logActivity("login", user.id, {
      email,
      hasPets: userPets.length > 0,
    });

    res.json(responseData);
  } catch (error) {
    console.error("❌ Error en login:", error);
    logger.logError(error, {
      endpoint: "POST /api/auth/login",
      email: req.body?.email,
    });
    res.status(500).json({
      success: false,
      error: "Error en el servidor durante el inicio de sesión",
    });
  } finally {
    if (connection) connection.release();
  }
});

// Get current user
router.get("/me", verifyToken, async (req, res) => {
  let connection;

  try {
    connection = await pool.getConnection();
    const [users] = await connection.query(
      "SELECT id, first_name, last_name, dni, email, phone, address, photo_path FROM adopters WHERE id = ?",
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Usuario no encontrado",
      });
    }

    const user = users[0];
    res.json({
      success: true,
      user: {
        ...user,
        full_name: `${user.first_name} ${user.last_name}`,
      },
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({
      success: false,
      error: "Error al obtener información del usuario",
    });
  } finally {
    connection.release();
  }
});

// Get user's pets
router.get("/my-pets", verifyToken, async (req, res) => {
  let connection;

  try {
    connection = await pool.getConnection();

    // Usar vista para obtener todos los datos con catálogos
    const [pets] = await connection.query(
      `SELECT * FROM view_pets_complete
       WHERE adopter_id = ?
       ORDER BY created_at DESC`,
      [req.user.id]
    );

    res.json({
      success: true,
      pets,
    });
  } catch (error) {
    console.error("❌ Error al obtener mascotas:", error);
    res.status(500).json({
      success: false,
      error: "Error al obtener mascotas del usuario",
    });
  } finally {
    if (connection) connection.release();
  }
});

// Update card printed status
router.put("/pet/:cui/card-printed", verifyToken, async (req, res) => {
  let connection;

  try {
    connection = await pool.getConnection();

    const { cui } = req.params;
    const { printed } = req.body;

    // Verify pet belongs to user
    const [pets] = await connection.query(
      `SELECT p.id FROM pets p 
       JOIN adopters a ON p.adopter_id = a.id 
       WHERE p.cui = ? AND a.id = ?`,
      [cui, req.user.id]
    );

    if (pets.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Mascota no encontrada o no pertenece al usuario",
      });
    }

    // Update card printed status
    await connection.query("UPDATE pets SET card_printed = ? WHERE cui = ?", [
      printed,
      cui,
    ]);

    res.json({
      success: true,
      message: "Estado del carnet actualizado",
    });
  } catch (error) {
    console.error("❌ Error al actualizar estado del carnet:", error);
    res.status(500).json({
      success: false,
      error: "Error al actualizar estado del carnet",
    });
  } finally {
    if (connection) connection.release();
  }
});

// Update user profile
router.put(
  "/profile",
  verifyToken,
  upload.single("profilePhoto"),
  async (req, res) => {
    let connection;

    try {
      connection = await pool.getConnection();

      const { first_name, last_name, phone, address, email } = req.body;

      // Prepare update fields
      let updateFields = [
        "first_name = ?",
        "last_name = ?",
        "phone = ?",
        "address = ?",
      ];
      let updateValues = [first_name, last_name, phone, address];

      // Add email if provided
      if (email) {
        updateFields.push("email = ?");
        updateValues.push(email);
      }

      // Add photo if uploaded
      if (req.file) {
        const photoPath = req.file.filename;
        updateFields.push("photo_path = ?");
        updateValues.push(photoPath);
      }

      // Add user ID at the end
      updateValues.push(req.user.id);

      await connection.query(
        `UPDATE adopters SET ${updateFields.join(", ")} WHERE id = ?`,
        updateValues
      );

      // Get updated user data
      const [updatedUser] = await connection.query(
        "SELECT id, first_name, last_name, email, phone, address, photo_path FROM adopters WHERE id = ?",
        [req.user.id]
      );

      res.json({
        success: true,
        message: "Perfil actualizado exitosamente",
        user: updatedUser[0],
      });
    } catch (error) {
      console.error("❌ Error al actualizar perfil:", error);
      res.status(500).json({
        success: false,
        error: "Error al actualizar perfil",
      });
    } finally {
      if (connection) connection.release();
    }
  }
);

// Update pet information
router.put("/pet/:id", verifyToken, async (req, res) => {
  let connection;

  try {
    connection = await pool.getConnection();

    const { id } = req.params;
    const {
      pet_name,
      sex,
      breed,
      age,
      color,
      size,
      additional_features,
      medical_history,
    } = req.body;

    // Verify pet belongs to user
    const [pets] = await connection.query(
      "SELECT id FROM pets WHERE id = ? AND adopter_id = ?",
      [id, req.user.id]
    );

    if (pets.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Mascota no encontrada",
      });
    }

    // Update usando subconsultas para IDs de catálogos
    await connection.query(
      `UPDATE pets 
       SET pet_name = ?, sex = ?, 
           breed_id = (SELECT id FROM breeds WHERE name = ? LIMIT 1), 
           age = ?, 
           color_id = (SELECT id FROM colors WHERE name = ? LIMIT 1),
           size_id = (SELECT id FROM sizes WHERE code = ? LIMIT 1),
           additional_features = ?, medical_history = ?
       WHERE id = ?`,
      [
        pet_name,
        sex,
        breed,
        age,
        color,
        size,
        additional_features,
        medical_history,
        id,
      ]
    );

    res.json({
      success: true,
      message: "Información de mascota actualizada",
    });
  } catch (error) {
    console.error("❌ Error al actualizar mascota:", error);
    res.status(500).json({
      success: false,
      error: "Error al actualizar mascota",
    });
  } finally {
    if (connection) connection.release();
  }
});

module.exports = router;
