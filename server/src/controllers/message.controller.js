const messageService = require('../services/message.service.js');
const validate = require('../services/validate.service.js');
const { socketEmitter } = require('../websoket/wss.js');

const createMessage = async (req, res) => {
  let message = req.body;

  const isMessageValid = validate.message(message);

  if (!isMessageValid.result) {
    res.status(400).send(JSON.stringify(isMessageValid, null, 2));

    return;
  }

  message = messageService.prepare(message);
  message = await messageService.createMessage(message);
  socketEmitter.emit('message', message);
  res.status(201).send(message);
};

const getMessages = async (req, res) => {
  const { chatId } = req.params;

  const messages = await messageService.getMessages(chatId);

  res.send(messages);
};

const setReadStatus = async (req, res) => {
  const { chatId, userId } = req.params;
  const result = await messageService.changeReadStatus(chatId, userId);

  socketEmitter.emit('readMessages', chatId);
  res.send(result);
};

const getUnreadMessages = async (req, res) => {
  const { userId, chats } = req.body;
  const unread = await messageService.getUnread(userId, chats);

  res.send(unread);
};

const readAll = async (req, res) => {
  const { userId, chats } = req.body;

  await messageService.readAll(userId, chats);

  res.sendStatus(200);
};

module.exports = {
  createMessage,
  getMessages,
  setReadStatus,
  getUnreadMessages,
  readAll,
};
