
import type { Room, Message } from '../types';

const API_URL = 'http://localhost:3000/api';

export const getRooms = async (): Promise<Room[]> => {
  const response = await fetch(`${API_URL}/rooms`);

  if (!response.ok) {
    throw new Error('Failed to fetch rooms');
  }

  return response.json();
};

export const createRoom = async (name: string): Promise<Room> => {
  const response = await fetch(`${API_URL}/rooms`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name }),
  });

  if (!response.ok) {
    throw new Error('Failed to create room');
  }

  return response.json();
};

export const renameRoom = async (
  roomId: number,
  name: string,
): Promise<Room> => {
  const response = await fetch(`${API_URL}/rooms/${roomId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name }),
  });

  if (!response.ok) {
    throw new Error('Failed to rename room');
  }

  return response.json();
};

export const deleteRoom = async (roomId: number): Promise<void> => {
  const response = await fetch(`${API_URL}/rooms/${roomId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete room');
  }
};

export const getMessages = async (
  roomId: number,
): Promise<Message[]> => {
  const response = await fetch(`${API_URL}/rooms/${roomId}/messages`);

  if (!response.ok) {
    throw new Error('Failed to fetch messages');
  }

  return response.json();
};
