'use strict';

const messagesService = require('../services/messagesService');

async function getMessages(req, res) {
  const messages = await messagesService.listMessages(req.params.roomId);

  res.json(messages);
}

async function createMessage(req, res) {
  const author = String(req.body.author || '').trim();
  const text = String(req.body.text || '').trim();

  if (!author || !text) {
    res.status(400).json({ message: 'author and text are required' });

    return;
  }

  const message = await messagesService.createMessage(
    req.params.roomId,
    author,
    text,
  );

  res.status(201).json(message);
}

module.exports = { getMessages, createMessage };
