import { User } from '../data/user.js';
import { Room } from '../data/room.js';
import { roomService } from './room.service.js';

const createUser = async (name) => {
  const newUser = await User.create({
    name,
  });

  return newUser;
};

const getUserById = async (id) => {
  const user = await User.findOne({ where: { id } });

  return user;
};

const getUserByName = async (name) => {
  const user = await User.findOne({ where: { name } });

  return user;
};

const findUsersByRoomId = async (roomId) => {
  const room = await Room.findByPk(roomId, {
    include: User,
  });

  if (!room) {
    return [];
  }

  return room.Users;
};

const mergeUsers = async (roomId, targetRoomId) => {
  const room = await roomService.findRoomById(roomId);
  const targetRoom = await roomService.findRoomById(targetRoomId);
  const usersToMerge = await findUsersByRoomId(roomId);
  const targetUsers = await findUsersByRoomId(targetRoomId);

  if (!room || !targetRoom) {
    throw new Error('One or both rooms not found');
  }

  const targetUserIds = new Set(targetUsers.map((u) => u.id));

  for (const user of usersToMerge) {
    if (!targetUserIds.has(user.id)) {
      await targetRoom.addUser(user);
    }
  }

  return { merged: usersToMerge.length, into: targetRoomId };
};

const getUserNameById = async (userId) => {
  const user = User.findOne({ where: { userId } });

  return user.name;
};

export const userService = {
  createUser,
  getUserById,
  getUserByName,
  findUsersByRoomId,
  mergeUsers,
  getUserNameById,
};
