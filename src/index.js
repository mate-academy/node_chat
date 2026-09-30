/* eslint-disable no-console */
import express from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import cors from 'cors';

const PORT = process.env.PORT || 3000;
const app = express();

app.use(cors());
app.use(express.json());

const server = createServer(app);
const wss = new WebSocketServer({ server });

const rooms = {
  general: {
    name: 'General',
    messages: [],
  },
};

const clients = new Map();

function broadcastRoomList() {
  const roomList = Object.keys(rooms).map((id) => ({
    id,
    name: rooms[id].name,
  }));

  const payload = JSON.stringify({ type: 'ROOMS_UPDATE', rooms: roomList });

  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  }
}

function broadcastToRoom(roomId, data) {
  const payload = JSON.stringify(data);

  for (const [client, meta] of clients.entries()) {
    if (meta.currentRoom === roomId && client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  }
}

wss.on('connection', (ws) => {
  clients.set(ws, { username: null, currentRoom: null });

  ws.send(
    JSON.stringify({
      type: 'ROOMS_UPDATE',
      rooms: Object.keys(rooms).map((id) => ({ id, name: rooms[id].name })),
    }),
  );

  ws.on('message', (messageRaw) => {
    try {
      const data = JSON.parse(messageRaw);

      switch (data.type) {
        case 'SET_USERNAME': {
          const clientMeta = clients.get(ws);

          if (clientMeta) {
            clientMeta.username = data.username;
          }
          break;
        }

        case 'JOIN_ROOM': {
          const { roomId } = data;

          if (!rooms[roomId]) {
            return;
          }

          const clientMeta = clients.get(ws);

          if (clientMeta) {
            clientMeta.currentRoom = roomId;
          }

          ws.send(
            JSON.stringify({
              type: 'ROOM_JOINED',
              roomId,
              roomName: rooms[roomId].name,
              messages: rooms[roomId].messages,
            }),
          );
          break;
        }

        case 'CREATE_ROOM': {
          const roomId = 'room_' + Date.now();

          rooms[roomId] = {
            name: data.name,
            messages: [],
          };
          broadcastRoomList();
          break;
        }

        case 'RENAME_ROOM': {
          const { roomId, newName } = data;

          if (rooms[roomId]) {
            rooms[roomId].name = newName;
            broadcastRoomList();

            broadcastToRoom(roomId, {
              type: 'ROOM_RENAMED',
              roomId,
              newName,
            });
          }
          break;
        }

        case 'DELETE_ROOM': {
          const { roomId } = data;

          if (rooms[roomId]) {
            delete rooms[roomId];

            for (const [client, meta] of clients.entries()) {
              if (meta.currentRoom === roomId) {
                meta.currentRoom = null;

                if (client.readyState === WebSocket.OPEN) {
                  client.send(JSON.stringify({ type: 'ROOM_DELETED', roomId }));
                }
              }
            }
            broadcastRoomList();
          }
          break;
        }

        case 'SEND_MESSAGE': {
          const clientMeta = clients.get(ws);

          if (!clientMeta) {
            return;
          }

          const { currentRoom, username } = clientMeta;

          if (!currentRoom || !rooms[currentRoom] || !username) {
            return;
          }

          const newMessage = {
            id: 'msg_' + Date.now() + '_' + Math.random(),
            author: username,
            text: data.text,
            time: new Date().toISOString(),
          };

          rooms[currentRoom].messages.push(newMessage);

          broadcastToRoom(currentRoom, {
            type: 'NEW_MESSAGE',
            message: newMessage,
          });
          break;
        }
        default:
          break;
      }
    } catch (err) {
      console.error('Помилка:', err);
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
  });
});

server.listen(PORT, () => {
  console.log('Server running at http://localhost:' + PORT + '/');
});
