const ApiError = require('../exceptions/apiError.js');

const errorMiddleware = (error, req, res, next) => {
  if (error instanceof ApiError) {
    const { code, message, errors } = error;

    res.status(code).send({ message, errors });
  } else {
    res.status(500).send({ message: error.message });
  }
};

module.exports = errorMiddleware;
