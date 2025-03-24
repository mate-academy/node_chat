/* eslint-disable no-console */
import express from 'express';
import http from 'http';
import cors from 'cors';
import { WebSocketServer } from 'ws';

const app = express();

app.use(cors());

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const rooms = {}; // Сховище для кімнат

wss.on('connection', (ws) => {
  console.log(`🔵 Користувач підключився`);

  ws.on('message', (data) => {
    const message = JSON.parse(data);

    if (message.type === 'create') {
      // Створення кімнати
      const { room } = message;

      if (!rooms[room]) {
        rooms[room] = { clients: new Set(), messages: [] };
        console.log(`🟢 Кімната створена: ${room}`);
      }
    } else if (message.type === 'join') {
      // Приєднання до кімнати
      const { room, username } = message;

      if (rooms[room]) {
        ws.room = room;
        ws.username = username;
        rooms[room].clients.add(ws);

        console.log(`🔹 ${username} приєднався до кімнати: ${room}`);

        // Надсилаємо історію повідомлень
        ws.send(
          JSON.stringify({ type: 'history', messages: rooms[room].messages }),
        );
      }
    } else if (message.type === 'rename') {
      // Перейменування кімнати
      const { oldRoom, newRoom } = message;

      if (rooms[oldRoom] && !rooms[newRoom]) {
        rooms[newRoom] = rooms[oldRoom];
        delete rooms[oldRoom];
        console.log(`🟡 Кімната перейменована: ${oldRoom} ➝ ${newRoom}`);
      }
    } else if (message.type === 'delete') {
      // Видалення кімнати
      const { room } = message;

      if (rooms[room]) {
        rooms[room].clients.forEach((client) => {
          client.send(JSON.stringify({ type: 'deleted' }));
        });
        delete rooms[room];
        console.log(`🔴 Кімната видалена: ${room}`);
      }
    } else if (message.type === 'message') {
      // Відправка повідомлення
      const room = ws.room;

      if (room && rooms[room]) {
        const time = new Date().toLocaleTimeString();
        const msg = {
          author: ws.username,
          time,
          text: message.text,
        };

        rooms[room].messages.push(msg);

        rooms[room].clients.forEach((client) => {
          client.send(JSON.stringify({ type: 'message', message: msg }));
        });
      }
    }
  });

  ws.on('close', () => {
    const room = ws.room;

    if (room && rooms[room]) {
      rooms[room].clients.delete(ws);
      console.log(`❌ ${ws.username} вийшов з кімнати: ${room}`);
    }
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT);
// () =>
// /* eslint-disable no-console */
// console.log(`🚀 Server running at http://localhost:${PORT}/`),);
