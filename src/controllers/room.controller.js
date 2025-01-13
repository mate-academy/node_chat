import { ApiError } from '../exceptions/ApiError.js';
import { roomService } from '../services/room.service.js';
import { uuidValidateV4 } from '../services/uuid.service.js';

function validateName(value) {
  if (!value.trim()) {
    return 'Name is required';
  }

  if (value.includes('"')) {
    return 'Name must not contain double quotes';
  }

  return null;
}

function validateUuid(uuid, fieldName) {
  if (!uuidValidateV4(uuid)) {
    return { [fieldName]: 'invalid syntax for type uuid' };
  }

  return null;
}

export const getRooms = async (req, res) => {
  const rooms = await roomService.getAll();

  res.send(rooms);
};

export const getRoomById = async (req, res) => {
  const { id } = req.params;
  const errors = validateUuid(id, 'RoomId');

  if (errors) {
    throw ApiError.UnprocessableEntity(errors);
  }

  const room = await roomService.getOne(id);

  if (!room) {
    throw ApiError.NotFound(`Room with id=${id} not found`);
  }

  res.send(room);
};

export const createRoom = async (req, res) => {
  const { name, UserId } = req.body;

  const errors = {
    name: validateName(name),
    ...validateUuid(UserId, 'UserId'),
  };

  if (Object.values(errors).some(Boolean)) {
    throw ApiError.UnprocessableEntity(errors);
  }

  const room = await roomService.create(name, UserId);

  res.status(201).send(room);
};

export const joinRoom = async (req, res) => {
  const { userId } = req.body;
  const { id } = req.params;

  const errors = {
    ...validateUuid(id, 'RoomId'),
    ...validateUuid(userId, 'UserId'),
  };

  if (Object.values(errors).some(Boolean)) {
    throw ApiError.UnprocessableEntity(errors);
  }

  const room = await roomService.join(id, userId);

  res.status(201).send(room);
};

export const updateRoom = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  const errors = {
    ...validateUuid(id, 'RoomId'),
    name: validateName(name),
  };

  if (Object.values(errors).some(Boolean)) {
    throw ApiError.UnprocessableEntity(errors);
  }

  await roomService.updateName(id, name);
  res.sendStatus(200);
};

export const deleteRoom = async (req, res) => {
  const { id } = req.params;

  const errors = validateUuid(id, 'RoomId');

  if (errors) {
    throw ApiError.UnprocessableEntity(errors);
  }

  await roomService.remove(id);
  res.sendStatus(204);
};
