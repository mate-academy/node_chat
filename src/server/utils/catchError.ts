import {
  Request as ExpressRequest,
  Response as ExpressResponse,
  NextFunction,
  RequestHandler,
} from 'express';

export const catchError = (action: RequestHandler): RequestHandler => {
  return async function (
    req: ExpressRequest,
    res: ExpressResponse,
    next: NextFunction,
  ): Promise<void> {
    try {
      await action(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};
