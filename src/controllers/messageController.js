import { sendMessageService } from '../service/messageService.js';

export const sendMessage = (req, res, next) => {
  try {
    const { roomName, author, text } = req.body;

    const result = sendMessageService(roomName, author, text);

    res.send(result.message);
  } catch (error) {
    next(error);
  }
};
