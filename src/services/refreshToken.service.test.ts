import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createHash } from 'node:crypto';
import { refreshTokenService } from './refreshToken.service.js';
import { prisma } from '../lib/prisma.js';
import { redis } from '../lib/redis.js';
import type { RefreshToken } from '../generated/prisma/client.js';

// The grace-period retry cache lives in Redis (see refreshToken.service.ts),
// so we fake just a get/set/del pair backed by an in-memory Map — enough to
// exercise the idempotent-retry behavior without a live connection.
const redisStore = new Map<string, string>();

vi.mock('../lib/redis.js', () => ({
  redis: {
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
  },
}));

vi.mock('../lib/prisma.js', () => ({
  prisma: {
    refreshToken: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
      findMany: vi.fn(),
    },
    // No longer used by verifyAndRotate (the read-then-write step was
    // replaced by an atomic updateMany), but kept in the mock in case
    // other paths still rely on it.
    $transaction: vi.fn(async (ops: Promise<unknown>[]) => Promise.all(ops)),
  },
}));

// In-memory fake store backing the mocked prisma.refreshToken methods.
// This lets us assert on real persistence semantics (e.g. that two rows
// created for the same userId both continue to exist), rather than just
// asserting on call arguments.
let rows: RefreshToken[] = [];
let nextId = 1;

function hash(raw: string) {
  return createHash('sha256').update(raw).digest('hex');
}

function resetStore() {
  rows = [];
  nextId = 1;
}

describe('refreshTokenService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetStore();
    redisStore.clear();

    vi.mocked(redis.get).mockImplementation(
      (async (key: string) =>
        redisStore.get(key) ?? null) as unknown as typeof redis.get,
    );
    vi.mocked(redis.set).mockImplementation((async (
      key: string,
      value: string,
    ) => {
      redisStore.set(key, value);
      return 'OK';
    }) as unknown as typeof redis.set);
    vi.mocked(redis.del).mockImplementation((async (key: string) => {
      const existed = redisStore.delete(key);
      return existed ? 1 : 0;
    }) as unknown as typeof redis.del);

    vi.mocked(prisma.refreshToken.create).mockImplementation((async ({
      data,
    }: {
      data: Partial<RefreshToken> & {
        userId: string;
        tokenHash: string;
        expiredTime: Date;
        familyId: string;
      };
    }) => {
      const row = {
        id: `token-${nextId++}`,
        tokenHash: data.tokenHash,
        userId: data.userId,
        expiredTime: data.expiredTime,
        userAgent: data.userAgent ?? null,
        ipAddress:
          (data as unknown as { ipAddress?: string }).ipAddress ?? null,
        deviceLabel: data.deviceLabel ?? null,
        lastUsedAt: data.lastUsedAt ?? null,
        // A token is "unused" until it's rotated away, so it starts as
        // null rather than undefined — the service checks this field to
        // tell a fresh token apart from one that's already been spent.
        familyId: data.familyId,
        usedAt: (data as unknown as { usedAt?: Date }).usedAt ?? null,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as unknown as RefreshToken;
      rows.push(row);
      return row;
    }) as unknown as typeof prisma.refreshToken.create);

    vi.mocked(prisma.refreshToken.findUnique).mockImplementation((async ({
      where,
    }: {
      where: { tokenHash?: string; id?: string };
    }) => {
      if (where.tokenHash) {
        return rows.find((r) => r.tokenHash === where.tokenHash) ?? null;
      }
      if (where.id) {
        return rows.find((r) => r.id === where.id) ?? null;
      }
      return null;
    }) as unknown as typeof prisma.refreshToken.findUnique);

    vi.mocked(prisma.refreshToken.update).mockImplementation((async ({
      where,
      data,
    }: {
      where: { id: string };
      data: Partial<RefreshToken>;
    }) => {
      const row = rows.find((r) => r.id === where.id);
      if (!row) throw new Error('Record not found');
      Object.assign(row, data);
      return row;
    }) as unknown as typeof prisma.refreshToken.update);

    // Mirrors the real DB semantics that verifyAndRotate now relies on for
    // its atomic "claim" step: only rows matching tokenHash AND usedAt
    // null AND expiredTime > now get updated, and the returned count
    // tells the caller whether it won the race. Everything else (already
    // used, expired, or nonexistent) yields count: 0, same as a real
    // conditional UPDATE would touch zero rows.
    vi.mocked(prisma.refreshToken.updateMany).mockImplementation((async ({
      where,
      data,
    }: {
      where: {
        tokenHash?: string;
        usedAt?: null;
        expiredTime?: { gt?: Date };
      };
      data: Partial<RefreshToken>;
    }) => {
      const matches = rows.filter((r) => {
        if (where.tokenHash !== undefined && r.tokenHash !== where.tokenHash) {
          return false;
        }
        if (where.usedAt === null && r.usedAt !== null) {
          return false;
        }
        const gt = where.expiredTime?.gt;
        if (gt !== undefined && !(r.expiredTime > gt)) {
          return false;
        }
        return true;
      });

      for (const row of matches) {
        Object.assign(row, data);
      }

      return { count: matches.length };
    }) as unknown as typeof prisma.refreshToken.updateMany);

    vi.mocked(prisma.refreshToken.delete).mockImplementation((async ({
      where,
    }: {
      where: { id: string };
    }) => {
      const index = rows.findIndex((r) => r.id === where.id);
      if (index === -1) throw new Error('Record not found');
      const [removed] = rows.splice(index, 1);
      return removed;
    }) as unknown as typeof prisma.refreshToken.delete);

    // deleteMany is used for two different scopes: wiping every session
    // for a user (revokeAllForUser), and wiping just one token family
    // (reuse detection) — the mock needs to honor whichever was passed.
    vi.mocked(prisma.refreshToken.deleteMany).mockImplementation((async ({
      where,
    }: {
      where: { userId?: string; familyId?: string };
    }) => {
      const before = rows.length;
      rows = rows.filter((r) => {
        if (where.familyId !== undefined) return r.familyId !== where.familyId;
        if (where.userId !== undefined) return r.userId !== where.userId;
        return true;
      });
      return { count: before - rows.length };
    }) as unknown as typeof prisma.refreshToken.deleteMany);
  });

  describe('create', () => {
    it('supports multiple concurrent sessions: two calls for the same userId both persist as separate rows', async () => {
      await refreshTokenService.create('user-a');
      await refreshTokenService.create('user-b');

      expect(rows).toHaveLength(2);
      expect(rows.map((r) => r.userId).sort()).toEqual(['user-a', 'user-b']);

      // Now call twice with the same userId (e.g. logging in from two devices).
      await refreshTokenService.create('user-a');
      await refreshTokenService.create('user-a');

      const userARows = rows.filter((r) => r.userId === 'user-a');
      // Regression check: both sessions for user-a must coexist, not replace one another.
      expect(userARows).toHaveLength(3);
      expect(rows).toHaveLength(4);

      // All tokenHashes should be distinct (no collisions/overwrites).
      const hashes = new Set(rows.map((r) => r.tokenHash));
      expect(hashes.size).toBe(rows.length);
    });

    it('assigns a fresh familyId with usedAt null for a brand-new login', async () => {
      await refreshTokenService.create('user-1');

      expect(rows).toHaveLength(1);
      expect(rows[0]?.familyId).toBeTruthy();
      expect(rows[0]?.usedAt).toBeNull();
    });

    it('returns the familyId alongside the raw token', async () => {
      const { rawToken, familyId } = await refreshTokenService.create('user-1');

      expect(rawToken).toBeTruthy();
      expect(familyId).toBeTruthy();
      expect(rows[0]?.familyId).toBe(familyId);
    });

    // Regression test: familyId used to be derived by re-hashing the raw
    // token with the same algorithm as tokenHash, making the two
    // coincidentally equal on first login. familyId and tokenHash are
    // separate concepts and must be generated independently.
    it('generates familyId independently of the token hash', async () => {
      const { rawToken, familyId } = await refreshTokenService.create('user-1');

      expect(familyId).not.toBe(hash(rawToken));
    });
  });

  describe('verifyAndRotate', () => {
    it('rotates a valid token: returns a new raw token, and the old tokenHash is no longer findable', async () => {
      const { rawToken } = await refreshTokenService.create('user-1');
      const oldTokenHash = hash(rawToken);
      expect(rows.find((r) => r.tokenHash === oldTokenHash)).toBeDefined();

      const result = await refreshTokenService.verifyAndRotate(rawToken);

      expect(result).not.toBeNull();
      expect(result).not.toBe('expired');
      expect(result).not.toBe('reused');
      expect(typeof result).toBe('object');
      expect((result as { rawToken: string }).rawToken).not.toBe(rawToken);

      // Old token row must still exist (now marked as spent), but its hash
      // is no longer usable to authenticate — only the new one is.
      const oldRow = rows.find((r) => r.tokenHash === oldTokenHash);
      expect(oldRow).toBeDefined();
      expect(oldRow?.usedAt).not.toBeNull();

      // New token hash must be findable and verifiable.
      const { rawToken: newRawToken } = result as { rawToken: string };
      const newTokenHash = hash(newRawToken);
      const newRow = rows.find((r) => r.tokenHash === newTokenHash);
      expect(newRow).toBeDefined();
      expect(newRow?.usedAt).toBeNull();

      // Both rows belong to the same family.
      expect(newRow?.familyId).toBe(oldRow?.familyId);
    });

    it('returns the familyId of the rotated token', async () => {
      const { rawToken, familyId } = await refreshTokenService.create('user-1');

      const result = await refreshTokenService.verifyAndRotate(rawToken);

      expect((result as { familyId: string }).familyId).toBe(familyId);
    });

    it("returns 'expired' for a token whose expiredTime is in the past", async () => {
      const { rawToken } = await refreshTokenService.create('user-1');
      const tokenHash = hash(rawToken);
      const row = rows.find((r) => r.tokenHash === tokenHash);
      if (!row) throw new Error('setup failed: token row not found');
      row.expiredTime = new Date(Date.now() - 1000);

      const result = await refreshTokenService.verifyAndRotate(rawToken);

      expect(result).toBe('expired');
      // Expired token must not be rotated/consumed, and must not have been
      // claimed (usedAt must still be null) by the atomic updateMany step.
      const stillThere = rows.find((r) => r.tokenHash === tokenHash);
      expect(stillThere).toBeDefined();
      expect(stillThere?.usedAt).toBeNull();
    });

    it('returns null for a token that does not exist', async () => {
      const result = await refreshTokenService.verifyAndRotate(
        'non-existent-raw-token',
      );

      expect(result).toBeNull();
    });
  });

  describe('revoke', () => {
    it('deletes only the specified row by id, leaving other rows for the same user intact', async () => {
      await refreshTokenService.create('user-1');
      await refreshTokenService.create('user-1');
      expect(rows).toHaveLength(2);

      const [first, second] = rows;

      await refreshTokenService.revoke(first?.id ?? '');

      expect(rows).toHaveLength(1);
      expect(rows[0]?.id).toBe(second?.id);
    });
  });

  describe('revokeAllForUser', () => {
    it('deletes all rows for the given userId without affecting other users', async () => {
      await refreshTokenService.create('user-1');
      await refreshTokenService.create('user-1');
      await refreshTokenService.create('user-2');
      expect(rows).toHaveLength(3);

      await refreshTokenService.revokeAllForUser('user-1');

      expect(rows).toHaveLength(1);
      expect(rows.every((r) => r.userId === 'user-2')).toBe(true);
    });
  });

  describe('reuse detection', () => {
    it('detects reuse after grace period and revokes the whole family', async () => {
      const { rawToken } = await refreshTokenService.create('user-1');
      const rotated = await refreshTokenService.verifyAndRotate(rawToken);
      expect(rotated).not.toBeNull();

      // simulate grace period having passed
      const spentRow = rows.find((r) => r.usedAt !== null);
      if (spentRow) spentRow.usedAt = new Date(Date.now() - 20_000);

      const result = await refreshTokenService.verifyAndRotate(rawToken);

      expect(result).toBe('reused');
      // entire family gone, including the freshly-rotated token
      expect(rows).toHaveLength(0);
    });

    it('does not affect other users/families when revoking a reused family', async () => {
      const { rawToken } = await refreshTokenService.create('user-1');
      await refreshTokenService.create('user-2'); // unrelated family
      await refreshTokenService.verifyAndRotate(rawToken);

      const spentRow = rows.find(
        (r) => r.userId === 'user-1' && r.usedAt !== null,
      );
      if (spentRow) spentRow.usedAt = new Date(Date.now() - 20_000);

      const result = await refreshTokenService.verifyAndRotate(rawToken);

      expect(result).toBe('reused');
      // user-1's family is gone, user-2's row is untouched
      expect(rows).toHaveLength(1);
      expect(rows[0]?.userId).toBe('user-2');
    });

    it('tolerates reuse within the grace period by replaying the same child token (treats as retry)', async () => {
      const { rawToken } = await refreshTokenService.create('user-1');
      const first = await refreshTokenService.verifyAndRotate(rawToken);

      // immediately retry with the same (now-spent) rawToken
      const second = await refreshTokenService.verifyAndRotate(rawToken);

      expect(second).not.toBe('reused');
      expect(second).not.toBeNull();

      // Regression check for the reuse-detection bypass: a grace-period
      // retry must return the SAME child token that was already minted,
      // not mint an independent new one.
      expect((second as { rawToken: string }).rawToken).toBe(
        (first as { rawToken: string }).rawToken,
      );

      // And it must not create a second child row in the family.
      expect(rows).toHaveLength(2); // original spent parent + single child
    });

    it('does not reset usedAt on the spent parent when a grace-period retry occurs', async () => {
      const { rawToken } = await refreshTokenService.create('user-1');
      await refreshTokenService.verifyAndRotate(rawToken);

      const spentRow = rows.find((r) => r.usedAt !== null);
      const usedAtAfterFirstRotation = spentRow?.usedAt;
      expect(usedAtAfterFirstRotation).toBeDefined();

      await refreshTokenService.verifyAndRotate(rawToken);

      const spentRowAfterRetry = rows.find((r) => r.usedAt !== null);
      expect(spentRowAfterRetry?.usedAt).toEqual(usedAtAfterFirstRotation);
    });

    it('fails closed (revokes the family) if a grace-period retry has no cached rotation result', async () => {
      const { rawToken } = await refreshTokenService.create('user-1');
      await refreshTokenService.verifyAndRotate(rawToken);

      // simulate the retry cache having expired/being unavailable
      redisStore.clear();

      const result = await refreshTokenService.verifyAndRotate(rawToken);

      expect(result).toBe('reused');
      expect(rows).toHaveLength(0);
    });
  });
});
