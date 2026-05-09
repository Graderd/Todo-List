const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/auth.middleware");

const { getTareas } = require("../controllers/tareas.controller");
const { createTarea } = require("../controllers/tareas.controller");
const { updateTarea } = require("../controllers/tareas.controller");
const { deleteTarea } = require("../controllers/tareas.controller");
const { getTareaById } = require("../controllers/tareas.controller");
const { toggleTarea } = require("../controllers/tareas.controller");

router.get("/tareas", verifyToken, getTareas);
router.post("/tareas", verifyToken, createTarea);
router.put("/tareas/:id", verifyToken, updateTarea);
router.delete("/tareas/:id", verifyToken, deleteTarea);
router.get("/tareas/:id", verifyToken, getTareaById);
router.patch("/tareas/:id/toggle", verifyToken, toggleTarea);


module.exports = router;
