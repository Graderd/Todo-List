const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/auth.middleware");

const { getTareas } = require("../controllers/tareas.controller");
const { createTarea } = require("../controllers/tareas.controller");
const { updateTarea } = require("../controllers/tareas.controller");
const { deleteTarea } = require("../controllers/tareas.controller");
const { getTareaById } = require("../controllers/tareas.controller");
const { toggleTarea } = require("../controllers/tareas.controller");

/**
 * @swagger
 * /api/tareas:
 *   get:
 *     summary: Obtener tareas del usuario
 *     tags:
 *       - Tareas
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de tareas
 *       401:
 *         description: Token faltante o inválido
 */
router.get("/tareas", verifyToken, getTareas);
/**
 * @swagger
 * /api/tareas:
 *   post:
 *     summary: Crear una nueva tarea
 *     tags:
 *       - Tareas
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - titulo
 *             properties:
 *               titulo:
 *                 type: string
 *                 example: Aprender Swagger
 *     responses:
 *       201:
 *         description: Tarea creada correctamente
 *       400:
 *         description: El título es inválido
 *       401:
 *         description: No autorizado
 */
router.post("/tareas", verifyToken, createTarea);
/**
 * @swagger
 * /api/tareas/{id}:
 *   put:
 *     summary: Actualizar una tarea
 *     tags:
 *       - Tareas
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la tarea a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - completada
 *             properties:
 *               completada:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Tarea actualizada correctamente
 *       400:
 *         description: El campo completada debe ser true o false
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Tarea no encontrada
 */
router.put("/tareas/:id", verifyToken, updateTarea);
/**
 * @swagger
 * /api/tareas/{id}:
 *   delete:
 *     summary: Eliminar una tarea
 *     tags:
 *       - Tareas
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la tarea a eliminar
 *     responses:
 *       200:
 *         description: Tarea eliminada correctamente
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Tarea no encontrada
 */
router.delete("/tareas/:id", verifyToken, deleteTarea);
/**
 * @swagger
 * /api/tareas/{id}:
 *   get:
 *     summary: Obtener una tarea por ID
 *     tags:
 *       - Tareas
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la tarea
 *     responses:
 *       200:
 *         description: Tarea encontrada
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Tarea no encontrada
 */
router.get("/tareas/:id", verifyToken, getTareaById);
/**
 * @swagger
 * /api/tareas/{id}/toggle:
 *   patch:
 *     summary: Cambiar el estado de una tarea
 *     tags:
 *       - Tareas
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la tarea
 *     responses:
 *       200:
 *         description: Estado de la tarea actualizado
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Tarea no encontrada
 */
router.patch("/tareas/:id/toggle", verifyToken, toggleTarea);


module.exports = router;
