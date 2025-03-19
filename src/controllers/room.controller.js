import { ApiError } from '../exception/api.error.js';
import { UserRoom } from '../models/userRoom.model.js';
import { messageService } from '../services/message.service.js';
import { roomService } from '../services/room.service.js';
import { userService } from '../services/user.service.js';
import { userRoomService } from '../services/userRoom.service.js';
import { rooms } from '../wsServer.js';

const create = async (req, res) => {
  const { title, userId } = req.body;

  if (!title || !userId) {
    throw ApiError.badRequest('title and userId are required');
  }

  const user = await userService.findUserById(userId);

  if (!user) {
    throw ApiError.notFound({
      user: 'User is not found',
    });
  }

  const newRoom = await roomService.create({ title, userId });

  await userRoomService.addMember({ userId, roomId: newRoom.id });

  res.status(201).send(newRoom);
};

const changeName = async (req, res) => {
  const { id: roomId } = req.params;
  const { userId, title } = req.body;

  if (!roomId || !userId || !title) {
    throw ApiError.badRequest('roomId, userId, title are required');
  }

  const room = await roomService.findRoom(roomId);

  if (room.userId !== userId) {
    throw ApiError.badRequest('You are not the owner of this room');
  }

  const updatedRoom = await roomService.rename({ id: roomId, title });

  res.send(updatedRoom);
};

const remove = async (req, res) => {
  const { id: roomId } = req.params;
  const { userId } = req.body;

  const room = await roomService.findRoom(roomId);

  if (!room) {
    throw ApiError.notFound({
      room: 'Room is not found',
    });
  }

  if (!userId || room.userId !== userId) {
    throw ApiError.badRequest('Bad request');
  }

  await roomService.remove(roomId);
  res.sendStatus(204);
};

const addMessage = async (req, res) => {
  const { id: roomId } = req.params;
  const { userId, text } = req.body;

  const isMember = await UserRoom.findOne({ where: { userId, roomId } });

  if (!isMember) {
    throw ApiError.forbidden({ error: 'You are not in this room' });
  }

  const room = await roomService.findRoom(roomId);

  if (!room) {
    throw ApiError.notFound({ error: 'Room not found' });
  }

  const message = await messageService.create({ userId, roomId, text });

  if (rooms.has(roomId)) {
    rooms.get(roomId).forEach((client) => {
      if (client.readyState === 1) {
        client.send(
          JSON.stringify({ type: 'message', room: roomId, ...message }),
        );
      }
    });
  }

  res.json(message);
};

const join = async (req, res) => {
  const { id: roomId } = req.params;
  const { userId } = req.body;

  const existMemeber = await userRoomService.findMember({ userId, roomId });

  if (existMemeber) {
    throw ApiError.badRequest('User is already a member of this room');
  }

  await userRoomService.addMember({ userId, roomId });

  res.send('User added to the room');
};

const getAllMessages = async (req, res) => {
  const { id: roomId } = req.params;
  const { userId } = req.query;

  const member = await userRoomService.findMember({ userId, roomId });

  if (!member) {
    throw ApiError.notFound({
      user: 'User is not a member of this room',
    });
  }

  const messages = await messageService.getAllMessages({ roomId });

  res.send(messages);
};

export const roomController = {
  create,
  changeName,
  remove,
  addMessage,
  join,
  getAllMessages,
};
