import { Message } from '../models/Message.model.js';
import { EventEmitter } from 'events';

const MESSAGE = 'message';

export const emitter = new EventEmitter();

export const getMessages = async (req, res) => {
  const whereClauses = {};
  const { roomId } = req.query;

  if (roomId) {
    whereClauses.roomId = roomId;
  }

  res.send(await Message.findAll({ where: whereClauses }));
};

export const postMessage = async (req, res) => {
  const { text, author, roomId } = req.body;

  if (!text) {
    return res.status(400).send({ message: 'Text message is missing' });
  }

  if (!author) {
    return res.status(400).send({ message: 'Author of text is missing' });
  }

  if (!roomId) {
    return res.status(400).send({ message: 'Room is missing' });
  }

  const message = {
    text,
    time: new Date().toString(),
    author,
    roomId,
  };

  try {
    await Message.create(message);
    emitter.emit(MESSAGE, message);
    res.status(201).send(message);
  } catch (error) {
    res.status(500).send({ error: 'Failed to create message' });
  }
};
