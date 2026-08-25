const { test, after } = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");

const app = require("../app");
const db = require("../models/db");

const email = `integracion-${Date.now()}-${process.pid}@test.com`;
const password = "ClaveSegura123!";
const nombre = "Usuario Integracion";

test("GET /ready confirma la conexión con MySQL", async () => {
  const response = await request(app).get("/ready");

  assert.equal(response.status, 200);

  assert.deepEqual(response.body, {
    status: "ready",
    service: "todo-api",
    database: "connected"
  });
});

test("registro sin nombre responde 400", async () => {
  const response = await request(app)
    .post("/auth/register")
    .send({
      email: `sin-nombre-${Date.now()}@test.com`,
      password
    });

  assert.equal(response.status, 400);
  assert.equal(response.body.success, false);
});

test("registro con nombre demasiado corto responde 400", async () => {
  const response = await request(app)
    .post("/auth/register")
    .send({
      nombre: "AB",
      email: `nombre-corto-${Date.now()}@test.com`,
      password
    });

  assert.equal(response.status, 400);
  assert.equal(response.body.success, false);
});

test("registro y login funcionan con la base de datos temporal", async () => {
  const registerResponse = await request(app)
    .post("/auth/register")
    .send({
      nombre,
      email,
      password
    });

  assert.equal(registerResponse.status, 201);
  assert.equal(registerResponse.body.success, true);
  assert.equal(registerResponse.body.data.email, email);
  assert.equal(registerResponse.body.data.nombre, nombre);

  const duplicateResponse = await request(app)
    .post("/auth/register")
    .send({
      nombre,
      email,
      password
    });

  assert.equal(duplicateResponse.status, 409);
  assert.equal(duplicateResponse.body.success, false);

  const loginResponse = await request(app)
    .post("/auth/login")
    .send({
      email,
      password
    });

  assert.equal(loginResponse.status, 200);
  assert.equal(loginResponse.body.success, true);
  assert.equal(typeof loginResponse.body.token, "string");
  assert.ok(loginResponse.body.token.length > 20);
  assert.equal(loginResponse.body.data.nombre, nombre);
  assert.equal(loginResponse.body.data.email, email);

  const invalidLoginResponse = await request(app)
    .post("/auth/login")
    .send({
      email,
      password: "ClaveIncorrecta123!"
    });

  assert.equal(invalidLoginResponse.status, 401);
  assert.equal(invalidLoginResponse.body.success, false);
});

after(async () => {
  await db
    .promise()
    .query("DELETE FROM usuarios WHERE email = ?", [email]);

  await db.promise().end();
});
