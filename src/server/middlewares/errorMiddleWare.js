const { ApiError } = require('../exeptions/api.error.js');

const errorMiddleWare = (error, req, res, next) => {
  if (error instanceof ApiError) {
    res.status(error.status).send({
      message: error.message,
      errors: error.errors,
    });
  }

  res.statusCode = 500;

  res.send({
    message: 'Internal server error',
  });
};

module.exports = { errorMiddleWare };
