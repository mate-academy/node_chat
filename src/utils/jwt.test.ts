import { describe, it, expect, afterEach, vi } from 'vitest';
import jwt from 'jsonwebtoken';

// jwt.ts reads JWT_SECRET and throws at import time if it's missing, so we
// make sure a value exists *before* importing it — don't assume the shell,
// CI, or a .env file already provides one (mirrors the pattern used in
// src/lib/socket.test.ts for CORS_ORIGIN).
process.env.JWT_SECRET ??= 'test-jwt-secret-for-unit-tests';
const JWT_SECRET = process.env.JWT_SECRET;

const { jwtService } = await import('./jwt.js');

function makePayload(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    userId: 'user-1',
    tokenVersion: 3,
    sessionId: 'session-abc',
    ...overrides,
  };
}

describe('jwtService', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  describe('sign', () => {
    it('embeds userId, tokenVersion, and sessionId in the token payload', () => {
      const payload = makePayload();

      const token = jwtService.sign(payload);
      const decoded = jwt.decode(token) as Record<string, unknown>;

      expect(decoded.userId).toBe('user-1');
      expect(decoded.tokenVersion).toBe(3);
      expect(decoded.sessionId).toBe('session-abc');
    });

    it('signs with the same JWT_SECRET the service verifies with', () => {
      const token = jwtService.sign(makePayload());

      // Would throw JsonWebTokenError if the secret didn't match
      expect(() => jwt.verify(token, JWT_SECRET)).not.toThrow();
    });

    it('sets an expiry roughly 15 minutes (900s) from now', () => {
      vi.useFakeTimers();
      const now = new Date('2026-01-01T00:00:00.000Z');
      vi.setSystemTime(now);

      const token = jwtService.sign(makePayload());
      const decoded = jwt.decode(token) as { iat: number; exp: number };

      expect(decoded.iat).toBe(Math.floor(now.getTime() / 1000));
      expect(decoded.exp - decoded.iat).toBe(15 * 60);
    });

    it('produces a token that is not yet expired at issuance time', () => {
      const token = jwtService.sign(makePayload());

      expect(() => jwtService.verify(token)).not.toThrow();
    });
  });

  describe('verify', () => {
    it('round-trips the exact payload for a token signed with the same secret', () => {
      const payload = makePayload({
        userId: 'user-42',
        tokenVersion: 7,
        sessionId: 'session-xyz',
      });

      const token = jwtService.sign(payload);
      const result = jwtService.verify(token);

      expect(result.userId).toBe('user-42');
      expect(result.tokenVersion).toBe(7);
      expect(result.sessionId).toBe('session-xyz');
    });

    it('throws TokenExpiredError for an expired token', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));

      const token = jwtService.sign(makePayload());

      // advance past the 15 minute expiry
      vi.setSystemTime(new Date('2026-01-01T00:16:00.000Z'));

      expect(() => jwtService.verify(token)).toThrow(jwt.TokenExpiredError);
    });

    it('throws JsonWebTokenError for a malformed token string', () => {
      expect(() => jwtService.verify('not-a-real-jwt')).toThrow(
        jwt.JsonWebTokenError,
      );
    });

    it('throws JsonWebTokenError for a well-formed but garbage token', () => {
      expect(() => jwtService.verify('a.b.c')).toThrow(jwt.JsonWebTokenError);
    });

    it('throws JsonWebTokenError (invalid signature) when the token was signed with a different secret', () => {
      const tamperedToken = jwt.sign(
        makePayload(),
        'a-completely-different-secret',
        {
          expiresIn: '15m',
        },
      );

      expect(() => jwtService.verify(tamperedToken)).toThrow(
        jwt.JsonWebTokenError,
      );
      expect(() => jwtService.verify(tamperedToken)).toThrow(
        /invalid signature/i,
      );
    });

    it('throws JsonWebTokenError when the payload is tampered with after signing', () => {
      const token = jwtService.sign(makePayload({ tokenVersion: 1 }));
      const [headerB64, payloadB64, signatureB64] = token.split('.');

      const decodedPayload = JSON.parse(
        Buffer.from(payloadB64!, 'base64url').toString('utf8'),
      );
      const tamperedPayload = { ...decodedPayload, tokenVersion: 999 };
      const tamperedPayloadB64 = Buffer.from(
        JSON.stringify(tamperedPayload),
      ).toString('base64url');

      const tamperedToken = `${headerB64}.${tamperedPayloadB64}.${signatureB64}`;

      expect(() => jwtService.verify(tamperedToken)).toThrow(
        jwt.JsonWebTokenError,
      );
    });

    it('throws JsonWebTokenError for an empty string', () => {
      expect(() => jwtService.verify('')).toThrow(jwt.JsonWebTokenError);
    });

    it('never returns null/undefined — verification failures are always thrown, not returned', () => {
      // Documents the actual contract of jwtService.verify: unlike some
      // other verify-style helpers in this codebase (e.g. tokenService),
      // this one always throws on failure rather than resolving to null.
      // Callers (see auth.middleware.ts) rely on try/catch around it.
      expect(() => jwtService.verify('garbage')).toThrow();
    });
  });
});
