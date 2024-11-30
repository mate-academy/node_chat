import { messageService } from '../services/message.service.js';

const create = async (req, res) => {
  const { author, text, id } = req.body;
  const message = await messageService.createMessage(author, text, id);

  res.status(201).send(message);
}

export const messageController = {
  create,
}


