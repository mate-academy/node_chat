const { ApiError } = require('../exceptions/api.error');

const errorMiddleware = (error, req, res, next) => {
  // eslint-disable-next-line no-console
  console.error(error);

  if (error instanceof ApiError) {
    return res.status(error.status).json({
      message: error.message,
      errors: error.errors,
    });
  }

  return res.status(500).json({
    message: 'Server Error',
  });
};

module.exports = {
  errorMiddleware,
};
