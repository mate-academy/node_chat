import { EventEmitter } from 'events';
import { messageService } from '../services/message.service.js';
import { User } from '../models/user.model.js';

export const messageEmitter = new EventEmitter();

const create = async (req, res) => {
  const { roomId } = req.params;
  const { text, userId } = req.body;

  if (!roomId || !userId || !text || typeof text !== 'string') {
    return res.status(400).json({ message: 'Missing or invalid parameters' });
  }

  try {
    const newMessage = await messageService.createMessageInRoom(
      text,
      userId,
      roomId,
    );

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const formattedMessage = {
      author: user.name,
      time: newMessage.createdAt,
      text: newMessage.text,
    };

    messageEmitter.emit('message', formattedMessage);

    res.status(201).json(formattedMessage);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error creating message:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getMessages = async (req, res) => {
  const { roomId } = req.params;

  if (!roomId) {
    return res.status(400).json({ message: 'Missing roomId' });
  }

  try {
    const messages = await messageService.getAllMessagesInRoom(roomId);

    const formattedMessages = messages.map((m) => ({
      author: m.User?.name || 'Unknown',
      time: m.createdAt,
      text: m.text,
    }));

    res.status(200).json(formattedMessages);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error getting messages:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const messageController = {
  create,
  getMessages,
};
