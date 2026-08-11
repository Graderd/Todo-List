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

test("GET /health responde que la API está saludable", async () => {
  const response = await request(app).get("/health");

  assert.equal(response.status, 200);

  assert.deepEqual(response.body, {
    status: "ok",
    service: "todo-api",
    version: "1.1.0"
  });
});

test("GET a una ruta inexistente responde 404 en JSON", async () => {
  const response = await request(app).get("/esta-ruta-no-existe");

  assert.equal(response.status, 404);
  assert.equal(response.body.success, false);
  assert.equal(response.body.error, "Ruta no encontrada");
  assert.match(response.headers["content-type"], /json/);
});

test("GET /metrics responde con métricas de Prometheus", async () => {
  const response = await request(app).get("/metrics");

  assert.equal(response.status, 200);
  assert.match(response.headers["content-type"], /text\/plain/);
  assert.match(response.text, /# HELP todo_api_http_requests_total Total number of HTTP requests/);
  assert.match(response.text, /# TYPE todo_api_http_requests_total counter/);
  assert.match(response.text, /# HELP todo_api_http_request_duration_seconds HTTP request duration in seconds/);
  assert.match(response.text, /# TYPE todo_api_http_request_duration_seconds histogram/);
});
