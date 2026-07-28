const notFoundHandler = (req, res) => {
  return res.status(404).json({
    success: false,
    error: "Ruta no encontrada"
  });
};

module.exports = notFoundHandler;
