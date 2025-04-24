import { ApiError } from '../exeptions/api.error.js';

export const errorMiddleware = (error, req, res, next) => {
  if (error instanceof ApiError) {
    res.statusCode = error.status;

    res.send({
      message: error.message,
      errors: error.errors,
    });

    return;
  }

  if (error) {
    res.statusCode = 500;
    res.send({ messsage: 'Server Error' });
  }
};
