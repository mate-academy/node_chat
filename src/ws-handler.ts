import type { WebSocket } from 'ws';
import { store } from './store.js';
import {
  clientMessageSchema,
  loginSchema,
  createRoomSchema,
  joinRoomSchema,
  renameRoomSchema,
  deleteRoomSchema,
  messageSchema,
} from './schemas.js';
import type { Message, ServerMessage } from './types.js';

function send(ws: WebSocket, message: ServerMessage): void {
  if (ws.readyState === ws.OPEN) {
    ws.send(JSON.stringify(message));
  }
}

function broadcast(
  roomId: string,
  message: ServerMessage,
  exclude?: WebSocket,
): void {
  for (const { ws } of store.getClientsInRoom(roomId)) {
    if (ws !== exclude) {
      send(ws, message);
    }
  }
}

function broadcastAll(message: ServerMessage, exclude?: WebSocket): void {
  for (const [ws] of store.getAllClients()) {
    if (ws !== exclude) {
      send(ws, message);
    }
  }
}

function sendRoomList(ws: WebSocket): void {
  const rooms = store.getAllRooms().map((r) => ({ id: r.id, name: r.name }));

  send(ws, { type: 'roomList', payload: { rooms } });
}

function sendError(ws: WebSocket, message: string): void {
  send(ws, { type: 'error', payload: { message } });
}

export function handleConnection(ws: WebSocket): void {
  store.addClient(ws);
  sendRoomList(ws);
}

export function handleDisconnect(ws: WebSocket): void {
  const client = store.getClient(ws);
  const roomId = store.removeClient(ws);

  if (roomId && client?.username) {
    broadcast(roomId, {
      type: 'userLeft',
      payload: { username: client.username },
    });
  }
}

export function handleMessage(ws: WebSocket, data: string): void {
  let parsed;

  try {
    parsed = JSON.parse(data);
  } catch {
    sendError(ws, 'Invalid JSON');

    return;
  }

  const result = clientMessageSchema.safeParse(parsed);

  if (!result.success) {
    sendError(ws, 'Invalid message format');

    return;
  }

  const { type, payload } = result.data;
  const client = store.getClient(ws);

  if (!client) {
    return;
  }

  switch (type) {
    case 'login':
      handleLogin(ws, payload);
      break;
    case 'createRoom':
      handleCreateRoom(ws, payload);
      break;
    case 'joinRoom':
      handleJoinRoom(ws, payload);
      break;
    case 'leaveRoom':
      handleLeaveRoom(ws);
      break;
    case 'renameRoom':
      handleRenameRoom(ws, payload);
      break;
    case 'deleteRoom':
      handleDeleteRoom(ws, payload);
      break;
    case 'message':
      handleChatMessage(ws, payload);
      break;
  }
}

function handleLogin(ws: WebSocket, payload: unknown): void {
  const result = loginSchema.safeParse(payload);

  if (!result.success) {
    sendError(ws, 'Invalid username');

    return;
  }

  store.setClientUsername(ws, result.data.username);
  send(ws, { type: 'loginOk', payload: { username: result.data.username } });
}

function handleCreateRoom(ws: WebSocket, payload: unknown): void {
  const client = store.getClient(ws);

  if (!client?.username) {
    sendError(ws, 'Not logged in');

    return;
  }

  const result = createRoomSchema.safeParse(payload);

  if (!result.success) {
    sendError(ws, 'Invalid room name');

    return;
  }

  const room = store.createRoom(result.data.name);

  broadcastAll({
    type: 'roomCreated',
    payload: { roomId: room.id, name: room.name },
  });
}

function handleJoinRoom(ws: WebSocket, payload: unknown): void {
  const client = store.getClient(ws);

  if (!client?.username) {
    sendError(ws, 'Not logged in');

    return;
  }

  const result = joinRoomSchema.safeParse(payload);

  if (!result.success) {
    sendError(ws, 'Invalid room ID');

    return;
  }

  const room = store.getRoom(result.data.roomId);

  if (!room) {
    sendError(ws, 'Room not found');

    return;
  }

  // Leave current room if in one
  if (client.roomId) {
    broadcast(
      client.roomId,
      {
        type: 'userLeft',
        payload: { username: client.username },
      },
      ws,
    );
  }

  store.setClientRoom(ws, room.id);

  send(ws, {
    type: 'joined',
    payload: { roomId: room.id, name: room.name, messages: room.messages },
  });

  broadcast(
    room.id,
    {
      type: 'userJoined',
      payload: { username: client.username },
    },
    ws,
  );
}

function handleLeaveRoom(ws: WebSocket): void {
  const client = store.getClient(ws);

  if (!client?.username || !client.roomId) {
    return;
  }

  const roomId = client.roomId;

  store.setClientRoom(ws, null);

  broadcast(roomId, {
    type: 'userLeft',
    payload: { username: client.username },
  });
  sendRoomList(ws);
}

function handleRenameRoom(ws: WebSocket, payload: unknown): void {
  const client = store.getClient(ws);

  if (!client?.username) {
    sendError(ws, 'Not logged in');

    return;
  }

  const result = renameRoomSchema.safeParse(payload);

  if (!result.success) {
    sendError(ws, 'Invalid rename data');

    return;
  }

  const success = store.renameRoom(result.data.roomId, result.data.name);

  if (!success) {
    sendError(ws, 'Room not found');

    return;
  }

  broadcastAll({
    type: 'roomRenamed',
    payload: { roomId: result.data.roomId, name: result.data.name },
  });
}

function handleDeleteRoom(ws: WebSocket, payload: unknown): void {
  const client = store.getClient(ws);

  if (!client?.username) {
    sendError(ws, 'Not logged in');

    return;
  }

  const result = deleteRoomSchema.safeParse(payload);

  if (!result.success) {
    sendError(ws, 'Invalid room ID');

    return;
  }

  const roomId = result.data.roomId;

  if (roomId === 'general') {
    sendError(ws, 'Cannot delete default room');

    return;
  }

  const usersInRoom = store.getClientsInRoom(roomId);

  if (usersInRoom.length > 0) {
    sendError(ws, 'Cannot delete room with users in it');

    return;
  }

  const success = store.deleteRoom(roomId);

  if (!success) {
    sendError(ws, 'Room not found');

    return;
  }

  broadcastAll({ type: 'roomDeleted', payload: { roomId } });
}

function handleChatMessage(ws: WebSocket, payload: unknown): void {
  const client = store.getClient(ws);

  if (!client?.username) {
    sendError(ws, 'Not logged in');

    return;
  }

  if (!client.roomId) {
    sendError(ws, 'Not in a room');

    return;
  }

  const result = messageSchema.safeParse(payload);

  if (!result.success) {
    sendError(ws, 'Invalid message');

    return;
  }

  const message: Message = {
    author: client.username,
    time: new Date().toISOString(),
    text: result.data.text,
  };

  store.addMessage(client.roomId, message);
  broadcast(client.roomId, { type: 'message', payload: message });
}
