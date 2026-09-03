const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export const WS_URL = API_BASE_URL.replace(/^http/, 'ws');

async function request(path, options) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));

    throw new Error(body.message || `Request failed: ${res.status}`);
  }

  if (res.status === 204) {
    return null;
  }

  return res.json();
}

export const api = {
  getRooms: () => request('/api/rooms'),
  createRoom: (name) =>
    request('/api/rooms', { method: 'POST', body: JSON.stringify({ name }) }),
  renameRoom: (id, name) =>
    request(`/api/rooms/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ name }),
    }),
  deleteRoom: (id) => request(`/api/rooms/${id}`, { method: 'DELETE' }),
  getMessages: (roomId) => request(`/api/rooms/${roomId}/messages`),
  createMessage: (roomId, author, text) =>
    request(`/api/rooms/${roomId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ author, text }),
    }),
};
