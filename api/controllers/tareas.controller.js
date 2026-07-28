const db = require("../models/db");

const obtenerIdTareaValido = (valor) => {
  const id = Number(valor);

  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }

  return id;
};

// OBTENER TAREA (DINAMICA)
const getTareas = (req, res, next) => {
  const userId = req.user.id;
  const { completada } = req.query;

  let query = "SELECT * FROM tareas WHERE user_id = ?";
  const params = [userId];

  if (completada !== undefined) {
    if (completada !== "true" && completada !== "false") {
      return res.status(400).json({
        success: false,
        error: "El filtro completada debe ser true o false"
      });
    }

    query += " AND completada = ?";
    params.push(completada === "true" ? 1 : 0);
  }

  db.query(query, params, (err, results) => {
    if (err) {
      return next(err);
    }

    return res.json({
      success: true,
      data: results
    });
  });
};

//OBTENER TAREA POR ID
const getTareaById = (req, res, next) => {
  const tareaId = obtenerIdTareaValido(req.params.id);
  const userId = req.user.id;

  if (tareaId === null) {
    return res.status(400).json({
      success: false,
      error: "El ID de la tarea no es válido"
    });
  }

  db.query(
    "SELECT * FROM tareas WHERE id = ? AND user_id = ?",
    [tareaId, userId],
    (err, results) => {
      if (err) {
        console.error(err);
        return next(err);
      }

      if (results.length === 0) {
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
  if (typeof titulo !== "string") {
    return res.status(400).json({
      success: false,
      error: "El titulo debe ser texto"
    });
  }

  const tituloLimpio = titulo.trim();

  if (tituloLimpio.length < 3 || tituloLimpio.length > 255) {
    return res.status(400).json({
      success: false,
      error: "El titulo debe tener entre 3 y 255 caracteres"
    });
  }

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
  const tareaId = obtenerIdTareaValido(req.params.id);
  const { titulo, completada } = req.body;
  const userId = req.user.id;

  if (tareaId === null) {
    return res.status(400).json({
      success: false,
      error: "El ID de la tarea no es válido"
    });
  }

  const tituloFueEnviado = titulo !== undefined;
  const completadaFueEnviada = completada !== undefined;

  // Debe enviarse al menos un campo para actualizar
  if (!tituloFueEnviado && !completadaFueEnviada) {
    return res.status(400).json({
      success: false,
      error: "Debes enviar titulo o completada"
    });
  }

  const campos = [];
  const valores = [];

  // Validar y preparar el título
  if (tituloFueEnviado) {
    if (typeof titulo !== "string") {
      return res.status(400).json({
        success: false,
        error: "El titulo debe ser texto"
      });
    }

    const tituloLimpio = titulo.trim();

    if (tituloLimpio.length < 3 || tituloLimpio.length > 255) {
      return res.status(400).json({
        success: false,
        error: "El titulo debe tener entre 3 y 255 caracteres"
      });
    }

    campos.push("titulo = ?");
    valores.push(tituloLimpio);
  }

  // Validar y preparar el estado
  if (completadaFueEnviada) {
    if (typeof completada !== "boolean") {
      return res.status(400).json({
        success: false,
        error: "Completada debe ser true o false"
      });
    }

    campos.push("completada = ?");
    valores.push(completada);
  }

  valores.push(tareaId, userId);

  const query = `
    UPDATE tareas
    SET ${campos.join(", ")}
    WHERE id = ? AND user_id = ?
  `;

  db.query(query, valores, (err, result) => {
    if (err) {
      console.error(err);
      return next(err);
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: "Tarea no encontrada"
      });
    }

    return res.json({
      success: true,
      message: "Tarea actualizada"
    });
  });
};

// BORRAR TAREA
const deleteTarea = (req, res, next) => {
  const tareaId = obtenerIdTareaValido(req.params.id);
  const userId = req.user.id;

  if (tareaId === null) {
    return res.status(400).json({
      success: false,
      error: "El ID de la tarea no es válido"
    });
  }

  db.query(
    "DELETE FROM tareas WHERE id = ? AND user_id = ?",
    [tareaId, userId],
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
  const tareaId = obtenerIdTareaValido(req.params.id);
  const userId = req.user.id;

  if (tareaId === null) {
    return res.status(400).json({
      success: false,
      error: "El ID de la tarea no es válido"
    });
  }

  db.query(
    "UPDATE tareas SET completada = NOT completada WHERE id = ? AND user_id = ?",
    [tareaId, userId],
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
