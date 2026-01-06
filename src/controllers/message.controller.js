/* eslint-disable no-useless-return */
import { messageService } from '../services/message.service.js';
import { roomService } from '../services/room.service.js';
import { userService } from '../services/user.service.js';

const getAllMessages = async (req, res) => {
  try {
    const messages = await messageService.getAll();

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
};

const createMessage = async (req, res) => {
  try {
    const { roomId, authorId, text } = req.body;

    if (!roomId || !authorId || !text) {
      return res
        .status(400)
        .json({ message: 'Room id, author id and text required' });
    }

    const room = await roomService.getRoom(+roomId);
    const author = await userService.getById(+authorId);

    if (!room || !author) {
      return res.status(404).json({ message: 'Room or author not found' });
    }

    await messageService.createMessage(+roomId, +authorId, text);

    res.sendStatus(201);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
};

const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    if (!messageId) {
      return res.status(400).json({ message: 'Message id required' });
    }

    const message = await messageService.getById(+messageId);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    await messageService.deleteMessage(+messageId);

    res.sendStatus(200);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
};

const updateMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { text } = req.body;

    if (!messageId || !text) {
      return res.status(400).json({ message: 'Message id and text required' });
    }

    const message = await messageService.getById(+messageId);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    await messageService.update(+messageId, text);

    res.sendStatus(200);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
};

export const messageController = {
  getAllMessages,
  createMessage,
  deleteMessage,
  updateMessage,
};
