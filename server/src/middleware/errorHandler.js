function errorHandler(err, req, res, next) {
  console.error(err);

  if (res.headersSent) {
    next(err);
    return;
  }

  const statusCode = err.statusCode || err.status || 500;
  const isInvalidJson = err.type === "entity.parse.failed";

  res.status(statusCode).json({
    message:
      statusCode === 500
        ? "Internal server error"
        : isInvalidJson
          ? "Request body must be valid JSON"
          : err.message,
  });
}

module.exports = errorHandler;
