const { test, after } = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");

const app = require("../app");
const db = require("../models/db");

const email = `integracion-${Date.now()}-${process.pid}@test.com`;
const password = "ClaveSegura123!";

test("GET /ready confirma la conexión con MySQL", async () => {
  const response = await request(app).get("/ready");

  assert.equal(response.status, 200);

  assert.deepEqual(response.body, {
    status: "ready",
    service: "todo-api",
    database: "connected"
  });
});

test("registro y login funcionan con la base de datos temporal", async () => {
  const registerResponse = await request(app)
    .post("/auth/register")
    .send({
      email,
      password
    });

  assert.equal(registerResponse.status, 201);
  assert.equal(registerResponse.body.success, true);
  assert.equal(registerResponse.body.data.email, email);

  const duplicateResponse = await request(app)
    .post("/auth/register")
    .send({
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
