import { roomService } from '../services/room.service.js';

const getAllRooms = async (req, res) => {
  const rooms = await roomService.getAllRooms();

  res.status(200).send(rooms.map((room) => roomService.normalize(room)));
};

const create = async (req, res) => {
  const { title, description } = req.body;
  const { id: userId } = req.user;

  await roomService.create(title, description, userId);

  res.status(201).send({ message: 'Room is created' });
};

const update = async (req, res) => {
  const { roomId } = req.params;
  const { title, description } = req.body;

  await roomService.update(roomId, title, description);

  res.status(200).send({ message: 'Room updated successfully' });
};

const remove = async (req, res) => {
  const { roomId } = req.params;

  await roomService.remove(roomId);

  res.sendStatus(204);
};

export const roomController = {
  create,
  getAllRooms,
  update,
  remove,
};
