import { Room } from '../models/room.js';

const getAllRooms = async (req, res) => {
  const rooms = await Room.findAll();

  res.send(rooms);
};

const findRoomByName = async (name) => {
  return Room.findOne({ where: { name } });
};

async function findRoomById(id) {
  return Room.findOne({ where: { id } });
}

const createNewRoom = async ({ name }) => {
  const checkRoom = await findRoomByName(name);

  if (checkRoom) {
    throw new Error('A Room with this name already exists.');
  }

  const newRoom = await Room.create({ name });

  return newRoom;
};

const createRoom = async (req, res) => {
  const { name } = req.body;
  const newRoom = await createNewRoom({ name });

  res.send(newRoom);
};

const deleteRoom = async (req, res) => {
  const { id } = req.params;
  const del = await Room.destroy({ where: { id } });

  res.json(del);
};

const updateRoomName = async (id, name) => {
  const updateRoom = await findRoomById(id);

  updateRoom.name = name;
  await updateRoom.save();
};

const renameRoom = async (req, res) => {
  const { id } = req.params;
  const { newName } = req.body;
  const result = await updateRoomName(id, newName);

  res.send(result);
};

export const room = {
  getAllRooms,
  createRoom,
  renameRoom,
  deleteRoom,
};
