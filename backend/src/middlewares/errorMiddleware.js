const ApiError = require('../exceptions/api.error');

const errorMiddleware = (err, req, res, next) => {
  if (err instanceof ApiError) {
    return res.status(err.status).json({
      message: err.message,
      errors: err.errors,
    });
  }

  res.status(500).json({
    err,
    message: 'Internal Server Error',
  });
};

module.exports = errorMiddleware;
