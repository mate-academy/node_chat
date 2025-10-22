import { roomsService } from '../services/rooms.service.js';

const getAllRooms = async (req, res) => {
  const rooms = await roomsService.getAllRooms();

  res.status(200).send(rooms);
};

const createRoom = async (req, res) => {
  const { title, userId, description } = req.body;

  if (!title || !userId) {
    return res
      .status(400)
      .json({ message: 'Missing required fields: title or userId' });
  }

  await roomsService.createRoom(title, userId, description);

  res.sendStatus(201);
};

const updateRoom = async (req, res) => {
  const { roomId } = req.params;
  const { title, description } = req.body;

  if ((!title && !description) || !roomId) {
    return res.status(400).json({
      message:
        'Missing required fields: roomId and either title or description',
    });
  }

  await roomsService.updateRoom(roomId, title, description);

  res.sendStatus(204);
};

const deleteRoom = async (req, res) => {
  const { roomId } = req.params;

  if (!roomId) {
    return res.sendStatus(400);
  }

  await roomsService.deleteRoom(roomId);

  res.sendStatus(204);
};

export const roomController = {
  getAllRooms,
  createRoom,
  updateRoom,
  deleteRoom,
};
