import { messageService } from '../services/message.service.js';
import { wss } from '../index.js';

const getAllMessages = async (req, res) => {
  const { roomId } = req.params;

  const messages = await messageService.getAllMessages(roomId);

  res
    .status(200)
    .send(messages.map((message) => messageService.normalize(message)));
};

const create = async (req, res) => {
  const { message } = req.body;
  const { roomId } = req.params;
  const { id: userId, name: userName } = req.user;

  const createdMessage = await messageService.create(message, userId, roomId);

  const messageData = {
    roomId,
    userId,
    userName,
    message,
    createdAt: createdMessage.createdAt,
  };
  wss.clients.forEach((client) => {
    if (
      client.readyState === client.OPEN &&
      client.username &&
      client.roomId === roomId
    ) {
      client.send(JSON.stringify(messageData));
    }
  });

  res.status(201).send({ message: 'Message created' });
};

export const messageController = {
  create,
  getAllMessages,
};
