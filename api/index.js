require("dotenv").config();

const app = require("./app");

app.listen(3000, () => {
  console.log("Servidor corriendo en puerto 3000");
});

