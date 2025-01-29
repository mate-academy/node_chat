import { Room } from '../models/room.model.js';
import { roomService } from '../services/room.service.js';

const getAllRooms = async (req, res) => {
  const room = await Room.findAll();

  res.send(room);
};

const createRoom = async (req, res) => {
  const { name } = req.body;
  const newRoom = roomService.createRoom(name);

  res.send(newRoom);
};

const deleteRoom = async (req, res) => {
  const { id } = req.params;
  const del = await Room.destroy({ where: { id } });

  res.json(del);
};

const renameRoom = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  const result = await roomService.updateRoom(id, name);

  res.send(result);
};

export const roomController = {
  getAllRooms,
  createRoom,
  deleteRoom,
  renameRoom,
};
