import { messageService } from '../services/messages.service.js';
import { sendEvent } from '../index.js';

const getAllByRoom = async (req, res) => {
  const { id } = req.params;

  console.log("ROOM ID FROM URL:", id);

  const messages = await messageService.getAllByRoom(id);
  if (!messages) return res.sendStatus(404);

  res.set({
    'Cache-Control': 'no-store, no-cache, must-revalidate',
    Pragma: 'no-cache',
    Expires: '0',
  });

  res.json(messages); // просто віддаємо історію повідомлень
};

const create = async (req, res) => {
  const { id } = req.params; // roomId
  const { author, text } = req.body;

  if (!author || !text) return res.sendStatus(400);

  const message = await messageService.create(id, { author, text });
  if (!message) return res.sendStatus(404);

  // ✅ Передаємо roomId на верхньому рівні для SSE
  sendEvent({ type: 'new-message', payload: message, roomId: id });

  res.status(201).json(message);
};

const removeAllByRoom = async (req, res) => {
  const { id } = req.params;

  const room = await messageService.removeAllByRoom(id);
  if (!room) return res.sendStatus(404);

  res.sendStatus(204);
};

export const messageController = {
  getAllByRoom,
  create,
  removeAllByRoom,
};
