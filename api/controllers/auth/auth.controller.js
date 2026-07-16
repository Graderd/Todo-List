const db = require("../../models/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const normalizeEmail = (value) => {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().toLowerCase();
};

const register = async (req, res, next) => {
  const email = normalizeEmail(req.body?.email);
  const password =
    typeof req.body?.password === "string" ? req.body.password : "";

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: "Email y contraseña son obligatorios"
    });
  }

  if (!EMAIL_REGEX.test(email) || email.length > 255) {
    return res.status(400).json({
      success: false,
      error: "El correo electrónico no es válido"
    });
  }

  if (password.length < 8 || password.length > 72) {
    return res.status(400).json({
      success: false,
      error: "La contraseña debe tener entre 8 y 72 caracteres"
    });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.promise().query(
      "INSERT INTO usuarios (email, password) VALUES (?, ?)",
      [email, hashedPassword]
    );

    return res.status(201).json({
      success: true,
      message: "Usuario creado",
      data: {
        id: result.insertId,
        email
      }
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        error: "El correo ya está registrado"
      });
    }

    return next(error);
  }
};

const login = async (req, res, next) => {
  const email = normalizeEmail(req.body?.email);
  const password =
    typeof req.body?.password === "string" ? req.body.password : "";

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: "Email y contraseña son obligatorios"
    });
  }

  try {
    const [results] = await db.promise().query(
      `
        SELECT id, email, password
        FROM usuarios
        WHERE email = ?
        LIMIT 1
      `,
      [email]
    );

    if (results.length === 0) {
      return res.status(401).json({
        success: false,
        error: "Credenciales inválidas"
      });
    }

    const user = results[0];
    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        error: "Credenciales inválidas"
      });
    }

    if (!process.env.JWT_SECRET) {
      const error = new Error("JWT_SECRET no está configurado");
      error.status = 500;
      throw error;
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h"
      }
    );

    return res.status(200).json({
      success: true,
      message: "Login exitoso",
      token
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  register,
  login
};