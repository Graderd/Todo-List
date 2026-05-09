const db = require("../models/db");

// OBTENER TAREA (DINAMICA)
const getTareas = (req, res, next) => {
  const userId = req.user.id;
  const { completada } = req.query;

  let query = "SELECT * FROM tareas WHERE user_id = ?";
  let params = [userId];

  if (completada !== undefined) {
    query += " AND completada = ?";
    params.push(completada === "true" ? 1 : 0);
  }

  db.query(query, params, (err, results) => {
    if (err) {
      return next(err);
    }

    res.json({
      success: true,
      data: results
    });
  });
};

//OBTENER TAREA POR ID
const getTareaById = (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  db.query(
    "SELECT * FROM tareas WHERE id = ? AND user_id = ?",
    [id, userId],
    (err, results) => {
      if (err) {
        console.error(err);
        return next(err);
      }

      if (results.length === 0){
	return res.status(404).json({
	  success: false,
	  error: "Tarea no encontrada"
	});
      }

      res.json({
	success: true,
        data: results[0]
      });
    }
  );
};

// CREAR TAREA
const createTarea = (req, res, next) => {
  const { titulo } = req.body;
  const userId = req.user.id;

  //VALIDACION
  if (typeof titulo !== "string" || titulo.trim().length < 3){
    return res.status(400).json({
      success: false,
      error: "El titulo debe tener al menos 3 caracteres"
    });
  }

  const tituloLimpio = titulo.trim();

  db.query(
    "INSERT INTO tareas (titulo, user_id) VALUES (?, ?)",
    [tituloLimpio, userId],
    (err, result) => {
      if (err) {
        console.error(err);
        return next(err);
      }

      res.status(201).json({
	success: true,
        message: "Tarea creada",
	"data" :{
          id: result.insertId,
	  titulo: tituloLimpio,
          user_id: userId
	}
      });
    }
  );
};

// ACTUALIZAR TAREA
const updateTarea = (req, res, next) => {
  const { id } = req.params;
  const { completada } = req.body;
  const userId = req.user.id;

  if(typeof completada !== "boolean"){
    return res.status(400).json({
      success: false,
      error:"Completada debe ser true o false"
    });
  }

  db.query(
    "UPDATE tareas SET completada = ? WHERE id = ? AND user_id = ?",
    [completada, id, userId],
    (err, result) => {
      if(err) {
        console.error(err);
        return next(err);
       }

      if (result.affectedRows === 0){
        return res.status(404).json({
	  success: false,
          error: "Tarea no encontrada"
        });
      }

      res.json({
	success: true,
        message: "Tarea Actualizada"
      });
    }
  );
};

// BORRAR TAREA
const deleteTarea = (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id

  db.query(
    "DELETE FROM tareas WHERE id = ? AND user_id = ?",
    [id, userId],
    (err, result) => {
      if(err) {
	return next(err);
       }

      if (result.affectedRows === 0) {
        return res.status(404).json({
	  success: false,
	  error: "Tarea no encontrada"
        });
      }

      res.json({
	success: true,
        message: "Tarea eliminada Correctamente"
      });
    }
  );
};

// TOGGLE
const toggleTarea = (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  db.query(
    "UPDATE tareas SET completada = NOT completada WHERE id = ? AND user_id = ?",
    [id, userId],
    (err, result) => {
      if (err ) {
	return next(err);
    }

      if (result.affectedRows === 0){
        return res.status(404).json({
	  success: false,
  	  error: "Tarea no encontrada"
        });
      }

      res.json({
	success: true,
	data: {
          message: "Estado de tarea actualizado"
	}
      });
    }
  );
};


module.exports = {
  getTareas,
  createTarea,
  updateTarea,
  deleteTarea,
  getTareaById,
  toggleTarea
};


