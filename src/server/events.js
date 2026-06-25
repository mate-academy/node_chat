'use strict';

const { sendSse } = require('./http');

const createEventBus = (store) => {
  const clients = new Set();

  const broadcast = (event, payload) => {
    for (const client of clients) {
      sendSse(client, event, payload);
    }
  };

  const connect = (req, res) => {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    });

    sendSse(res, 'rooms', store.getState());
    clients.add(res);

    req.on('close', () => {
      clients.delete(res);
    });
  };

  return {
    broadcast,
    connect,
  };
};

module.exports = { createEventBus };
