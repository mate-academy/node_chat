import WebSocket, { WebSocketServer } from 'ws';
import { rooms, users } from '../store/store.js';
import { roomEmitter } from '../routes/room.router.js';
import type { IncomingMessage, Server } from 'node:http';
import { messageEmitter } from '../routes/message.router.js';

export function createWebSocket(server: Server) {
  const wws = new WebSocketServer({ server });

  wws.on('connection', (socket: WebSocket, req: IncomingMessage) => {
    const url = new URL(req.url || '', 'http://localhost');
    const userId = url.searchParams.get('userId');

    const user = users.find((item) => item.id === userId);

    if (!user) {
      socket.close(1008, 'Unauthorized');

      return;
    }

    socket.userId = user.id;
  });

  roomEmitter.on('createRoom', (newRoom) => {
    for (const client of wws.clients) {
      if (
        newRoom.ownerId === client.userId ||
        newRoom.usersId.find((id) => id === client.userId)
      ) {
        client.send(JSON.stringify({ type: 'room:post', payload: newRoom }));
      }
    }
  });

  roomEmitter.on('deleteRoom', (deletedRoom) => {
    for (const client of wws.clients) {
      if (
        deletedRoom.ownerId === client.userId ||
        deletedRoom.usersId.find((id) => id === client.userId)
      ) {
        client.send(
          JSON.stringify({ type: 'room:delete', payload: deletedRoom.id }),
        );
      }
    }
  });

  roomEmitter.on('updateRoom', (deletedRoom) => {
    for (const client of wws.clients) {
      if (
        deletedRoom.ownerId === client.userId ||
        deletedRoom.usersId.find((id) => id === client.userId)
      ) {
        client.send(
          JSON.stringify({ type: 'room:rename', payload: deletedRoom }),
        );
      }
    }
  });

  roomEmitter.on('addMember', (updatedRoom) => {
    for (const client of wws.clients) {
      if (
        updatedRoom.ownerId === client.userId ||
        updatedRoom.usersId.find((id) => id === client.userId)
      ) {
        client.send(
          JSON.stringify({ type: 'room:addMember', payload: updatedRoom }),
        );
      }
    }
  });

  roomEmitter.on('deleteMember', (userId, updatedRoom) => {
    for (const client of wws.clients) {
      if (
        updatedRoom.ownerId === client.userId ||
        updatedRoom.usersId.find((id) => id === client.userId) ||
        userId === client.userId
      ) {
        client.send(
          JSON.stringify({ type: 'room:deleteMember', payload: updatedRoom }),
        );
      }
    }
  });

  messageEmitter.on('createMessage', (newMessage) => {
    const foundRoom = rooms.find((room) => room.id === newMessage.roomId);

    if (!foundRoom) {
      return;
    }

    for (const client of wws.clients) {
      if (
        foundRoom.ownerId === client.userId ||
        foundRoom.usersId.find((id) => id === client.userId)
      ) {
        client.send(
          JSON.stringify({ type: 'message:post', payload: { newMessage } }),
        );
      }
    }
  });
}
