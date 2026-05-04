import type { Message, Room } from "./../types/chat";

const API_URL = "http://localhost:3000";

const getRooms = async (): Promise<Room[]> => {
  const response = await fetch(`${API_URL}/rooms`);
  if (!response.ok) {
    throw new Error("Failed to fetch rooms");
  }
  const data = await response.json();
  return data;
};

const getRoomMessages = async (roomId: string): Promise<Message[]> => {
  const response = await fetch(`${API_URL}/rooms/${roomId}/messages`);
  if (!response.ok) {
    throw new Error("Failed to fetch messages");
  }
  const data = await response.json();
  return data;
};

const sendMessage = async (
  text: string,
  author: string,
  roomId: string,
): Promise<void> => {
  const response = await fetch(`${API_URL}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text,
      author,
      roomId,
    }),
  });
  if (!response.ok) {
    throw new Error("Failed to send message");
  }
  console.log("Message sent:", text);
};

const createRoom = async (name: string): Promise<Room> => {
  const response = await fetch(`${API_URL}/rooms`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name }),
  });

  if (!response.ok) {
    throw new Error("Failed to create room");
  }

  const data = await response.json();
  return data;
};

const renameRoom = async (roomId: string, name: string): Promise<Room> => {
  const response = await fetch(`${API_URL}/rooms/${roomId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name }),
  });

  if (!response.ok) {
    throw new Error("Failed to rename room");
  }

  const data = await response.json();
  return data;
};

const deleteRoom = async (roomId: string): Promise<void> => {
  const response = await fetch(`${API_URL}/rooms/${roomId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete room");
  }
};

export const chatApi = {
  getRoomMessages,
  sendMessage,
  getRooms,
  createRoom,
  renameRoom,
  deleteRoom,
};
