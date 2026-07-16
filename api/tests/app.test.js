const test = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");

const app = require("../app");

test("GET / responde que la API está funcionando", async () => {
  const response = await request(app).get("/");

  assert.equal(response.status, 200);
  assert.equal(response.text, "API de TODO funcionando");
});

test("GET /api/tareas sin token responde 401", async () => {
  const response = await request(app).get("/api/tareas");

  assert.equal(response.status, 401);
  assert.equal(response.body.success, false);
  assert.equal(typeof response.body.error, "string");
});

test("GET /api/tareas con token falso responde 401", async () => {
  const response = await request(app)
    .get("/api/tareas")
    .set("Authorization", "Bearer token-falso");

  assert.equal(response.status, 401);
  assert.equal(response.body.success, false);
  assert.equal(typeof response.body.error, "string");
});