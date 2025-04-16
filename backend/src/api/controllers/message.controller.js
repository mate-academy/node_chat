// const { EventEmitter } = require('events');
const messagesRepository = require('../../entity/message.repository');
const usersRepository = require('../../entity/users.repository');
const ApiError = require('../../exceptions/api.error');
// const messageService = require('../services/message.service');

// const emitter = new EventEmitter();

const getAllMessages = async (req, res) => {
  const messages = await messagesRepository.getAll(req.query);

  res.set('Cache-Control', 'no-store');

  // emitter.once('message', (message) => {
  //   console.log('Message event');
  //   res.status(200).json(messages);
  // });

  res
    .status(200)
    // .json(messages.map((message) => messageService.normalize(message)));
    .json(messages);
};

const createMessage = async (req, res) => {
  const { text, userId } = req.body;

  if (!text) {
    throw ApiError.badRequest('Bad request', { text: 'Text is required' });
  }

  const user = await usersRepository.getById(userId);

  if (!user) {
    throw ApiError.notFound({ userId: 'User not found' });
  }

  const message = await messagesRepository.create({ text, userId });

  res.status(201).json(message);
};

const updateMessage = async (req, res) => {
  const { id } = req.params;
  const { text } = req.body;

  const message = await messagesRepository.getById(id);

  if (!message) {
    throw ApiError.notFound({ message: 'Message not found' });
  }

  if (!text) {
    throw ApiError.badRequest('Bad request', { text: 'Text is required' });
  }

  message.text = text;
  await message.save();

  // res.status(200).json(messageService.normalize(message));
  res.status(200).json(message);
};

const deleteMessage = async (req, res) => {
  const { id } = req.params;
  const message = await messagesRepository.getById(id);

  if (!message) {
    throw ApiError.notFound({ message: 'Message not found' });
  }

  await messagesRepository.deleteById(id);

  res.sendStatus(204);
};

const messageController = {
  getAllMessages,
  createMessage,
  updateMessage,
  deleteMessage,
};

module.exports = messageController;
