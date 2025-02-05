import { messageServices } from '../service/messageService.js';

export const sendMessage = (req, res, next) => {
  try {
    const { roomName, author, text } = req.body;

    const result = messageServices.sendMessageService(roomName, author, text);

    res.send(result.message);
  } catch (error) {
    next(error);
  }
};
