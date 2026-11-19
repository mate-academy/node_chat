import type { Message, Room, User } from './types';

const API_URL = import.meta.env.VITE_API_URL;

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(response.status, data?.error ?? 'Request failed');
  }

  return data as T;
}

export const api = {
  createUser: (username: string) =>
    request<User>('/users', {
      method: 'POST',
      body: JSON.stringify({ username }),
    }),

  getUser: (username: string) =>
    request<User>(`/users/${encodeURIComponent(username)}`),

  getRooms: () => request<Room[]>('/rooms'),

  createRoom: (name: string) =>
    request<Room>('/rooms', { method: 'POST', body: JSON.stringify({ name }) }),

  renameRoom: (id: string, name: string) =>
    request<Room>(`/rooms/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ name }),
    }),

  deleteRoom: (id: string) =>
    request<void>(`/rooms/${id}`, { method: 'DELETE' }),

  getMessages: (roomId: string) =>
    request<Message[]>(`/rooms/${roomId}/messages`),
};
