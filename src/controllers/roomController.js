import { roomService } from '../services/roomService.js';

const ROOM_NOT_FOUND = 'Room not found';
const ID_NOT_NUMBER = 'Id is not a number';
const HAS_NOT_ROOM_NAME = 'Request does not have "roomName" property';

const getAll = async(req, res) => {
  const categories = await roomService.getAll();

  res.send(
    categories.map(room => roomService.normalize(room)),
  );
};

const create = async(req, res) => {
  const { roomName } = req.body;

  if (!roomName) {
    return res.status(400)
      .send(HAS_NOT_ROOM_NAME);
  }

  try {
    const room = await roomService.create(roomName);

    res.status(201).send(roomService.normalize(room));
  } catch (error) {
    res.status(500).send('Internal server error');
  }
};

const getOne = async(req, res) => {
  const { id } = req.params;

  if (isNaN(+id)) {
    return res.status(400).send(ID_NOT_NUMBER);
  }

  const room = await roomService.getById(+id);

  if (!room) {
    return res.status(404).send(ROOM_NOT_FOUND);
  }

  res.send(roomService.normalize(room));
};

const update = async(req, res) => {
  const { id } = req.params;
  const { roomName } = req.body;

  if (isNaN(+id)) {
    return res.status(400).send(ID_NOT_NUMBER);
  }

  if (!roomName) {
    return res.status(400)
      .send(HAS_NOT_ROOM_NAME);
  }

  const room = await roomService.getById(+id);

  if (!room) {
    return res.status(404).send(ROOM_NOT_FOUND);
  }

  const updatedRoom = await roomService.update({
    id: +id,
    roomName,
  });

  res.send(updatedRoom);
};

const remove = async(req, res) => {
  const { id } = req.params;

  if (isNaN(+id)) {
    return res.status(400).send(ID_NOT_NUMBER);
  }

  const room = await roomService.getById(+id);

  if (!room) {
    return res.status(404).send(ROOM_NOT_FOUND);
  }

  await roomService.remove(+id);

  res.sendStatus(204);
};

export const roomController = {
  getAll,
  create,
  getOne,
  update,
  remove,
};
