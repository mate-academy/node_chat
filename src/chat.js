/* eslint-disable no-console */
'use strict';

const { EventEmitter } = require('events');
const { WebSocketServer } = require('ws');
const messages = require('./messages');

const emitter = new EventEmitter();

const bindWSToServer = server => {
  const wss = new WebSocketServer({ server });

  wss.on('connection', client => {
    console.log('Connected');

    client.on('message', data => {
      const message = JSON.parse(data.toString());

      messages.createMessage(message);
      emitter.emit('message', messages.getAllMessages(message.room.id));
    });
  });

  emitter.on('message', data => {
    for (const client of wss.clients) {
      client.send(JSON.stringify(data));
    }
  });

  return wss;
};

module.exports = {
  bindWSToServer,
};
