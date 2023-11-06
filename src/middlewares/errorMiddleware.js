'use strict';

const { ApiError } = require('../exceptions/api.error');

const errorMiddleware = (error, req, res, next) => {
  if (error instanceof ApiError) {
    res.status(error.status).send(({
      message: error.message,
      error: error.errors,
    }));

    return;
  }

  res.status(500).send({
    message: 'Server error',
  });
};

module.exports = {
  errorMiddleware,
};
