import {
  describe,
  it,
  expect,
  vi,
  beforeAll,
  beforeEach,
  type Mock,
} from 'vitest';
import type { NextFunction, Request, Response } from 'express';
import { ipKeyGenerator } from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';

// rateLimit.middleware.ts builds every limiter (and its RedisStore) as a
// module-level side effect at import time, and RedisStore's constructor
// wires `sendCommand` straight through to `redis.call`. We therefore have to
// (1) mock `../lib/redis.js` before anything imports it, since the real
// module opens a live ioredis connection using REDIS_URL, and (2) spy on
// RedisStore.prototype.init *before* the middleware module is imported, so
// we can capture the resolved `windowMs`/`limit` that express-rate-limit
// hands to each store. That means the middleware module must be imported
// dynamically inside beforeAll(), after the spies/mocks are in place.
vi.mock('../lib/redis.js', () => ({
  redis: { call: vi.fn() },
}));

import { redis } from '../lib/redis.js';

const redisCall = redis.call as unknown as Mock;

describe('rateLimit.middleware', () => {
  let mod: typeof import('./rateLimit.middleware.js');
  let initSpy: ReturnType<typeof vi.spyOn>;

  beforeAll(async () => {
    // Pass-through spy: real RedisStore#init still runs (so `this.windowMs`
    // gets set correctly and the store keeps working), we just also record
    // every call so we can inspect the options each limiter was built with.
    initSpy = vi.spyOn(RedisStore.prototype, 'init');

    // Every request that flows through a limiter ultimately calls
    // `redis.call(...)` via `sendCommand`. We fake just enough of the Redis
    // protocol for rate-limit-redis to keep functioning: EVAL follows the
    // standard `EVAL script numkeys key... arg...` shape, so with a single
    // key the key is always argument index 2. We use that to run a real
    // in-memory counter per key, which lets us assert on both (a) which key
    // a limiter used, and (b) that it actually blocks once `limit` is
    // exceeded.
    const counters = new Map<string, number>();
    redisCall.mockImplementation(
      async (command: string, ...args: unknown[]) => {
        const cmd = String(command).toUpperCase();

        if (cmd === 'SCRIPT') {
          // loadIncrementScript does a SCRIPT LOAD during RedisStore#init and
          // asserts the reply looks like a real SHA1 hex digest; an
          // unrecognized reply throws, and express-rate-limit treats a
          // rejected store init as "this store is broken" and fails open
          // (every request passes, nothing ever gets counted). Return a
          // fake-but-valid-shaped SHA1 so init resolves cleanly.
          return 'a'.repeat(40);
        }

        if (cmd === 'EVAL' || cmd === 'EVALSHA') {
          // Once SCRIPT LOAD "succeeds" above, the store prefers EVALSHA for
          // subsequent increments and only falls back to EVAL if that fails.
          // Both use the same `numkeys key...` shape, so the key is still at
          // args[2] for a single-key call in either case.
          const key = String(args[2]);
          const next = (counters.get(key) ?? 0) + 1;
          counters.set(key, next);
          // rate-limit-redis expects [totalHits, timeToExpireMs] back.
          return [next, 15 * 60 * 1000];
        }

        if (cmd === 'DECR') {
          const key = String(args[0]);
          const next = Math.max((counters.get(key) ?? 0) - 1, 0);
          counters.set(key, next);
          return next;
        }

        if (cmd === 'DEL') {
          const key = String(args[0]);
          counters.delete(key);
          return 1;
        }

        return 1;
      },
    );

    mod = await import('./rateLimit.middleware.js');
  });

  beforeEach(() => {
    redisCall.mockClear();
  });

  // --- helpers ------------------------------------------------------------

  function makeReq(overrides: Partial<Request> = {}): Request {
    return {
      ip: '127.0.0.1',
      body: {},
      headers: {},
      method: 'POST',
      path: '/',
      app: { get: vi.fn(() => false) },
      ...overrides,
    } as unknown as Request;
  }

  interface MockRes {
    statusCode: number;
    headers: Record<string, string>;
    setHeader(key: string, value: string): MockRes;
    getHeader(key: string): string | undefined;
    removeHeader(key: string): MockRes;
    append(key: string, value: string): MockRes;
    status(code: number): MockRes;
    on: Mock;
    once: Mock;
    send: Mock;
    json: Mock;
    end: Mock;
  }

  /**
   * Drives an express-rate-limit handler exactly like Express would: it may
   * resolve synchronously or asynchronously, and signals its outcome either
   * by calling `next()` (allowed) or by writing a response (blocked).
   */
  function runMiddleware(
    middleware: (req: Request, res: Response, next: NextFunction) => unknown,
    req: Request,
  ): Promise<{ blocked: boolean; status: number }> {
    return new Promise((resolve) => {
      let settled = false;

      const res = {
        statusCode: 200,
        headers: {},
        setHeader(key: string, value: string) {
          this.headers[key] = value;
          return this;
        },
        getHeader(key: string) {
          return this.headers[key];
        },
        removeHeader(key: string) {
          delete this.headers[key];
          return this;
        },
        append(key: string, value: string) {
          const existing = this.headers[key];
          this.headers[key] = existing ? `${existing}, ${value}` : value;
          return this;
        },
        status(code: number) {
          this.statusCode = code;
          return this;
        },
        on: vi.fn(),
        once: vi.fn(),
      } as MockRes;

      const settle = (blocked: boolean) => {
        if (settled) return;
        settled = true;
        resolve({ blocked, status: res.statusCode });
      };
      res.send = vi.fn(() => {
        settle(true);
        return res;
      });
      res.json = vi.fn(() => {
        settle(true);
        return res;
      });
      res.end = vi.fn(() => {
        settle(true);
        return res;
      });

      const next: NextFunction = () => settle(false);

      Promise.resolve(middleware(req, res as unknown as Response, next)).catch(
        () => settle(true),
      );
    });
  }

  function optionsForCall(index: number) {
    return initSpy.mock.calls[index][0] as { windowMs: number; limit: number };
  }

  /** Every arg (across every recorded redis.call invocation) as a flat list. */
  function allCallArgs(): unknown[] {
    return redisCall.mock.calls.flat();
  }

  // --- windowMs / limit configuration --------------------------------------

  describe('limiter configuration', () => {
    // The limiters are created top-to-bottom as module-level side effects,
    // so RedisStore#init is called in this exact order — one call per
    // exported limiter.
    it('loginRateLimitMiddleware: 15 minutes, 7 requests', () => {
      expect(optionsForCall(0)).toMatchObject({
        windowMs: 15 * 60 * 1000,
        limit: 7,
      });
    });

    it('registerRateLimitMiddleware: 1 hour, 5 requests', () => {
      expect(optionsForCall(1)).toMatchObject({
        windowMs: 60 * 60 * 1000,
        limit: 5,
      });
    });

    it('activationIpRateLimitMiddleware: 1 hour, 7 requests', () => {
      expect(optionsForCall(2)).toMatchObject({
        windowMs: 60 * 60 * 1000,
        limit: 7,
      });
    });

    it('activationEmailRateLimitMiddleware: 24 hours, 3 requests', () => {
      expect(optionsForCall(3)).toMatchObject({
        windowMs: 24 * 60 * 60 * 1000,
        limit: 3,
      });
    });

    it('passwordResetIpRateLimitMiddleware: 1 hour, 7 requests', () => {
      expect(optionsForCall(4)).toMatchObject({
        windowMs: 60 * 60 * 1000,
        limit: 7,
      });
    });

    it('passwordResetEmailRateLimitMiddleware: 24 hours, 3 requests', () => {
      expect(optionsForCall(5)).toMatchObject({
        windowMs: 24 * 60 * 60 * 1000,
        limit: 3,
      });
    });

    it('refreshRateLimitMiddleware: 15 minutes, 30 requests', () => {
      expect(optionsForCall(6)).toMatchObject({
        windowMs: 15 * 60 * 1000,
        limit: 30,
      });
    });

    it('logoutRateLimitMiddleware: 15 minutes, 30 requests', () => {
      expect(optionsForCall(7)).toMatchObject({
        windowMs: 15 * 60 * 1000,
        limit: 30,
      });
    });

    it('googleLoginRateLimitMiddleware: 15 minutes, 10 requests', () => {
      expect(optionsForCall(8)).toMatchObject({
        windowMs: 15 * 60 * 1000,
        limit: 10,
      });
    });

    it('activationTokenRateLimitMiddleware: 1 hour, 30 requests', () => {
      expect(optionsForCall(9)).toMatchObject({
        windowMs: 60 * 60 * 1000,
        limit: 30,
      });
    });

    it('passwordResetTokenRateLimitMiddleware: 1 hour, 30 requests', () => {
      expect(optionsForCall(10)).toMatchObject({
        windowMs: 60 * 60 * 1000,
        limit: 30,
      });
    });
  });

  // --- behavior: allows up to `limit`, blocks past it ----------------------

  describe('limiter behavior against the (mocked) redis store', () => {
    it('loginRateLimitMiddleware allows 7 requests then blocks the 8th', async () => {
      const req = makeReq({ ip: '10.0.0.1' });

      for (let i = 0; i < 7; i++) {
        const result = await runMiddleware(mod.loginRateLimitMiddleware, req);
        expect(result.blocked).toBe(false);
      }

      const eighth = await runMiddleware(mod.loginRateLimitMiddleware, req);
      expect(eighth.blocked).toBe(true);
      expect(eighth.status).toBe(429);

      expect(redisCall).toHaveBeenCalled();
    });

    it('googleLoginRateLimitMiddleware allows 10 requests then blocks the 11th', async () => {
      const req = makeReq({ ip: '10.0.0.5' });

      for (let i = 0; i < 10; i++) {
        const result = await runMiddleware(
          mod.googleLoginRateLimitMiddleware,
          req,
        );
        expect(result.blocked).toBe(false);
      }

      const eleventh = await runMiddleware(
        mod.googleLoginRateLimitMiddleware,
        req,
      );
      expect(eleventh.blocked).toBe(true);
      expect(eleventh.status).toBe(429);

      expect(redisCall).toHaveBeenCalled();
    });

    it('registerRateLimitMiddleware allows 5 requests then blocks the 6th', async () => {
      const req = makeReq({ ip: '10.0.0.2' });

      for (let i = 0; i < 5; i++) {
        const result = await runMiddleware(
          mod.registerRateLimitMiddleware,
          req,
        );
        expect(result.blocked).toBe(false);
      }

      const sixth = await runMiddleware(mod.registerRateLimitMiddleware, req);
      expect(sixth.blocked).toBe(true);
      expect(sixth.status).toBe(429);
    });

    it('refreshRateLimitMiddleware allows 30 requests then blocks the 31st', async () => {
      const req = makeReq({ ip: '10.0.0.3' });

      for (let i = 0; i < 30; i++) {
        const result = await runMiddleware(mod.refreshRateLimitMiddleware, req);
        expect(result.blocked).toBe(false);
      }

      const overLimit = await runMiddleware(
        mod.refreshRateLimitMiddleware,
        req,
      );
      expect(overLimit.blocked).toBe(true);
    });

    it('logoutRateLimitMiddleware allows 30 requests then blocks the 31st', async () => {
      const req = makeReq({ ip: '10.0.0.4' });

      for (let i = 0; i < 30; i++) {
        const result = await runMiddleware(mod.logoutRateLimitMiddleware, req);
        expect(result.blocked).toBe(false);
      }

      const overLimit = await runMiddleware(mod.logoutRateLimitMiddleware, req);
      expect(overLimit.blocked).toBe(true);
    });

    // Regression tests: GET /users/activation/:activationToken and
    // POST /users/password-reset/:resetToken previously had no rate limit
    // at all, unlike their sibling "request a token" endpoints.
    it('activationTokenRateLimitMiddleware allows 30 requests then blocks the 31st', async () => {
      const req = makeReq({ ip: '10.0.0.6' });

      for (let i = 0; i < 30; i++) {
        const result = await runMiddleware(
          mod.activationTokenRateLimitMiddleware,
          req,
        );
        expect(result.blocked).toBe(false);
      }

      const overLimit = await runMiddleware(
        mod.activationTokenRateLimitMiddleware,
        req,
      );
      expect(overLimit.blocked).toBe(true);
    });

    it('passwordResetTokenRateLimitMiddleware allows 30 requests then blocks the 31st', async () => {
      const req = makeReq({ ip: '10.0.0.7' });

      for (let i = 0; i < 30; i++) {
        const result = await runMiddleware(
          mod.passwordResetTokenRateLimitMiddleware,
          req,
        );
        expect(result.blocked).toBe(false);
      }

      const overLimit = await runMiddleware(
        mod.passwordResetTokenRateLimitMiddleware,
        req,
      );
      expect(overLimit.blocked).toBe(true);
    });
  });

  // --- keyGenerator: email limiters fall back to ipKeyGenerator -----------

  describe('email-based keyGenerator fallback', () => {
    it('activationEmailRateLimitMiddleware keys by email when resendActivationData.email is present', async () => {
      const req = makeReq({
        ip: '203.0.113.10',
        body: { resendActivationData: { email: 'user@example.com' } },
      });

      await runMiddleware(mod.activationEmailRateLimitMiddleware, req);

      const args = allCallArgs();
      expect(
        args.some(
          (a) => typeof a === 'string' && a.endsWith('user@example.com'),
        ),
      ).toBe(true);
      const ipKey = ipKeyGenerator('203.0.113.10');
      expect(args.some((a) => typeof a === 'string' && a.endsWith(ipKey))).toBe(
        false,
      );
    });

    it('activationEmailRateLimitMiddleware falls back to ipKeyGenerator when the email is missing', async () => {
      const req = makeReq({ ip: '203.0.113.11', body: {} });

      await runMiddleware(mod.activationEmailRateLimitMiddleware, req);

      const expectedKey = ipKeyGenerator('203.0.113.11');
      const args = allCallArgs();
      expect(
        args.some((a) => typeof a === 'string' && a.endsWith(expectedKey)),
      ).toBe(true);
    });

    it('activationEmailRateLimitMiddleware falls back to ipKeyGenerator when resendActivationData itself is missing', async () => {
      const req = makeReq({
        ip: '203.0.113.12',
        body: { resendActivationData: undefined },
      });

      await runMiddleware(mod.activationEmailRateLimitMiddleware, req);

      const expectedKey = ipKeyGenerator('203.0.113.12');
      const args = allCallArgs();
      expect(
        args.some((a) => typeof a === 'string' && a.endsWith(expectedKey)),
      ).toBe(true);
    });

    it('passwordResetEmailRateLimitMiddleware keys by email when resetPasswordData.email is present', async () => {
      const req = makeReq({
        ip: '203.0.113.20',
        body: { resetPasswordData: { email: 'reset@example.com' } },
      });

      await runMiddleware(mod.passwordResetEmailRateLimitMiddleware, req);

      const args = allCallArgs();
      expect(
        args.some(
          (a) => typeof a === 'string' && a.endsWith('reset@example.com'),
        ),
      ).toBe(true);
    });

    it('passwordResetEmailRateLimitMiddleware falls back to ipKeyGenerator when the email is missing', async () => {
      const req = makeReq({ ip: '203.0.113.21', body: {} });

      await runMiddleware(mod.passwordResetEmailRateLimitMiddleware, req);

      const expectedKey = ipKeyGenerator('203.0.113.21');
      const args = allCallArgs();
      expect(
        args.some((a) => typeof a === 'string' && a.endsWith(expectedKey)),
      ).toBe(true);
    });

    // Regression test: before normalizing, "case-variant@example.com" and
    // "Case-Variant@Example.com" hashed to different keys, so replaying the
    // same request with a different letter case reset the counter and
    // bypassed the limit entirely.
    // NOTE: the key is the (normalized) email itself, not the IP — and the
    // mock `counters` Map above is shared for the whole test file (only
    // call history is cleared per test), so these emails must be unique
    // across every test in this file or they'll inherit stale counts.
    it('activationEmailRateLimitMiddleware treats case/whitespace variants of the same email as one bucket', async () => {
      const ip = '203.0.113.40';
      const variants = [
        'case-variant-a@example.com',
        'Case-Variant-A@Example.com',
        'CASE-VARIANT-A@EXAMPLE.COM',
      ];

      for (const email of variants) {
        const req = makeReq({
          ip,
          body: { resendActivationData: { email } },
        });
        const result = await runMiddleware(
          mod.activationEmailRateLimitMiddleware,
          req,
        );
        expect(result.blocked).toBe(false);
      }

      // The limit is 3; all 3 variants above must have counted against the
      // same bucket, so a 4th request (in any casing, with stray whitespace)
      // is blocked.
      const fourthReq = makeReq({
        ip,
        body: {
          resendActivationData: { email: '  case-Variant-a@Example.com  ' },
        },
      });
      const fourth = await runMiddleware(
        mod.activationEmailRateLimitMiddleware,
        fourthReq,
      );
      expect(fourth.blocked).toBe(true);
    });

    it('passwordResetEmailRateLimitMiddleware treats case/whitespace variants of the same email as one bucket', async () => {
      const ip = '203.0.113.41';
      const variants = [
        'case-variant-b@example.com',
        'Case-Variant-B@Example.com',
        'CASE-VARIANT-B@EXAMPLE.COM',
      ];

      for (const email of variants) {
        const req = makeReq({
          ip,
          body: { resetPasswordData: { email } },
        });
        const result = await runMiddleware(
          mod.passwordResetEmailRateLimitMiddleware,
          req,
        );
        expect(result.blocked).toBe(false);
      }

      const fourthReq = makeReq({
        ip,
        body: {
          resetPasswordData: { email: '  Case-variant-B@example.com  ' },
        },
      });
      const fourth = await runMiddleware(
        mod.passwordResetEmailRateLimitMiddleware,
        fourthReq,
      );
      expect(fourth.blocked).toBe(true);
    });

    it('two different emails from the same IP are tracked independently', async () => {
      const ip = '203.0.113.30';

      for (let i = 0; i < 3; i++) {
        const req = makeReq({
          ip,
          body: { resendActivationData: { email: 'first@example.com' } },
        });
        const result = await runMiddleware(
          mod.activationEmailRateLimitMiddleware,
          req,
        );
        expect(result.blocked).toBe(false);
      }

      // `first@example.com` is now at its 3-request limit, but a different
      // email from the same IP must not be affected by that.
      const otherEmailReq = makeReq({
        ip,
        body: { resendActivationData: { email: 'second@example.com' } },
      });
      const result = await runMiddleware(
        mod.activationEmailRateLimitMiddleware,
        otherEmailReq,
      );
      expect(result.blocked).toBe(false);
    });
  });
});
