const { messagesService } = require('../services/messages.service.js');
const { websocketEmitter } = require('../websocket.js');

function sendMessage(req, res) {
  const { username, message } = req.body;

  if (!username) {
    res.status(400).send('Username is required');

    return;
  }

  if (!message) {
    res.status(400).send('Message is empty');

    return;
  }

  const newMessage = messagesService.sendMessage(username, message);

  websocketEmitter.emit('newMessage', newMessage);

  res.sendStatus(201);
}

module.exports = {
  sendMessage,
};
