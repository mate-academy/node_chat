import type {
  ChatProfile,
  ChatProfileSummary,
  ChatRoom,
  ChatRoomDetails,
  MessagesPage,
  RoomInvitation,
  RoomMember,
} from '@/types/chat';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api';

type ApiError = {
  message?: string | string[];
};

export type CreateChatProfileInput = {
  displayName: string;
  email?: string;
  phone?: string;
};

export async function createChatProfile(
  input: CreateChatProfileInput,
): Promise<ChatProfile> {
  const response = await fetch(`${API_URL}/chat-profiles`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const error = (await response.json()) as ApiError;
    const message = Array.isArray(error.message)
      ? error.message.join(', ')
      : error.message;

    throw new Error(message ?? 'Failed to open chat profile');
  }

  return response.json() as Promise<ChatProfile>;
}

export async function getRooms(userId: string): Promise<ChatRoom[]> {
  const search = new URLSearchParams({
    userId,
  });

  const response = await fetch(`${API_URL}/rooms?${search}`);

  if (!response.ok) {
    throw new Error('Failed to load rooms');
  }

  return response.json() as Promise<ChatRoom[]>;
}

type GetMessagesOptions = {
  before?: string;
  limit?: number;
};

export async function getMessages(
  roomId: string,
  userId: string,
  options: GetMessagesOptions = {},
): Promise<MessagesPage> {
  const search = new URLSearchParams({
    userId,
    limit: String(options.limit ?? 30),
  });

  if (options.before) {
    search.set('before', options.before);
  }

  const response = await fetch(`${API_URL}/rooms/${roomId}/messages?${search}`);

  if (!response.ok) {
    const error = (await response.json()) as ApiError;
    const message = Array.isArray(error.message)
      ? error.message.join(', ')
      : error.message;

    throw new Error(message ?? 'Failed to load messages');
  }

  return response.json() as Promise<MessagesPage>;
}

export async function joinRoom(
  roomId: string,
  userId: string,
): Promise<RoomMember> {
  const response = await fetch(`${API_URL}/rooms/${roomId}/join`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userId,
    }),
  });

  if (!response.ok) {
    const error = (await response.json()) as ApiError;
    const message = Array.isArray(error.message)
      ? error.message.join(', ')
      : error.message;

    throw new Error(message ?? 'Failed to join room');
  }

  return response.json() as Promise<RoomMember>;
}

type CreateRoomInput = {
  name: string;
  description?: string;
  visibility: 'PUBLIC' | 'PRIVATE';
  ownerId: string;
};

export async function createRoom(
  input: CreateRoomInput,
): Promise<{ id: string }> {
  const response = await fetch(`${API_URL}/rooms`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const error = (await response.json()) as ApiError;
    const message = Array.isArray(error.message)
      ? error.message.join(', ')
      : error.message;

    throw new Error(message ?? 'Failed to create room');
  }

  return response.json() as Promise<{ id: string }>;
}
type UpdateRoomInput = {
  requesterId: string;
  name: string;
  description?: string;
  visibility: 'PUBLIC' | 'PRIVATE';
};

export async function updateRoom(roomId: string, input: UpdateRoomInput) {
  const response = await fetch(`${API_URL}/rooms/${roomId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error('Failed to update room');
  }
}

export async function deleteRoom(roomId: string, requesterId: string) {
  const response = await fetch(`${API_URL}/rooms/${roomId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      requesterId,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to delete room');
  }
}

export async function leaveRoom(roomId: string, userId: string) {
  const response = await fetch(`${API_URL}/rooms/${roomId}/members/${userId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to leave room');
  }
}

export async function searchChatProfiles(
  search: string,
): Promise<ChatProfileSummary[]> {
  const query = new URLSearchParams({
    search,
  });

  const response = await fetch(`${API_URL}/chat-profiles?${query}`);

  if (!response.ok) {
    throw new Error('Failed to search users');
  }

  return response.json() as Promise<ChatProfileSummary[]>;
}

export async function createRoomInvitation(
  roomId: string,
  invitedById: string,
  recipientId: string,
) {
  const response = await fetch(`${API_URL}/rooms/${roomId}/invitations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      invitedById,
      recipientId,
    }),
  });

  if (!response.ok) {
    const error = (await response.json()) as ApiError;
    const message = Array.isArray(error.message)
      ? error.message.join(', ')
      : error.message;

    throw new Error(message ?? 'Failed to invite user');
  }
}

export async function getPendingInvitations(
  recipientId: string,
): Promise<RoomInvitation[]> {
  const query = new URLSearchParams({
    recipientId,
  });

  const response = await fetch(`${API_URL}/room-invitations?${query}`);

  if (!response.ok) {
    throw new Error('Failed to load invitations');
  }

  return response.json() as Promise<RoomInvitation[]>;
}

export async function respondToInvitation(
  invitationId: string,
  recipientId: string,
  action: 'accept' | 'decline',
) {
  const response = await fetch(
    `${API_URL}/room-invitations/${invitationId}/${action}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        recipientId,
      }),
    },
  );

  if (!response.ok) {
    const error = (await response.json()) as ApiError;
    const message = Array.isArray(error.message)
      ? error.message.join(', ')
      : error.message;

    throw new Error(message ?? `Failed to ${action} invitation`);
  }
}
export async function getRoomDetails(
  roomId: string,
  userId: string,
): Promise<ChatRoomDetails> {
  const query = new URLSearchParams({
    userId,
  });

  const response = await fetch(`${API_URL}/rooms/${roomId}?${query}`);

  if (!response.ok) {
    throw new Error('Failed to load room members');
  }

  return response.json() as Promise<ChatRoomDetails>;
}

export async function updateChatProfile(
  profileId: string,
  displayName: string,
): Promise<ChatProfile> {
  const response = await fetch(`${API_URL}/chat-profiles/${profileId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      displayName,
    }),
  });

  if (!response.ok) {
    const error = (await response.json()) as ApiError;
    const message = Array.isArray(error.message)
      ? error.message.join(', ')
      : error.message;

    throw new Error(message ?? 'Failed to update profile');
  }

  return response.json() as Promise<ChatProfile>;
}
