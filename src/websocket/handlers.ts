import type { WebSocketServer } from 'ws';
import {
  createRoom,
  addUser,
  getRoomById,
  removeUser,
  deleteRoom,
} from '../rooms.js';
import { WebSocketClient, Message, IncomingMessage } from '../types.js';
import {
  broadcastRoomsList,
  sendToClient,
  broadcastNewMessage,
  broadcastToRoom,
} from './broadcast.js';

export function handleCreateRoom(
  client: WebSocketClient,
  data: IncomingMessage,
  wss: WebSocketServer,
) {
  const name = data.name?.trim();

  if (!name) {
    return;
  }

  const room = createRoom(name, client.user);

  console.log(`${client.user.name} created room "${room.name}"`);

  broadcastRoomsList(wss);
}

export function handleJoinRoom(client: WebSocketClient, data: IncomingMessage) {
  const roomId = data.roomId?.trim();

  if (!roomId) {
    return;
  }

  const room = addUser(client, roomId);

  if (!room) {
    return;
  }

  sendToClient(client, {
    type: 'JOINED_ROOM',
    room: {
      id: room.id,
      name: room.name,
      owner: room.owner,
      messages: room.messages,
      membersCount: room.members.size,
    },
  });

  const newMessage: Message = {
    author: 'server',
    time: new Date(),
    text: `${client.user.name} joined`,
  };

  room.messages.push(newMessage);

  broadcastNewMessage(room, newMessage);
}

export function handleSendMessage(
  client: WebSocketClient,
  data: IncomingMessage,
) {
  const roomId = client.user.roomId;

  if (!roomId) {
    return;
  }

  const room = getRoomById(roomId);
  const text = data.text?.trim();

  if (!room || !text) {
    return;
  }

  const newMessage: Message = {
    author: client.user.name ?? 'Unknown',
    time: new Date(),
    text,
  };

  room.messages.push(newMessage);

  broadcastNewMessage(room, newMessage);
}

export function handleLeaveRoom(client: WebSocketClient, wss: WebSocketServer) {
  const roomId = client.user.roomId;

  if (!roomId) {
    return;
  }

  const room = removeUser(client, roomId);

  if (!room) {
    return;
  }

  const newMessage: Message = {
    author: 'server',
    time: new Date(),
    text: `${client.user.name} left the room`,
  };

  room.messages.push(newMessage);

  broadcastNewMessage(room, newMessage);
  broadcastRoomsList(wss);
}

export function handleRenameRoom(
  client: WebSocketClient,
  data: IncomingMessage,
  wss: WebSocketServer,
) {
  const roomId = data.roomId?.trim();
  const newName = data.name?.trim();

  if (!roomId || !newName) {
    return;
  }

  const room = getRoomById(roomId);

  if (!room) {
    return;
  }

  if (room.owner.name !== client.user.name) {
    return;
  }

  if (!room.members.has(client)) {
    return;
  }

  room.name = newName;

  const newMessage: Message = {
    author: 'server',
    time: new Date(),
    text: `Room was renamed to "${room.name}"`,
  };

  room.messages.push(newMessage);

  broadcastToRoom(room, {
    type: 'ROOM_UPDATED',
    room: {
      id: room.id,
      name: room.name,
      owner: room.owner,
      membersCount: room.members.size,
      messages: room.messages,
    },
  });

  broadcastNewMessage(room, newMessage);
  broadcastRoomsList(wss);
}

export function handleDeleteRoom(
  client: WebSocketClient,
  data: IncomingMessage,
  wss: WebSocketServer,
) {
  const roomId = data.roomId?.trim();

  if (!roomId) {
    return;
  }

  const room = getRoomById(roomId);

  if (!room) {
    return;
  }

  if (room.owner.name !== client.user.name) {
    return;
  }

  if (!room.members.has(client)) {
    return;
  }

  const members = deleteRoom(roomId);

  if (!members) {
    return;
  }

  members.forEach((member) => {
    sendToClient(member, {
      type: 'ROOM_DELETED',
      roomId,
    });
  });

  broadcastRoomsList(wss);

  console.log(`${client.user.name} deleted room "${room.name}"`);
}
