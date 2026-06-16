import { Room } from '../models/room.js';

function getRooms() {
  return Room.findAll();
}

function createRoom({ name }) {
  return Room.create({ name });
}

function updateRoom(roomId, { name }) {
  return Room.update({ name }, { where: { id: roomId } });
}

function deleteRoom(roomId) {
  return Room.destroy({ where: { id: roomId } });
}

export const roomService = {
  getRooms,
  createRoom,
  updateRoom,
  deleteRoom,
};
