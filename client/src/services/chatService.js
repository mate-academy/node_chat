const API_URL = 'http://localhost:3008';

const request = async (url, options = {}) => {
  const response = await fetch(url, options);

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || 'Something went wrong');
  }

  return data;
};

export const createUser = async (username) => {
  return request(`${API_URL}/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username }),
  });
};

export const getRooms = async (userId) => {
  return request(`${API_URL}/rooms?userId=${encodeURIComponent(userId)}`);
};

export const createRoom = async (username, userId) => {
  return request(`${API_URL}/rooms`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, userId }),
  });
};

export const renameRoom = async (roomId, username) => {
  return request(`${API_URL}/rooms/${roomId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username }),
  });
};

export const joinRoom = async (roomId, username) => {
  return request(`${API_URL}/rooms/${roomId}/join`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username }),
  });
};

export const leaveRoom = async (roomId, username) => {
  return request(`${API_URL}/rooms/${roomId}/leave`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username }),
  });
};

export const deleteRoom = async (roomId) => {
  const response = await fetch(`${API_URL}/rooms/${roomId}`, {
    method: 'DELETE',
  });

  if (!response.ok && response.status !== 204) {
    const data = await response.json().catch(() => null);

    throw new Error(data?.message || 'Failed to delete room');
  }
};

export const getRoomMessages = async (roomId) => {
  return request(`${API_URL}/rooms/${roomId}/messages`);
};
