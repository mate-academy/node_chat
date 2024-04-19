'use strict';

const { ApiError } = require('../exceptions/ApiError');

const errorMiddleware = (error, req, res, next) => {
  if (error instanceof ApiError) {
    res.status(error.status).send({ message: error.message });

    return;
  }

  res.status(500).send({ message: 'Internal server error' });
};

module.exports = { errorMiddleware };
