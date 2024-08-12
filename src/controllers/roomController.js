import { ApiError } from '../exceptions/ApiError.js';
import { roomService } from '../services/roomService.js';
import { uuidValidateV4 } from '../services/uuidService.js';

export function validateName(value) {
  if (!value.trim()) {
    return 'Name is required';
  }
  
  if (value.match('["]')) {
    return 'Name must not contain double quotes';
  }
}

export const get = async (req, res) => {
  res.send(await roomService.getAll());
};

export const getOne = async (req, res) => {
  const { id } = req.params;

  if (!uuidValidateV4(id)) {
    throw ApiError.UnprocessableEntity({
      RoomId: "invalid syntax for type uuid"
    });
  }

  const room = await roomService.getOne(id);
  if (!room) {
    throw ApiError.NotFound(`Room with id=${id} not found`);
  }
  res.send(room);
};

export const create = async (req, res) => {
  let { name, UserId } = req.body;

  const errors = {
    name: validateName(name),
  }

  if (errors.name) {
    throw ApiError.UnprocessableEntity(errors);
  }

  const room = await roomService.create(name, UserId);
  res.statusCode = 201;
  res.send(room);
};

export const join = async (req, res) => {
  const { userId } = req.body;
  const { id } = req.params;

  if (!uuidValidateV4(id)) {
    throw ApiError.UnprocessableEntity({
      RoomId: "invalid syntax for type uuid"
    });
  }

  if (!uuidValidateV4(userId)) {
    throw ApiError.UnprocessableEntity({
      UserId: "invalid syntax for type uuid"
    });
  }


  const room = await roomService.join(id, userId);
  res.statusCode = 201;
  res.send(room);
};

export const update = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  if (!uuidValidateV4(id)) {
    throw ApiError.UnprocessableEntity({
      RoomId: "invalid syntax for type uuid"
    });
  }

  const errors = {
    name: validateName(name),
  }

  if (errors.name) {
    throw ApiError.UnprocessableEntity(errors);
  }

  await roomService.updateName(id, name);
  res.sendStatus(200);
};

export const remove = async (req, res) => {
  const { id } = req.params;

  if (!uuidValidateV4(id)) {
    throw ApiError.UnprocessableEntity({
      RoomId: "invalid syntax for type uuid"
    });
  }

  roomService.remove(id);
  res.sendStatus(204);
};