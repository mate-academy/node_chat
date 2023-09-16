/* eslint-disable quotes */
import { roomService } from "../services/roomService.js";

async function createRoom(req, res, next) {
  const { name } = req.body;
  const room = await roomService.createRoom(name);

  res.send(room);
}

async function renameRoom(req, res, next) {
  const { id, name } = req.body;
  const room = await roomService.renameRoom(id, name);

  res.send(room);
}

async function deleteRoom(req, res, next) {
  const { id } = req.params;
  const result = await roomService.deleteRoom(id);

  res.send(result);
}

async function mergeRooms(req, res, next) {
  const { absorbedId, absorbingId } = req.body;

  const result = await roomService.mergeRooms(absorbedId, absorbingId);

  res.send(result);
}

async function getRoomById(req, res, next) {
  const { id } = req.params;
  const room = await roomService.getById(id);

  res.send(room);
}

async function getAll(req, res, next) {
  const rooms = await roomService.getAll();

  res.send(rooms);
}

export const roomController = {
  createRoom,
  renameRoom,
  deleteRoom,
  mergeRooms,
  getRoomById,
  getAll,
};
