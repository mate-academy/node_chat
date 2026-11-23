import type { WebSocketServer } from 'ws';
import { getRooms } from '../rooms.js';
import { IncomingMessage, WebSocketClient } from '../types.js';
import { sendToClient, broadcastRoomsList } from './broadcast.js';
import {
  handleCreateRoom,
  handleJoinRoom,
  handleSendMessage,
  handleLeaveRoom,
  handleRenameRoom,
  handleDeleteRoom,
} from './handlers.js';

export function handleMessage(
  client: WebSocketClient,
  data: Buffer,
  wss: WebSocketServer,
) {
  let message: IncomingMessage;

  try {
    message = JSON.parse(data.toString()) as IncomingMessage;
  } catch {
    console.error('Invalid WebSocket message');
    return;
  }

  if (!client.user.name) {
    const name = message.name?.trim();

    if (!name) {
      return;
    }

    client.user = {
      name,
      roomId: null,
    };

    console.log(`${client.user.name} connected`);

    sendToClient(client, {
      type: 'ROOMS_LIST',
      rooms: getRooms(),
    });

    return;
  }

  switch (message.type) {
    case 'CREATE_ROOM':
      handleCreateRoom(client, message, wss);
      break;

    case 'JOIN_ROOM':
      handleJoinRoom(client, message);
      broadcastRoomsList(wss);
      break;

    case 'SEND_MESSAGE':
      handleSendMessage(client, message);
      break;

    case 'LEAVE_ROOM':
      handleLeaveRoom(client, wss);
      break;

    case 'RENAME_ROOM':
      handleRenameRoom(client, message, wss);
      break;

    case 'DELETE_ROOM':
      handleDeleteRoom(client, message, wss);
      break;

    default:
      console.log(`Unknown WebSocket event: ${message.type}`);
  }
}
