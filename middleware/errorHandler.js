const { AppError } = require('../utils/errors');

module.exports = function errorHandler(err, req, res, next) {
  // If headers already sent, let Express handle it
  if (res.headersSent) return next(err);

  const status = err.status || err.statusCode || 500;
  const isServer = status >= 500;

  // Log only unexpected errors
  if (isServer) {
    console.error('[error]', err);
  }

  const body = {
    error: err.message || 'Internal Server Error',
  };

  // Include name for client-side handling (UnauthorizedError, NotFoundError, etc.)
  if (err.name && err.name !== 'Error') {
    body.type = err.name;
  }

  // Optional: add field-level errors for validation
  if (err.errors) {
    body.details = err.errors;
  }

  res.status(status).json(body);
};