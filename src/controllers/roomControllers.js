import { roomService } from '../service/roomService.js';

export const createRoom = (req, res, next) => {
  try {
    const { name: roomName } = req.body;
    const result = roomService.createRoomService(roomName);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const renameRoom = (req, res, next) => {
  try {
    const { name: currentName, newName } = req.body;
    const rename = roomService.renameRoomService(currentName, newName);

    res.send(rename.message);
  } catch (error) {
    next(error);
  }
};

export const deleteRoom = (req, res, next) => {
  try {
    const { name: roomName } = req.body;
    const result = roomService.deleteRoomService(roomName);

    res.send(result.message);
  } catch (error) {
    next(error);
  }
};

export const getRoomMessage = (req, res, next) => {
  try {
    const { name: roomName } = req.params;

    const result = roomService.getRoomMessageService(roomName);

    res.json(result.messages);
  } catch (error) {
    next(error);
  }
};
