import { ZodError, ZodTypeAny } from 'zod';
import { Request, Response, NextFunction } from 'express';

import { ApiError } from '../exceptions/api.error';

export function validationMiddleware(
  schema: ZodTypeAny,
  source: 'body' | 'params' | 'cookies' | 'headers' = 'body',
) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      const data = req[source];

      schema.parse(data);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.reduce(
          (acc, { path, message }) => {
            const field = path.join('.');
            acc[field] = message;

            return acc;
          },
          {} as Record<string, string>,
        );

        throw ApiError.badRequest('Validation error', formattedErrors);
      }

      next(error);
    }
  };
}
