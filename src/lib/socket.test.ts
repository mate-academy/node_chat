import {
  describe,
  it,
  expect,
  vi,
  beforeAll,
  beforeEach,
  type Mock,
} from 'vitest';
import { createServer } from 'http';

// socket.ts reads CORS_ORIGIN at module-evaluation time and throws if it's
// missing. Static `import` declarations are hoisted above any other
// top-level code, so this assignment must run before socket.ts is loaded —
// which is why socket.ts is imported dynamically inside beforeAll() below,
// rather than with a static `import` at the top of this file.
process.env.CORS_ORIGIN ??= 'http://localhost:3000';

vi.mock('./redis.js', () => ({
  redis: {
    incr: vi.fn(),
    expire: vi.fn(),
    del: vi.fn(),
    atomicDecrement: vi.fn(),
    slidingWindowRateLimit: vi.fn(),
  },
  pubClient: {},
  subClient: {},
}));

vi.mock('./logger.js', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

vi.mock('../services/room.service.js', () => ({
  roomService: {
    checkIsUserIn: vi.fn(),
  },
}));

vi.mock('../services/user.service.js', () => ({
  userService: {
    getOneById: vi.fn(),
  },
}));

vi.mock('../utils/jwt.js', () => ({
  jwtService: {
    verify: vi.fn(),
    sign: vi.fn(),
  },
}));

// The real redis-adapter would try to call .publish/.subscribe on the mocked
// redis clients above. We only need `io.adapter(...)` to not blow up.
// socket.io's namespace initialization calls `new (this.server._adapter)(this)`
// and then `.init()` on the resulting instance, so the stub constructor must
// return an object exposing at least `init`/`close` — a bare `vi.fn()` isn't
// enough, since `new (vi.fn())()` has no methods on it and previously caused
// `TypeError: this.adapter.init is not a function`. Nothing in these tests
// ever broadcasts through a real socket, so the adapter is never actually
// exercised beyond this minimal interface.
vi.mock('@socket.io/redis-adapter', () => ({
  createAdapter: vi.fn(() => {
    return function AdapterStub() {
      return {
        init: vi.fn(),
        close: vi.fn(),
      };
    };
  }),
}));

import { redis } from './redis.js';
import { roomService } from '../services/room.service.js';
import { userService } from '../services/user.service.js';
import { jwtService } from '../utils/jwt.js';
import type { attachSocket as AttachSocket, io as Io } from './socket.js';

type NextFn = (err?: Error) => void;
type Middleware = (socket: FakeSocket, next: NextFn) => void | Promise<void>;
type ConnectionHandler = (socket: FakeSocket) => void;

interface FakeSocket {
  id: string;
  data: Record<string, unknown>;
  handshake: {
    address: string;
    headers: Record<string, unknown>;
    auth: { token?: string };
  };
  on: Mock;
  emit: Mock;
  join: Mock;
  leave: Mock;
  _handlers: Map<string, (...args: unknown[]) => unknown>;
}

function makeFakeSocket(overrides: Partial<FakeSocket> = {}): FakeSocket {
  const handlers = new Map<string, (...args: unknown[]) => unknown>();

  return {
    id: 'socket-1',
    data: {},
    handshake: {
      address: '127.0.0.1',
      headers: {},
      auth: { token: 'valid-token' },
    },
    on: vi.fn((event: string, cb: (...args: unknown[]) => unknown) => {
      handlers.set(event, cb);
    }),
    emit: vi.fn(),
    join: vi.fn(),
    leave: vi.fn(),
    _handlers: handlers,
    ...overrides,
  };
}

describe('socket.ts', () => {
  let middleware: Middleware;
  let connectionHandler: ConnectionHandler;
  let io: typeof Io;

  beforeAll(async () => {
    const socketModule = await import('./socket.js');
    io = socketModule.io;
    const attachSocket: typeof AttachSocket = socketModule.attachSocket;

    // `io` is a module-level singleton created when socket.ts is imported.
    // attachSocket() registers the auth middleware and the 'connection'
    // handler on it via io.use()/io.on(). We spy on those just long enough
    // to capture the registered functions so we can invoke them directly
    // with fake sockets, without ever performing a real socket.io/network
    // handshake.
    const useSpy = vi.spyOn(io, 'use');
    const onSpy = vi.spyOn(io, 'on');

    attachSocket(createServer());

    middleware = useSpy.mock.calls[0]![0] as unknown as Middleware;
    const connectionCall = onSpy.mock.calls.find(
      (call) => call[0] === 'connection',
    );
    connectionHandler = connectionCall![1] as ConnectionHandler;

    useSpy.mockRestore();
    onSpy.mockRestore();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(jwtService.verify).mockReturnValue({
      userId: 'user-1',
      tokenVersion: 0,
      sessionId: 'session-1',
    });
    vi.mocked(userService.getOneById).mockResolvedValue({
      id: 'user-1',
      tokenVersion: 0,
    } as never);
    vi.mocked(redis.incr).mockResolvedValue(1);
  });

  describe('connection middleware (per-IP connection counter)', () => {
    it('increments the connection counter and refreshes its TTL on the first connection from an IP', async () => {
      vi.mocked(redis.incr).mockResolvedValue(1);
      const socket = makeFakeSocket();
      const next = vi.fn();

      await middleware(socket, next);

      expect(redis.incr).toHaveBeenCalledWith('socket:connections:127.0.0.1');
      expect(redis.expire).toHaveBeenCalledWith(
        'socket:connections:127.0.0.1',
        24 * 60 * 60,
      );
      expect(next).toHaveBeenCalledWith();
      expect(socket.data.userId).toBe('user-1');
    });

    // Regression test: the TTL must be refreshed on every connection, not
    // just the first one. Otherwise a long-lived batch of WebSocket
    // connections would see the Redis counter key silently expire and
    // reset to 0 while those connections are still open, defeating the
    // per-IP connection cap.
    it('also refreshes the TTL on subsequent connections from the same IP', async () => {
      vi.mocked(redis.incr).mockResolvedValue(2);
      const socket = makeFakeSocket();
      const next = vi.fn();

      await middleware(socket, next);

      expect(redis.incr).toHaveBeenCalledWith('socket:connections:127.0.0.1');
      expect(redis.expire).toHaveBeenCalledWith(
        'socket:connections:127.0.0.1',
        24 * 60 * 60,
      );
      expect(next).toHaveBeenCalledWith();
    });
  });

  describe('connection middleware (tokenVersion revocation check)', () => {
    it('rejects a connection whose JWT tokenVersion no longer matches the stored user tokenVersion', async () => {
      vi.mocked(jwtService.verify).mockReturnValue({
        userId: 'user-1',
        tokenVersion: 0,
        sessionId: 'session-1',
      });
      // e.g. the user called logoutAll or changed their password after this
      // JWT was issued, bumping the stored tokenVersion to 1.
      vi.mocked(userService.getOneById).mockResolvedValue({
        id: 'user-1',
        tokenVersion: 1,
      } as never);

      const socket = makeFakeSocket();
      const next = vi.fn();

      await middleware(socket, next);

      expect(userService.getOneById).toHaveBeenCalledWith('user-1');
      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect((next.mock.calls[0]![0] as Error).message).toBe('Session revoked');
      expect(socket.data.userId).toBeUndefined();
      // The per-IP connection count that was optimistically incremented
      // must be rolled back on rejection, same as the other failure paths.
      expect(redis.atomicDecrement).toHaveBeenCalledWith(
        'socket:connections:127.0.0.1',
        24 * 60 * 60,
      );
    });

    it('rejects a connection when the user no longer exists', async () => {
      vi.mocked(userService.getOneById).mockResolvedValue(null as never);

      const socket = makeFakeSocket();
      const next = vi.fn();

      await middleware(socket, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect((next.mock.calls[0]![0] as Error).message).toBe('Session revoked');
    });

    it('allows a connection whose JWT tokenVersion matches the stored user tokenVersion', async () => {
      vi.mocked(jwtService.verify).mockReturnValue({
        userId: 'user-1',
        tokenVersion: 3,
        sessionId: 'session-1',
      });
      vi.mocked(userService.getOneById).mockResolvedValue({
        id: 'user-1',
        tokenVersion: 3,
      } as never);

      const socket = makeFakeSocket();
      const next = vi.fn();

      await middleware(socket, next);

      expect(next).toHaveBeenCalledWith();
      expect(socket.data.userId).toBe('user-1');
      expect(redis.atomicDecrement).not.toHaveBeenCalled();
    });

    it('rejects the connection and rolls back the connection count if the tokenVersion lookup throws', async () => {
      vi.mocked(userService.getOneById).mockRejectedValue(new Error('db down'));

      const socket = makeFakeSocket();
      const next = vi.fn();

      await middleware(socket, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect((next.mock.calls[0]![0] as Error).message).toBe(
        'Internal server error',
      );
      expect(redis.atomicDecrement).toHaveBeenCalledWith(
        'socket:connections:127.0.0.1',
        24 * 60 * 60,
      );
    });
  });

  describe("'disconnect' cleanup", () => {
    it('calls atomicDecrement on the per-IP connection counter and deletes the room-events rate-limit key', async () => {
      const socket = makeFakeSocket({ id: 'socket-42' });

      connectionHandler(socket);
      const disconnectHandler = socket._handlers.get('disconnect');
      expect(disconnectHandler).toBeDefined();

      await disconnectHandler!();

      expect(redis.atomicDecrement).toHaveBeenCalledWith(
        'socket:connections:127.0.0.1',
        24 * 60 * 60,
      );
      expect(redis.del).toHaveBeenCalledWith('socket:room-events:socket-42');
    });
  });

  describe("'room:join' sliding-window rate limiting", () => {
    it('rejects the event and never checks room membership when the rate limit is exceeded', async () => {
      vi.mocked(redis.slidingWindowRateLimit).mockResolvedValue(0);
      const socket = makeFakeSocket({
        id: 'socket-7',
        data: { userId: 'user-1' },
      });

      connectionHandler(socket);
      socket.join.mockClear();

      const roomJoinHandler = socket._handlers.get('room:join');
      expect(roomJoinHandler).toBeDefined();

      await roomJoinHandler!('room-1');

      expect(redis.slidingWindowRateLimit).toHaveBeenCalledWith(
        'socket:room-events:socket-7',
        expect.any(Number),
        10_000,
        20,
        expect.any(String),
        expect.any(Number),
      );
      expect(socket.emit).toHaveBeenCalledWith(
        'room:join:error',
        'Too many requests, slow down',
      );
      expect(roomService.checkIsUserIn).not.toHaveBeenCalled();
      expect(socket.join).not.toHaveBeenCalledWith('room-1');
    });

    it('proceeds to check room membership and joins the room when the rate limit allows the event', async () => {
      vi.mocked(redis.slidingWindowRateLimit).mockResolvedValue(1);
      vi.mocked(roomService.checkIsUserIn).mockResolvedValue(true);
      const socket = makeFakeSocket({
        id: 'socket-8',
        data: { userId: 'user-1' },
      });

      connectionHandler(socket);
      const roomJoinHandler = socket._handlers.get('room:join');

      await roomJoinHandler!('room-1');

      expect(roomService.checkIsUserIn).toHaveBeenCalledWith(
        'user-1',
        'room-1',
      );
      expect(socket.join).toHaveBeenCalledWith('room-1');
      expect(socket.emit).not.toHaveBeenCalledWith(
        'room:join:error',
        expect.any(String),
      );
    });
  });
});
