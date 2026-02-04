import { Router } from 'express';
import { getRoomsUtil, writeChat } from '../utils/fileStorage.js';

const router = Router();

const getMessages = async (req, res) => {
  const { roomId } = req.params;

  const rooms = await getRoomsUtil();
  const room = rooms.find((roomItem) => roomItem.id === roomId);

  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }

  res.status(200).json({ messages: room.messages });
};

const addMessage = async (req, res) => {
  const { roomId } = req.params;
  const { author, text, time } = req.body;

  if (!author || !text) {
    return res.status(400).json({ error: 'Author and text are required' });
  }

  const rooms = await getRoomsUtil();
  const room = rooms.find((roomItem) => roomItem.id === roomId);

  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }

  const newMessage = {
    author,
    text,
    time: time || new Date().toISOString(),
  };

  room.messages.unshift(newMessage);
  await writeChat({ rooms });

  const io = req.app.get('io');
  if (io) {
    io.to(roomId).emit('newMessage', newMessage);
  }

  res.status(201).json({ message: 'Message added', data: newMessage });
};

router.get('/:roomId/messages', getMessages);
router.post('/:roomId/messages', addMessage);

export default router;
