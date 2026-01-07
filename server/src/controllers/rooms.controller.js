import { roomService } from '../services/rooms.service.js';

const getAll = async (req, res) => {
  const rooms = await roomService.getAll();

  res.json(rooms);
};

const create = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.sendStatus(400);

    const newRoom = await roomService.create({ name });
    res.status(201).json(newRoom);
  } catch (e) {
    console.error('ROOM CREATE ERROR:', e); // 👈
    res.sendStatus(500);
  }
};

const edit = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  if (!name) {
    return res.sendStatus(400);
  }

  const room = await roomService.edit(id, name);

  if (!room) {
    return res.sendStatus(404);
  }

  res.status(200).json(room);
};

const remove = async (req, res) => {
  const { id } = req.params;

  const room = await roomService.remove(id); // один виклик

  if (!room) {
    return res.sendStatus(404);
  }

  res.sendStatus(204);
};
export const roomController = {
  getAll,
  create,
  edit,
  remove,
};
