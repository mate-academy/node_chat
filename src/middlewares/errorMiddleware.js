import { ApiError } from '../exceptions/api.error.js';

export const errorMiddleware = (error, req, res, next) => {
  if (error instanceof ApiError) {
    const { status, message, errors } = error;

    res.status(status).send({
      message: message,
      errors: errors,
    });

    return;
  }

  res.statusCode = 500;

  res.send({
    message: 'Server Error!',
  });
};
