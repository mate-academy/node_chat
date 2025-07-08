const ApiError = require('../exceptions/ApiError.js');

const globalErrorHandler = (err, req, res, next) => {
  if (err instanceof ApiError) {
    return res
      .status(err.status)
      .json({ message: err.message, errors: err.errors });
  }

  return res
    .status(500)
    .json({ message: 'An unexpected internal server error occurred.' });
};

module.exports = {
  globalErrorHandler,
};
