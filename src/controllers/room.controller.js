import { Room } from '../models/Room.models.js';

export const getRooms = async (req, res) => {
  res.send(await Room.findAll());
};

export const getOneRoom = async (req, res) => {
  const { id } = req.params;
  const room = await Room.findByPk(id);

  if (!room) {
    res.status(404).send({ message: 'cant get a room' });

    return;
  }
  res.status(200).send(room);
};

export const createRoom = async (req, res) => {
  const { roomName } = req.body;

  if (!roomName) {
    return res.status(400).send({ message: 'room name is required' });
  }

  const room = {
    roomName,
  };

  const newRoom = await Room.create(room);

  res.status(201).send(newRoom);
};

const deleteR = async (id) => {
  await Room.destroy({
    where: {
      id,
    },
  });
};

export const deleteRoom = async (req, res) => {
  const { id } = req.params;

  if (!(await Room.findByPk(id))) {
    res.sendStatus(404);

    return;
  }

  await deleteR(id);
  res.sendStatus(204);
};

const patchRoom = async ({ roomName, id }) => {
  await Room.update({ roomName }, { where: { id } });

  return Room.findByPk(id);
};

export const renameRoom = async (req, res) => {
  const { id } = req.params;
  const { roomName } = req.body;

  if (!(await Room.findByPk(id))) {
    res.sendStatus(404);

    return;
  }

  const updatedRomm = await patchRoom({ roomName, id });

  if (!updatedRomm) {
    res.status(404).send({ message: 'cant update a room' });

    return;
  }
  res.status(200).json(updatedRomm);
};
