// @ts-nocheck
import { where } from 'sequelize';
import { ApiError } from '../exeptions/api.error.js';
import { Message } from '../models/messages.js';
import { Rooms } from '../models/room.js';

export const normalize = ({ id, text, userId, roomId, createdAt }) => {
  return { id, text, userId, roomId, createdAt };
};

export const createNewMessage = async ({ text, userId, roomId }) => {
  return await Message.create({
    text,
    userId,
    roomId,
  });
};

export const getAllMessagesByRoomId = async (roomId) =>
  Message.findAll({ where: { roomId } });
