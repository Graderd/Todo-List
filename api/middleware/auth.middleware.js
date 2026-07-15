const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const authHeader = req.get("authorization");

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      error: "Token requerido"
    });
  }

  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      error: "Formato de autorización inválido"
    });
  }

  const token = authHeader.slice(7).trim();

  if (!token) {
    return res.status(401).json({
      success: false,
      error: "Token requerido"
    });
  }

  if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET no está configurado");

    return res.status(500).json({
      success: false,
      error: "Error interno del servidor"
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    return next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        error: "Token expirado"
      });
    }

    return res.status(401).json({
      success: false,
      error: "Token inválido"
    });
  }
};

module.exports = verifyToken;
