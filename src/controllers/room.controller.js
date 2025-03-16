import { getAllMessage } from '../services/message.service';
import {
  createRoom,
  joinRoom,
  removeRoom,
  renameRoom,
} from '../services/room.service';

export const create = async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).send({ message: 'Name is Required!' });
  }

  const room = await createRoom(name);

  return res.status(201).send(room);
};

export const join = async (req, res) => {
  const id = Number(req.params.id);

  if (!id || isNaN(id)) {
    return res.status(400).send();
  }

  const room = await joinRoom(id);

  if (!room) {
    return res.status(400).send();
  }

  const message = await getAllMessage(id);

  return res.status(200).send(room, message);
};

export const remove = async (req, res) => {
  const id = Number(req.params.id);

  if (!id || isNaN(id)) {
    return res.status(400).send();
  }

  const room = await joinRoom(id);

  if (!room) {
    return res.status(400).send();
  }

  await removeRoom(id);

  return res.status(204).send();
};

export const rename = async (req, res) => {
  const id = Number(req.params.id);
  const { name } = req.body;

  if (!id || isNaN(id)) {
    return res.status(400).send();
  }

  if (!name) {
    return res.status(400).send({ message: 'Name is Required!' });
  }

  const room = await joinRoom(id);

  if (!room) {
    return res.status(400).send();
  }

  const newRoom = renameRoom(id, name);

  return res.status(201).send(newRoom);
};

export const RoomController = {
  create,
  join,
  remove,
  rename,
};
