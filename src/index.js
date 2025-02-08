'use strict';

const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(cors()); // Дозволяє запити з інших доменів
app.use(express.json()); // Дозволяє обробляти JSON у запитах

const users = {}; // Зберігання користувачів { userId: { name, room } }
const rooms = {}; // Зберігання повідомлень у кімнатах { roomName: [messages] }

// Маршрут для перевірки роботи сервера
app.get('/', (req, res) => {
  res.send('Chat server is running...');
});

wss.on('connection', (ws) => {
  // eslint-disable-next-line no-console
  console.log('✅ New user connected');

  ws.on('message', (message) => {
    let data;

    // Перевірка чи JSON правильний
    try {
      data = JSON.parse(message);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('❌ JSON parsing error:', error.message);
      ws.send(JSON.stringify({ error: 'Invalid message format' }));

      return;
    }

    // Перевірка типу події
    switch (data.type) {
      case 'join':
        users[data.userId] = { name: data.name, room: data.room };

        if (!rooms[data.room]) {
          rooms[data.room] = [];
        }

        ws.send(
          JSON.stringify({ type: 'history', messages: rooms[data.room] }),
        );
        // eslint-disable-next-line no-console
        console.log(`🔹 ${data.name} joined room: ${data.room}`);
        break;

      case 'message':
        const user = users[data.userId];

        if (!user) {
          ws.send(JSON.stringify({ error: 'User not found' }));

          return;
        }

        const msg = {
          author: user.name,
          time: new Date().toISOString(),
          text: data.text,
        };

        rooms[user.room].push(msg);

        // Обмежуємо історію до 100 останніх повідомлень
        if (rooms[user.room].length > 100) {
          rooms[user.room] = rooms[user.room].slice(-100);
        }

        // Відправляємо повідомлення всім користувачам у кімнаті
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'message', message: msg }));
          }
        });

        break;

      default:
        ws.send(JSON.stringify({ error: 'Unknown event type' }));
    }
  });

  ws.on('close', () => {
    // eslint-disable-next-line no-console
    console.log('❌ User disconnected');
  });
});

// Запуск сервера
const PORT = process.env.PORT || 8080;

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
