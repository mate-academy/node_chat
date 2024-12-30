const express = require('express');
const { getWSS } = require('../wss');
const { messagesControllers } = require('../controllers/messages.controller');
const { messageEmitter } = require('../emmiters/messages.emmiters');

const router = express.Router();

router.get('/', messagesControllers.getMessage);
router.get('/:roomId', messagesControllers.getMessagesByRoom);
router.post('/', messagesControllers.createMessage);

messageEmitter.on('message', (message) => {
  const wss = getWSS();

  for (const client of wss.clients) {
    if (client.readyState === 1) {
      client.send(JSON.stringify(message));
    }
  }
});

module.exports = { messagesRouter: router };
