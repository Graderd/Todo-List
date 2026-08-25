const express = require("express");
const cors = require("cors");
const app = express();

app.disable("x-powered-by");

const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger");
const db = require("./models/db");
const packageJson = require("./package.json");

const tareasRoutes = require("./routes/tareas.routes");
const authRoutes = require("./routes/auth.routes");
const errorHandler = require("./middleware/error.middleware");
const notFoundHandler = require("./middleware/notFound.middleware");

const { register } = require("./metrics/metrics");
const metricsMiddleware = require("./middleware/metrics.middleware");

const { logError } = require("./utils/logger");

const appVersion =
    process.env.APP_VERSION || packageJson.version;

app.use(cors({
  origin: [
    "http://127.0.0.1:3000",
    "http://localhost:3000",
    "http://127.0.0.1:5500",
    "http://localhost:5500"
  ]
}));

app.use(express.json());
app.use(metricsMiddleware);

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
    service: "todo-api",
    version: appVersion
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
    logError("readiness_check_failed", error);

    return res.status(503).json({
      status: "not_ready",
      service: "todo-api",
      database: "disconnected"
    });
  }
});

// Endpoint para métricas de Prometheus
app.get("/metrics", async (req, res) => {
    try {
        res.set("Content-Type", register.contentType);
        res.send(await register.metrics());
    } catch (error) {
        logError("metrics_retrieval_failed", error);
        res.status(500).send("Error retrieving metrics");
    }
});


app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;