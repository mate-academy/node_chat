import { Prisma } from '../generated/prisma/client.js';
import type { NextFunction, Request, Response } from 'express';
import { logger } from '../lib/logger.js';

export const errorMiddleware = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (res.headersSent) {
    return next(error);
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      return res.status(409).json({
        message: 'Unique constraint failed',
        field: error.meta?.target,
      });
    }

    if (error.code === 'P2025') {
      return res.status(404).json({
        message: 'Record not found',
      });
    }
  }

  logger.error({ err: error }, 'Unhandled error occurred');

  return res.status(500).json({
    message: 'Server error',
  });
};
