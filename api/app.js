const express = require("express");
const app = express();
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger");
const db = require("./models/db");

app.use(express.json());

// importar ruta
const tareasRoutes = require("./routes/tareas.routes");
const authRoutes = require("./routes/auth.routes");
const errorHandler = require("./middleware/error.middleware");

app.use("/api", tareasRoutes);
app.use("/auth", authRoutes);

// ruta swagger
app.use(
  "/docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec)
);

// ruta base
app.get("/", (req, res) => {
  res.send("API de TODO funcionando");
});

// Ruta utilizada para comprobar la salud de la API
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "todo-api"
  });
});

// Comprueba que la API puede comunicarse con MySQL
app.get("/ready", async (req, res) => {
  try {
    await db.promise().query("SELECT 1");

    return res.status(200).json({
      status: "ready",
      service: "todo-api",
      database: "connected"
    });
  } catch (error) {
    console.error("Readiness check failed:", error.message);

    return res.status(503).json({
      status: "not_ready",
      service: "todo-api",
      database: "disconnected"
    });
  }
});

app.use(errorHandler);

module.exports = app;