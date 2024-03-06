import { ApiError } from '../exceptions/api.error.js';

/* eslint no-console: "warn" */

/** @type {import('../types/func.type').TyFuncErrorMiddleware} */
export function errorMiddleware(error, req, res, next) {
  console.error(error);

  if (error instanceof ApiError) {
    const { status, message, errors } = error;

    return res.status(status)
      .send({
        message, errors,
      });
  }

  res.status(500)
    .send({
      message: 'Unexpected error',
    });
}
