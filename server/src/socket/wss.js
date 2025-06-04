import { WebSocketServer } from 'ws';
import { messageEmitter } from '../events/messageEmitter.js';
import { roomsService } from '../service/roomsService.js';
import { usersService } from '../service/usersService.js';
import { roomsEmitter } from '../events/roomsEmitter.js';

export function initWebSocket(server) {
  const wss = new WebSocketServer({ server });

  const clientRooms = new Map();

  wss.on('connection', async (client) => {
    console.log('Client connected');

    client.on('message', async (data) => {
      let parsed;

      try {
        parsed = JSON.parse(data);
      } catch {
        client.send(JSON.stringify({ error: 'Invalid JSON' }));

        return client.close();
      }

      if (parsed.type === 'join') {
        try {
          const currentRoom = await roomsService.getById(parsed.roomId);

          if (!currentRoom) {
            client.send(JSON.stringify({ error: 'Room not found' }));

            return client.close();
          }

          const currentUser = await usersService.getOne(parsed.name);

          if (!currentUser) {
            client.send(JSON.stringify({ error: 'User not found' }));

            return client.close();
          }

          const userHasAccess = currentRoom.users.includes(parsed.name);

          if (!userHasAccess) {
            client.send(
              JSON.stringify({ error: 'Access denied to this room' }),
            );

            return client.close();
          }

          clientRooms.set(client, parsed.roomId);
          client.userName = parsed.name;
          client.roomId = parsed.roomId;

          console.log(`Client ${parsed.name} joined room: ${parsed.roomId}`);

          const allMessages = await roomsService.getMessages(parsed.roomId);
          const roomInfo = await roomsService.getById(parsed.roomId);

          client.send(
            JSON.stringify({
              type: 'start_connect',
              payload: allMessages,
              info: roomInfo,
            }),
          );
        } catch (err) {
          console.error('Error in join logic:', err.message);
          client.send(JSON.stringify({ error: 'Internal server error' }));

          return client.close();
        }
      } else if (parsed.type === 'message') {
        const isClient = clientRooms.has(client);

        if (!isClient) {
          client.send('Client does not have access to socket');

          return client.close();
        }

        if (!parsed.user || !parsed.roomId || !parsed.text) {
          client.send('Invalid data request');

          return client.close();
        }

        try {
          const newMessage = await roomsService.addMessage(
            parsed.roomId,
            parsed.user,
            parsed.text,
          );

          if (newMessage) {
            const emitterMessage = {
              ...newMessage,
              roomId: parsed.roomId,
            };

            messageEmitter.emit('message', emitterMessage);
          }
        } catch (err) {
          console.error(`catch error soket add message: ${err.message}`);
          client.send(JSON.stringify({ error: 'Server error' }));
        }
      }
    });

    client.on('close', () => {
      clientRooms.delete(client);
      console.log('Client disconnected');
    });
  });

  messageEmitter.on('message', (newMessage) => {
    for (const client of wss.clients) {
      if (
        client.readyState === 1 &&
        clientRooms.get(client) === newMessage.roomId
      ) {
        client.send(JSON.stringify({ type: 'message', payload: newMessage }));
      }
    }
  });

  roomsEmitter.on('deleted', (deletedId) => {
    for (const client of wss.clients) {
      if (clientRooms.get(client) === deletedId) {
        client.close();
      }
    }
  });

  roomsEmitter.on('changed', (changedRoom) => {
    console.log(`EMITTER REACTION | ID: ${changedRoom.id}`)

    for (const client of wss.clients) {
      if (clientRooms.get(client) === changedRoom.id) {
        console.log('SOCKET SEND')
        client.send(JSON.stringify({ type: 'changed', payload: changedRoom }));
      }
    }
  });
}
