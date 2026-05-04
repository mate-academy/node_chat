import type { LoginResponse } from './types';

export const loginErrors = {
  duplicateUsername: 'duplicate-username',
  failed: 'login-failed',
  unreachable: 'server-unreachable',
} as const;

async function request<T>(input: RequestInfo | URL, init?: RequestInit) {
  let response: Response;

  try {
    response = await fetch(input, init);
  } catch {
    throw new Error(loginErrors.unreachable);
  }

  return response as Response & { json(): Promise<T> };
}

export async function login(username: string): Promise<LoginResponse> {
  const response = await request<LoginResponse>('/api/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username }),
  });

  if (response.status === 409) {
    throw new Error(loginErrors.duplicateUsername);
  }

  if (!response.ok) {
    throw new Error(loginErrors.failed);
  }

  return response.json();
}
