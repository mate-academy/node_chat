import { ApiError } from "../exceptions/ApiError.js";

export function errorMiddleware(error, req, res, next) {
  if (error instanceof ApiError) {
    const { status, message, errors } = error;

    res.status(status).send({ message, errors });
    return;
  }

  console.log(error);

  res.status(500).send({
    message: 'Unexpected error',
  });
}
