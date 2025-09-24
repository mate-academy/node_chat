import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { messageRouter } from './routes/message.route.js';
import { WebSocketServer } from 'ws';
import { messageService } from './services/message.service.js';
import { client } from './utils/db.js';
import { roomRouter } from './routes/room.route.js';
import { roomService } from './services/room.service.js';

const app = express();
const PORT = process.env.PORT || 3005;

await client.sync({ alter: true });

app.use(cors());
app.use(express.json());
app.use(messageRouter);
app.use(roomRouter);

const server = app.listen(PORT);
const wss = new WebSocketServer({ server });

const connectionRooms = new Map();

function broadcastToRoom(message, roomId) {
  wss.clients.forEach((cl) => {
    if (cl.readyState === cl.OPEN && connectionRooms.get(cl) === roomId) {
      cl.send(JSON.stringify(message));
    }
  });
}

wss.on('connection', (connection) => {
  connection.on('message', async (messageBuffer) => {
    try {
      const messageData = JSON.parse(messageBuffer.toString());
      
      if (messageData.type === 'set-username') {
        connection.username = messageData.username;
        return;
      }
      
      if (messageData.type === 'join') {
        const id = messageData.roomId;
        
        try {
          const rooms = await roomService.getAll();
          const roomExists = rooms.some(room => room.id === id);
          
          if (!roomExists) {
            connection.send(JSON.stringify({
              type: 'join-error',
              error: 'Room not found'
            }));
            return;
          }
          
          connectionRooms.set(connection, id);
          
          connection.send(JSON.stringify({
            type: 'join-success',
            roomId: id,
            message: 'Successfully joined room'
          }));
          
          const history = await messageService.getByRoom(id);
          connection.send(JSON.stringify({
            type: 'history',
            messages: history.reverse()
          }));
        } catch (error) {
          connection.send(JSON.stringify({
            type: 'join-error',
            error: 'Failed to join room'
          }));
        }
        return;
      }
      
      const newMessage = await messageService.add(messageData);
      const roomId = connectionRooms.get(connection);
      if (roomId) {
        broadcastToRoom(newMessage, roomId);
      }
    } catch (error) {
      connection.send(
        JSON.stringify({ error: 'Invalid message format or server error.' }),
      );
    }
  });
  
  connection.on('close', () => {
    connectionRooms.delete(connection);
  });
});
