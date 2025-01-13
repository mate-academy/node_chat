import { ApiError } from '../exeptions/api.error.js';

export const errorMiddleware = (err, req, res, next) => {
  if (err instanceof ApiError) {
    res.status(err.status).send({
      message: err.message,
      errors: err.errors,
    });
  }

  res.statusCode = 500;
  res.send({
    message: 'Unexpected server error',
  });
};
