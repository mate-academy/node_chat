import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, NextFunction } from 'express';
import * as z from 'zod';
import { errorMiddleware } from './error.middleware.js';
import { logger } from '../lib/logger.js';
import {
  ForbiddenError,
  NotFoundError,
  BadRequestError,
  ConflictError,
  UnauthorizedError,
} from '../utils/checks.js';

// The real `Prisma.PrismaClientKnownRequestError` requires the query engine
// to be generated, which isn't available in this test environment. We mock
// the whole generated client module with a minimal, structurally identical
// class so `error instanceof Prisma.PrismaClientKnownRequestError` in the
// middleware still works, since both sides import the same mocked class.
vi.mock('../generated/prisma/client.js', async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>();

  class PrismaClientKnownRequestError extends Error {
    code: string;
    meta?: Record<string, unknown>;
    clientVersion: string;
    constructor(
      message: string,
      opts: {
        code: string;
        clientVersion: string;
        meta?: Record<string, unknown>;
      },
    ) {
      super(message);
      this.name = 'PrismaClientKnownRequestError';
      this.code = opts.code;
      this.clientVersion = opts.clientVersion;
      if (opts.meta !== undefined) {
        this.meta = opts.meta;
      }
    }
  }

  return {
    ...actual,
    Prisma: { PrismaClientKnownRequestError },
  };
});

vi.mock('../lib/logger.js', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
}));

// Imported after the mock so we construct instances of the exact same class
// the middleware checks against.
const { Prisma } = await import('../generated/prisma/client.js');

function makePrismaError(
  code: string,
  meta?: Record<string, unknown>,
  message = 'Prisma error',
) {
  const opts = {
    code,
    clientVersion: '5.0.0',
    ...(meta !== undefined ? { meta } : {}),
  };

  return new Prisma.PrismaClientKnownRequestError(message, opts);
}

function makeReq(): Request {
  return {} as Request;
}

function makeRes() {
  const res = {
    headersSent: false,
  } as unknown as { headersSent: boolean } & Record<string, unknown>;
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  res.send = vi.fn().mockReturnValue(res);
  return res as unknown as import('express').Response & {
    headersSent: boolean;
  };
}

describe('errorMiddleware', () => {
  let next: NextFunction;

  beforeEach(() => {
    vi.clearAllMocks();
    next = vi.fn();
  });

  it('forwards to next(error) without touching the response when headers were already sent', () => {
    const req = makeReq();
    const res = makeRes();
    res.headersSent = true;
    const error = new Error('boom');

    errorMiddleware(error, req, res, next);

    expect(next).toHaveBeenCalledWith(error);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  describe('Prisma known-request errors', () => {
    it('maps a P2002 unique constraint violation to 409 with the offending field', () => {
      const req = makeReq();
      const res = makeRes();
      const error = makePrismaError('P2002', { target: ['email'] });

      errorMiddleware(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Unique constraint failed',
        field: ['email'],
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('maps a P2002 error without meta.target to 409 with an undefined field', () => {
      const req = makeReq();
      const res = makeRes();
      const error = makePrismaError('P2002');

      errorMiddleware(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Unique constraint failed',
        field: undefined,
      });
    });

    it('maps a P2025 "record not found" error to 404', () => {
      const req = makeReq();
      const res = makeRes();
      const error = makePrismaError('P2025');

      errorMiddleware(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Record not found',
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('falls back to the generic 500 response for a Prisma error code it does not special-case', () => {
      const req = makeReq();
      const res = makeRes();
      // e.g. P2003 (foreign key constraint) — not handled explicitly by the
      // middleware, so it should fall through to the same catch-all as any
      // other unexpected error rather than leaking Prisma internals.
      const error = makePrismaError('P2003', { field_name: 'roomId' });

      errorMiddleware(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Server error' });
      expect(logger.error).toHaveBeenCalledWith(
        { err: error },
        'Unhandled error occurred',
      );
    });
  });

  // NOTE: mapping ZodError -> 400 and the checks.ts assertion errors
  // (ForbiddenError/NotFoundError/BadRequestError/ConflictError/
  // UnauthorizedError/GoneError) to their status codes is implemented in
  // `catchError.ts`, which wraps every route handler and responds directly
  // before `next(err)` would ever reach this middleware — see
  // src/utils/catchError.ts. `errorMiddleware` is the final Express error
  // handler and, as written, does not special-case either error family
  // itself. The cases below document that: if one of these errors *does*
  // reach this middleware directly (e.g. thrown outside a catchError-wrapped
  // handler), it is treated like any other unexpected error and mapped to a
  // generic 500 rather than its "intended" status code. If that mapping is
  // ever duplicated into errorMiddleware as a safety net, these are the
  // cases to flip over to expecting the specific status codes.
  describe('zod validation errors reaching this middleware directly', () => {
    it('does not special-case ZodError; it falls back to a generic 500', () => {
      const req = makeReq();
      const res = makeRes();
      const schema = z.object({ name: z.string().min(2) });
      const result = schema.safeParse({ name: 'a' });
      const error = result.success ? undefined : result.error;
      expect(error).toBeInstanceOf(z.ZodError);

      errorMiddleware(error as unknown as Error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Server error' });
    });
  });

  describe('checks.ts assertion errors reaching this middleware directly', () => {
    it.each([
      ['ForbiddenError', new ForbiddenError('nope')],
      ['NotFoundError', new NotFoundError('missing')],
      ['BadRequestError', new BadRequestError('bad')],
      ['ConflictError', new ConflictError('conflict')],
      ['UnauthorizedError', new UnauthorizedError('nope')],
    ])(
      '%s is not special-cased here either; it falls back to a generic 500',
      (_name, error) => {
        const req = makeReq();
        const res = makeRes();

        errorMiddleware(error, req, res, next);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: 'Server error' });
      },
    );
  });

  describe('unexpected errors', () => {
    it('responds 500 with a generic message and logs the real error', () => {
      const req = makeReq();
      const res = makeRes();
      const error = new Error('something exploded internally');

      errorMiddleware(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Server error' });
      expect(logger.error).toHaveBeenCalledWith(
        { err: error },
        'Unhandled error occurred',
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('never leaks the error message or stack trace into the response body', () => {
      const req = makeReq();
      const res = makeRes();
      const error = new Error('super secret internal detail: db password xyz');
      error.stack = 'Error: super secret internal detail\n    at secretFn()';

      errorMiddleware(error, req, res, next);

      const [responseBody] = vi.mocked(res.json).mock.calls[0] as [
        Record<string, unknown>,
      ];

      expect(responseBody).toEqual({ message: 'Server error' });
      expect(responseBody).not.toHaveProperty('stack');
      expect(JSON.stringify(responseBody)).not.toContain('secret');
      expect(JSON.stringify(responseBody)).not.toContain('at secretFn');
    });

    it('does not vary the response body between development and production NODE_ENV', () => {
      const originalEnv = process.env.NODE_ENV;

      try {
        for (const env of ['development', 'production']) {
          process.env.NODE_ENV = env;
          vi.clearAllMocks();

          const req = makeReq();
          const res = makeRes();
          const error = new Error('internal failure');

          errorMiddleware(error, req, res, next);

          expect(res.status).toHaveBeenCalledWith(500);
          expect(res.json).toHaveBeenCalledWith({ message: 'Server error' });
        }
      } finally {
        process.env.NODE_ENV = originalEnv;
      }
    });

    it('still logs the full error object (with stack) server-side even though the response is generic', () => {
      const req = makeReq();
      const res = makeRes();
      const error = new Error('internal failure');

      errorMiddleware(error, req, res, next);

      const [logPayload] = vi.mocked(logger.error).mock.calls[0] as [
        { err: Error },
        string,
      ];

      expect(logPayload.err).toBe(error);
      expect(logPayload.err.stack).toBeDefined();
    });
  });
});
