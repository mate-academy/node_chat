import { messageService } from '../services/messageService.js';

const getMessages = async (req, res) => {
  const roomId = req.params.roomId || null;

  const messages = await messageService.getMessages(roomId);

  return res.json(messages);
};

const sendMessage = async (req, res) => {
  const { username, text, userId } = req.body;
  const roomId = req.params.roomId;

  const message = await messageService.addMessage(
    username,
    text,
    roomId,
    userId,
  );

  res.status(201).json(message);
};

export const messageController = {
  getMessages,
  sendMessage,
};
