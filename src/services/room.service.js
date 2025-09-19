import { User } from '../data/user.js';
import { Room } from '../data/room.js';
import { userService } from './user.service.js';

const findRoomsByUserId = async (userId) => {
  const user = await User.findByPk(userId, {
    include: Room,
  });

  if (!user) {
    return [];
  }

  return user.Rooms;
};

const findRoomById = async (roomId) => {
  const room = await Room.findByPk(roomId);

  if (!room) {
    return null;
  }

  return room;
};

const createRoom = async (name) => {
  const newRoom = await Room.create({ name });

  return newRoom;
};

const addUserToRoom = async (userId, roomId) => {
  const room = await roomService.findRoomById(roomId);
  const user = await userService.getUserById(userId);

  await room.addUser(user);
};

export const roomService = {
  findRoomsByUserId,
  findRoomById,
  createRoom,
  addUserToRoom,
};
