import { roomService } from '../services/room.service.js';
import { ApiError } from '../exeptions/api.error.js';
import { validateId, validateName } from '../utils/validation.js';

const getAllRooms = async (req, res) => {
  const rooms = await roomService.getAllRooms();

  res.send(rooms);
};

const create = async (req, res) => {
  const { name } = req.body;

  const errors = {
    name: validateName(name),
  };

  if (errors.name) {
    throw ApiError.badRequest('Validation error', errors);
  }

  const newRoom = await roomService.create(name);

  res.statusCode = 201;
  res.send(newRoom);
};

const rename = async (req, res) => {
  const { id } = req.params;
  const { newName } = req.body;

  const errors = {
    id: validateId(id),
    newName: validateName(newName),
  };

  if (errors.newName || errors.id) {
    throw ApiError.badRequest('Validation error', errors);
  }

  const updatedRoom = await roomService.rename({ id, newName });

  res.statusCode = 200;
  res.send(updatedRoom);
};

const remove = async (req, res) => {
  const { id } = req.params;

  const errors = {
    id: validateId(id),
  };

  if (errors.id) {
    throw ApiError.badRequest('Validation error', errors);
  }

  await roomService.remove(id);

  res.statusCode = 200;
  res.send({
    message: 'Room removed successfully',
  });
};

export const roomController = {
  getAllRooms,
  create,
  rename,
  remove,
};
