const { ApiError } = require('../exceptions/api.error');

const errorMiddleware = (error, req, res, next) => {
  if (error instanceof ApiError) {
    res.status(error.status).send({
      message: error.message,
      errors: error.errors,
    });

    return;
  }

  res.status(500).send({
    errorMessage: error.message,
  });
};

module.exports = {
  errorMiddleware,
};
