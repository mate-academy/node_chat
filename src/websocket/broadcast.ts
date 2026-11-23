import { WebSocket, WebSocketServer } from 'ws';
import { getRooms } from '../rooms.js';
import { WebSocketClient, Room, Message } from '../types.js';

export function sendToClient(client: WebSocketClient, data: object) {
  if (client.readyState !== WebSocket.OPEN) {
    return;
  }

  client.send(JSON.stringify(data));
}

export function broadcastToRoom(room: Room, data: object) {
  room.members.forEach((client) => {
    sendToClient(client, data);
  });
}

export function broadcastRoomsList(wss: WebSocketServer) {
  wss.clients.forEach((client) => {
    sendToClient(client as WebSocketClient, {
      type: 'ROOMS_LIST',
      rooms: getRooms(),
    });
  });
}

export function broadcastNewMessage(room: Room, message: Message) {
  broadcastToRoom(room, {
    type: 'NEW_MESSAGE',
    message,
  });
}
