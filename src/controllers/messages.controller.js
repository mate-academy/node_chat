const { messagesEmitter } = require('../messagesEmitter.js');

const messagesService = require('../services/messages.service');
const groupsService = require('../services/groups.service.js');

function polling(req, res) {
  const { username, groupId } = req.body;

  if (!username) {
    res.status(400).send('Username is required');

    return;
  }

  if (groupId && !groupsService.getGroup(groupId)) {
    res.status(400).send('This group does not exists');

    return;
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Connection', 'keep-alive');

  if (groupId) {
    const oldMessages = messagesService.getMessagesByGroupId(groupId);

    res.write(`data: ${JSON.stringify({ oldMessages })}\n\n`);
  }

  const callback = (message) => {
    if (
      (groupId && groupId === message.groupId) ||
      (!groupId && !message.groupId)
    ) {
      res.write(`data: ${JSON.stringify(message)}\n\n`);
    }
  };

  messagesEmitter.on('message', callback);

  res.on('close', () => {
    messagesEmitter.off('message', callback);
  });
}

function sendMessage(req, res) {
  const { username, message, groupId } = req.body;

  if (!username) {
    res.status(400).send('Username is required');

    return;
  }

  if (!message) {
    res.status(400).send('Message is empty');

    return;
  }

  if (groupId && !groupsService.getGroup(groupId)) {
    res.status(400).send('This group does not exists');

    return;
  }

  const newMessage = messagesService.sendMessage(username, message, groupId);

  messagesEmitter.emit('message', newMessage);

  res.sendStatus(201);
}

module.exports = {
  polling,
  sendMessage,
};
