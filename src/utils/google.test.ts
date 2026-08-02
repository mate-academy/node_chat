import { describe, it, expect, beforeEach, vi } from 'vitest';

// google.ts constructs an OAuth2Client and validates GOOGLE_CLIENT_ID at
// module-load time, so both the mock and the env default must be in place
// *before* importing it (same pattern as jwt.test.ts / email.test.ts).
// Mocking OAuth2Client entirely also guarantees no real network call is
// ever made — the constructor never talks to Google, and `verifyIdToken`
// is our own vi.fn() rather than the library's HTTP-calling implementation.
const verifyIdToken = vi.fn();

vi.mock('google-auth-library', () => {
  class OAuth2Client {
    verifyIdToken = verifyIdToken;
  }
  return { OAuth2Client: vi.fn(OAuth2Client) };
});

process.env.GOOGLE_CLIENT_ID ??= 'test-google-client-id';

const { googleService } = await import('./google.js');
const { OAuth2Client } = await import('google-auth-library');

function makeGooglePayload(overrides: Record<string, unknown> = {}) {
  return {
    sub: 'google-user-123',
    email: 'user@example.com',
    email_verified: true,
    name: 'Test User',
    ...overrides,
  };
}

describe('googleService.verify', () => {
  beforeEach(() => {
    verifyIdToken.mockReset();
  });

  it('constructs a single OAuth2Client and never touches the network directly', () => {
    // The mocked constructor proves google.ts talks only to our fake
    // client, not the real google-auth-library HTTP client.
    expect(OAuth2Client).toHaveBeenCalledTimes(1);
  });

  it('verifies against the client_id from GOOGLE_CLIENT_ID', async () => {
    const payload = makeGooglePayload();
    verifyIdToken.mockResolvedValue({ getPayload: () => payload });

    await googleService.verify('valid-id-token');

    expect(verifyIdToken).toHaveBeenCalledWith({
      idToken: 'valid-id-token',
      audience: 'test-google-client-id',
    });
  });

  it('returns the expected payload shape for a valid token: email, sub, name, email_verified', async () => {
    const payload = makeGooglePayload({
      sub: '1234567890',
      email: 'jane.doe@example.com',
      email_verified: true,
      name: 'Jane Doe',
    });
    verifyIdToken.mockResolvedValue({ getPayload: () => payload });

    const result = await googleService.verify('valid-id-token');

    expect(result).toMatchObject({
      sub: '1234567890',
      email: 'jane.doe@example.com',
      email_verified: true,
      name: 'Jane Doe',
    });
  });

  it('returns the payload object exactly as getPayload() produced it, unmodified', async () => {
    const payload = makeGooglePayload();
    const getPayload = vi.fn(() => payload);
    verifyIdToken.mockResolvedValue({ getPayload });

    const result = await googleService.verify('valid-id-token');

    expect(getPayload).toHaveBeenCalledTimes(1);
    expect(result).toBe(payload);
  });

  it('returns null (rather than throwing) when the ticket has no payload', async () => {
    verifyIdToken.mockResolvedValue({ getPayload: () => undefined });

    const result = await googleService.verify('token-with-no-payload');

    expect(result).toBeNull();
  });

  it('rejects when the underlying client rejects an invalid token', async () => {
    verifyIdToken.mockRejectedValue(
      new Error('Wrong number of segments in token'),
    );

    await expect(googleService.verify('not-a-jwt')).rejects.toThrow(
      'Wrong number of segments in token',
    );
  });

  it('rejects when the underlying client rejects an expired token', async () => {
    verifyIdToken.mockRejectedValue(new Error('Token used too late'));

    await expect(googleService.verify('expired-token')).rejects.toThrow(
      'Token used too late',
    );
  });

  it('rejects when the token audience does not match GOOGLE_CLIENT_ID', async () => {
    verifyIdToken.mockRejectedValue(
      new Error('Wrong recipient, payload audience != requiredAudience'),
    );

    await expect(
      googleService.verify('token-for-another-client'),
    ).rejects.toThrow(/audience/i);
  });

  it('propagates the exact error instance rather than swallowing or wrapping it', async () => {
    const originalError = new Error('Invalid token signature');
    verifyIdToken.mockRejectedValue(originalError);

    await expect(googleService.verify('tampered-token')).rejects.toBe(
      originalError,
    );
  });

  it('never resolves to a payload when verification fails', async () => {
    verifyIdToken.mockRejectedValue(new Error('invalid_token'));

    let resolved: unknown = 'not-yet-settled';
    try {
      resolved = await googleService.verify('bad-token');
    } catch {
      // expected
    }

    expect(resolved).toBe('not-yet-settled');
  });
});
