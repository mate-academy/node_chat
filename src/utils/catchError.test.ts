import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import * as z from 'zod';
import { catchError } from './catchError.js';
import {
  ForbiddenError,
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
  ConflictError,
  GoneError,
} from './checks.js';

function makeReq(): Request {
  return {} as Request;
}

function makeRes(): Response {
  const res = {} as Response;
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  res.send = vi.fn().mockReturnValue(res);
  return res;
}

// flushes the microtask queue so the `.catch(...)` attached inside
// catchError has had a chance to run before we assert on it
const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('catchError', () => {
  let next: NextFunction;

  beforeEach(() => {
    vi.clearAllMocks();
    next = vi.fn();
  });

  it('does nothing extra when the wrapped handler resolves successfully', async () => {
    const handler = vi.fn(async (_req: Request, res: Response) => {
      res.status(200).send({ ok: true });
    });
    const req = makeReq();
    const res = makeRes();

    catchError(handler)(req, res, next);
    await flush();

    expect(handler).toHaveBeenCalledWith(req, res, next);
    expect(next).not.toHaveBeenCalled();
  });

  it('maps a ZodError to 400 with a structured validation body', async () => {
    const schema = z.object({ name: z.string().min(2) });
    const result = schema.safeParse({ name: 'a' });
    if (result.success) throw new Error('expected validation to fail');
    const zodError = result.error;

    const handler = vi.fn(async () => {
      throw zodError;
    });
    const req = makeReq();
    const res = makeRes();

    catchError(handler)(req, res, next);
    await flush();

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      message: 'Validation error',
      errors: zodError.issues,
    });
    expect(next).not.toHaveBeenCalled();
  });

  it.each([
    [ForbiddenError, 'no access', 403],
    [BadRequestError, 'bad input', 400],
    [NotFoundError, 'missing thing', 404],
    [UnauthorizedError, 'not logged in', 401],
    [ConflictError, 'already exists', 409],
    [GoneError, 'expired', 410],
  ] as const)(
    'maps %s to a %i response carrying the error message',
    async (ErrorClass, message, expectedStatus) => {
      const handler = vi.fn(async () => {
        throw new ErrorClass(message);
      });
      const req = makeReq();
      const res = makeRes();

      catchError(handler)(req, res, next);
      await flush();

      expect(res.status).toHaveBeenCalledWith(expectedStatus);
      expect(res.json).toHaveBeenCalledWith({ message });
      expect(next).not.toHaveBeenCalled();
    },
  );

  it('falls back to next(err) for an error type it does not recognize', async () => {
    const error = new Error('totally unexpected');
    const handler = vi.fn(async () => {
      throw error;
    });
    const req = makeReq();
    const res = makeRes();

    catchError(handler)(req, res, next);
    await flush();

    expect(next).toHaveBeenCalledWith(error);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
    expect(res.send).not.toHaveBeenCalled();
  });

  it('forwards a Prisma-style error to next() rather than mapping it, leaving that to error.middleware.ts', async () => {
    class FakePrismaError extends Error {
      code = 'P2002';
    }
    const error = new FakePrismaError('unique constraint');
    const handler = vi.fn(async () => {
      throw error;
    });
    const req = makeReq();
    const res = makeRes();

    catchError(handler)(req, res, next);
    await flush();

    expect(next).toHaveBeenCalledWith(error);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('handles a rejected-promise-returning (non-async) handler the same as an async one', async () => {
    const handler = vi.fn(
      (_req: Request, _res: Response, _next: NextFunction) =>
        Promise.reject(new NotFoundError('not there')),
    );
    const req = makeReq();
    const res = makeRes();

    catchError(handler)(req, res, next);
    await flush();

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'not there' });
  });

  it('only responds once even if the handler resolves after throwing is no longer possible', async () => {
    // sanity check that a successful async handler never triggers next()
    // or an error response as a side effect of being wrapped
    const handler = vi.fn(async (_req: Request, res: Response) => {
      res.sendStatus?.(204);
    });
    const req = makeReq();
    const res = makeRes();
    res.sendStatus = vi.fn().mockReturnValue(res);

    catchError(handler)(req, res, next);
    await flush();

    expect(res.sendStatus).toHaveBeenCalledWith(204);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  // NOTE: catchError only guards against *asynchronous* failures — it calls
  // `fn(req, res, next)` first and wraps the result in `Promise.resolve()`.
  // If `fn` is a plain (non-async) function that throws synchronously, the
  // throw happens while evaluating that call, before `Promise.resolve` or
  // `.catch` ever get involved, so it is NOT caught here — it propagates
  // straight out of the function `catchError` returns. In this codebase
  // every controller is an `async function`, so a synchronous throw never
  // actually happens in practice (calling an async function always returns
  // a promise, even if the body throws immediately). This test documents
  // that boundary rather than asserting a "fix" that isn't implemented.
  it('does not catch a synchronous throw from a non-async handler — it propagates out of the wrapper', () => {
    const handler = vi.fn(() => {
      throw new NotFoundError('thrown synchronously');
    }) as unknown as (req: Request, res: Response, next: NextFunction) => void;
    const req = makeReq();
    const res = makeRes();

    expect(() => catchError(handler)(req, res, next)).toThrow(
      'thrown synchronously',
    );

    expect(res.status).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });
});
