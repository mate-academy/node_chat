import { Room } from '../models/room.js';

function getRooms() {
  return Room.findAll();
}

function createRoom({ name }) {
  return Room.create({ name });
}

async function updateRoom(roomId, { name }) {
  await Room.update({ name }, { where: { id: roomId } });

  return Room.findByPk(roomId);
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
