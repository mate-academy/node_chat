import { rateLimit, ipKeyGenerator } from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import type { Request } from 'express';
import { redis } from '../lib/redis.js';
import type { RedisReply } from 'rate-limit-redis';

const createRedisStore = () =>
  new RedisStore({
    sendCommand: async (
      command: string,
      ...args: string[]
    ): Promise<RedisReply> => {
      return redis.call(command, ...args) as Promise<RedisReply>;
    },
  });

export const loginRateLimitMiddleware = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 7,
  skipSuccessfulRequests: true,

  store: createRedisStore(),

  standardHeaders: 'draft-8',
  legacyHeaders: false,
  ipv6Subnet: 56,
});

export const registerRateLimitMiddleware = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 5,

  store: createRedisStore(),

  standardHeaders: 'draft-8',
  legacyHeaders: false,
  ipv6Subnet: 56,
});

export const activationIpRateLimitMiddleware = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 7,

  store: createRedisStore(),

  standardHeaders: 'draft-8',
  legacyHeaders: false,
  ipv6Subnet: 56,
});

export const activationEmailRateLimitMiddleware = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  limit: 3, // Limit each email to 3 requests per `window` (here, per 24 hours).
  // Normalized the same way the controller's Zod schema normalizes it, so a
  // request can't dodge the limit by varying the letter case of the email.
  keyGenerator: (req: Request) =>
    req.body?.resendActivationData?.email?.trim().toLowerCase() ??
    ipKeyGenerator(req.ip ?? ''),

  store: createRedisStore(),

  standardHeaders: 'draft-8',
  legacyHeaders: false,
});

export const passwordResetIpRateLimitMiddleware = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 7,

  store: createRedisStore(),

  standardHeaders: 'draft-8',
  legacyHeaders: false,
  ipv6Subnet: 56,
});

export const passwordResetEmailRateLimitMiddleware = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  limit: 3, // Limit each email to 3 reset requests per 24 hours.
  // Normalized the same way the controller's Zod schema normalizes it, so a
  // request can't dodge the limit by varying the letter case of the email.
  keyGenerator: (req: Request) =>
    req.body?.resetPasswordData?.email?.trim().toLowerCase() ??
    ipKeyGenerator(req.ip ?? ''),

  store: createRedisStore(),

  standardHeaders: 'draft-8',
  legacyHeaders: false,
});

export const refreshRateLimitMiddleware = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  skipSuccessfulRequests: true,
  store: createRedisStore(),
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  ipv6Subnet: 56,
  max: 30,
  message: 'Too many refresh attempts, please try again later',
});

export const logoutRateLimitMiddleware = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  skipSuccessfulRequests: true,
  store: createRedisStore(),
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  ipv6Subnet: 56,
  max: 30,
  message: 'Too many logout attempts, please try again later',
});

export const googleLoginRateLimitMiddleware = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 10,
  skipSuccessfulRequests: true,

  store: createRedisStore(),

  standardHeaders: 'draft-8',
  legacyHeaders: false,
  ipv6Subnet: 56,
});

// Activation/reset tokens are 256-bit random strings, so brute-forcing one
// directly is not practical. These IP limits exist mainly to keep noisy or
// misbehaving clients from hammering the endpoint (DoS/log-noise
// protection), matching the coverage their sibling "request a token"
// endpoints already have — not as the primary defense.
export const activationTokenRateLimitMiddleware = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 30,
  skipSuccessfulRequests: true,

  store: createRedisStore(),

  standardHeaders: 'draft-8',
  legacyHeaders: false,
  ipv6Subnet: 56,
});

export const passwordResetTokenRateLimitMiddleware = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 30,
  skipSuccessfulRequests: true,

  store: createRedisStore(),

  standardHeaders: 'draft-8',
  legacyHeaders: false,
  ipv6Subnet: 56,
});
