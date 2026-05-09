const express = require("express");
const app = express();

app.use(express.json());

// importar ruta
const tareasRoutes = require("./routes/tareas.routes");
const authRoutes = require("./routes/auth.routes");
const errorHandler = require("./middleware/error.middleware");

app.use(tareasRoutes);
app.use(authRoutes);
app.use(errorHandler);

// ruta base
app.get("/", (req, res) => {
  res.send("API de TODO funcionando");
});

app.listen(3000, () => {
  console.log("Servidor corriendo en puerto 3000");
});

