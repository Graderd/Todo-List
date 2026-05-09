const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  // no hay token
  if (!authHeader) {
    return res.status(401).json({
      error: "Token requerido"
    });
  }

  // formato: Bearer TOKEN
  const token = authHeader.split(" ")[1];

  try {
   const decoded = jwt.verify(token, "secreto_super_seguro");

  //guardamos ingo en usuario
  req.user = decoded;

  next();
  } catch(error) {
    return res.status(403).json({
      error: "Token invalido"
    });
  }
};

module.exports = verifyToken;
