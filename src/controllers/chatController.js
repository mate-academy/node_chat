import { ApiError } from '../exceptions/api.error.js';
import { chatService } from '../service/chat.service.js';
import { EventEmitter } from 'events';
import { wss } from '../index.js';

const emitter = new EventEmitter();

const createRoom = async (req, res) => {
  const { name } = req.body;

  if (!name) {
    throw ApiError.badRequest('Name is empty');
  }

  await chatService.createRoom(name);

  const roomId = await chatService.getId(name);

  res.status(200).json({ roomId });
};

const messages = async (req, res) => {
  const { text } = req.body;
  const { roomId } = req.params;

  const refreshToken = req.headers.cookie;

  if (!refreshToken) {
    throw ApiError.badRequest('Refresh token not found');
  }

  const cookieToken = refreshToken.split('=')[1];

  const author = await chatService.getUser(cookieToken);

  if (!author) {
    throw ApiError.badRequest('User not found');
  }

  if (!text) {
    throw ApiError.badRequest('Text is missing');
  }

  if (!roomId) {
    throw ApiError.badRequest('Room ID is missing');
  }

  const messageSend = await chatService.sendMessages(text, roomId, author);

  // emitter.emit('messages', JSON.stringify(messageSend));

  for (const client of wss.clients) {
    client.send(JSON.stringify(messageSend));
  }

  const allMessages = await chatService.getAll(roomId);

  res.status(201).send(allMessages);
};

const getMessage = async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Cache-Controle', 'no-store');

  const cb = (message) => {
    res.write(`data: ${JSON.stringify(message)}\n\n`);
  };

  emitter.on('message', cb);

  res.on('close', () => {
    emitter.off('message', cb);
  });
};

const getAllMessages = async (req, res) => {
  const { roomId } = req.params;

  if (!roomId) {
    throw ApiError.badRequest('Room ID is missing');
  }

  const allMessages = await chatService.getAll(roomId);

  res.status(200).send(allMessages);
};

const getAllRooms = async (req, res) => {
  const allRooms = await chatService.getAllRoom();

  res.status(200).send(allRooms);
};

const remove = async (req, res) => {
  const { roomId } = req.params;

  if (!roomId) {
    throw ApiError.badRequest('Room not found');
  }

  await chatService.removeRoom(roomId);

  res.sendStatus(200);
};

export const chatController = {
  createRoom,
  messages,
  getAllMessages,
  getMessage,
  getAllRooms,
  remove,
};
