import {
  Request as ExpressRequest,
  Response as ExpressResponse,
  NextFunction,
} from 'express';

import { ApiError } from '../exeptions/api.error.js';

export const errorMiddleware = (
  error: Error,
  req: ExpressRequest,
  res: ExpressResponse,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction,
): void => {
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
