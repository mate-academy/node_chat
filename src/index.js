'use strict';

const express = require('express');
const cors = require('cors');
const { WebSocketServer } = require('ws');
const path = require('path');
const { createServer } = require('http');

const PORT = process.env.PORT || 3004;
const app = express();
const server = createServer(app);

app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, '../public')));

const wss = new WebSocketServer({ server });

const generateId = () => Math.random().toString(36).substring(2, 11);

// State
const rooms = {
  general: {
    id: 'general',
    name: 'General',
    messages: [],
  },
};

// Map<WebSocket, { username: string, roomId: string }>
const clients = new Map();

function broadcast(roomId, message, excludeWs = null) {
  const messageStr = JSON.stringify(message);

  for (const [clientWs, clientData] of clients.entries()) {
    if (
      clientData.roomId === roomId &&
      clientWs !== excludeWs &&
      clientWs.readyState === 1 /* OPEN */
    ) {
      clientWs.send(messageStr);
    }
  }
}

function broadcastAll(message) {
  const messageStr = JSON.stringify(message);

  for (const [clientWs] of clients.entries()) {
    if (clientWs.readyState === 1 /* OPEN */) {
      clientWs.send(messageStr);
    }
  }
}

function getRoomsList() {
  return Object.values(rooms).map((r) => ({ id: r.id, name: r.name }));
}

wss.on('connection', (ws) => {
  clients.set(ws, { username: null, roomId: null });

  // Send initial room list
  ws.send(JSON.stringify({ type: 'ROOMS_LIST', payload: getRoomsList() }));

  ws.on('message', (messageRaw) => {
    try {
      const message = JSON.parse(messageRaw);
      const clientData = clients.get(ws);

      switch (message.type) {
        case 'SET_USERNAME':
          clientData.username = message.payload;
          break;

        case 'CREATE_ROOM': {
          const roomId = generateId();

          rooms[roomId] = { id: roomId, name: message.payload, messages: [] };
          broadcastAll({ type: 'ROOMS_LIST', payload: getRoomsList() });
          break;
        }

        case 'RENAME_ROOM': {
          const { roomId, newName } = message.payload;

          if (rooms[roomId]) {
            rooms[roomId].name = newName;
            broadcastAll({ type: 'ROOMS_LIST', payload: getRoomsList() });
          }
          break;
        }

        case 'DELETE_ROOM': {
          const roomId = message.payload;

          if (rooms[roomId]) {
            delete rooms[roomId];
            broadcastAll({ type: 'ROOMS_LIST', payload: getRoomsList() });

            // Evict users from the deleted room
            for (const [cWs, cData] of clients.entries()) {
              if (cData.roomId === roomId) {
                cData.roomId = null;

                cWs.send(
                  JSON.stringify({ type: 'ROOM_DELETED', payload: roomId }),
                );
              }
            }
          }
          break;
        }

        case 'JOIN_ROOM': {
          const roomId = message.payload;

          if (rooms[roomId]) {
            clientData.roomId = roomId;

            ws.send(
              JSON.stringify({
                type: 'ROOM_STATE',
                payload: {
                  roomId,
                  name: rooms[roomId].name,
                  messages: rooms[roomId].messages,
                },
              }),
            );
          }
          break;
        }

        case 'SEND_MESSAGE': {
          const roomId = clientData.roomId;

          if (roomId && rooms[roomId]) {
            const chatMsg = {
              id: generateId(),
              author: clientData.username || 'Anonymous',
              text: message.payload,
              time: new Date().toISOString(),
            };

            rooms[roomId].messages.push(chatMsg);

            broadcast(roomId, {
              type: 'NEW_MESSAGE',
              payload: { roomId, message: chatMsg },
            });
          }
          break;
        }
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Error handling message:', e);
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
  });
});

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running at http://localhost:${PORT}/`);
});
