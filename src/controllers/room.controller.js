import * as roomService from '../services/room.service.js';

export const getAllRooms = async (req, res) => {
  const rooms = await roomService.getAllRooms();

  res.statusCode = 200;
  res.send(rooms.map((room) => roomService.normalize(room)));
};

export const create = async (req, res) => {
  const { title, description, userId } = req.body;

  if (!title || !userId) {
    res.sendStatus(404);

    return;
  }

  await roomService.createRoom(title, userId, description);

  res.sendStatus(201);
};

export const update = async (req, res) => {
  const roomId = req.params.roomId;

  const { title, description } = req.body;

  if ((!title && !description) || !roomId) {
    res.sendStatus(404);

    return;
  }

  await roomService.updateRoom(roomId, title, description);

  res.sendStatus(204);
};

export const remove = async (req, res) => {
  const { roomId } = req.params;

  if (!roomId) {
    res.sendStatus(400);

    return;
  }

  await roomService.removeRoom(roomId);
  res.sendStatus(204);
};
