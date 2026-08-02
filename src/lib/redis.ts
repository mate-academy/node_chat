import 'dotenv/config';
import { Redis } from 'ioredis';
import { logger } from './logger.js';

const REDIS_URL = process.env.REDIS_URL;

if (!REDIS_URL) {
  throw new Error('REDIS_URL is not set');
}

const RATE_LIMIT_SCRIPT = `
local key = KEYS[1]
local now = tonumber(ARGV[1])
local windowMs = tonumber(ARGV[2])
local limit = tonumber(ARGV[3])
local member = ARGV[4]
local ttlSeconds = tonumber(ARGV[5])

redis.call('ZREMRANGEBYSCORE', key, 0, now - windowMs)

local count = redis.call('ZCARD', key)

if count >= limit then
  return 0
end

redis.call('ZADD', key, now, member)
redis.call('EXPIRE', key, ttlSeconds)

return 1
`;

const DECREMENT_SCRIPT = `
local key = KEYS[1]
local ttlSeconds = tonumber(ARGV[1])
local count = redis.call('DECR', key)

if count <= 0 then
  redis.call('DEL', key)
else
  redis.call('EXPIRE', key, ttlSeconds)
end

return count
`;

export const redis = new Redis(REDIS_URL, {
  maxRetriesPerRequest: 3,
  lazyConnect: false,
});

export const pubClient = new Redis(REDIS_URL, {
  maxRetriesPerRequest: 3,
  lazyConnect: false,
});

export const subClient = new Redis(REDIS_URL, {
  maxRetriesPerRequest: 3,
  lazyConnect: false,
});

redis.defineCommand('slidingWindowRateLimit', {
  numberOfKeys: 1,
  lua: RATE_LIMIT_SCRIPT,
});

redis.defineCommand('atomicDecrement', {
  numberOfKeys: 1,
  lua: DECREMENT_SCRIPT,
});

declare module 'ioredis' {
  interface RedisCommander {
    slidingWindowRateLimit(
      key: string,
      now: number,
      windowMs: number,
      limit: number,
      member: string,
      ttlSeconds: number,
    ): Promise<number>;
    atomicDecrement(key: string, ttlSeconds: number): Promise<number>;
  }
}

redis.on('error', (err: Error) => {
  logger.error({ err }, 'Redis connection error');
});

pubClient.on('error', (err: Error) => {
  logger.error({ err }, 'Redis pub client connection error');
});

subClient.on('error', (err: Error) => {
  logger.error({ err }, 'Redis sub client connection error');
});
