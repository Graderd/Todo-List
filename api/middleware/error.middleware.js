const errorHandler = (err, req, res, next) => {
  const status =
    Number.isInteger(err.status) && err.status >= 400
      ? err.status
      : 500;

  console.error({
    method: req.method,
    path: req.originalUrl,
    status,
    code: err.code,
    message: err.message
  });

  const publicMessage =
    status >= 500
      ? "Error interno del servidor"
      : err.message;

  return res.status(status).json({
    success: false,
    error: publicMessage
  });
};

module.exports = errorHandler;