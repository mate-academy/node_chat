import { roomService } from '../services/room.service.js';

const get = async (req, res) => {
  const rooms = await roomService.get();

  res.send(rooms);
};

const create = async (req, res) => {
  const { roomName, authorName } = req.body;

  const room = await roomService.findByName(roomName);

  if (room) {
    return res.status(409).send({
      message: `Room with ${roomName} name alredy exist`,
    });
  }

  const newRoom = await roomService.create(roomName, authorName);

  const broadcast = req.app.get('broadcast');

  if (broadcast) {
    broadcast({
      type: 'ROOM_CREATED',
      data: newRoom,
    });
  }

  res.status(201).send(newRoom);
};

const rename = async (req, res) => {
  const { roomId } = req.params;
  const { roomName, authorName } = req.body;

  const room = await roomService.findById(roomId);

  if (!room) {
    res.sendStatus(404);

    return;
  }

  if (room.authorName !== authorName) {
    res.sendStatus(403);

    return;
  }

  const updatedRoom = await roomService.update(roomId, roomName);

  const broadcast = req.app.get('broadcast');

  if (broadcast) {
    broadcast({
      type: 'ROOM_UPDATED',
      data: updatedRoom,
    });
  }

  res.send(updatedRoom);
};

const remove = async (req, res) => {
  const { roomId } = req.params;
  const { authorName } = req.body;

  const room = await roomService.findById(roomId);

  if (!room) {
    res.sendStatus(404);

    return;
  }

  if (room.authorName !== authorName) {
    res.sendStatus(403);

    return;
  }

  await roomService.remove(roomId);

  const broadcast = req.app.get('broadcast');

  if (broadcast) {
    broadcast({
      type: 'ROOM_DELETED',
      data: { id: roomId },
    });
  }

  res.sendStatus(204);
};

export const roomController = {
  get,
  create,
  rename,
  remove,
};
