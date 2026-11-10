const API_URL = "http://localhost:3005";

export const WS_URL = API_URL.replace(/^http/, "ws");

const request = async (path, options = {}) => {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
};

export const chatApi = {
  getRooms: () => request("/room"),

  createRoom: (name) =>
    request("/room", {
      method: "POST",
      body: JSON.stringify({ name }),
    }),

  renameRoom: (id, name) =>
    request(`/room/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ name }),
    }),

  deleteRoom: (id) =>
    request(`/room/${id}`, {
      method: "DELETE",
    }),

  getMessages: (roomId, signal) =>
    request(`/room/${roomId}/messages`, { signal }),

  sendMessage: (roomId, author, text) =>
    request(`/room/${roomId}/messages`, {
      method: "POST",
      body: JSON.stringify({ author, text }),
    }),

  updateMessage: (roomId, messageId, text) =>
    request(`/room/${roomId}/messages/${messageId}`, {
      method: "PATCH",
      body: JSON.stringify({ text }),
    }),

  deleteMessage: (roomId, messageId) =>
    request(`/room/${roomId}/messages/${messageId}`, {
      method: "DELETE",
    }),
};
