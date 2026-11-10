import { validate as isUuid } from 'uuid';
import { messagesService } from '../services/messages.service.js';
import { roomsService } from '../services/rooms.service.js';
import { broadcastToRoom } from '../realtime.js';

const getMessages = async (req, res) => {
  const { roomId } = req.params;

  if (!isUuid(roomId)) {
    return res.status(400).json({ message: 'Invalid room id' });
  }

  const room = await roomsService.getById(roomId);

  if (!room) {
    return res.status(404).json({ message: 'Room not found' });
  }

  const messages = await messagesService.listMessages(room.id);

  return res.json(messages);
};

const createMessage = async (req, res) => {
  const { roomId } = req.params;
  const author = req.body?.author;
  const text = req.body?.text;

  if (!isUuid(roomId)) {
    return res.status(400).json({ message: 'Invalid room id' });
  }

  if (typeof author !== 'string' || !author.trim()) {
    return res.status(400).json({ message: 'Author is required' });
  }

  if (typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ message: 'Text is required' });
  }

  if (author.trim().length > 255 || text.trim().length > 255) {
    return res.status(400).json({
      message: 'Author and text must be at most 255 characters each',
    });
  }

  const room = await roomsService.getById(roomId);

  if (!room) {
    return res.status(404).json({ message: 'Room not found' });
  }

  const message = await messagesService.createMessage(
    room.id,
    author.trim(),
    text.trim(),
  );

  broadcastToRoom(room.id, 'message:created', message.toJSON());

  return res.status(201).json(message);
};

const updateMessage = async (req, res) => {
  const { roomId, messageId } = req.params;
  const text = req.body?.text;

  if (!isUuid(roomId) || !isUuid(messageId)) {
    return res.status(400).json({
      message: 'Invalid room or message id',
    });
  }

  if (typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ message: 'Text is required' });
  }

  if (text.trim().length > 255) {
    return res.status(400).json({
      message: 'Text must be at most 255 characters',
    });
  }

  const room = await roomsService.getById(roomId);

  if (!room) {
    return res.status(404).json({ message: 'Room not found' });
  }

  const message = await messagesService.updateMessage(
    room.id,
    messageId,
    text.trim(),
  );

  if (!message) {
    return res.status(404).json({ message: 'Message not found' });
  }

  broadcastToRoom(room.id, 'message:updated', message.toJSON());

  return res.json(message);
};

const deleteMessage = async (req, res) => {
  const { roomId, messageId } = req.params;

  if (!isUuid(roomId) || !isUuid(messageId)) {
    return res.status(400).json({
      message: 'Invalid room or message id',
    });
  }

  const room = await roomsService.getById(roomId);

  if (!room) {
    return res.status(404).json({ message: 'Room not found' });
  }

  const message = await messagesService.deleteMessage(room.id, messageId);

  if (!message) {
    return res.status(404).json({ message: 'Message not found' });
  }

  const payload = {
    id: message.id,
    roomId: message.roomId,
  };

  broadcastToRoom(room.id, 'message:deleted', payload);

  return res.json(payload);
};

export const messagesController = {
  getMessages,
  createMessage,
  updateMessage,
  deleteMessage,
};
