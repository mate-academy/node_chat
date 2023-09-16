/* eslint-disable quotes */
import { messageService } from "../services/messageService.js";

async function getAll(req, res, next) {
  const messages = await messageService.getAll();

  res.send(messages);
}

async function getAllForRoom(req, res, next) {
  const { roomId } = req.params;

  const messages = await messageService.getAllForRoom(roomId);

  res.send(messages);
}

export const messageController = {
  getAllForRoom,
  getAll,
};
