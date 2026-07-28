const { test, after } = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");

const app = require("../app");
const db = require("../models/db");

const uniqueId = `${Date.now()}-${process.pid}`;

const userAEmail = `usuario-a-${uniqueId}@test.com`;
const userBEmail = `usuario-b-${uniqueId}@test.com`;
const password = "ClaveSegura123!";

async function registerAndLogin(email) {
  const registerResponse = await request(app)
    .post("/auth/register")
    .send({
      email,
      password
    });

  assert.equal(registerResponse.status, 201);
  assert.equal(registerResponse.body.success, true);

  const loginResponse = await request(app)
    .post("/auth/login")
    .send({
      email,
      password
    });

  assert.equal(loginResponse.status, 200);
  assert.equal(loginResponse.body.success, true);
  assert.equal(typeof loginResponse.body.token, "string");

  return {
    id: registerResponse.body.data.id,
    token: loginResponse.body.token
  };
}

test("CRUD de tareas mantiene el aislamiento entre usuarios", async (t) => {
  const userA = await registerAndLogin(userAEmail);
  const userB = await registerAndLogin(userBEmail);

  let tareaId;

    await t.test("Crear tarea con título corto responde 400", async () => {
    const response = await request(app)
      .post("/api/tareas")
      .set("Authorization", `Bearer ${userA.token}`)
      .send({
        titulo: "ab"
      });

    assert.equal(response.status, 400);
    assert.equal(response.body.success, false);
  });

  await t.test("Crear tarea con título demasiado largo responde 400", async () => {
    const response = await request(app)
      .post("/api/tareas")
      .set("Authorization", `Bearer ${userA.token}`)
      .send({
        titulo: "a".repeat(256)
      });

    assert.equal(response.status, 400);
    assert.equal(response.body.success, false);
  });

  await t.test("Crear tarea con título no textual responde 400", async () => {
    const response = await request(app)
      .post("/api/tareas")
      .set("Authorization", `Bearer ${userA.token}`)
      .send({
        titulo: 123
      });

    assert.equal(response.status, 400);
    assert.equal(response.body.success, false);
    assert.equal(response.body.error, "El titulo debe ser texto");
  });

  await t.test("Usuario A puede crear una tarea", async () => {
    const response = await request(app)
      .post("/api/tareas")
      .set("Authorization", `Bearer ${userA.token}`)
      .send({
        titulo: "Tarea privada del usuario A"
      });

    assert.equal(response.status, 201);
    assert.equal(response.body.success, true);
    assert.equal(
      response.body.data.titulo,
      "Tarea privada del usuario A"
    );
    assert.equal(response.body.data.user_id, userA.id);

    tareaId = response.body.data.id;
    assert.equal(typeof tareaId, "number");
  });

  await t.test("Usuario A puede ver su tarea en el listado", async () => {
    const response = await request(app)
      .get("/api/tareas")
      .set("Authorization", `Bearer ${userA.token}`);

    assert.equal(response.status, 200);
    assert.equal(response.body.success, true);
    assert.equal(Array.isArray(response.body.data), true);

    const tareaEncontrada = response.body.data.some(
      (tarea) => tarea.id === tareaId
    );

    assert.equal(tareaEncontrada, true);
  });

  await t.test("Usuario A puede consultar su tarea por ID", async () => {
    const response = await request(app)
      .get(`/api/tareas/${tareaId}`)
      .set("Authorization", `Bearer ${userA.token}`);

    assert.equal(response.status, 200);
    assert.equal(response.body.success, true);
    assert.equal(response.body.data.id, tareaId);
    assert.equal(response.body.data.user_id, userA.id);
  });

    await t.test("Usuario A puede actualizar solamente el título", async () => {
    const updateResponse = await request(app)
      .put(`/api/tareas/${tareaId}`)
      .set("Authorization", `Bearer ${userA.token}`)
      .send({
        titulo: "Título actualizado por el usuario A"
      });

    assert.equal(updateResponse.status, 200);
    assert.equal(updateResponse.body.success, true);

    const getResponse = await request(app)
      .get(`/api/tareas/${tareaId}`)
      .set("Authorization", `Bearer ${userA.token}`);

    assert.equal(getResponse.status, 200);
    assert.equal(
      getResponse.body.data.titulo,
      "Título actualizado por el usuario A"
    );
  });

    await t.test("Usuario A puede actualizar título y estado juntos", async () => {
    const updateResponse = await request(app)
      .put(`/api/tareas/${tareaId}`)
      .set("Authorization", `Bearer ${userA.token}`)
      .send({
        titulo: "Tarea actualizada completamente",
        completada: false
      });

    assert.equal(updateResponse.status, 200);
    assert.equal(updateResponse.body.success, true);

    const getResponse = await request(app)
      .get(`/api/tareas/${tareaId}`)
      .set("Authorization", `Bearer ${userA.token}`);

    assert.equal(getResponse.status, 200);
    assert.equal(
      getResponse.body.data.titulo,
      "Tarea actualizada completamente"
    );
    assert.equal(Number(getResponse.body.data.completada), 0);
  });

    await t.test("Actualizar sin campos responde 400", async () => {
    const response = await request(app)
      .put(`/api/tareas/${tareaId}`)
      .set("Authorization", `Bearer ${userA.token}`)
      .send({});

    assert.equal(response.status, 400);
    assert.equal(response.body.success, false);
    assert.equal(
      response.body.error,
      "Debes enviar titulo o completada"
    );
  });

    await t.test("Actualizar con título corto responde 400", async () => {
    const response = await request(app)
      .put(`/api/tareas/${tareaId}`)
      .set("Authorization", `Bearer ${userA.token}`)
      .send({
        titulo: "ab"
      });

    assert.equal(response.status, 400);
    assert.equal(response.body.success, false);
  });

    await t.test("Actualizar con título demasiado largo responde 400", async () => {
    const response = await request(app)
      .put(`/api/tareas/${tareaId}`)
      .set("Authorization", `Bearer ${userA.token}`)
      .send({
        titulo: "a".repeat(256)
      });

    assert.equal(response.status, 400);
    assert.equal(response.body.success, false);
  });

    await t.test("Actualizar con título no textual responde 400", async () => {
    const response = await request(app)
      .put(`/api/tareas/${tareaId}`)
      .set("Authorization", `Bearer ${userA.token}`)
      .send({
        titulo: 123
      });

    assert.equal(response.status, 400);
    assert.equal(response.body.success, false);
    assert.equal(response.body.error, "El titulo debe ser texto");
  });

    await t.test("Actualizar con completada no booleana responde 400", async () => {
    const response = await request(app)
      .put(`/api/tareas/${tareaId}`)
      .set("Authorization", `Bearer ${userA.token}`)
      .send({
        completada: "true"
      });

    assert.equal(response.status, 400);
    assert.equal(response.body.success, false);
    assert.equal(
      response.body.error,
      "Completada debe ser true o false"
    );
  });

    await t.test("Las operaciones rechazan IDs inválidos", async () => {
    const getResponse = await request(app)
      .get("/api/tareas/abc")
      .set("Authorization", `Bearer ${userA.token}`);

    assert.equal(getResponse.status, 400);
    assert.equal(
      getResponse.body.error,
      "El ID de la tarea no es válido"
    );

    const updateResponse = await request(app)
      .put("/api/tareas/0")
      .set("Authorization", `Bearer ${userA.token}`)
      .send({
        completada: true
      });

    assert.equal(updateResponse.status, 400);

    const toggleResponse = await request(app)
      .patch("/api/tareas/2.5/toggle")
      .set("Authorization", `Bearer ${userA.token}`);

    assert.equal(toggleResponse.status, 400);

    const deleteResponse = await request(app)
      .delete("/api/tareas/-1")
      .set("Authorization", `Bearer ${userA.token}`);

    assert.equal(deleteResponse.status, 400);
  });

  await t.test("Usuario A puede marcar su tarea como completada", async () => {
    const updateResponse = await request(app)
      .put(`/api/tareas/${tareaId}`)
      .set("Authorization", `Bearer ${userA.token}`)
      .send({
        completada: true
      });

    assert.equal(updateResponse.status, 200);
    assert.equal(updateResponse.body.success, true);

    const getResponse = await request(app)
      .get(`/api/tareas/${tareaId}`)
      .set("Authorization", `Bearer ${userA.token}`);

    assert.equal(getResponse.status, 200);
    assert.equal(Number(getResponse.body.data.completada), 1);
  });

  await t.test("Usuario A puede alternar el estado de su tarea", async () => {
    const toggleResponse = await request(app)
      .patch(`/api/tareas/${tareaId}/toggle`)
      .set("Authorization", `Bearer ${userA.token}`);

    assert.equal(toggleResponse.status, 200);
    assert.equal(toggleResponse.body.success, true);

    const getResponse = await request(app)
      .get(`/api/tareas/${tareaId}`)
      .set("Authorization", `Bearer ${userA.token}`);

    assert.equal(getResponse.status, 200);
    assert.equal(Number(getResponse.body.data.completada), 0);
  });

  await t.test("Usuario B no ve la tarea de A en su listado", async () => {
    const response = await request(app)
      .get("/api/tareas")
      .set("Authorization", `Bearer ${userB.token}`);

    assert.equal(response.status, 200);
    assert.equal(response.body.success, true);

    const tareaAjenaVisible = response.body.data.some(
      (tarea) => tarea.id === tareaId
    );

    assert.equal(tareaAjenaVisible, false);
  });

  await t.test("Usuario B no puede consultar la tarea de A", async () => {
    const response = await request(app)
      .get(`/api/tareas/${tareaId}`)
      .set("Authorization", `Bearer ${userB.token}`);

    assert.equal(response.status, 404);
    assert.equal(response.body.success, false);
  });

  await t.test("Usuario B no puede actualizar la tarea de A", async () => {
    const response = await request(app)
      .put(`/api/tareas/${tareaId}`)
      .set("Authorization", `Bearer ${userB.token}`)
      .send({
        completada: true
      });

    assert.equal(response.status, 404);
    assert.equal(response.body.success, false);
  });

  await t.test("Usuario B no puede alternar la tarea de A", async () => {
    const response = await request(app)
      .patch(`/api/tareas/${tareaId}/toggle`)
      .set("Authorization", `Bearer ${userB.token}`);

    assert.equal(response.status, 404);
    assert.equal(response.body.success, false);
  });

  await t.test("Usuario B no puede eliminar la tarea de A", async () => {
    const response = await request(app)
      .delete(`/api/tareas/${tareaId}`)
      .set("Authorization", `Bearer ${userB.token}`);

    assert.equal(response.status, 404);
    assert.equal(response.body.success, false);
  });

  await t.test("La tarea sigue existiendo para el usuario A", async () => {
    const response = await request(app)
      .get(`/api/tareas/${tareaId}`)
      .set("Authorization", `Bearer ${userA.token}`);

    assert.equal(response.status, 200);
    assert.equal(response.body.data.id, tareaId);
  });

  await t.test("Usuario A puede eliminar su propia tarea", async () => {
    const deleteResponse = await request(app)
      .delete(`/api/tareas/${tareaId}`)
      .set("Authorization", `Bearer ${userA.token}`);

    assert.equal(deleteResponse.status, 200);
    assert.equal(deleteResponse.body.success, true);

    const getResponse = await request(app)
      .get(`/api/tareas/${tareaId}`)
      .set("Authorization", `Bearer ${userA.token}`);

    assert.equal(getResponse.status, 404);
  });
});

after(async () => {
  try {
    const [users] = await db.promise().query(
      "SELECT id FROM usuarios WHERE email IN (?, ?)",
      [userAEmail, userBEmail]
    );

    const userIds = users.map((user) => user.id);

    if (userIds.length > 0) {
      const placeholders = userIds.map(() => "?").join(",");

      await db.promise().query(
        `DELETE FROM tareas WHERE user_id IN (${placeholders})`,
        userIds
      );

      await db.promise().query(
        `DELETE FROM usuarios WHERE id IN (${placeholders})`,
        userIds
      );
    }
  } finally {
    await db.promise().end();
  }
});
