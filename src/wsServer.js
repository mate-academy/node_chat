import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import {
  createRoom,
  getRooms,
  renameRoom,
  deleteRoom,
  addMessage,
  getMessages,
} from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const server = createServer((req, res) => {
  if (req.url === '/') {
    const html = readFileSync(join(__dirname, 'client', 'index.html'), 'utf8');
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
  } else if (req.url === '/App.jsx') {
    const jsx = readFileSync(join(__dirname, 'client', 'App.jsx'), 'utf8');
    res.writeHead(200, { 'Content-Type': 'application/javascript' });
    res.end(jsx);
  } else if (req.url === '/App.css') {
    const css = readFileSync(join(__dirname, 'client', 'App.css'), 'utf8');
    res.writeHead(200, { 'Content-Type': 'text/css' });
    res.end(css);
  } else {
    res.writeHead(404);
    res.end();
  }
});

const wss = new WebSocketServer({ server });

const clients = new Map();

async function broadcastRoomList() {
  const rooms = await getRooms();
  const message = JSON.stringify({ type: 'rooms', rooms });
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

wss.on('connection', (ws) => {
  console.log('New client connected');
  const clientId = Date.now().toString();
  clients.set(clientId, ws);

  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);
      console.log('Received message from client:', data);

      switch (data.type) {
        case 'createRoom':
          const room = await createRoom(data.name);
          await broadcastRoomList();
          break;

        case 'renameRoom':
          const renamedRoom = await renameRoom(data.roomId, data.newName);
          await broadcastRoomList();
          break;

        case 'deleteRoom':
          await deleteRoom(data.roomId);
          await broadcastRoomList();
          break;

        case 'joinRoom':
          console.log('Client joining room:', data.roomId);
          const messages = await getMessages(data.roomId);
          console.log('Sending room history:', messages);
          ws.send(JSON.stringify({ type: 'roomHistory', messages }));
          break;

        case 'message':
          console.log('Received message:', data);
          if (!data.roomId || !data.author || !data.text) {
            throw new Error('Missing required fields: roomId, author, or text');
          }
          const savedMessage = await addMessage(
            data.roomId,
            data.author,
            data.text,
          );
          console.log('Saved message:', savedMessage);

          // Broadcast the message to all clients in the same room
          wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(
                JSON.stringify({
                  type: 'message',
                  roomId: data.roomId,
                  message: savedMessage,
                }),
              );
            }
          });
          break;

        default:
          console.warn('Unknown message type:', data.type);
      }
    } catch (error) {
      console.error('Error handling message:', error);
      ws.send(JSON.stringify({ type: 'error', message: error.message }));
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
    clients.delete(clientId);
  });

  // Send initial room list
  broadcastRoomList();
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
