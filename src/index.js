/* eslint-disable no-console */
'use strict';

// Импортируем необходимые библиотеки
import { WebSocketServer } from 'ws';
import express from 'express';
import http from 'http';

// Создаем Express приложение
const app = express();
const server = http.createServer(app);

// Инициализируем WebSocket сервер
const wss = new WebSocketServer({ server });

const rooms = {}; // Объект для хранения комнат и сообщений

// Когда клиент подключается
wss.on('connection', (ws) => {
  console.log('New client connected');

  // Когда клиент отправляет сообщение
  ws.on('message', (message) => {
    const data = JSON.parse(message);

    switch (data.type) {
      case 'join': // Присоединиться к комнате
        ws.room = data.room;

        if (!rooms[data.room]) {
          rooms[data.room] = [];
        }

        // Отправляем все предыдущие сообщения новому пользователю
        ws.send(
          JSON.stringify({
            type: 'history',
            messages: rooms[data.room],
          }),
        );
        break;

      case 'message': // Отправить сообщение
        const msg = {
          author: data.author,
          time: new Date().toISOString(),
          text: data.text,
        };

        // Добавляем сообщение в комнату
        if (ws.room) {
          rooms[ws.room].push(msg);

          // Отправляем сообщение всем в комнате
          wss.clients.forEach((client) => {
            if (client.room === ws.room && client !== ws) {
              client.send(
                JSON.stringify({
                  type: 'message',
                  message: msg,
                }),
              );
            }
          });
        }
        break;

      case 'createRoom': // Создать комнату
        if (!rooms[data.room]) {
          rooms[data.room] = [];

          ws.send(
            JSON.stringify({
              type: 'roomCreated',
              room: data.room,
            }),
          );
        }
        break;

      case 'renameRoom': // Переименовать комнату
        if (rooms[data.oldName]) {
          rooms[data.newName] = rooms[data.oldName];
          delete rooms[data.oldName];

          ws.send(
            JSON.stringify({
              type: 'roomRenamed',
              oldName: data.oldName,
              newName: data.newName,
            }),
          );
        }
        break;

      case 'deleteRoom': // Удалить комнату
        if (rooms[data.room]) {
          delete rooms[data.room];

          wss.clients.forEach((client) => {
            if (client.room === data.room) {
              client.send(
                JSON.stringify({
                  type: 'roomDeleted',
                  room: data.room,
                }),
              );
            }
          });
        }
        break;

      default:
        break;
    }
  });

  // Когда клиент отключается
  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

// Запуск сервера
server.listen(8080, () => {
  console.log('Server is running on ws://localhost:8080');
});
