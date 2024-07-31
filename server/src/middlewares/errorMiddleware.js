const { ApiError } = require('../exceptions/api.error.js');

const errorMiddleware = (error, req, res) => {
  if (error instanceof ApiError) {
    const { status, message, errors } = error;

    res.status(status).send({
      message,
      errors,
    });

    return;
  }

  res.status(500).send({ message: 'Server error' });
};

module.exports = { errorMiddleware };
