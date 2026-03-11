import type { Request, Response } from 'express';
import roomRepository from '../repository/room.repository';
import { ApiError } from '../utils/ApiError';
import messageRepository from '../repository/message.repository';
import { filter } from '../utils/filterToUpdate';
import { emitter } from '../index';

const create = async (req: Request, res: Response) => {
  const { title } = req.body;

  if (!title.trim()) {
    throw ApiError.badRequest([{ message: 'Title is required' }]);
  }

  const rawRoom: RawRoom = {
    title,
  };

  const room: Room = await roomRepository.create(rawRoom);

  if (!room) {
    throw ApiError.internalServerError([{ message: 'Internal server error'}])
  }

  emitter.emit('message', {
    type: 'new',
    to: 'room',
    data: room,
  });

  res.status(201).send(room);
};

const deleteRoom = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id || typeof id !== 'string' || !(await roomRepository.getById(id))) {
    throw ApiError.badRequest([{ message: 'Id is required' }]);
  }

  await messageRepository.deleteMany(id);
  const room = await roomRepository.deleteRoom(id);

  emitter.emit('message', {
    type: 'delete',
    to: 'room',
    data: room,
  });

  res.sendStatus(204);
};

const getMessages = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id || typeof id !== 'string') {
    throw ApiError.badRequest([{ message: 'Room id required' }]);
  }

  const messages = await messageRepository.getRoomMessages(id);

  res.status(200).send(messages);
};

const change = async (req: Request, res: Response) => {
  const { id } = req.params;
  const rawToChange: PartialRawRoom = req.body;

  if (!id || typeof id !== 'string') {
    throw ApiError.badRequest([{ message: 'Room is required' }]);
  }

  if (!rawToChange) {
    throw ApiError.badRequest([{ message: 'Changes is required' }]);
  }

  const toChange = filter(rawToChange);

  const updatedRoom = await roomRepository.change(id, toChange);

  emitter.emit('message', {
    type: 'update',
    to: 'room',
    data: updatedRoom,
  });

  res.sendStatus(204);
};

const get = async (req: Request, res: Response) => {
  const rooms = await roomRepository.get();

  res.status(200).send(rooms);
};

export default {
  create,
  deleteRoom,
  getMessages,
  get,
  change,
};
