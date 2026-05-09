const db = require("../../models/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
  const { email, password } = req.body;

  //validacion basica
  if (!email || !password) {
    return res.status(400).json({
    });
  }

  try {
    // encriptar contrasena
    const hashedPassword = await bcrypt.hash(password, 10);

    db.query(
      "INSERT INTO usuarios (email, password) VALUES (?, ?)",
      [email, hashedPassword],
      (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
	    error: "Error registrando usuario"
          });
        }

	res.status(201).json({
	  message: "Usuario creado"
	});
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error en el servidor"
    });
   }
};

const login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      error: "Email y password son obligarios"
    });
  }

  db.query(
    "SELECT * FROM usuarios WHERE email = ?",
    [email],
    async (err, results) => {

      if (err) {
        console.error(err);
	return res.status(500).json({
	  error: "Error en el servidor"
        });
      }

      if(results.length === 0) {
	return res.status(401).json({
	  error: "Credenciales invalidas"
	});
      }

      const user = results[0];
      const match = await bcrypt.compare(password, user.password);

      if(!match) {
	return res.status(401).json({
	  error: "Credenciales invalidas"
	});
      }

      //generar token
      const token = jwt.sign(
        { id: user.id, email: user.email },
	"secreto_super_seguro",
	{ expiresIn: "1h" }
      );

      res.json({
	message: "Login exitoso",
	token
      });
    }
  );
};

module.exports = {
  register,
  login
};
