/* eslint-disable no-console */
import { ApiError } from '../exceptions/ApiError.js';
import logger from '../utils/logger.js';

export function errorMiddleware(error, req, res, next) {
  if (error instanceof ApiError) {
    const { status, message, errors } = error;

    res.status(status).send({ status, message, errors });

    return;
  }

  const errorId = Date.now();

  if (process.env.NODE_ENV === 'production') {
    logger.error(`[Error ID: ${errorId}]`, error.stack || error.message);
  } else {
    console.error(`[Error ID: ${errorId}]`, error);
  }

  res.status(500).send({
    status: 500,
    message: 'Unexpected error',
    errorId,
  });
}
