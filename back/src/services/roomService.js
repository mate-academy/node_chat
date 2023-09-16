/* eslint-disable quotes */
import { Room } from "../models/Room.js";
import { messageService } from "./messageService.js";

function getById(id) {
  return Room.findOne({
    where: { id },
  });
}

async function createRoom(name) {
  const newRoom = await Room.create({
    name,
  });

  return newRoom;
}

async function renameRoom(id, name) {
  const updatedRoom = await Room.update(
    {
      name,
    },
    {
      where: {
        id,
      },
    }
  );

  return updatedRoom;
}

async function deleteRoom(id) {
  const roomToDelete = await getById(id);

  await messageService.deleteAllForRoom(id);

  const result = await roomToDelete.destroy();

  return result;
}

async function mergeRooms(absorbedId, absorbingId) {
  await messageService.reassignMessages(absorbedId, absorbingId);

  const roomToDelete = await getById(absorbedId);

  await roomToDelete.destroy();

  return { result: "completed" };
}

async function getAll() {
  const rooms = await Room.findAll();

  return rooms;
}

export const roomService = {
  getById,
  createRoom,
  renameRoom,
  deleteRoom,
  mergeRooms,
  getAll,
};
