import type { NextFunction, Request, RequestHandler, Response } from 'express';
import type { ParamsDictionary } from 'express-serve-static-core';
import type { ParsedQs } from 'qs';
import * as z from 'zod';
import {
  ForbiddenError,
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
  ConflictError,
  GoneError,
} from './checks.js';

export const catchError =
  <
    P = ParamsDictionary,
    ResBody = unknown,
    ReqBody = unknown,
    ReqQuery = ParsedQs,
  >(
    fn: RequestHandler<P, ResBody, ReqBody, ReqQuery>,
  ) =>
  (
    req: Request<P, ResBody, ReqBody, ReqQuery>,
    res: Response<ResBody>,
    next: NextFunction,
  ) => {
    Promise.resolve(fn(req, res, next)).catch((err) => {
      if (err instanceof z.ZodError) {
        (res as Response)
          .status(400)
          .send({ message: 'Validation error', errors: err.issues });
        return;
      }
      if (err instanceof ForbiddenError) {
        (res as Response).status(403).json({ message: err.message });
        return;
      }
      if (err instanceof BadRequestError) {
        (res as Response).status(400).json({ message: err.message });
        return;
      }
      if (err instanceof NotFoundError) {
        (res as Response).status(404).json({ message: err.message });
        return;
      }
      if (err instanceof UnauthorizedError) {
        (res as Response).status(401).json({ message: err.message });
        return;
      }
      if (err instanceof ConflictError) {
        (res as Response).status(409).json({ message: err.message });
        return;
      }
      if (err instanceof GoneError) {
        (res as Response).status(410).json({ message: err.message });
        return;
      }
      next(err);
    });
  };
