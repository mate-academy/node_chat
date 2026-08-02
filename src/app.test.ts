import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// app.ts has real side effects on import (opens an HTTP server, attaches
// socket.io, and transitively connects to Redis/Postgres via prisma.ts and
// redis.ts), so it can't be exercised end-to-end here the way the rest of
// the test suite mocks its way around dependencies. Instead, these tests
// pin the specific invariant the dotenv fix relies on: env vars must be
// loaded before *any* module-level `process.env.*` read happens.
//
// Note this is intentionally redundant across multiple files rather than
// relying solely on app.ts: several test files (checks.test.ts,
// auth.middleware.test.ts, error.middleware.test.ts, catchError.test.ts)
// import prisma.ts (via services/checks.ts) directly, without ever going
// through app.ts and without stubbing DATABASE_URL themselves the way
// jwt.test.ts/google.test.ts/email.test.ts stub their own required vars.
// dotenv/config is idempotent, so having it in both app.ts (for the
// production entrypoint) and in prisma.ts/redis.ts (for every other import
// path, including tests) is deliberate defense-in-depth, not duplication
// to clean up.
const __dirname = path.dirname(fileURLToPath(import.meta.url));

function readSource(relativePath: string): string {
  return readFileSync(path.join(__dirname, relativePath), 'utf-8');
}

/** First non-blank, non-comment line of a TS source file. */
function firstStatement(source: string): string {
  const lines = source.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed === '' || trimmed.startsWith('//')) continue;
    return trimmed;
  }
  return '';
}

describe('dotenv load order (app.ts entrypoint)', () => {
  it('loads dotenv/config as the very first statement in app.ts', () => {
    const source = readSource('app.ts');

    expect(firstStatement(source)).toBe("import 'dotenv/config';");
  });

  it('does not read any environment variable before the dotenv import in app.ts', () => {
    const source = readSource('app.ts');
    const dotenvIndex = source.indexOf("import 'dotenv/config'");
    const firstEnvRead = source.indexOf('process.env');

    expect(dotenvIndex).toBeGreaterThanOrEqual(0);
    // -1 (no process.env usage at all) is fine too; what must never happen
    // is a process.env read appearing before the dotenv import.
    if (firstEnvRead !== -1) {
      expect(firstEnvRead).toBeGreaterThan(dotenvIndex);
    }
  });

  // Regression guard: prisma.ts and redis.ts are import paths in their own
  // right (many test files reach them without ever loading app.ts), so
  // removing their own dotenv/config import — as a previous version of
  // this fix mistakenly did — reintroduces "DATABASE_URL/REDIS_URL is not
  // set" crashes for any test suite that doesn't happen to go through
  // app.ts first.
  it('lib/prisma.ts loads dotenv/config itself, independent of app.ts', () => {
    const source = readSource('lib/prisma.ts');

    expect(firstStatement(source)).toBe("import 'dotenv/config';");
  });

  it('lib/redis.ts loads dotenv/config itself, independent of app.ts', () => {
    const source = readSource('lib/redis.ts');

    expect(firstStatement(source)).toBe("import 'dotenv/config';");
  });
});
