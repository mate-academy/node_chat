'use strict';

const http = require('http');

const express = require('express');

const cors = require('cors');

const _require = require('ws');
const WebSocketServer = _require.WebSocketServer;

const _require2 = require('../src/middleware/emmiter');
const emitter = _require2.emitter; // Підключаємо бібліотеку cors.
// Вона допомагає браузеру дозволити frontend отримувати відповіді
// від backend, якщо вони мають різні origin.

const authRouter = require('./middleware/auth.routes');

const createServer = function createServer() {
  const app = express();

  app.use(
    cors({
      origin: process.env.CLIENT_URL || 'http://localhost:5173', // origin - це адреса клієнта
      // process.env.CLIENT_URL — змінна середовища,
      // у якій можна зберегти адресу frontend.
    }),
  );
  app.use(express.json());
  app.use(authRouter); // eslint-disable-next-line

  app.use(function (error, req, res, next) {
    // оце і є наший middleware
    //
    // error — об'єкт із інформацією про помилку.
    // req — HTTP-запит від клієнта.
    // res — HTTP-відповідь, яку повертаємо клієнту.
    // next — дозволяє передати помилку наступному обробнику,
    // якщо ми не хочемо обробляти її тут.
    if (error.type === 'entity.parse.failed') {
      res.status(400).send({
        message: 'Invalid JSON',
      });

      return;
    }

    res.status(500).send({
      message: 'Internal server error',
    });
  });

  const server = http.createServer(app);
  const wss = new WebSocketServer({
    server: server,
  });

  const broadcast = function broadcast(type, payload) {
    const data = JSON.stringify({
      type: type,
      payload: payload,
    });
    let _iteratorNormalCompletion = true;
    let _didIteratorError = false;
    let _iteratorError;

    try {
      for (
        var _iterator = wss.clients[Symbol.iterator](), _step;
        !(_iteratorNormalCompletion = (_step = _iterator.next()).done);
        _iteratorNormalCompletion = true
      ) {
        const client = _step.value;

        if (client.readyState === 1) {
          client.send(data);
        }
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator['return'] != null) {
          _iterator['return']();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }
  };

  emitter.on('message', function (m) {
    return broadcast('message', m);
  });

  emitter.on('room:created', function (r) {
    return broadcast('room:created', r);
  });

  emitter.on('room:updated', function (r) {
    return broadcast('room:updated', r);
  });

  emitter.on('room:deleted', function (r) {
    return broadcast('room:deleted', r);
  });

  return server;
};

module.exports = {
  createServer: createServer,
};
