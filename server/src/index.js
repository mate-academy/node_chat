/* eslint-disable no-console */
import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import { EventEmitter } from 'events';
import { WebSocketServer } from 'ws';
import { WebSocket } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import { connectDB, syncDB } from './utils/db.js';
import { Room } from './models/room.js';
import { Message } from './models/message.js';
import { error } from 'console';

const app = express();

connectDB();
syncDB();

app.use(cors());
app.use(express.json());

const emitter = new EventEmitter();
const rooms = new Map();
const messages = [];

let connectionsCount = 0;

app.post('/rooms', async (req, res) => {
  const { roomName } = req.body;
  try {
    const existingRoom = await Room.findOne({ where: { roomName } });
    if (existingRoom) {
      return res.status(409).json({ error: 'Room already exists' });
    }
    const newRoom = await Room.create({ roomName });
    res.status(201).json({ roomId: newRoom.id, roomName: newRoom.roomName });
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/rooms', async (req, res) => {
  try {
    const rooms = await Room.findAll({ attributes: ['id', 'roomName'] });
    res.status(200).json(rooms.map(room => ({ roomId: room.id, roomName: room.roomName })))
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/messages', async (req, res) => {
  const { text, roomId, username } = req.body;

  try {
    const room = await Room.findByPk(roomId);
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    const message = await Message.create({
      text,
      username,
      RoomId: roomId,
    });

    res.status(201).json({ success: true, message });
  } catch (error) {
    console.error('Error adding message:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/connections-count', (req, res) => {
  res.status(200).json({ connectionsCount });
});

app.get('/messages', (req, res) => {
  res.status(405).send("Method Not Allowed");
});

app.get('/rooms/:roomId/messages', async (req, res) => {
  const { roomId } = req.params;

  try {
    const messages = await Message.findAll({
      where: { RoomId: roomId },
      order: [['createdAt', 'ASC']],
    });

    res.json(messages);
  } catch (error) {
    console.error("Error loading messages:", error);
    res.status(500).send("Error loading messages.");
  }
});

const PORT = 3005;
const server = app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

const wss = new WebSocketServer({ server });

wss.on('connection', (connection) => {
  connectionsCount++;
  console.log('connection');
  console.log(connectionsCount);

  connection.on('open', async () => {
    const { roomId } = connection;

    if (!roomId) {
      connection.send(JSON.stringify({ error: 'Room is required' }));
      return;
    }

    try {
      const room = await Room.findByPk(roomId, { include: { model: Message }});

    if (!room) {
      connection.send(JSON.stringify({ error: `Room with ID ${roomId} not found` }));
      return;
    }
    const messages = room.Messages.map(msg => ({
      username: msg.username,
      text: msg.text,
      createdAt: msg.createdAt
    }));

      connection.send(JSON.stringify({ history: messages }));
    } catch (error) {
      console.error('Error loading room messages:', error);
      connection.send(JSON.stringify({ error: 'Failed to load room messages' }));
    }
  })

  connection.on('message', async (message) => {
    let parsedMessage;
    try {
      parsedMessage = JSON.parse(message);

      if (parsedMessage.action === 'joinRoom') {
        const { roomId, roomName, username } = parsedMessage;

        if (!roomId) {
          connection.send(JSON.stringify({ error: 'Room ID is required' }));
          return;
        }

        const room = await Room.findByPk(roomId);
        if (!room) {
          connection.send(JSON.stringify({ error: `Room with ID ${roomId} not found` }));
          return;
        }

        connection.roomId = roomId;
        connection.roomName = roomName;
        connection.username = username;

        // connection.send(JSON.stringify({ history: room.Messages }));
        connection.send(JSON.stringify({ success: true, roomId, roomName }));

        wss.clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN && client.roomId === roomId) {
            client.send(JSON.stringify({
              newUser: username,
              message: `${username} has joined the room.`,
            }));
         }
        });
      } else if (parsedMessage.action === 'sendMessage') {
        const { roomId, username, messageText } = parsedMessage;

        if (!roomId || !username || !messageText) {
          connection.send(JSON.stringify({ error: 'Message or roomId is missing' }));
          return;
        }

        const room = await Room.findByPk(roomId);
        if (!room) {
          connection.send(JSON.stringify({ error: 'Room not found' }));
          return;
        }

        const newMessage = await Message.create({
          text: messageText,
          username,
          RoomId: roomId,
          // timestamp: new Date().toISOString(),
          // timestamp: data.timestamp || new Date().toISOString(),
        });

        wss.clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN && client.roomId === roomId) {
            client.send(JSON.stringify({ newMessage: { username, text: messageText, time: new Date().toISOString() } }));
          }
        });
      }
    } catch (error) {
      console.error('Error processing WebSocket message:', error);
      connection.send(JSON.stringify({ error: 'Invalid message format' }));
    }
  });

  connection.on('close', () => {
    connectionsCount--;
    if (connection.roomId) {
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN && client.roomId === connection.roomId) {
          client.send(JSON.stringify({
            message: `${connection.username} has left the room.`,
          }));
        }
      });
      console.log('disconected');
      console.log('disconnected', connectionsCount);
    }
  })
});

