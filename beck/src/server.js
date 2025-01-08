/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const http = require('http');
const app = require('./app');
const WebSocket = require('ws');
const sequelize = require('./models/index.js');

const server = http.createServer(app);

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('Новий користувач підключений');

  wss.clients.add(ws);

  ws.on('message', (message) => {
    const parsedMessage = JSON.parse(message);

    if (parsedMessage.type === 'CONNECT') {
      ws.userId = parsedMessage.id;
    }

    console.log('Отримане повідомлення:', parsedMessage);
  });

  ws.on('close', () => {
    console.log('Користувач відключився');
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Сервер працює на порту ${PORT}`);
});

exports.wss = wss;
