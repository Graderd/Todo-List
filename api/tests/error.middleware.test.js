const test = require("node:test");
const assert = require("node:assert/strict");
const express = require("express");
const request = require("supertest");

const errorHandler = require("../middleware/error.middleware");

test("El manejador oculta los detalles de errores internos", async () => {
  const testApp = express();

  testApp.get("/error-interno", (req, res, next) => {
    const error = new Error(
      "Detalle interno que no debe mostrarse al cliente"
    );

    next(error);
  });

  testApp.use(errorHandler);

  const originalConsoleError = console.error;
  console.error = () => {};

  try {
    const response = await request(testApp).get("/error-interno");

    assert.equal(response.status, 500);

    assert.deepEqual(response.body, {
      success: false,
      error: "Error interno del servidor"
    });

    assert.doesNotMatch(
      response.text,
      /Detalle interno que no debe mostrarse/
    );
  } finally {
    console.error = originalConsoleError;
  }
});
