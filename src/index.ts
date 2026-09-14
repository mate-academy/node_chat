import express from 'express';
import cors from 'cors';
import { WebSocketServer, WebSocket } from 'ws';
import ChatRooms from './ChatRooms.js';
import { Rooms } from './types/Room.js';

export const GENERAL = 'General';

const PORT = process.env.PORT || 3000;
const app = express();

const rooms = new ChatRooms();

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
  res.send('Chat server is running!');
});

const server = app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server is running on PORT on http://localhost:${PORT}`);
});

interface CustomWebSocket extends WebSocket {
  id: string;
  userId: string;
}

const connectedUsers: Record<string, CustomWebSocket> = {};

const wss = new WebSocketServer({ server });

function sendMessages() {
  Object.values(connectedUsers).forEach((userSocket) => {
    if (userSocket.readyState === WebSocket.OPEN) {
      userSocket.send(
        JSON.stringify({
          messages: rooms.userMessages(userRooms[userSocket.userId] || []),
          rooms: rooms.titles,
        }),
      );
    }
  });
}

const userRooms: Record<string, Rooms> = {};

wss.on('connection', (ws) => {
  const socket = ws as CustomWebSocket;

  socket.id = crypto.randomUUID();
  socket.userId = '';

  socket.on('message', (message) => {
    const data = JSON.parse(message.toString());

    if (!data?.type) {
      return;
    }

    switch (data.type) {
      case 'login': {
        if (!data.userName || data.userName.trim() === '') {
          return;
        }

        socket.userId = data.userName;
        connectedUsers[socket.id] = socket;

        /* eslint-disable-next-line no-console */
        console.log(`User ${socket.userId} connected with ID: ${socket.id}`);

        sendMessages();

        return;
      }

      case 'rooms': {
        const { command, room, newTitle } = data;

        switch (command) {
          case 'add': {
            if (rooms.addRoom(room)) {
              sendMessages();
            }

            return;
          }

          case 'delete': {
            if (room !== undefined) {
              if (rooms.deleteRoom(room)) {
                sendMessages();
              }
            }

            return;
          }

          case 'rename': {
            if (rooms.renameRoom(room, newTitle)) {
              sendMessages();
            }

            return;
          }

          case 'join': {
            if (!socket.userId) {
              return;
            }

            if (userRooms[socket.userId] === undefined) {
              userRooms[socket.userId] = [room];
            } else if (!userRooms[socket.userId].includes(room)) {
              userRooms[socket.userId].push(room);
            }

            sendMessages();

            return;
          }

          default: {
            return;
          }
        }
      }

      case 'message': {
        const time = new Date().toISOString();

        if (rooms.addMessage(data.room, { ...data, time })) {
          sendMessages();
        }
      }
    }
  });

  // Optional: Handle client disconnection
  socket.on('close', () => {
    delete connectedUsers[socket.id];
    // eslint-disable-next-line no-console
    console.log('Client disconnected');
  });
});
