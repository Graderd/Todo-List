require("dotenv").config();

const express = require("express");
const app = express();

app.use(express.json());

// importar ruta
const tareasRoutes = require("./routes/tareas.routes");
const authRoutes = require("./routes/auth.routes");
const errorHandler = require("./middleware/error.middleware");

app.use("/api", tareasRoutes);
app.use("/auth", authRoutes);

// ruta base
app.get("/", (req, res) => {
  res.send("API de TODO funcionando");
});

app.use(errorHandler);

app.listen(3000, () => {
  console.log("Servidor corriendo en puerto 3000");
});

