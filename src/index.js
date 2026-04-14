import express from 'express';
import { createServer } from 'http';
import WebSocket, { WebSocketServer } from 'ws';

const PORT = 3000;
const app = express();

app.get('/', (req, res) => {
  res.sendFile('index.html', { root: './public' });
});

app.use(express.static('./public'));

const server = createServer(app);
const wss = new WebSocketServer({ server });

const clients = new Map();
const rooms = new Map();

function broadcastRooms() {
  const roomsArray = Array.from(rooms.values()).map((room) => ({
    id: room.id,
    name: room.name,
  }));

  clients.forEach((clientData, clientSocket) => {
    if (clientSocket.readyState === WebSocket.OPEN) {
      clientSocket.send(
        JSON.stringify({
          type: 'rooms_list',
          payload: roomsArray,
        }),
      );
    }
  });
}

rooms.set('general', {
  id: 'general',
  name: 'General',
  messages: [],
});

wss.on('connection', (socket) => {
  clients.set(socket, {
    username: null,
    roomId: 'general',
  });
  broadcastRooms();

  const generalRoom = rooms.get('general');

  socket.send(
    JSON.stringify({
      type: 'room_history',
      payload: generalRoom.messages,
    }),
  );

  socket.on('message', (message) => {
    try {
      const parsedMessage = JSON.parse(message.toString());

      if (parsedMessage.type === 'set_username') {
        const clientData = clients.get(socket);

        clientData.username = parsedMessage.payload.username;
      }

      if (parsedMessage.type === 'send_message') {
        const clientData = clients.get(socket);
        const room = rooms.get(clientData.roomId);

        if (!clientData.username) {
          return;
        }

        if (!room) {
          return;
        }

        const chatMessage = {
          author: clientData.username,
          time: new Date().toLocaleTimeString(),
          text: parsedMessage.payload.text,
        };

        room.messages.push(chatMessage);

        clients.forEach((otherClientData, clientSocket) => {
          if (
            otherClientData.roomId === clientData.roomId &&
            clientSocket.readyState === WebSocket.OPEN
          ) {
            clientSocket.send(
              JSON.stringify({
                type: 'new_message',
                payload: chatMessage,
              }),
            );
          }
        });
      }

      if (parsedMessage.type === 'create_room') {
        const roomName = parsedMessage.payload.name.trim();

        if (!roomName) {
          return;
        }

        const roomId = Date.now().toString();

        const newRoom = {
          id: roomId,
          name: roomName,
          messages: [],
        };

        rooms.set(roomId, newRoom);
        broadcastRooms();
      }

      if (parsedMessage.type === 'join_room') {
        const clientData = clients.get(socket);
        const roomId = parsedMessage.payload.roomId;

        if (!rooms.has(roomId)) {
          return;
        }

        clientData.roomId = roomId;

        const room = rooms.get(roomId);

        socket.send(
          JSON.stringify({
            type: 'room_history',
            payload: room.messages,
          }),
        );
      }

      if (parsedMessage.type === 'rename_room') {
        const { roomId, newName } = parsedMessage.payload;
        const room = rooms.get(roomId);

        if (!room) {
          return;
        }

        const trimmedName = newName.trim();

        if (!trimmedName) {
          return;
        }

        room.name = trimmedName;

        broadcastRooms();
      }

      if (parsedMessage.type === 'delete_room') {
        const { roomId } = parsedMessage.payload;

        if (roomId === 'general') {
          return;
        }

        if (!rooms.has(roomId)) {
          return;
        }

        rooms.delete(roomId);

        clients.forEach((clientData, clientSocket) => {
          if (clientData.roomId === roomId) {
            clientData.roomId = 'general';

            const defaultRoom = rooms.get('general');

            clientSocket.send(
              JSON.stringify({
                type: 'room_history',
                payload: defaultRoom.messages,
              }),
            );
          }
        });

        broadcastRooms();
      }
    } catch (error) {
      socket.send(
        JSON.stringify({
          type: 'error',
          payload: {
            message: 'Something went wrong',
          },
        }),
      );
    }
  });

  socket.on('close', () => {
    clients.delete(socket);
  });
});

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server started on http://localhost:${PORT}`);
});
