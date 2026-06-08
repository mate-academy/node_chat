'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');
const initSocketHandler = require('./socketHandler');

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  const pathname = req.url.split('?')[0];

  if (
    req.method === 'GET' &&
    (pathname === '/' || pathname === '/index.html')
  ) {
    const filePath = path.join(__dirname, 'public', 'index.html');

    fs.readFile(filePath, 'utf8', (err, content) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Внутрішня помилка сервера під час завантаження інтерфейсу.');

        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(content);
    });

    return;
  }

  // Обробка неіснуючих маршрутів
  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Сторінку не знайдено.');
});

const wss = new WebSocket.Server({ server });

initSocketHandler(wss);

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(
    `[Сервер] Модульний чат успішно запущено на http://localhost:${PORT}`,
  );
});
