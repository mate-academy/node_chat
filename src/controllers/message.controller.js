import { messageService } from '../services/message.service.js';

const getAll = async (req, res) => {
  const messages = await messageService.getAll();

  res.send(messages);
};

const getByRoom = async (req, res) => {
  const messages = await messageService.getByRoom(req.params.roomId);

  res.send(messages);
};

const add = async (req, res) => {
  try {
    const messageData = req.body;
    const newMessage = await messageService.add(messageData);
    res.status(201).send(newMessage);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

const deleteByRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const deleted = await messageService.deleteByRoom(roomId);
    if (deleted) {
      res.sendStatus(200);
    } else {
      res.status(404).send({ error: 'Messages for this room not found' });
    }
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

export const messageController = {
  getAll,
  getByRoom,
  add,
  deleteByRoom,
};
