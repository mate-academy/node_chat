'use strict';

const http = require('http');
const express = require('express');
const cors = require('cors');

const { WebSocketServer } = require('ws');
const { emitter } = require('../src/middleware/emmiter');

// Підключаємо бібліотеку cors.
// Вона допомагає браузеру дозволити frontend отримувати відповіді
// від backend, якщо вони мають різні origin.

const authRouter = require('./middleware/auth.routes');

const createServer = () => {
  const app = express();

  app.use(
    cors({
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      // origin - це адреса клієнта
      // process.env.CLIENT_URL — змінна середовища,
      // у якій можна зберегти адресу frontend.
    }),
  );
  app.use(express.json());

  app.use(authRouter);

  // eslint-disable-next-line
  app.use((error, req, res, next) => {
    // оце і є наший middleware
    //
    // error — об'єкт із інформацією про помилку.
    // req — HTTP-запит від клієнта.
    // res — HTTP-відповідь, яку повертаємо клієнту.
    // next — дозволяє передати помилку наступному обробнику,
    // якщо ми не хочемо обробляти її тут.
    if (error.type === 'entity.parse.failed') {
      res.status(400).send({ message: 'Invalid JSON' });

      return;
    }

    res.status(500).send({ message: 'Internal server error' });
  });

  const server = http.createServer(app);
  const wss = new WebSocketServer({ server });

  const broadcast = (type, payload) => {
    const data = JSON.stringify({ type, payload });

    for (const client of wss.clients) {
      if (client.readyState === 1) {
        client.send(data);
      }
    }
  };

  emitter.on('message', (m) => broadcast('message', m));
  emitter.on('room:created', (r) => broadcast('room:created', r));
  emitter.on('room:updated', (r) => broadcast('room:updated', r));
  emitter.on('room:deleted', (r) => broadcast('room:deleted', r));

  return server;
};

module.exports = {
  createServer,
};
