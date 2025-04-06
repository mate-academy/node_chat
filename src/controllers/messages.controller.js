'use strict';

const { EventEmitter } = require('events');
const chatService = require('../services/chats.service');

const emmiter = new EventEmitter();

const sendMessage = async (req, res) => {
  const { text, username, chatId } = req.body;

  if (!text || !username || !chatId) {
    return res.status(400).send({ error: 'Missing fields' });
  }

  const message = {
    text,
    sender: username,
  };

  const result = await chatService.addNewMessage(chatId, message);

  if (!result) {
    return res.status(404).send({ error: 'Chat not found' });
  }

  emmiter.emit(`message-${chatId}`, result);

  res.status(201).send(result);
};

const getMessages = async (req, res) => {
  const { chatId } = req.params;

  const messages = await chatService.getAllMessages(chatId);

  if (!messages) {
    return res.status(404).send({ error: 'Chat not found' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Cache-Control', 'no-store');

  const cb = (message) => {
    res.write(`data: ${JSON.stringify(message)}\n\n`);
  };

  emmiter.on(`message-${chatId}`, cb);

  res.on('close', () => {
    emmiter.off(`message-${chatId}`, cb);
  });

  // console.log(emmiter.listenerCount(`message-${chatId}`));
};

const getMessageHistory = async (req, res) => {
  const { chatId } = req.params;

  const messages = await chatService.getAllMessages(chatId);

  if (!messages) {
    return res.status(404).send({ error: 'Chat not found' });
  }

  res.status(200).json(messages);
};

module.exports = {
  sendMessage,
  getMessages,
  getMessageHistory,
};
