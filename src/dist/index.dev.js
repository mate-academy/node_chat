'use strict';

var http = require('http');

var express = require('express');

var cors = require('cors');

var _require = require('ws'),
    WebSocketServer = _require.WebSocketServer;

var _require2 = require('../src/middleware/emmiter'),
    emitter = _require2.emitter; // Підключаємо бібліотеку cors.
// Вона допомагає браузеру дозволити frontend отримувати відповіді
// від backend, якщо вони мають різні origin.


var authRouter = require('./middleware/auth.routes');

var createServer = function createServer() {
  var app = express();
  app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173' // origin - це адреса клієнта
    // process.env.CLIENT_URL — змінна середовища,
    // у якій можна зберегти адресу frontend.

  }));
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
        message: 'Invalid JSON'
      });
      return;
    }

    res.status(500).send({
      message: 'Internal server error'
    });
  });
  var server = http.createServer(app);
  var wss = new WebSocketServer({
    server: server
  });

  var broadcast = function broadcast(type, payload) {
    var data = JSON.stringify({
      type: type,
      payload: payload
    });
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = wss.clients[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var client = _step.value;

        if (client.readyState === 1) {
          client.send(data);
        }
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator["return"] != null) {
          _iterator["return"]();
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
  createServer: createServer
};