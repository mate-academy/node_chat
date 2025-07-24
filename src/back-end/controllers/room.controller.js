import { Room } from '../../models/Room.model.js';
import { roomService } from '../services/room.service.js';

const createRoom = async (req, res) => {
  const { title } = req.body;

  if (!title) {
    return res.sendStatus(401);
  }

  const newRoom = await roomService.createNewRoom(title);

  res.status(201).send(newRoom);
};

const getAllRooms = async (req, res) => {
  const rooms = await Room.findAll();

  res.status(200).send(rooms);
};

const deleteRoom = async (req, res) => {
  const { roomId } = req.params;

  if (!roomId) {
    return res.sendStatus(401);
  }

  await Room.destroy({ where: { id: roomId } });

  res.sendStatus(204);
};

const updateTitle = async (req, res) => {
  const { roomId } = req.params;
  const { newTitle } = req.body;

  if (!roomId || !newTitle) {
    return res.sendStatus(401);
  }

  const room = await Room.findByPk(roomId);

  if (!room) {
    return res.sendStatus(404);
  }

  room.title = newTitle;
  await room.save();

  res.sendStatus(200);
};

export const roomController = {
  createRoom,
  getAllRooms,
  deleteRoom,
  updateTitle,
};
