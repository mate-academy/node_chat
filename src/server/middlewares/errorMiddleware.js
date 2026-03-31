import { ApiError } from '../exeptions/api.error.js';

export const errorMiddleware = (
  error,
  req,
  res,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next,
) => {
  if (error instanceof ApiError) {
    res.status(error.status).json({
      message: error.message,
      errors: error.errors,
    });

    return;
  }

  if (error) {
    res.status(500).json({
      message: `${error}`,
    });
  }
};
