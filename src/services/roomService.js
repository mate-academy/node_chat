import { Room } from '../modules/Room.js';
import { UserRooms } from '../modules/UserRooms.js';

function getAllRooms() {
  return Room.findAll();
}

function getRoomById(id) {
  return Room.findOne({
    where: { id },
  });
}

async function renameRoom(newName, room) {
  room.set({
    name: newName,
  });

  await room.save();

  return room;
}

async function joinRoom(userId, roomId) {
  const [membership] = await UserRooms.findOrCreate({
    where: { userId, roomId },
  });

  return membership;
}

async function isUserInRoom(userId, roomId) {
  const membership = await UserRooms.findOne({
    where: { userId, roomId },
  });

  return Boolean(membership);
}

async function addRoom(name, userId) {
  const room = await Room.create({ name });

  await joinRoom(userId, room.id);

  return room;
}

async function deleteRoom(roomId) {
  return Room.destroy({
    where: { id: roomId },
  });
}

async function leaveRoom(userId, roomId) {
  return UserRooms.destroy({
    where: { userId, roomId },
  });
}

export const roomService = {
  getAllRooms,
  getRoomById,
  addRoom,
  renameRoom,
  joinRoom,
  deleteRoom,
  leaveRoom,
  isUserInRoom,
};
