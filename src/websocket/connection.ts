import type { WebSocketServer } from 'ws';
import { Message, WebSocketClient } from '../types.js';
import { removeUser } from '../rooms.js';
import { broadcastNewMessage, broadcastRoomsList } from './broadcast.js';
import { handleMessage } from './routeHandler.js';

export function initializeWebSocket(wss: WebSocketServer) {
  wss.on('connection', (client: WebSocketClient) => {
    console.log('A new client connected');

    client.user = {
      name: null,
      roomId: null,
    };

    client.on('message', (data) => {
      handleMessage(client, data as Buffer, wss);
    });

    client.on('close', () => {
      const username = client.user.name ?? 'Unknown user';
      const roomId = client.user.roomId;

      console.log(`${username} disconnected`);

      if (roomId) {
        const room = removeUser(client, roomId);

        if (room) {
          const newMessage: Message = {
            author: 'server',
            time: new Date(),
            text: `${username} disconnected`,
          };

          room.messages.push(newMessage);
          broadcastNewMessage(room, newMessage);
          broadcastRoomsList(wss);
        }
      }
    });
  });
}
