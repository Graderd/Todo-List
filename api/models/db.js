const mysql = require("mysql2");

const db = mysql.createPool({
  host: "db",
  user: "user",
  password: "user123",
  database: "todoappdb",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = db;
