/* eslint-disable no-console */

'use strict';

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const http = require('http');
const { WebSocketServer, WebSocket } = require('ws');
const { initDB } = require('./db');
const { Room, Message, User } = require('./models');
const { roomRouter } = require('./routes/room.router');
const { usersRouter } = require('./routes/users.router');
const { MessageType } = require('./shared/types');

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());

app.use('/api', roomRouter);
app.use('/api', usersRouter);

app.use((req, res) => {
  res.status(404).json({ message: 'Page not found' });
});

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const rooms = {};

// WebSocket логіка тут...
wss.on('connection', (ws) => {
  console.log('Нове підключення встановлено');

  ws.on('message', async (data) => {
    try {
      const rawData = typeof data === 'string' ? data : data.toString();
      const message = JSON.parse(rawData);
      const { type, payload } = message;

      console.log('Отримано повідомлення:', message);

      switch (type) {
        case MessageType.ROOM_JOIN: {
          const normRoomId = Number(payload.roomId);

          // Якщо кімнати ще немає в пам'яті сервера — створюємо її
          if (!rooms[normRoomId]) {
            rooms[normRoomId] = new Set();
          }

          // Видаляємо з попередньої кімнати, якщо була
          if (ws.currentRoom && rooms[ws.currentRoom]) {
            rooms[ws.currentRoom].delete(ws);
          }

          if (ws.currentRoom === normRoomId) {
            break;
          }

          rooms[normRoomId].add(ws);
          ws.currentRoom = normRoomId;
          console.log(`Користувач приєднався до кімнати ${normRoomId}`);

          break;
        }

        case MessageType.ROOM_CREATE: {
          try {
            const { name, userId } = payload; // Отримуємо name
            // та userId від клієнта
            const normUserId = Number(userId);

            // 1. Створюємо кімнату в БД
            const newRoom = await Room.create({
              name,
              ownerId: normUserId, // Записуємо власника!
            });

            // 2. Розсилаємо ВУСІМ підключеним клієнтам (wss.clients)
            const broadcastData = JSON.stringify({
              type: MessageType.ROOM_NEW,
              payload: newRoom,
            });

            wss.clients.forEach((client) => {
              if (client.readyState === WebSocket.OPEN) {
                client.send(broadcastData);
              }
            });
          } catch (err) {
            console.error('Помилка створення кімнати через WS:', err);
          }

          break;
        }

        case MessageType.ROOM_RENAME: {
          const { roomId, newName, userId } = payload;
          const normRoomId = Number(roomId);
          const normUserId = Number(userId);
          const room = await Room.findByPk(normRoomId);

          // Перевірка прав: тільки власник може редагувати
          if (room && room.ownerId === normUserId) {
            room.name = newName;
            await room.save();

            const broadcastData = JSON.stringify({
              type: MessageType.ROOM_RENAMED,
              payload: {
                roomId: normRoomId,
                newName,
              },
            });

            wss.clients.forEach((client) => {
              if (client.readyState === WebSocket.OPEN) {
                client.send(broadcastData);
              }
            });
          }
          break;
        }

        case MessageType.ROOM_DELETE: {
          const { roomId, userId } = payload;
          const normRoomId = Number(roomId);
          const normUserId = Number(userId);
          const room = await Room.findByPk(normRoomId);

          if (room && room.ownerId === normUserId) {
            await room.destroy();

            const broadcastData = JSON.stringify({
              type: MessageType.ROOM_DELETED,
              payload: { roomId: normRoomId },
            });

            wss.clients.forEach((client) => {
              if (client.readyState === WebSocket.OPEN) {
                client.send(broadcastData);
              }
            });
          }
          break;
        }

        case MessageType.MESSAGE_SEND: {
          const { roomId, userId, text } = payload;

          const normRoomId = Number(roomId);
          const normUserId = Number(userId);

          try {
            // 1. Зберігаємо в базу даних
            const newMessage = await Message.create({
              text,
              userId: normUserId,
              roomId: normRoomId,
            });

            // 2. Знаходимо автора, щоб відправити ім'я на фронтенд
            const user = await User.findByPk(normUserId);

            const clients = rooms[normRoomId];

            if (clients) {
              clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                  client.send(
                    JSON.stringify({
                      type: MessageType.MESSAGE_NEW,
                      payload: {
                        id: newMessage.id,
                        text: newMessage.text,
                        userId: newMessage.userId,
                        roomId: newMessage.roomId,
                        authorName: user?.username || 'Unknown',
                        createdAt: newMessage.createdAt,
                      },
                    }),
                  );
                }
              });
            }
          } catch (err) {
            console.error('Помилка збереження повідомлення:', err);
          }
          break;
        }

        default:
          console.log('Невідомий тип повідомлення', type);
      }
    } catch (err) {
      console.error('Помилка парсингу JSON:', err);
    }
  });

  ws.on('close', () => {
    // Не забути видалити сокет з усіх кімнат при відключенні
    if (ws.currentRoom && rooms[ws.currentRoom]) {
      rooms[ws.currentRoom].delete(ws);
    }

    console.log('Клієнт від’єднався');
  });
});

const start = async () => {
  try {
    await initDB();
    server.listen(5700, () => console.log('🚀 Server started on port 5700'));
  } catch (error) {
    console.error('Failed to start server:', error);
  }
};

start();
