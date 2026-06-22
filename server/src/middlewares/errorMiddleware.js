import { ApiError } from '../exeptions/api.error.js';

export const errorMiddleware = (error, req, res, next) => {
  if (error instanceof ApiError) {
    return res.status(error.status).send({
      message: error.message,
      errors: error.errors,
    });
  }

  res.statusCode = 500;
  res.send({ message: error });
};
