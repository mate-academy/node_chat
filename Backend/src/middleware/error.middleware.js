const { ApiError } = require('../exceptions/api.error');

function errorMiddleware(error, req, res, next) {
  if (error instanceof ApiError) {
    const { status, message, errors } = error;

    res.status(status).send({ message, errors });

    return;
  }
  /* eslint-disable no-console */
  console.log(error);

  res.status(500).send({
    message: 'Unexpected server error',
    info: error.message,
    name: error.name,
  });
}

module.exports = {
  errorMiddleware,
};
